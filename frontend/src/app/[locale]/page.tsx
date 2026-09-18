import React from 'react';
import { notFound } from 'next/navigation';
import { isValidLocale, Locale } from '@/lib/i18n';
import { MOCK_PROPERTIES } from '@/lib/mockData';
import HeroSection from '@/components/home/HeroSection';
import ArchitectureStorySection from '@/components/home/ArchitectureStorySection';
import FeaturedSection from '@/components/home/FeaturedSection';
import TrustSection from '@/components/home/TrustSection';
import ProcessSection from '@/components/home/ProcessSection';
import EditorialCtaSection from '@/components/home/EditorialCtaSection';
import MapView from '@/components/properties/MapView';

interface HomePageProps {
  params: {
    locale: string;
  };
}

export default function HomePage({ params }: HomePageProps) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const isTe = locale === 'te';

  return (
    <div className="space-y-0 bg-[#FAF8F5]">
      {/* 1. Asymmetrical Luxury Editorial Hero with Integrated Search */}
      <HeroSection locale={locale} />

      {/* 2. Architecture Collage & Visual Story Section */}
      <ArchitectureStorySection locale={locale} />

      {/* 3. Magazine-Style Featured Properties Showcase */}
      <FeaturedSection locale={locale} />

      {/* 4. The Fiduciary Diligence & 13-Document Verification Gate */}
      <TrustSection locale={locale} />

      {/* 5. Strategic Telangana Corridor Map Showcase */}
      <section className="py-20 sm:py-32 bg-[#141210] text-[#FAF8F5] border-b border-[#2C2520]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4 border-b border-[#2C2520]">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C5A880] block">
                {isTe ? 'భౌగోళిక విస్తరణ' : 'Growth Corridors'}
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#FAF8F5] leading-[1.1] tracking-tight">
                {isTe
                  ? 'హైదరాబాద్ ORR రేడియల్ జోన్లు'
                  : 'Telangana & Hyderabad Radial Zones'}
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-xs sm:text-sm text-[#A89F95] leading-relaxed">
                {isTe
                  ? 'హైదరాబాద్ మెట్రో కోర్, ఔటర్ రింగ్ రోడ్ 5-10 కి.మీ వృద్ధి ప్రాంతాలు మరియు వరంగల్-యాదాద్రి హైవే కారిడార్లలోని ఖచ్చితమైన ప్రాపర్టీలు.'
                  : 'Explore verified land ventures and architectural apartments mapped across HMDA Radial Service Tiers 1, 2, and 3.'}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#2C2520] overflow-hidden shadow-2xl">
            <MapView properties={MOCK_PROPERTIES} locale={locale} />
          </div>
        </div>
      </section>

      {/* 6. Four-Pillar Mediation Workflow & Seller Concierge */}
      <ProcessSection locale={locale} />

      {/* 7. Final Full-Bleed Architectural Call to Action */}
      <EditorialCtaSection locale={locale} />
    </div>
  );
}
