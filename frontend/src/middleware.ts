import { NextResponse, type NextRequest } from 'next/server';
import { LOCALES, DEFAULT_LOCALE } from '@/lib/i18n';
import { ROOT_DOMAIN, ADMIN_DOMAIN, isAdminHost } from '@/lib/domain';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ignore static assets, next internal files, and APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/locales') ||
    pathname.startsWith('/images') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.includes('.') // file extension like favicon.ico
  ) {
    return NextResponse.next();
  }

  // 2. Identify Host & Subdomain
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const hostWithoutPort = host.split(':')[0].toLowerCase();

  // Support query param ?subdomain=admin or ?portal=admin or header for local/preview testing
  const querySubdomain = request.nextUrl.searchParams.get('subdomain') || request.nextUrl.searchParams.get('portal');
  const isExplicitAdminQuery = querySubdomain === 'admin' || querySubdomain === 'staff';
  const isExplicitAdminHeader = request.headers.get('x-subdomain') === 'admin';

  const isAdminSubdomain =
    isAdminHost(host) ||
    isExplicitAdminQuery ||
    isExplicitAdminHeader;

  const isCustomProductionDomain =
    hostWithoutPort.includes(ROOT_DOMAIN.toLowerCase()) ||
    hostWithoutPort.includes('telanganarealty.in');

  // Cookies for Edge RBAC
  const token = request.cookies.get('trh_token')?.value;
  const role = request.cookies.get('trh_role')?.value;
  const isStaff = !!token && (role === 'ADMIN' || role === 'AGENT');

  // ───────────────────────────────────────────────────────────────────────────
  // SCENARIO A: INTERNAL STAFF SUBDOMAIN (admin.* / staff.* / team.*)
  // ───────────────────────────────────────────────────────────────────────────
  if (isAdminSubdomain) {
    // A1. Redirect /{locale}/dashboard to /dashboard
    for (const loc of LOCALES) {
      if (pathname.startsWith(`/${loc}/dashboard`)) {
        const strippedPath = pathname.replace(`/${loc}`, '');
        const redirectUrl = new URL(strippedPath, request.url);
        redirectUrl.search = request.nextUrl.search;
        return NextResponse.redirect(redirectUrl);
      }
    }

    // A2. Root or login on admin subdomain -> rewrite directly to the Executive Terminal
    const isRootOrAuthPath =
      pathname === '/' ||
      pathname === `/${DEFAULT_LOCALE}` ||
      pathname === '/login' ||
      pathname === `/${DEFAULT_LOCALE}/login` ||
      pathname === '/trh-internal-desk' ||
      pathname === `/${DEFAULT_LOCALE}/trh-internal-desk`;

    if (isRootOrAuthPath) {
      // If staff is already authenticated, send them straight to back-office dashboard
      if (isStaff) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Otherwise, cleanly rewrite to internal desk without altering URL bar
      const terminalUrl = new URL(`/${DEFAULT_LOCALE}/trh-internal-desk`, request.url);
      terminalUrl.search = request.nextUrl.search;
      return NextResponse.rewrite(terminalUrl);
    }

    // A3. Dashboard Protection on Admin Subdomain
    if (pathname.startsWith('/dashboard')) {
      if (!token) {
        // Unauthenticated staff are sent to the root of the admin subdomain (terminal login)
        const loginUrl = new URL('/', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Sellers have no business on the internal admin desk
      if (role === 'SELLER') {
        const publicSellerUrl = isCustomProductionDomain
          ? `https://${ROOT_DOMAIN}/dashboard/seller`
          : '/dashboard/seller';
        return NextResponse.redirect(new URL(publicSellerUrl, request.url));
      }

      // 13-Doc Verification is strictly for ADMIN
      if (pathname.startsWith('/dashboard/verification') && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/properties', request.url));
      }

      // Root /dashboard dispatcher: allow staff to view Executive Command Center
      if (pathname === '/dashboard') {
        return NextResponse.next();
      }

      return NextResponse.next();
    }

    // A4. If someone tries to browse public consumer pages on the admin subdomain
    const isConsumerPage =
      pathname.startsWith('/properties') ||
      pathname.startsWith('/list-property') ||
      pathname.startsWith('/seller') ||
      pathname.startsWith('/about');

    if (isConsumerPage && isCustomProductionDomain) {
      return NextResponse.redirect(new URL(`https://${ROOT_DOMAIN}${pathname}`, request.url));
    }

    // Pass through other internal assets
    return NextResponse.next();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SCENARIO B: PUBLIC ROOT DOMAIN (telanganarealty.in / preview / localhost)
  // ───────────────────────────────────────────────────────────────────────────

  // B1. Handle /{locale}/dashboard routes by redirecting to /dashboard
  for (const loc of LOCALES) {
    if (pathname.startsWith(`/${loc}/dashboard`)) {
      const strippedPath = pathname.replace(`/${loc}`, '');
      const redirectUrl = new URL(strippedPath, request.url);
      redirectUrl.search = request.nextUrl.search;
      return NextResponse.redirect(redirectUrl);
    }
  }

  // B2. If user requests /admin or /admin/login on the public domain
  if (pathname === '/admin' || pathname === '/admin/login') {
    if (isCustomProductionDomain) {
      // In production, seamlessly route them to the dedicated admin subdomain
      return NextResponse.redirect(new URL(`https://${ADMIN_DOMAIN}/`, request.url));
    }
    // Return clean 404 on preview/localhost so no unauthenticated admin route exists
    return NextResponse.rewrite(new URL('/_not-found', request.url));
  }

  // B3. If user requests /trh-internal-desk on the public domain
  if (pathname === '/trh-internal-desk' || pathname.endsWith('/trh-internal-desk')) {
    if (isCustomProductionDomain) {
      // Direct staff to their dedicated subdomain
      return NextResponse.redirect(new URL(`https://${ADMIN_DOMAIN}/`, request.url));
    }
    // In dev / preview without DNS, allow internal desk path
    if (pathname === '/trh-internal-desk') {
      return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/trh-internal-desk`, request.url));
    }
    return NextResponse.next();
  }

  // B4. Public Domain Dashboard Gate
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const isStaffRoute =
        pathname.startsWith('/dashboard/verification') ||
        pathname.startsWith('/dashboard/properties') ||
        pathname.startsWith('/dashboard/enquiries');

      if (isStaffRoute) {
        if (isCustomProductionDomain) {
          return NextResponse.redirect(new URL(`https://${ADMIN_DOMAIN}/`, request.url));
        }
        const loginUrl = new URL(`/${DEFAULT_LOCALE}/trh-internal-desk`, request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Public seller/buyer dashboard
      const loginUrl = new URL(`/${DEFAULT_LOCALE}/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Strict Admin Gate
    if (pathname.startsWith('/dashboard/verification')) {
      if (role && role !== 'ADMIN') {
        const dest = role === 'SELLER' ? '/dashboard/seller' : '/dashboard/properties';
        return NextResponse.redirect(new URL(dest, request.url));
      }
    }

    // Staff Gate: Sellers blocked from properties/enquiries
    if (pathname.startsWith('/dashboard/properties') || pathname.startsWith('/dashboard/enquiries')) {
      if (role === 'SELLER') {
        return NextResponse.redirect(new URL('/dashboard/seller', request.url));
      }
    }

    // Non-sellers guided away from seller page
    if (pathname === '/dashboard/seller') {
      if (role === 'ADMIN' || role === 'AGENT') {
        return NextResponse.redirect(new URL('/dashboard/properties', request.url));
      }
    }

    // Root /dashboard dispatcher
    if (pathname === '/dashboard') {
      if (role === 'SELLER') return NextResponse.redirect(new URL('/dashboard/seller', request.url));
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  // B5. Check if pathname starts with a supported locale
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Redirect to default locale prefix if missing
  const targetLocale = DEFAULT_LOCALE;
  const targetPath = pathname === '/' ? `/${targetLocale}` : `/${targetLocale}${pathname}`;
  const redirectUrl = new URL(targetPath, request.url);
  redirectUrl.search = request.nextUrl.search;

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
