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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 overflow-x-hidden">
      {/* Header & Breadcrumb */}
      <div className="space-y-3">
        <nav className="text-xs text-[#8C827A] flex items-center gap-2" aria-label="Breadcrumb">
          <Link href={`/${locale}`} className="hover:text-[#191512] transition-colors">
            {dict.nav.home}
          </Link>
          <span>/</span>
          <span className="text-[#191512] font-semibold tracking-wide uppercase text-[10px]">{dict.nav.properties}</span>
        </nav>
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#8C653E] block">
          {isTe ? 'ధృవీకరించబడిన పోర్ట్‌ఫోలియో' : 'Curated Portfolio'}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#191512] tracking-tight">
          {isTe ? 'ధృవీకరించబడిన ప్రాపర్టీల శోధన' : 'Explore Verified Properties & Land'}
        </h1>
        <p className="text-sm sm:text-base text-[#574F48] max-w-3xl leading-relaxed">
          {isTe
            ? 'తెలంగాణ రెవెన్యూ & 13 డాక్యుమెంట్ల వెరిఫికేషన్ పూర్తయిన ల్యాండ్ మరియు అపార్ట్‌మెంట్లు.'
            : 'Explore legally audited land ventures, agricultural estates, and architectural residences across Telangana with 13-document certification.'}
        </p>
      </div>

      {/* Interactive Buyer Discovery Experience */}
      <PropertyDiscovery locale={locale} initialParams={searchParams} />
    </div>
  );
}
