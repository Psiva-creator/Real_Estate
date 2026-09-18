'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, PlusCircle, ShieldCheck } from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';

interface EditorialCtaSectionProps {
  locale: Locale;
}

export default function EditorialCtaSection({ locale }: EditorialCtaSectionProps) {
  const dict = getDictionary(locale);
  const isTe = locale === 'te';

  return (
    <section className="relative overflow-hidden py-24 sm:py-36 bg-[#141210] text-[#FAF8F5] border-t border-[#2C2520]">
      {/* High-Resolution Architectural Image Background with Dark Luxury Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85"
          alt="Luxury Architecture Facade at Twilight"
          className="w-full h-full object-cover object-center opacity-25 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/90 to-[#141210]/80" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Subtle Category Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E1B18] border border-[#8C653E]/40 text-[#C5A880] text-xs font-semibold tracking-[0.2em] uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>{isTe ? 'గోప్యమైన & ధృవీకరించబడిన మీడియేషన్' : 'Fiduciary Concierge Representation'}</span>
        </div>

        {/* Display Serif Headline */}
        <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#FAF8F5] leading-[1.1] tracking-tight max-w-4xl mx-auto">
          {isTe ? (
            <>
              మీ విలువైన ప్రాపర్టీ లావాదేవీని{' '}
              <span className="italic font-light text-[#C5A880]">పరిపూర్ణ చట్టబద్ధమైన</span> స్పష్టతతో పూర్తి చేయండి
            </>
          ) : (
            <>
              Acquire or Transact Exceptional Real Estate with{' '}
              <span className="italic font-light text-[#C5A880]">Absolute Title</span> Certitude
            </>
          )}
        </h2>

        {/* Minimal Supporting Description */}
        <p className="text-xs sm:text-base text-[#A89F95] max-w-2xl mx-auto leading-relaxed font-normal">
          {isTe
            ? 'మీరు భూమి లేదా ఫ్లాట్ కొనుగోలుదారులైనా, లేదా యజమానులైనా — మా 13-పాయింట్ల రెవెన్యూ గేట్ మరియు లైసెన్స్డ్ ఏజెంట్లు ఇరుపక్షాలకు అత్యున్నత విలువను అందిస్తారు.'
            : 'Whether acquiring a landmark penthouse in Kokapet or listing prime venture acreage along the Outer Ring Road, connect directly with our certified mediation team.'}
        </p>

        {/* Dual Refined CTAs */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/${locale}/properties`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#FAF8F5] hover:bg-[#EFE9E0] text-[#191512] font-semibold text-xs tracking-widest uppercase transition-all shadow-lg active:scale-[0.98]"
          >
            <span>{dict.hero.ctaExplore || 'Browse Verified Portfolio'}</span>
            <ArrowRight className="w-4 h-4 text-[#8C653E]" />
          </Link>

          <Link
            href={`/${locale}/list-property`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#1E1B18] hover:bg-[#28231E] text-[#FAF8F5] border border-[#8C653E]/50 font-semibold text-xs tracking-widest uppercase transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 text-[#C5A880]" />
            <span>{dict.hero.ctaList || 'Represent Your Property'}</span>
          </Link>
        </div>

        {/* Small Disclaimers / Legal Badge */}
        <div className="pt-6 text-xs text-[#8C827A] font-mono tracking-wider">
          <span>HMDA Sanctioned • Dharani Digital Mutation • Zero Broker Spam</span>
        </div>
      </div>
    </section>
  );
}
