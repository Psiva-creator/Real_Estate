import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidLocale, Locale, getDictionary } from '@/lib/i18n';
import PropertyDiscovery from '@/components/properties/PropertyDiscovery';

interface PropertiesPageProps {
  params: { locale: string };
  searchParams: {
    status?: string;
    type?: string;
    q?: string;
    location?: string;
    price?: string;
    area?: string;
    distance?: string;
    verification?: string;
    tier?: string;
    saved?: string;
  };
}

export async function generateMetadata({ params, searchParams }: PropertiesPageProps): Promise<Metadata> {
  const isTe = params.locale === 'te';
  const isSold = searchParams.status === 'SOLD';
  const isLand = searchParams.type === 'LAND';
  const isFlat = searchParams.type === 'FLAT';

  let title = isTe ? 'ధృవీకరించబడిన ప్రాపర్టీల శోధన' : 'Verified Properties & Land for Sale';
  let description = isTe
    ? 'తెలంగాణ రెవెన్యూ & 13 డాక్యుమెంట్ల వెరిఫికేషన్ పూర్తయిన ల్యాండ్ మరియు అపార్ట్‌మెంట్లు.'
    : 'Browse verified agricultural land, commercial plots, and gated apartments in Hyderabad with 13-point revenue document validation.';

  if (isSold) {
    title = isTe ? 'విక్రయించబడిన ప్రాపర్టీల ఆర్కైవ్' : 'Sold Properties Archive';
    description = isTe
      ? 'హైదరాబాద్ మరియు తెలంగాణ అంతటా విజయవంతంగా విక్రయించబడిన ప్రాపర్టీల రికార్డులు.'
      : 'Explore historical benchmark transaction records of successfully mediated properties across Telangana.';
  } else if (isLand) {
    title = isTe ? 'అమ్మకానికి భూములు & ప్లాట్లు' : 'Verified Land & Plots for Sale';
    description = isTe
      ? 'ధరణి పాస్‌బుక్, HMDA మరియు 13 డాక్యుమెంట్ల పరిశీలన పూర్తయిన వ్యవసాయ మరియు వెంచర్ ప్లాట్లు.'
      : 'Explore Dharani passbook-verified agricultural land, farm plots, and HMDA layout ventures in Telangana.';
  } else if (isFlat) {
    title = isTe ? 'అమ్మకానికి అపార్ట్‌మెంట్లు & ఫ్లాట్లు' : 'Apartments & Flats for Sale';
    description = isTe
      ? 'హైదరాబాద్‌లోని ప్రముఖ లొకేషన్లలో రెరా ఆమోదిత లగ్జరీ ఫ్లాట్లు మరియు గేటెడ్ కమ్యూనిటీలు.'
      : 'Discover RERA-registered luxury high-rise apartments and gated communities across Hyderabad growth corridors.';
  }

  return {
    title,
    description,
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
