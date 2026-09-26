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
      className={`sticky top-0 z-40 w-full transition-all duration-300 bg-[#FAF8F5]/90 backdrop-blur-md border-b ${
        isScrolled ? 'border-[#E8E2D9] shadow-[0_4px_24px_-4px_rgba(25,21,18,0.06)]' : 'border-[#E8E2D9]/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          {/* Logo & Brand */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8C653E] rounded-lg min-w-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#191512] text-[#FAF8F5] flex items-center justify-center border border-[#8C653E]/40 shadow-sm group-hover:border-[#8C653E] transition-all duration-300 shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A880]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-serif text-lg sm:text-2xl font-bold text-[#191512] tracking-wider uppercase leading-none group-hover:text-[#8C653E] transition-colors truncate">
                {dict.brand.name}
              </span>
              <span className="text-[9px] sm:text-[10px] font-medium text-[#8C653E] tracking-[0.18em] uppercase hidden xs:block truncate mt-1">
                {locale === 'te' ? 'ధృవీకరించబడిన లగ్జరీ బ్రోకరేజ్' : 'Verified Luxury Real Estate Brokerage'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-full text-xs font-medium tracking-wide uppercase transition-all relative ${
                    isActive
                      ? 'text-[#191512] font-bold bg-[#EFE9E0]'
                      : 'text-[#574F48] hover:text-[#191512] hover:bg-[#F5F1EA]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#8C653E]" />
                  )}
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#191512] hover:bg-[#8C653E] text-[#FAF8F5] text-xs font-semibold tracking-wide uppercase shadow-sm transition-all duration-200 active:scale-[0.98]"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{dict.nav.listProperty}</span>
            </Link>

            {/* Team / Account Login or Dashboard Entry */}
            {isAuthenticated && user ? (
              /* ── Authenticated state ─────────────────────────────────────── */
              <div className="flex items-center gap-2 pl-2 border-l border-[#E8E2D9]">
                <Link
                  href={dashboardHref}
                  className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F1EA] hover:bg-[#EFE9E0] text-[#191512] border border-[#E8E2D9] text-xs font-semibold transition-colors"
                  title={isSeller ? dict.nav.sellerDashboard || 'Seller Dashboard' : dict.nav.adminDashboard || 'Dashboard'}
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#8C653E] shrink-0" />
                  <span className="max-w-[90px] truncate">{user.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#8C653E] text-white font-bold tracking-wider uppercase shrink-0">
                    {user.role}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="p-2 text-[#8C827A] hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                  title={dict.nav.logout || 'Log Out'}
                  aria-label={dict.nav.logout || 'Log Out'}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* ── Unauthenticated: luxury portal login CTA ───────────────── */
              <Link
                href={`/${locale}/login?role=ADMIN`}
                className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#E8E2D9] bg-white hover:bg-[#F5F1EA] text-[#191512] text-xs font-semibold tracking-wide uppercase transition-all duration-200 shadow-sm"
                title={dict.nav.teamLogin}
                aria-label={dict.nav.teamLogin}
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#F5F1EA] group-hover:bg-[#EDE6DA] transition-colors shrink-0">
                  <Users2 className="w-3 h-3 text-[#8C653E]" />
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
              className="p-2.5 rounded-full bg-white border border-[#E8E2D9] text-[#191512] hover:bg-[#F5F1EA] focus:outline-none focus:ring-2 focus:ring-[#8C653E] tap-target flex items-center justify-center"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8E2D9] bg-[#FAF8F5] shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto px-5 py-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <nav className="flex flex-col space-y-1.5" aria-label="Mobile Navigation">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-medium transition-colors tap-target ${
                      isActive
                        ? 'bg-[#EFE9E0] text-[#191512] font-semibold border border-[#E8E2D9]'
                        : 'text-[#574F48] hover:bg-[#F5F1EA]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#8C653E] shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[#E8E2D9] flex flex-col gap-3">
              <Link
                href={`/${locale}/list-property`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-full bg-[#191512] text-[#FAF8F5] font-semibold text-xs tracking-wide uppercase shadow-sm hover:bg-[#8C653E] tap-target"
              >
                <PlusCircle className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>{dict.nav.listProperty}</span>
              </Link>

              {isAuthenticated && user ? (
                /* ── Mobile authenticated state ───────────────────────────── */
                <div className="space-y-2">
                  <Link
                    href={dashboardHref}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-2xl bg-white border border-[#E8E2D9] text-[#191512] font-semibold tap-target text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#8C653E]" />
                      <span>{user.name}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8C653E] text-white font-bold tracking-wider uppercase">
                      {user.role}
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full border border-red-200 text-red-700 font-medium hover:bg-red-50 text-xs tracking-wide uppercase"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{dict.nav.logout || 'Log Out'}</span>
                  </button>
                </div>
              ) : (
                /* ── Mobile unauthenticated: portal login CTA ─────────────── */
                <Link
                  href={`/${locale}/login?role=ADMIN`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2.5 w-full px-4 py-3.5 rounded-full bg-white border border-[#E8E2D9] text-[#191512] font-semibold tap-target text-xs tracking-wide uppercase shadow-sm hover:bg-[#F5F1EA] transition-colors"
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#F5F1EA] shrink-0">
                    <Users2 className="w-3 h-3 text-[#8C653E]" />
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
