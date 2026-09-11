import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidLocale, Locale, getDictionary } from '@/lib/i18n';
import PropertyDiscovery from '@/components/properties/PropertyDiscovery';

interface PropertiesPageProps {
  params: { locale: string };
  searchParams: {
    type?: string;
    q?: string;
    location?: string;
    price?: string;
    area?: string;
    distance?: string;
    verification?: string;
    tier?: string;
  };
}

export default function PropertiesPage({ params, searchParams }: PropertiesPageProps) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isTe = locale === 'te';
  const dict = getDictionary(locale);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 overflow-x-hidden">
      {/* Header & Breadcrumb */}
      <div className="space-y-2">
        <nav className="text-xs text-slate-500 flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href={`/${locale}`} className="hover:text-emerald-700 transition-colors">
            {dict.nav.home}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{dict.nav.properties}</span>
        </nav>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {isTe ? 'ధృవీకరించబడిన ప్రాపర్టీల శోధన' : 'Explore Verified Properties'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          {isTe
            ? 'తెలంగాణ రెవెన్యూ & 13 డాక్యుమెంట్ల వెరిఫికేషన్ పూర్తయిన ల్యాండ్ మరియు అపార్ట్‌మెంట్లు.'
            : 'Explore legally screened land ventures, agricultural parcels, and luxury apartments across Telangana.'}
        </p>
      </div>

      {/* Interactive Day 3 Buyer Discovery Experience */}
      <PropertyDiscovery locale={locale} initialParams={searchParams} />
    </div>
  );
}
