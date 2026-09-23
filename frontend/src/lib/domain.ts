/**
 * Telangana Realty Hub - Domain & Subdomain Configuration
 *
 * Real-world enterprise multi-subdomain routing:
 * - Public Portal: telanganarealty.in / www.telanganarealty.in
 * - Executive Staff Desk: admin.telanganarealty.in / staff.telanganarealty.in
 * - REST API: api.telanganarealty.in
 */

export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'telanganarealty.in';
export const ADMIN_DOMAIN = process.env.NEXT_PUBLIC_ADMIN_DOMAIN || `admin.${ROOT_DOMAIN}`;

/**
 * Checks whether a given hostname is an administrative / staff subdomain.
 * Supports:
 * - admin.telanganarealty.in, staff.telanganarealty.in, team.telanganarealty.in
 * - admin.localhost, staff.localhost (for local testing in Chrome/Firefox/Edge)
 * - Explicit query parameters or headers for preview environments
 */
export function isAdminHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const normalized = host.split(':')[0].toLowerCase();

  return (
    normalized.startsWith('admin.') ||
    normalized.startsWith('staff.') ||
    normalized.startsWith('team.') ||
    normalized === ADMIN_DOMAIN.toLowerCase()
  );
}

/**
 * Generates an absolute public URL or root domain URL.
 */
export function getPublicUrl(path: string = '/'): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    const host = window.location.host;
    if (isAdminHost(host)) {
      // If we are currently on admin.telanganarealty.in, link back to telanganarealty.in
      const publicHost = host.replace(/^(admin|staff|team)\./i, '');
      const protocol = window.location.protocol;
      return `${protocol}//${publicHost}${cleanPath}`;
    }
  }
  return cleanPath;
}

/**
 * Generates an absolute URL for the admin portal.
 */
export function getAdminUrl(path: string = '/'): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    const host = window.location.host;
    if (!isAdminHost(host)) {
      const protocol = window.location.protocol;
      // Handle localhost development
      if (host.includes('localhost')) {
        const port = window.location.port ? `:${window.location.port}` : '';
        return `${protocol}//admin.localhost${port}${cleanPath}`;
      }
      return `https://${ADMIN_DOMAIN}${cleanPath}`;
    }
  }
  return cleanPath;
}
