'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Shield,
  Compass,
  Building2,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';

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
    <section className="relative overflow-hidden bg-[#FAF8F5] text-[#191512] pt-8 pb-20 sm:pt-14 sm:pb-28 border-b border-[#E8E2D9]">
      {/* Subtle architectural background grid */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#191512_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#EFE9E0]/60 blur-3xl pointer-events-none -z-10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ── LEFT COLUMN: Editorial Typography, Search & CTAs (7 cols) ── */}
          <div className="lg:col-span-7 space-y-7 xl:pr-6">
            {/* Architectural Category Eyebrow */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F1EA] text-[#8C653E] border border-[#E8E2D9] text-[11px] font-semibold tracking-[0.2em] uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#8C653E]" />
                <span>
                  {isTe ? '100% చట్టబద్ధమైన లగ్జరీ బ్రోకరేజ్' : 'Fiduciary Real Estate Advisory'}
                </span>
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-widest text-[#8C827A]">
                ORR Radial Zone 1 & 2
              </span>
            </div>

            {/* Display Editorial Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-[#191512] leading-[1.08] tracking-tight">
              {isTe ? (
                <>
                  తెలంగాణ & హైదరాబాద్{' '}
                  <span className="italic font-light text-[#8C653E] block sm:inline">
                    అత్యున్నత
                  </span>{' '}
                  లగ్జరీ ల్యాండ్ & రెసిడెన్సెస్
                </>
              ) : (
                <>
                  Curating Exceptional{' '}
                  <span className="italic font-light text-[#8C653E] block sm:inline">
                    Land & Architectural
                  </span>{' '}
                  Residences
                </>
              )}
            </h1>

            {/* Subtitle description */}
            <p className="text-sm sm:text-base text-[#574F48] leading-relaxed max-w-2xl font-normal">
              {dict.hero.subtitle ||
                'Every high-value land venture and luxury high-rise is verified through our 13-point revenue gate, Dharani records, and 30-year encumbrance search before direct buyer mediation.'}
            </p>

            {/* ── Redesigned Luxury Compact Search Bar ── */}
            <div className="pt-2">
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-[0_8px_30px_-6px_rgba(25,21,18,0.08)] border border-[#E8E2D9] flex flex-col sm:flex-row items-center gap-2 transition-all hover:border-[#C5A880]/60"
              >
                {/* Property Type Dropdown */}
                <div className="w-full sm:w-44 shrink-0">
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full h-12 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] text-xs font-semibold text-[#191512] focus:outline-none focus:ring-1 focus:ring-[#8C653E] cursor-pointer"
                    aria-label="Property Type"
                  >
                    <option value="ALL">{dict.filters.allTypes}</option>
                    <option value="LAND">{dict.filters.land}</option>
                    <option value="FLAT">{dict.filters.flat}</option>
                  </select>
                </div>

                {/* Keyword Input */}
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C827A]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isTe
                        ? 'గ్రామం, ORR కారిడార్ లేదా సర్వే నంబర్...'
                        : 'Search Kokapet, Mokila, Tellapur, or corridor...'
                    }
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] text-xs sm:text-sm text-[#191512] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#8C653E]"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full sm:w-auto h-12 px-7 rounded-xl bg-[#191512] hover:bg-[#8C653E] text-[#FAF8F5] font-semibold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] shrink-0 shadow-sm"
                >
                  <span>{isTe ? 'వెతకండి' : 'Explore'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
                </button>
              </form>
            </div>

            {/* Quick Title & Due Diligence Indicators */}
            <div className="pt-1 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#574F48]">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#8C653E]" />
                <span>{isTe ? 'ధరణి & 30-ఏళ్ల ఈసీ' : 'Dharani & 30-Yr EC Clear'}</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#8C653E]" />
                <span>{isTe ? 'HMDA & RERA ఆమోదం' : 'HMDA & RERA Sanctioned'}</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#8C653E]" />
                <span>{isTe ? 'లైసెన్స్డ్ మీడియేషన్' : 'Direct Deal Mediation'}</span>
              </span>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href={`/${locale}/properties`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#191512] hover:bg-[#8C653E] text-[#FAF8F5] font-semibold text-xs tracking-wider uppercase transition-all shadow-sm active:scale-[0.98]"
              >
                <span>{dict.hero.ctaExplore || 'Browse Portfolio'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
              </Link>

              <Link
                href={`/${locale}/list-property`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#F5F1EA] hover:bg-[#EDE6DA] text-[#191512] border border-[#E8E2D9] font-semibold text-xs tracking-wider uppercase transition-all active:scale-[0.98]"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#8C653E]" />
                <span>{dict.hero.ctaList || 'List Your Property'}</span>
              </Link>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Magazine-Style Asymmetric Visual Showcase (5 cols) ── */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            {/* Main Luxury Architectural Image */}
            <div className="relative rounded-3xl overflow-hidden border border-[#E8E2D9] shadow-[0_20px_50px_-10px_rgba(25,21,18,0.12)] group bg-[#EDE6DA]">
              <div className="aspect-[4/5] relative w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"
                  alt="Luxury Villa & High-Rise Living in Hyderabad"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#191512]/75 via-transparent to-transparent opacity-80" />
              </div>

              {/* Floating Lead Asset Pill / Badge */}
              <div className="absolute top-5 left-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5]/95 backdrop-blur-md text-[#191512] text-[11px] font-semibold border border-[#E8E2D9] shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#8C653E] animate-pulse" />
                  {isTe ? 'ఫీచర్డ్ అసెట్' : 'Featured Architectural Asset'}
                </span>
              </div>

              {/* Bottom Details Overlay Card */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-[#FAF8F5]/95 backdrop-blur-md border border-[#E8E2D9] shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8C653E]">
                      Kokapet Neopolis • Exit 1
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#191512] leading-tight mt-0.5">
                      {isTe ? 'అల్ట్రా-లగ్జరీ స్కై విల్లా & హై-రైజ్' : 'Ultra-Luxury High-Rise Sky Villa'}
                    </h3>
                    <p className="text-xs text-[#574F48] mt-1">
                      {isTe ? '30 ఏళ్ల నిరభ్యంతర ఈసీ ధృవీకరణ' : '13-Point Title Diligence Verified'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C827A] block">
                      Guiding Price
                    </span>
                    <span className="font-serif text-lg sm:text-xl font-bold text-[#191512]">
                      ₹2.85 Cr
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Asymmetrical Floating Secondary Detail Card (Desktop/Tablet) */}
            <div className="hidden sm:block absolute -bottom-8 -left-10 w-48 rounded-2xl overflow-hidden border-2 border-[#FAF8F5] shadow-2xl bg-white p-2.5">
              <div className="aspect-[4/3] relative rounded-xl overflow-hidden mb-2">
                <img
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80"
                  alt="Modern Architectural Pavilion"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-1">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#8C653E] block font-bold">
                  Gated Venture
                </span>
                <span className="text-xs font-serif font-bold text-[#191512] block truncate">
                  Mokila Villa Plots
                </span>
                <span className="text-[10px] text-[#574F48] font-mono block">
                  HMDA Sanctioned
                </span>
              </div>
            </div>

            {/* Fiduciary Seal Badge floating top-right */}
            <div className="absolute -top-4 -right-4 sm:-right-6 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#191512] text-[#FAF8F5] border-2 border-[#FAF8F5] shadow-xl flex flex-col items-center justify-center text-center p-2">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A880] mb-0.5" />
              <span className="text-[8px] sm:text-[9px] font-mono tracking-widest uppercase text-[#C5A880] leading-tight">
                13-GATE
              </span>
              <span className="text-[7px] font-sans text-[#A89F95] uppercase leading-none">
                VERIFIED
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
