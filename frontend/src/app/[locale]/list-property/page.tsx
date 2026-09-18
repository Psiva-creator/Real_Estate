import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidLocale, Locale, getDictionary } from '@/lib/i18n';
import { ShieldCheck, CheckCircle2, Lock, ArrowLeft, Clock, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-[#FAF8F5] py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Breadcrumb & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <nav className="text-xs text-[#8C827A] flex items-center gap-2">
            <Link href={`/${locale}`} className="hover:text-[#191512] transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{dict.nav.home}</span>
            </Link>
            <span>/</span>
            <span className="text-[#191512] font-medium">{dict.nav.listProperty}</span>
          </nav>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <TrustBadge locale={locale} variant="pill" />
          </div>
        </div>

        {/* Page Header with Editorial Hierarchy */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5F1EA] border border-[#E8E2D9] text-[#8C653E] text-[11px] font-semibold tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8C653E]" />
            <span>{isTe ? 'సెల్లర్ ఆన్‌బోర్డింగ్ & 13 డాక్యుమెంట్ల గేట్' : 'Direct Seller Onboarding & 13-Doc Gate'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-normal text-[#191512] tracking-tight leading-tight">
            {isTe
              ? 'మీ ప్రాపర్టీని చట్టబద్ధమైన రక్షణతో అమ్మండి'
              : 'List Your Asset with 100% Legal Protection'}
          </h1>

          <p className="text-xs sm:text-sm text-[#61584F] font-light leading-relaxed max-w-xl mx-auto">
            {isTe
              ? 'అవాంఛనీయ బ్రోకర్ల కాల్స్ లేకుండా, ధరణి & ఈసీ రికార్డులతో ధృవీకరించిన తర్వాతే అర్హులైన కొనుగోలుదారులకు మాత్రమే మీ ప్రాపర్టీ ప్రదర్శించబడుతుంది.'
              : 'Zero marketplace spam. Every land parcel or flat is screened across our 13-point revenue checklist and represented by certified deal mediators.'}
          </p>

          {/* Quick Value Points */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs text-[#61584F]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E2D9]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#8C653E]" />
              <span>{isTe ? 'ఉచిత డాక్యుమెంట్ వెరిఫికేషన్' : 'Zero Listing Fee'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E2D9]">
              <Lock className="w-3.5 h-3.5 text-[#8C653E]" />
              <span>{isTe ? 'యజమాని నంబర్ గోప్యత' : 'Shielded Phone Number'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E2D9]">
              <Clock className="w-3.5 h-3.5 text-[#8C653E]" />
              <span>{isTe ? '24 గంటల్లో లీగల్ సమీక్ష' : '24-Hour Legal Review'}</span>
            </span>
          </div>
        </div>

        {/* Multi-Step Seller Form Container */}
        <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm p-4 sm:p-8">
          <MultiStepForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
