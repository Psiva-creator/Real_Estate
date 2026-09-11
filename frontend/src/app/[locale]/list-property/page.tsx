import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidLocale, Locale, getDictionary } from '@/lib/i18n';
import { ShieldCheck, CheckCircle2, Lock, ArrowLeft, Clock } from 'lucide-react';
import MultiStepForm from '@/components/seller/MultiStepForm';
import TrustBadge from '@/components/common/TrustBadge';

interface ListPropertyPageProps {
  params: { locale: string };
}

export default function ListPropertyPage({ params }: ListPropertyPageProps) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isTe = locale === 'te';
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Breadcrumb & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <nav className="text-xs text-slate-500 flex items-center gap-1.5">
            <Link href={`/${locale}`} className="hover:text-emerald-800 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{dict.nav.home}</span>
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">{dict.nav.listProperty}</span>
          </nav>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <TrustBadge locale={locale} variant="pill" />
          </div>
        </div>

        {/* Page Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>{isTe ? 'సెల్లర్ ఆన్‌బోర్డింగ్ & 13 డాక్యుమెంట్ల గేట్' : 'Direct Seller Onboarding & 13-Doc Gate'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {isTe
              ? 'మీ ప్రాపర్టీని చట్టబద్ధమైన రక్షణతో అమ్మండి'
              : 'List Your Property with 100% Legal Protection'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isTe
              ? 'అవాంఛనీయ బ్రోకర్ల కాల్స్ లేకుండా, ధరణి & ఈసీ రికార్డులతో ధృవీకరించిన తర్వాతే అర్హులైన కొనుగోలుదారులకు మాత్రమే మీ ప్రాపర్టీ ప్రదర్శించబడుతుంది.'
              : 'Zero marketplace spam. Every land parcel or flat is screened across our 13-point revenue checklist and represented by certified deal mediators.'}
          </p>

          {/* Quick Value Points */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-700 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isTe ? 'ఉచిత డాక్యుమెంట్ వెరిఫికేషన్' : 'Zero Listing Fee'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isTe ? 'యజమాని నంబర్ గోప్యత' : 'Shielded Phone Number'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isTe ? '24 గంటల్లో లీగల్ సమీక్ష' : '24-Hour Legal Review'}</span>
            </span>
          </div>
        </div>

        {/* Multi-Step Seller Form */}
        <MultiStepForm locale={locale} />
      </div>
    </div>
  );
}
