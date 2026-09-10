#!/usr/bin/env bash
# ==============================================================================
# Git Continuous Auto-Sync Monitor for Real Estate Repository
#
# Automatically:
#  1. Detects local uncommitted/untracked changes, stages and commits them.
#  2. Fetches upstream remote changes.
#  3. Pulls new remote changes safely (using rebase with conflict detection).
#  4. Pushes local commits to the remote branch.
# ==============================================================================

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Configuration (defaults can be overridden via environment variables)
SYNC_INTERVAL="${SYNC_INTERVAL:-20}"           # Check interval in seconds
REMOTE="${GIT_REMOTE:-origin}"                 # Remote name
AUTO_COMMIT="${AUTO_COMMIT:-true}"             # Auto-commit modified files
SERVICE_NAME="git-sync-realestate.service"
SYSTEMD_USER_DIR="${HOME}/.config/systemd/user"
LOCK_FILE="/tmp/git_sync_realestate.lock"

# Color support for interactive terminals
if [ -t 1 ]; then
    COLOR_RESET="\033[0m"
    COLOR_GREEN="\033[1;32m"
    COLOR_YELLOW="\033[1;33m"
    COLOR_RED="\033[1;31m"
    COLOR_CYAN="\033[1;36m"
else
    COLOR_RESET=""
    COLOR_GREEN=""
    COLOR_YELLOW=""
    COLOR_RED=""
    COLOR_CYAN=""
fi

log() {
    local level="$1"
    local msg="$2"
    local timestamp
    timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
    case "$level" in
        "INFO")    echo -e "[${timestamp}] ${COLOR_CYAN}[INFO]${COLOR_RESET} $msg" ;;
        "SUCCESS") echo -e "[${timestamp}] ${COLOR_GREEN}[OK]${COLOR_RESET} $msg" ;;
        "WARN")    echo -e "[${timestamp}] ${COLOR_YELLOW}[WARN]${COLOR_RESET} $msg" ;;
        "ERROR")   echo -e "[${timestamp}] ${COLOR_RED}[ERROR]${COLOR_RESET} $msg" ;;
        *)         echo -e "[${timestamp}] [$level] $msg" ;;
    esac
}

acquire_lock() {
    exec 200>"$LOCK_FILE"
    if ! flock -n 200; then
        log "WARN" "Another instance of git-sync is already running. Exiting."
        exit 0
    fi
}

release_lock() {
    flock -u 200 2>/dev/null || true
    rm -f "$LOCK_FILE" 2>/dev/null || true
}

trap release_lock EXIT INT TERM

