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
    <div className="min-h-screen bg-gradient-to-b from-[#FBF8F3] via-[#F5F0E8] to-[#FAF8F5] text-[#201512] py-10 sm:py-16 relative overflow-hidden">
      {/* Luxury atmospheric background pattern & ambient glow */}
      <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#201512_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] sm:w-[900px] h-[450px] rounded-full bg-[#E2CFB6]/30 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        {/* Top Breadcrumb & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <nav className="text-xs text-[#8B624C] flex items-center gap-2 font-medium tracking-wide">
            <Link href={`/${locale}`} className="hover:text-[#201512] transition-colors flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5 text-[#C79A6B]" />
              <span>{dict.nav.home}</span>
            </Link>
            <span className="text-[#C79A6B]/50">/</span>
            <span className="text-[#201512] font-semibold">{dict.nav.listProperty}</span>
          </nav>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <TrustBadge locale={locale} variant="pill" />
          </div>
        </div>

        {/* Page Header with Editorial Hierarchy */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5F0E8] border border-[#E2CFB6] text-[#8B624C] text-[11px] font-semibold tracking-[0.18em] uppercase shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C79A6B]" />
            <span>{isTe ? 'సెల్లర్ ఆన్‌బోర్డింగ్ & 13 డాక్యుమెంట్ల గేట్' : 'Direct Seller Onboarding & 13-Doc Gate'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-serif font-normal text-[#201512] tracking-tight leading-[1.15]">
            {isTe
              ? 'మీ ప్రాపర్టీని చట్టబద్ధమైన రక్షణతో అమ్మండి'
              : 'List Your Asset with 100% Legal Protection'}
          </h1>

          <p className="text-xs sm:text-sm text-[#8B624C] font-normal leading-relaxed max-w-xl mx-auto">
            {isTe
              ? 'అవాంఛనీయ బ్రోకర్ల కాల్స్ లేకుండా, ధరణి & ఈసీ రికార్డులతో ధృవీకరించిన తర్వాతే అర్హులైన కొనుగోలుదారులకు మాత్రమే మీ ప్రాపర్టీ ప్రదర్శించబడుతుంది.'
              : 'Zero marketplace spam. Every land parcel or flat is screened across our 13-point revenue checklist and represented by certified deal mediators.'}
          </p>

          {/* Quick Value Points (Feature Badges) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F3] border border-[#E2CFB6]/80 text-[#5A382B] shadow-xs hover:border-[#C79A6B] hover:bg-[#F5F0E8] transition-all duration-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#C79A6B]" />
              <span className="font-medium">{isTe ? 'ఉచిత డాక్యుమెంట్ వెరిఫికేషన్' : 'Zero Listing Fee'}</span>
            </span>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F3] border border-[#E2CFB6]/80 text-[#5A382B] shadow-xs hover:border-[#C79A6B] hover:bg-[#F5F0E8] transition-all duration-300">
              <Lock className="w-3.5 h-3.5 text-[#C79A6B]" />
              <span className="font-medium">{isTe ? 'యజమాని నంబర్ గోప్యత' : 'Shielded Phone Number'}</span>
            </span>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F3] border border-[#E2CFB6]/80 text-[#5A382B] shadow-xs hover:border-[#C79A6B] hover:bg-[#F5F0E8] transition-all duration-300">
              <Clock className="w-3.5 h-3.5 text-[#C79A6B]" />
              <span className="font-medium">{isTe ? '24 గంటల్లో లీగల్ సమీక్ష' : '24-Hour Legal Review'}</span>
            </span>
          </div>
        </div>

        {/* Multi-Step Seller Form Container */}
        <div className="bg-[#FAF8F3] rounded-2xl border border-[#E2CFB6] shadow-[0_16px_50px_-20px_rgba(32,21,18,0.08)] overflow-hidden">
          <MultiStepForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
