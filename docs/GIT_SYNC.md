# Git Continuous Auto-Sync Service

This repository is configured with an automated continuous synchronization monitor that keeps your local working copy and the remote GitHub repository (`origin/main`) in sync in real time.

---

## Features

1. **Auto-Commit**: Detects local file additions, modifications, and deletions, staging and committing them with timestamped messages.
2. **Auto-Pull**: Automatically fetches and pulls new remote changes with `--rebase` to maintain a clean git history.
3. **Auto-Push**: Pushes any newly committed changes directly to `origin/main`.
4. **Safety Mechanisms**:
   - **Conflict Protection**: If an auto-rebase encounters a merge conflict, it automatically aborts the rebase (`git rebase --abort`) to prevent working tree corruption and prompts for manual resolution.
   - **Process Lock**: Uses `flock` to guarantee only one sync operation runs at any given time.
   - **Offline Tolerance**: If network connectivity drops or GitHub is temporarily unreachable, it retries cleanly without crashing.
   - **Linger & Persistence**: Runs as a `systemd --user` background daemon enabled with user lingering, staying alive across terminal closures and rebooting automatically on system start.

---

## Management & Commands

You can control the sync service either via `npm` scripts or directly with the script:

### Using NPM
```bash
# View current git status and systemd sync service status
npm run sync:status

# Run a single sync cycle manually (commit + pull + push)
npm run sync

# Stream live sync service logs
npm run sync:logs
```

### Using the Script Directly
```bash
# Check repository status & systemd service status
./scripts/git-sync.sh --status

# View live service logs
./scripts/git-sync.sh --logs

# Run a single sync pass
./scripts/git-sync.sh --once

# Stop and disable the background service
./scripts/git-sync.sh --uninstall-service

# Re-enable and start the background service
./scripts/git-sync.sh --install-service
```

### Using `systemctl` Directly
```bash
# Check service status
systemctl --user status git-sync-realestate.service

# Restart the service
systemctl --user restart git-sync-realestate.service

# Stop the service
systemctl --user stop git-sync-realestate.service

# View journal logs
journalctl --user -u git-sync-realestate.service -f
```

---

## Configuration

The sync script supports environment variable configuration:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `SYNC_INTERVAL` | `20` | Interval in seconds between sync checks |
| `GIT_REMOTE` | `origin` | Target git remote name |
| `AUTO_COMMIT` | `true` | Automatically stage and commit local changes |

Systemd unit configuration file is located at:
`~/.config/systemd/user/git-sync-realestate.service`
