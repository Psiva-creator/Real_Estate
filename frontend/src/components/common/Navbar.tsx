'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield, PlusCircle, Building2, MapPin, UserCheck, Users2, LogOut } from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import LanguageToggle from './LanguageToggle';

interface NavbarProps {
  locale: Locale;
}

export default function Navbar({ locale }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const dict = getDictionary(locale);
  const { user, isAuthenticated, isSeller, logout } = useAuth();

  const dashboardHref = isSeller ? '/dashboard/seller' : '/dashboard/properties';

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle sticky shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: `/${locale}/properties`, label: dict.nav.properties, icon: Building2 },
    { href: `/${locale}/properties?type=LAND`, label: dict.nav.lands, icon: MapPin },
    { href: `/${locale}/properties?type=FLAT`, label: dict.nav.flats, icon: Building2 },
    { href: `/${locale}/about`, label: dict.nav.about, icon: Shield },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 bg-white/95 backdrop-blur-md border-b ${
        isScrolled ? 'border-slate-200 shadow-sm' : 'border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-lg min-w-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight group-hover:text-emerald-800 transition-colors truncate">
                {dict.brand.name}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 tracking-wider uppercase hidden xs:block truncate">
                {locale === 'te' ? 'ధృవీకరించబడిన బ్రోకరేజ్' : 'Verified Telangana Brokerage'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-emerald-800 bg-emerald-50 font-semibold'
                      : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Utilities */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageToggle currentLocale={locale} />

            {/* List Property CTA */}
            <Link
              href={`/${locale}/list-property`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-all duration-150 active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 text-emerald-200" />
              <span>{dict.nav.listProperty}</span>
            </Link>

            {/* Team / Account Login or Dashboard Entry */}
            {isAuthenticated && user ? (
              /* ── Authenticated state ─────────────────────────────────────── */
              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                <Link
                  href={dashboardHref}
                  className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
                  title={isSeller ? dict.nav.sellerDashboard || 'Seller Dashboard' : dict.nav.adminDashboard || 'Dashboard'}
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="max-w-[96px] truncate">{user.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-700 text-white font-bold tracking-wide shrink-0">
                    {user.role}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  title={dict.nav.logout || 'Log Out'}
                  aria-label={dict.nav.logout || 'Log Out'}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* ── Unauthenticated: premium login CTA ──────────────────────── */
              <Link
                href={`/${locale}/login`}
                className="group inline-flex items-center gap-2.5 px-4 py-[9px] rounded-lg bg-emerald-800 text-white text-sm font-semibold shadow-sm ring-1 ring-emerald-700/60 hover:bg-emerald-900 hover:shadow-md transition-all duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                title={dict.nav.teamLogin}
                aria-label={dict.nav.teamLogin}
              >
                {/* Icon badge */}
                <span className="flex items-center justify-center w-[22px] h-[22px] rounded-md bg-emerald-700 group-hover:bg-emerald-800 transition-colors shrink-0">
                  <Users2 className="w-3.5 h-3.5 text-emerald-200" />
                </span>
                <span className="whitespace-nowrap leading-none">{dict.nav.teamLogin}</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button & Language Toggle on Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <LanguageToggle currentLocale={locale} className="scale-90" />
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 tap-target flex items-center justify-center"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="max-w-7xl mx-auto px-4 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors tap-target ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-emerald-700 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
              <Link
                href={`/${locale}/list-property`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl bg-emerald-800 text-white font-semibold shadow-sm hover:bg-emerald-700 tap-target text-base"
              >
                <PlusCircle className="w-5 h-5 text-emerald-200 shrink-0" />
                <span>{dict.nav.listProperty}</span>
              </Link>

              {isAuthenticated && user ? (
                /* ── Mobile authenticated state ───────────────────────────── */
                <div className="space-y-2">
                  <Link
                    href={dashboardHref}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold tap-target text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-700" />
                      <span>{user.name}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900 font-bold">
                      {user.role}
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-red-200 text-red-700 font-medium hover:bg-red-50 text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{dict.nav.logout || 'Log Out'}</span>
                  </button>
                </div>
              ) : (
                /* ── Mobile unauthenticated: premium login CTA ─────────────── */
                <Link
                  href={`/${locale}/login`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2.5 w-full px-4 py-3.5 rounded-xl bg-emerald-800 text-white font-semibold tap-target text-sm shadow-sm hover:bg-emerald-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-emerald-700 shrink-0">
                    <Users2 className="w-3.5 h-3.5 text-emerald-200" />
                  </span>
                  <span>{dict.nav.teamLogin}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
