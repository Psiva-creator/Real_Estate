import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidLocale, Locale, getDictionary } from '@/lib/i18n';
import { ShieldCheck, CheckCircle2, Lock, ArrowLeft, Clock, Sparkles } from 'lucide-react';
import MultiStepForm from '@/components/seller/MultiStepForm';
import TrustBadge from '@/components/common/TrustBadge';

interface ListPropertyPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: ListPropertyPageProps): Promise<Metadata> {
  const isTe = params.locale === 'te';
  return {
    title: isTe ? 'మీ ప్రాపర్టీని లిస్ట్ చేయండి | తెలంగాణ రియల్టీ హబ్' : 'List Your Land or Flat for Sale',
    description: isTe
      ? 'మీ వ్యవసాయ భూమి, వెంచర్ ప్లాట్ లేదా అపార్ట్‌మెంట్‌ను నేరుగా లిస్ట్ చేయండి. 13-పాయింట్ల ఉచిత రెవెన్యూ ధృవీకరణ పొందండి.'
      : 'Submit your agricultural land, commercial plot, or flat for 13-point revenue document validation and mediated sale in Telangana.',
  };
}

export default function ListPropertyPage({ params }: ListPropertyPageProps) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isTe = locale === 'te';
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#12100E] text-[#201512] dark:text-[#F7F3EC] py-10 sm:py-16 relative overflow-hidden">
      {/* Luxury atmospheric background pattern & ambient glow */}
      <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] bg-[radial-gradient(#8C653E_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] sm:w-[900px] h-[420px] rounded-full bg-[#E2CFB6]/25 dark:bg-[#8C653E]/10 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10 relative z-10">
        {/* Top Breadcrumb & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2CFB6]/70 dark:border-[#2E2822]">
          <nav className="text-xs text-[#8B624C] dark:text-[#BDB2A4] flex items-center gap-2 font-medium tracking-wide">
            <Link href={`/${locale}`} className="hover:text-[#201512] dark:hover:text-white transition-colors flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5 text-[#C79A6B]" />
              <span>{dict.nav.home}</span>
            </Link>
            <span className="text-[#C79A6B]/50">/</span>
            <span className="text-[#201512] dark:text-[#F7F3EC] font-semibold">{dict.nav.listProperty}</span>
          </nav>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <TrustBadge locale={locale} variant="pill" />
          </div>
        </div>

        {/* Page Header with Editorial Hierarchy */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5F0E8] dark:bg-[#231F1B] border border-[#E2CFB6] dark:border-[#3A3028] text-[#8B624C] dark:text-[#E0B684] text-[11px] font-semibold tracking-[0.16em] uppercase shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C79A6B]" />
            <span>{isTe ? 'సెల్లర్ ఆన్‌బోర్డింగ్ & 13 డాక్యుమెంట్ల గేట్' : 'Direct Seller Onboarding · 13-Doc Legal Gate'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-[3.35rem] font-serif font-semibold text-[#191512] dark:text-[#F7F3EC] tracking-tight leading-[1.12]">
            {isTe
              ? 'మీ ప్రాపర్టీని చట్టబద్ధమైన రక్షణతో అమ్మండి'
              : 'List Your Asset with 100% Legal Protection'}
          </h1>

          <p className="text-sm sm:text-base text-[#5A382B] dark:text-[#BDB2A4] font-normal leading-relaxed max-w-2xl mx-auto">
            {isTe
              ? 'అవాంఛనీయ బ్రోకర్ల కాల్స్ లేకుండా, ధరణి & ఈసీ రికార్డులతో ధృవీకరించిన తర్వాతే అర్హులైన కొనుగోలుదారులకు మాత్రమే మీ ప్రాపర్టీ ప్రదర్శించబడుతుంది.'
              : 'Zero marketplace spam. Every land parcel, villa, or apartment is screened across our 13-point Telangana revenue checklist and represented by certified deal mediators.'}
          </p>

          {/* Architectural Value Bar */}
          <div className="pt-3 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E2CFB6]/80 dark:divide-[#2E2822] rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E2CFB6] dark:border-[#2E2822] shadow-xs overflow-hidden">
              <div className="flex items-center justify-center gap-2.5 py-3 px-4 text-xs text-[#201512] dark:text-[#DFD7CC]">
                <CheckCircle2 className="w-4 h-4 text-[#8C653E] dark:text-[#E0B684] shrink-0" />
                <span className="font-semibold tracking-wide">{isTe ? 'ఉచిత డాక్యుమెంట్ వెరిఫికేషన్' : 'Zero Listing Fee'}</span>
              </div>
              <div className="flex items-center justify-center gap-2.5 py-3 px-4 text-xs text-[#201512] dark:text-[#DFD7CC]">
                <Lock className="w-4 h-4 text-[#8C653E] dark:text-[#E0B684] shrink-0" />
                <span className="font-semibold tracking-wide">{isTe ? 'యజమాని నంబర్ గోప్యత' : 'Shielded Phone Number'}</span>
              </div>
              <div className="flex items-center justify-center gap-2.5 py-3 px-4 text-xs text-[#201512] dark:text-[#DFD7CC]">
                <Clock className="w-4 h-4 text-[#8C653E] dark:text-[#E0B684] shrink-0" />
                <span className="font-semibold tracking-wide">{isTe ? '24 గంటల్లో లీగల్ సమీక్ష' : '24-Hour Legal Review'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Step Seller Form Container */}
        <div className="bg-white dark:bg-[#1A1714] rounded-2xl border border-[#E2CFB6] dark:border-[#2E2822] shadow-[0_16px_50px_-20px_rgba(32,21,18,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.55)] overflow-hidden">
          <MultiStepForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
