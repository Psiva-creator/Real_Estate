import React from 'react';
import { notFound } from 'next/navigation';
import { isValidLocale, Locale } from '@/lib/i18n';
import { MOCK_PROPERTIES } from '@/lib/mockData';
import HeroSection from '@/components/home/HeroSection';
import TrustSection from '@/components/home/TrustSection';
import FeaturedSection from '@/components/home/FeaturedSection';
import ProcessSection from '@/components/home/ProcessSection';
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
    <div className="space-y-0">
      {/* 1. Hero Section with Quick Search & CTAs */}
      <HeroSection locale={locale} />

      {/* 2. Trust & Value Proposition (13-Document Gate & Deal Mediation) */}
      <TrustSection locale={locale} />

      {/* 3. Featured Verified Properties (Land & Flats) */}
      <FeaturedSection locale={locale} />

      {/* 4. Strategic Telangana Corridor Map Preview */}
      <section className="py-16 sm:py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {isTe ? 'భౌగోళిక విస్తరణ' : 'Growth Corridors'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isTe
                ? 'తెలంగాణ & హైదరాబాద్ ORR కారిడార్లలో ప్రాపర్టీలు'
                : 'Telangana & Hyderabad ORR Radial Zones'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isTe
                ? 'హైదరాబాద్ మెట్రో కోర్, ఔటర్ రింగ్ రోడ్ 5-10 కి.మీ వృద్ధి ప్రాంతాలు మరియు వరంగల్-యాదాద్రి హైవే కారిడార్లు.'
                : 'Explore verified land ventures and apartments mapped across HMDA Service Tiers 1, 2, and 3.'}
            </p>
          </div>

          <MapView properties={MOCK_PROPERTIES} locale={locale} />
        </div>
      </section>

      {/* 5. 4-Step Mediation Workflow */}
      <ProcessSection locale={locale} />
    </div>
  );
}