# Perform a single synchronization round
sync_once() {
    cd "$REPO_DIR" || {
        log "ERROR" "Cannot cd into $REPO_DIR"
        return 1
    }

    # Verify git repository
    if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        log "ERROR" "$REPO_DIR is not a valid git repository."
        return 1
    fi

    # Check for in-progress interactive git operations
    if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ] || [ -f ".git/MERGE_HEAD" ] || [ -f ".git/CHERRY_PICK_HEAD" ]; then
        log "WARN" "Git operation (rebase/merge/cherry-pick) currently in progress. Pausing auto-sync until resolved."
        return 0
    fi

    # Identify current branch
    local branch
    branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"
    if [ -z "$branch" ] || [ "$branch" = "HEAD" ]; then
        log "WARN" "Detached HEAD or uninitialized branch. Skipping sync cycle."
        return 0
    fi

    # 1. Stage and commit local uncommitted changes if AUTO_COMMIT is enabled
    local status_output
    status_output="$(git status --porcelain 2>/dev/null || echo "")"
    if [ -n "$status_output" ]; then
        if [ "$AUTO_COMMIT" = "true" ]; then
            log "INFO" "Detected uncommitted local changes. Staging and committing..."
            git add -A
            local commit_msg="Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"
            if git commit -m "$commit_msg" >/dev/null 2>&1; then
                log "SUCCESS" "Local changes committed: '$commit_msg'"
            else
                log "WARN" "Git commit did not produce a new commit."
            fi
        else
            log "WARN" "Uncommitted changes present but AUTO_COMMIT=false. Changes will not be committed."
        fi
    fi

    # 2. Fetch remote branch quietly
    if ! git fetch "$REMOTE" "$branch" --quiet 2>/dev/null; then
        # Network down, DNS failure, or credentials issue
        log "WARN" "Unable to reach remote '$REMOTE' for branch '$branch'. Will retry next interval."
        return 0
    fi

    # 3. Check if remote tracking reference exists
    if ! git rev-parse --verify "$REMOTE/$branch" >/dev/null 2>&1; then
        log "INFO" "Remote branch '$REMOTE/$branch' does not exist yet. Pushing upstream..."
        if git push -u "$REMOTE" "$branch" >/dev/null 2>&1; then
            log "SUCCESS" "Pushed branch '$branch' to '$REMOTE' and established tracking."
        else
            log "ERROR" "Failed to push new branch '$branch' to '$REMOTE'."
        fi
        return 0
    fi

    # 4. Compare local HEAD and remote tracking branch
    local local_hash remote_hash base_hash
    local_hash="$(git rev-parse HEAD)"
    remote_hash="$(git rev-parse "$REMOTE/$branch")"
    base_hash="$(git merge-base HEAD "$REMOTE/$branch" 2>/dev/null || echo "")"

    if [ "$local_hash" = "$remote_hash" ]; then
        # Repo is fully in sync
        return 0
    fi

    if [ "$local_hash" = "$base_hash" ]; then
        # Local is behind remote -> Pull new remote commits
        log "INFO" "New remote commits detected on '$REMOTE/$branch'. Pulling changes..."
        if git pull --rebase "$REMOTE" "$branch" >/dev/null 2>&1; then
            log "SUCCESS" "Successfully pulled and integrated remote changes."
        else
            log "ERROR" "Pull failed. Aborting rebase to preserve local working state."
            git rebase --abort 2>/dev/null || true
        fi
    elif [ "$remote_hash" = "$base_hash" ]; then
        # Local has commits ahead of remote -> Push
        log "INFO" "Local branch '$branch' is ahead of '$REMOTE/$branch'. Pushing commits..."
        if git push "$REMOTE" "$branch" >/dev/null 2>&1; then
            log "SUCCESS" "Successfully pushed local commits to '$REMOTE/$branch'."
        else
            log "ERROR" "Failed to push commits to '$REMOTE/$branch'."
        fi
    else
        # Diverged: both local and remote have commits
        log "INFO" "Diverged history detected. Rebasing local commits on top of remote '$REMOTE/$branch'..."
        if git pull --rebase "$REMOTE" "$branch" >/dev/null 2>&1; then
            log "SUCCESS" "Rebase succeeded. Now pushing integrated changes to remote..."
            if git push "$REMOTE" "$branch" >/dev/null 2>&1; then
                log "SUCCESS" "Successfully pushed integrated changes."
            else
                log "ERROR" "Push failed after rebase."
            fi
        else
            log "ERROR" "Merge conflict encountered during rebase! Aborting rebase to protect working copy."
            git rebase --abort 2>/dev/null || true
            log "WARN" "Please resolve conflicts manually in $REPO_DIR."
        fi
    fi
}

# Continuous loop mode
run_loop() {
    log "INFO" "Starting Git Auto-Sync Monitor for: $REPO_DIR"
    log "INFO" "Interval: ${SYNC_INTERVAL}s | Remote: $REMOTE | Auto-Commit: $AUTO_COMMIT"
    while true; do
        sync_once
        sleep "$SYNC_INTERVAL"
    done
}

