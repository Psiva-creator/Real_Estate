import { NextResponse, type NextRequest } from 'next/server';
import { LOCALES, DEFAULT_LOCALE } from '@/lib/i18n';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static assets, next internal files, and APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/locales') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') // file extension like favicon.ico
  ) {
    return NextResponse.next();
  }

  // Handle /{locale}/dashboard routes by redirecting to /dashboard
  for (const loc of LOCALES) {
    if (pathname.startsWith(`/${loc}/dashboard`)) {
      const strippedPath = pathname.replace(`/${loc}`, '');
      const redirectUrl = new URL(strippedPath, request.url);
      redirectUrl.search = request.nextUrl.search;
      return NextResponse.redirect(redirectUrl);
    }
  }

  // ─── Edge RBAC Protection for Back-Office Dashboard Routes ─────────────────
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('trh_token')?.value;
    const role = request.cookies.get('trh_role')?.value;

    // 1. Unauthenticated users cannot view any back-office dashboard
    if (!token) {
      const loginUrl = new URL(`/${DEFAULT_LOCALE}/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Strict Admin Gate: Only ADMIN role can access the 13-Doc Verification Reviewer
    if (pathname.startsWith('/dashboard/verification')) {
      if (role && role !== 'ADMIN') {
        const dest = role === 'SELLER' ? '/dashboard/seller' : '/dashboard/properties';
        return NextResponse.redirect(new URL(dest, request.url));
      }
    }

    // 3. Staff Gate: Sellers are blocked from general broker properties and enquiry management
    if (pathname.startsWith('/dashboard/properties') || pathname.startsWith('/dashboard/enquiries')) {
      if (role === 'SELLER') {
        return NextResponse.redirect(new URL('/dashboard/seller', request.url));
      }
    }

    // 4. Seller Gate: Non-sellers (Admins and Agents) are guided to properties workspace
    if (pathname === '/dashboard/seller') {
      if (role === 'ADMIN' || role === 'AGENT') {
        return NextResponse.redirect(new URL('/dashboard/properties', request.url));
      }
    }

    // 5. Root Dashboard dispatcher
    if (pathname === '/dashboard') {
      let target = '/dashboard/properties';
      if (role === 'SELLER') target = '/dashboard/seller';
      else if (role === 'ADMIN') target = '/dashboard/verification';
      return NextResponse.redirect(new URL(target, request.url));
    }

    return NextResponse.next();
  }

  // Check if pathname starts with a supported locale
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
