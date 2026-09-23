'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Shield,
  PlusCircle,
  Building2,
  MapPin,
  Home,
  CheckCircle2,
  ChevronDown,
  UserCheck,
  Users2,
  LogOut,
  Archive,
  Layers,
} from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import LanguageToggle from './LanguageToggle';

interface NavbarProps {
  locale: Locale;
}

export default function Navbar({ locale }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'forSale' | 'sold' | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<{ forSale: boolean; sold: boolean }>({
    forSale: true,
    sold: true,
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const dict = getDictionary(locale);
  const isTe = locale === 'te';
  const { user, isAuthenticated, isSeller, logout } = useAuth();

  const dashboardHref = isSeller ? '/dashboard/seller' : '/dashboard/properties';

  // Close mobile drawer and dropdown on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle sticky shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const forSaleCategories = [
    {
      href: `/${locale}/properties?status=FOR_SALE&type=FLAT`,
      label: dict.nav.apartments || (isTe ? 'అపార్ట్‌మెంట్లు' : 'Apartments'),
      subtext: isTe ? 'లగ్జరీ హై-రైజ్ & ఫ్లాట్లు' : 'High-rises & residences',
      icon: Building2,
    },
    {
      href: `/${locale}/properties?status=FOR_SALE&type=LAND`,
      label: dict.nav.landsPlots || (isTe ? 'భూములు / ప్లాట్లు' : 'Lands / Plots'),
      subtext: isTe ? 'వ్యవసాయ & వెంచర్ ప్లాట్లు' : 'Farmlands & layout plots',
      icon: MapPin,
    },
    {
      href: `/${locale}/properties?status=FOR_SALE&type=VILLA`,
      label: dict.nav.villas || (isTe ? 'విల్లాలు' : 'Villas'),
      subtext: isTe ? 'గేటెడ్ ట్రిప్లెక్స్ & విల్లాలు' : 'Gated triplexes & villas',
      icon: Home,
    },
  ];

  const soldCategories = [
    {
      href: `/${locale}/properties?status=SOLD&type=FLAT`,
      label: dict.nav.apartments || (isTe ? 'అపార్ట్‌మెంట్లు' : 'Apartments'),
      subtext: isTe ? 'విక్రయించబడిన ఫ్లాట్లు' : 'Transacted flats',
      icon: Building2,
    },
    {
      href: `/${locale}/properties?status=SOLD&type=LAND`,
      label: dict.nav.landsPlots || (isTe ? 'భూములు / ప్లాట్లు' : 'Lands / Plots'),
      subtext: isTe ? 'విక్రయించబడిన భూములు' : 'Transacted land parcels',
      icon: MapPin,
    },
    {
      href: `/${locale}/properties?status=SOLD&type=VILLA`,
      label: dict.nav.villas || (isTe ? 'విల్లాలు' : 'Villas'),
      subtext: isTe ? 'విక్రయించబడిన విల్లాలు' : 'Transacted luxury villas',
      icon: Home,
    },
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
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-3" aria-label="Main Navigation" ref={dropdownRef}>
            {/* All Properties */}
            <Link
              href={`/${locale}/properties`}
              className={`px-3.5 py-2 rounded-full text-xs font-medium tracking-wide uppercase transition-all relative ${
                pathname === `/${locale}/properties` && !activeDropdown
                  ? 'text-[#191512] font-bold bg-[#EFE9E0]'
                  : 'text-[#574F48] hover:text-[#191512] hover:bg-[#F5F1EA]'
              }`}
            >
              {dict.nav.properties}
            </Link>

            {/* For Sale Dropdown Trigger & Flyout */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('forSale')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'forSale' ? null : 'forSale')}
                aria-expanded={activeDropdown === 'forSale'}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium tracking-wide uppercase transition-all ${
                  activeDropdown === 'forSale' || (pathname.includes('/properties') && pathname.includes('status=FOR_SALE'))
                    ? 'text-[#191512] font-bold bg-[#EFE9E0]'
                    : 'text-[#574F48] hover:text-[#191512] hover:bg-[#F5F1EA]'
                }`}
              >
                <span>{dict.nav.forSale || (isTe ? 'అమ్మకానికి' : 'For Sale')}</span>
                <ChevronDown className={`w-3 h-3 text-[#8C653E] transition-transform duration-200 ${activeDropdown === 'forSale' ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Card */}
              {activeDropdown === 'forSale' && (
                <div className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-2xl border border-[#E8E2D9] shadow-[0_12px_36px_-6px_rgba(25,21,18,0.12)] p-2 z-50 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 border-b border-[#E8E2D9]/60 flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#8C653E]">
                      {isTe ? 'అమ్మకానికి అందుబాటులో ఉన్నవి' : 'Available For Sale'}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#F5F1EA] text-[#5C4026] font-semibold">
                      {isTe ? '13 డాక్స్ ధృవీకరించినవి' : '13-Doc Verified'}
                    </span>
                  </div>

                  <div className="py-1 space-y-0.5">
                    {forSaleCategories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <Link
                          key={cat.href}
                          href={cat.href}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5F1EA] text-[#191512] group transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-center text-[#8C653E] group-hover:bg-[#191512] group-hover:text-white transition-colors shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold tracking-wide">
                              {cat.label}
                            </span>
                            <span className="text-[10px] text-[#8C827A] truncate">
                              {cat.subtext}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="pt-1.5 mt-1 border-t border-[#E8E2D9]/60">
                    <Link
                      href={`/${locale}/properties?status=FOR_SALE`}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-semibold text-[#8C653E] hover:bg-[#F5F1EA] transition-colors"
                    >
                      <span>{isTe ? 'అన్ని అమ్మకపు ప్రాపర్టీలు చూడండి' : 'View All For Sale'}</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Sold Dropdown Trigger & Flyout */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('sold')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'sold' ? null : 'sold')}
                aria-expanded={activeDropdown === 'sold'}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium tracking-wide uppercase transition-all ${
                  activeDropdown === 'sold' || (pathname.includes('/properties') && pathname.includes('status=SOLD'))
                    ? 'text-[#191512] font-bold bg-[#EFE9E0]'
                    : 'text-[#574F48] hover:text-[#191512] hover:bg-[#F5F1EA]'
                }`}
              >
                <span>{dict.nav.sold || (isTe ? 'విక్రయించబడినవి' : 'Sold')}</span>
                <ChevronDown className={`w-3 h-3 text-[#8C653E] transition-transform duration-200 ${activeDropdown === 'sold' ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Card */}
              {activeDropdown === 'sold' && (
                <div className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-2xl border border-[#E8E2D9] shadow-[0_12px_36px_-6px_rgba(25,21,18,0.12)] p-2 z-50 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 border-b border-[#E8E2D9]/60 flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#8C653E]">
                      {isTe ? 'విక్రయించబడిన ప్రాపర్టీల ఆర్కైవ్' : 'Sold Transacted Archive'}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#F5F1EA] text-[#8C827A] font-semibold">
                      {isTe ? 'పూర్తయినవి' : 'Closed Deals'}
                    </span>
                  </div>

                  <div className="py-1 space-y-0.5">
                    {soldCategories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <Link
                          key={cat.href}
                          href={cat.href}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5F1EA] text-[#191512] group transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-center text-[#8C827A] group-hover:bg-[#191512] group-hover:text-white transition-colors shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold tracking-wide">
                              {cat.label}
                            </span>
                            <span className="text-[10px] text-[#8C827A] truncate">
                              {cat.subtext}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="pt-1.5 mt-1 border-t border-[#E8E2D9]/60">
                    <Link
                      href={`/${locale}/properties?status=SOLD`}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-semibold text-[#8C653E] hover:bg-[#F5F1EA] transition-colors"
                    >
                      <span>{isTe ? 'విక్రయించబడిన అన్ని ప్రాపర్టీలు' : 'View All Sold Archive'}</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* About */}
            <Link
              href={`/${locale}/about`}
              className={`px-3.5 py-2 rounded-full text-xs font-medium tracking-wide uppercase transition-all relative ${
                pathname === `/${locale}/about`
                  ? 'text-[#191512] font-bold bg-[#EFE9E0]'
                  : 'text-[#574F48] hover:text-[#191512] hover:bg-[#F5F1EA]'
              }`}
            >
              {dict.nav.about}
            </Link>
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
                href={`/${locale}/login`}
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
            {/* Top Level: Explore All */}
            <Link
              href={`/${locale}/properties`}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-colors border ${
                pathname === `/${locale}/properties`
                  ? 'bg-[#191512] text-white border-[#191512]'
                  : 'bg-white text-[#191512] border-[#E8E2D9] hover:bg-[#F5F1EA]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-[#8C653E]" />
                <span>{dict.nav.properties}</span>
              </div>
              <span>→</span>
            </Link>

            {/* FOR SALE SECTION */}
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-4 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D9]/70">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8C653E] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{dict.nav.forSale || (isTe ? 'అమ్మకానికి' : 'For Sale')}</span>
                </span>
                <Link
                  href={`/${locale}/properties?status=FOR_SALE`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[10px] font-semibold text-[#8C827A] hover:text-[#191512]"
                >
                  {isTe ? 'అన్నీ' : 'All'} →
                </Link>
              </div>

              <div className="space-y-1">
                {forSaleCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F5F1EA] text-[#191512] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#8C653E]" />
                        <span className="text-xs font-medium">{cat.label}</span>
                      </div>
                      <span className="text-[10px] text-[#8C827A]">→</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* SOLD SECTION */}
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-4 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D9]/70">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8C827A] flex items-center gap-1.5">
                  <Archive className="w-3.5 h-3.5 text-[#8C653E]" />
                  <span>{dict.nav.sold || (isTe ? 'విక్రయించబడినవి' : 'Sold Archive')}</span>
                </span>
                <Link
                  href={`/${locale}/properties?status=SOLD`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[10px] font-semibold text-[#8C827A] hover:text-[#191512]"
                >
                  {isTe ? 'అన్నీ' : 'All'} →
                </Link>
              </div>

              <div className="space-y-1">
                {soldCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F5F1EA] text-[#191512] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#8C827A]" />
                        <span className="text-xs font-medium">{cat.label}</span>
                      </div>
                      <span className="text-[10px] text-[#8C827A]">→</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* About */}
            <Link
              href={`/${locale}/about`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-[#E8E2D9] text-[#191512] font-semibold text-xs uppercase tracking-wider hover:bg-[#F5F1EA] transition-colors"
            >
              <Shield className="w-4 h-4 text-[#8C653E]" />
              <span>{dict.nav.about}</span>
            </Link>

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
                  href={`/${locale}/login`}
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