# Show status
show_status() {
    cd "$REPO_DIR" || exit 1
    echo -e "${COLOR_CYAN}=== Git Repository Status ===${COLOR_RESET}"
    echo "Repository: $REPO_DIR"
    local branch
    branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'none')"
    echo "Current Branch: $branch"
    git status --short
    echo ""

    echo -e "${COLOR_CYAN}=== Remote Sync Status ===${COLOR_RESET}"
    git fetch "$REMOTE" "$branch" --quiet 2>/dev/null || true
    local local_hash remote_hash
    local_hash="$(git rev-parse HEAD 2>/dev/null || echo '')"
    remote_hash="$(git rev-parse "$REMOTE/$branch" 2>/dev/null || echo '')"
    if [ "$local_hash" = "$remote_hash" ]; then
        echo -e "${COLOR_GREEN}✓ Local branch is fully up-to-date with $REMOTE/$branch${COLOR_RESET}"
    else
        local ahead behind
        ahead="$(git rev-list --count "$REMOTE/$branch..HEAD" 2>/dev/null || echo 0)"
        behind="$(git rev-list --count "HEAD..$REMOTE/$branch" 2>/dev/null || echo 0)"
        echo -e "${COLOR_YELLOW}Ahead of remote by: $ahead commit(s) | Behind remote by: $behind commit(s)${COLOR_RESET}"
    fi
    echo ""

    echo -e "${COLOR_CYAN}=== systemd User Service Status ===${COLOR_RESET}"
    if systemctl --user is-active --quiet "$SERVICE_NAME"; then
        echo -e "${COLOR_GREEN}● Service '$SERVICE_NAME' is ACTIVE and running in the background.${COLOR_RESET}"
        systemctl --user status "$SERVICE_NAME" --no-pager -l -n 5
    else
        echo -e "${COLOR_YELLOW}○ Service '$SERVICE_NAME' is INACTIVE or not installed.${COLOR_RESET}"
    fi
}

# Install systemd user service
install_service() {
    mkdir -p "$SYSTEMD_USER_DIR"
    local service_file="$SYSTEMD_USER_DIR/$SERVICE_NAME"

    log "INFO" "Creating systemd unit file at: $service_file"
    cat > "$service_file" <<EOF
[Unit]
Description=Continuous Git Sync Monitor for Real Estate Repository
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=$REPO_DIR
ExecStart=$REPO_DIR/scripts/git-sync.sh --loop
Restart=always
RestartSec=10
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
Environment=HOME=$HOME
Environment=SYNC_INTERVAL=$SYNC_INTERVAL
Environment=AUTO_COMMIT=$AUTO_COMMIT

StandardOutput=journal
StandardError=journal

[Install]
WantedBy=default.target
EOF

    log "INFO" "Reloading systemd user daemon..."
    systemctl --user daemon-reload

    log "INFO" "Enabling and starting $SERVICE_NAME..."
    systemctl --user enable --now "$SERVICE_NAME"

    if systemctl --user is-active --quiet "$SERVICE_NAME"; then
        log "SUCCESS" "Service '$SERVICE_NAME' is active and running!"
    else
        log "ERROR" "Failed to start '$SERVICE_NAME'. Check 'systemctl --user status $SERVICE_NAME'."
    fi
}

# Uninstall systemd user service
uninstall_service() {
    log "INFO" "Stopping and disabling $SERVICE_NAME..."
    systemctl --user stop "$SERVICE_NAME" 2>/dev/null || true
    systemctl --user disable "$SERVICE_NAME" 2>/dev/null || true
    rm -f "$SYSTEMD_USER_DIR/$SERVICE_NAME"
    systemctl --user daemon-reload
    log "SUCCESS" "Service '$SERVICE_NAME' has been removed."
}

# Tail logs
tail_logs() {
    echo -e "${COLOR_CYAN}Streaming logs for $SERVICE_NAME (Ctrl+C to exit)...${COLOR_RESET}"
    journalctl --user -u "$SERVICE_NAME" -f --output=cat
}

# Parse CLI arguments
case "${1:-}" in
    --once|once)
        acquire_lock
        sync_once
        ;;
    --status|status)
        show_status
        ;;
    --install-service|install)
        install_service
        ;;
    --uninstall-service|uninstall)
        uninstall_service
        ;;
    --logs|logs)
        tail_logs
        ;;
    --help|-h|help)
        echo "Usage: $0 [OPTION]"
        echo ""
        echo "Options:"
        echo "  --loop (default)      Run continuous sync monitoring loop in foreground"
        echo "  --once                Run a single sync check (commit/pull/push) and exit"
        echo "  --status              Check repo git status and systemd service status"
        echo "  --install-service     Install and start as background systemd user service"
        echo "  --uninstall-service   Stop and remove the systemd user service"
        echo "  --logs                Stream live logs from systemd service"
        echo "  --help                Show this help message"
        ;;
    --loop|loop|"")
        acquire_lock
        run_loop
        ;;
    *)
        echo "Unknown option: $1"
        echo "Run '$0 --help' for available options."
        exit 1
        ;;
esac
