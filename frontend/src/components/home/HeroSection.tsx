'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Search,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Building,
  MapPin,
  FileCheck,
} from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import TrustBadge from '../common/TrustBadge';

interface HeroSectionProps {
  locale: Locale;
}

export default function HeroSection({ locale }: HeroSectionProps) {
  const router = useRouter();
  const dict = getDictionary(locale);
  const isTe = locale === 'te';

  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('ALL');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (propertyType !== 'ALL') params.set('type', propertyType);
    router.push(`/${locale}/properties?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white pt-12 pb-20 sm:pt-16 sm:pb-28">
      {/* Background Decorative Mesh & Patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Trust Pill */}
          <div className="inline-flex items-center justify-center">
            <TrustBadge locale={locale} variant="pill" />
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            {dict.hero.title}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal max-w-2xl mx-auto">
            {dict.hero.subtitle}
          </p>

          {/* Quick Stats / Trust Indicators */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-emerald-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isTe ? 'ధరణి & EC 30-ఏళ్ల స్పష్టత' : 'Dharani & 30-Yr EC Clear'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isTe ? 'HMDA & RERA అనుమతులు' : 'HMDA & RERA Sanctioned'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isTe ? 'ప్రత్యక్ష డీల్ మధ్యవర్తిత్వం' : 'Licensed Deal Mediation'}</span>
            </span>
          </div>

          {/* Quick Search Card */}
          <div className="pt-4">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-2xl border border-slate-200/40 text-slate-800 flex flex-col sm:flex-row gap-2"
            >
              {/* Type selector */}
              <div className="sm:w-44 shrink-0">
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full h-12 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700 tap-target"
                >
                  <option value="ALL">{dict.filters.allTypes}</option>
                  <option value="LAND">{dict.filters.land}</option>
                  <option value="FLAT">{dict.filters.flat}</option>
                </select>
              </div>

              {/* Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={dict.hero.searchPlaceholder}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 tap-target"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="h-12 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all tap-target flex items-center justify-center gap-2 active:scale-[0.98] shrink-0"
              >
                <span>{isTe ? 'వెతకండి' : 'Search'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Primary & Secondary Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href={`/${locale}/properties`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-emerald-950 font-bold text-sm sm:text-base shadow-lg hover:bg-emerald-50 transition-all tap-target active:scale-[0.98]"
            >
              <span>{dict.hero.ctaExplore}</span>
              <ArrowRight className="w-4 h-4 text-emerald-800" />
            </Link>

            <Link
              href={`/${locale}/list-property`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white border border-emerald-600/50 font-semibold text-sm sm:text-base transition-all tap-target active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>{dict.hero.ctaList}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
