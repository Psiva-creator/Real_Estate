import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidLocale, Locale, getDictionary } from '@/lib/i18n';
import { ShieldCheck, Scale, Users, MapPin, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import TrustBadge from '@/components/common/TrustBadge';

interface AboutPageProps {
  params: { locale: string };
}

export default function AboutPage({ params }: AboutPageProps) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isTe = locale === 'te';
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header with Luxury Serif Hierarchy */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5F1EA] border border-[#E8E2D9] text-[#8C653E] text-[11px] font-semibold tracking-widest uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8C653E]" />
            <span>{isTe ? 'మా గురించి & మా లక్ష్యం' : 'Our Charter & Fiduciary Ethos'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#191512] tracking-tight leading-[1.15]">
            {dict.brand.name}
          </h1>

          <p className="text-base sm:text-lg text-[#61584F] font-light leading-relaxed max-w-2xl mx-auto">
            {dict.brand.tagline}
          </p>
        </div>

        {/* Editorial Narrative Card */}
        <div className="bg-white rounded-2xl p-7 sm:p-12 border border-[#E8E2D9] shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-[#E8E2D9] pb-6 md:pb-0 md:pr-8 space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C653E] block">
                The Core Manifesto
              </span>
              <blockquote className="font-serif text-2xl text-[#191512] leading-snug italic">
                &ldquo;True luxury in real estate is unconditional legal certainty.&rdquo;
              </blockquote>
              <p className="text-xs text-[#8C653E] pt-2">
                — Directorate of Conveyancing & Diligence
              </p>
            </div>

            <div className="md:col-span-8 space-y-5 text-sm sm:text-base text-[#4A423A] font-light leading-relaxed">
              <p>
                {isTe
                  ? 'తెలంగాణ రియల్ ఎస్టేట్ మార్కెట్‌లో కొనుగోలుదారులు మరియు అమ్మకందారులు ఎదుర్కొనే ప్రధాన సమస్య అస్పష్టమైన రికార్డులు మరియు అవాంఛనీయ మధ్యవర్తుల గందరగోళం. మేము ఈ సమస్యకు శాశ్వత పరిష్కారంగా చట్టపరమైన స్పష్టతతో కూడిన ప్రొఫెషనల్ బ్రోకరేజ్ సేవలను అందిస్తున్నాము.'
                  : 'The real estate landscape across Hyderabad and Telangana has long suffered from ambiguous land records, unverified listings, and unregulated middlemen. Telangana Realty Hub was established to bring corporate transparency, archival diligence, and legal peace of mind to prime land parcels and bespoke residential acquisitions.'}
              </p>
              <p>
                {isTe
                  ? 'ప్రతి ప్రాపర్టీ లిస్టింగ్‌కు ముందు ధరణి పోర్టల్ రికార్డులు, 30 ఏళ్ల నిరభ్యంతర ఈసీ, లింక్ డాక్యుమెంట్లు మరియు లేఅవుట్ అనుమతులను మా న్యాయవాదుల బృందం క్షుణ్ణంగా పరిశీలిస్తుంది. పూర్తి క్లియరెన్స్ లభించిన తర్వాతే బ్రోకరేజ్ డీల్ ప్రాసెస్ ప్రారంభమవుతుంది.'
                  : 'Unlike open classified listing boards that permit unvetted postings, our practice operates as a fiduciary advisory. We rigorously inspect all 13 official Telangana revenue and municipal instruments, escort our patrons on private ground site visits, and coordinate registry documentation end-to-end.'}
              </p>
            </div>
          </div>

          {/* 3 Advisory Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-8 border-t border-[#E8E2D9]">
            <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] space-y-3 hover:border-[#8C653E]/40 transition-colors">
              <div className="flex items-center justify-between">
                <Scale className="w-5 h-5 text-[#8C653E]" />
                <span className="font-mono text-[10px] text-[#A39A8F]">01</span>
              </div>
              <h3 className="text-base font-serif font-semibold text-[#191512]">
                {isTe ? '100% చట్టపరమైన స్పష్టత' : 'Legal Due Diligence'}
              </h3>
              <p className="text-xs text-[#61584F] leading-relaxed">
                {isTe ? '13 డాక్యుమెంట్ల కఠినమైన తనిఖీ మరియు 30 ఏళ్ల టైటిల్ ట్రాక్.' : 'Rigorous 13-document revenue audit & 30-year unencumbered chain of title.'}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] space-y-3 hover:border-[#8C653E]/40 transition-colors">
              <div className="flex items-center justify-between">
                <Users className="w-5 h-5 text-[#8C653E]" />
                <span className="font-mono text-[10px] text-[#A39A8F]">02</span>
              </div>
              <h3 className="text-base font-serif font-semibold text-[#191512]">
                {isTe ? 'సర్టిఫైడ్ డీల్ ఏజెంట్లు' : 'Certified Mediators'}
              </h3>
              <p className="text-xs text-[#61584F] leading-relaxed">
                {isTe ? 'ఇరుపక్షాలకు న్యాయమైన సంప్రదింపులు మరియు స్థిరమైన ధర.' : 'Structured fiduciary negotiation, escrow facilitation, and locked fair pricing.'}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] space-y-3 hover:border-[#8C653E]/40 transition-colors">
              <div className="flex items-center justify-between">
                <MapPin className="w-5 h-5 text-[#8C653E]" />
                <span className="font-mono text-[10px] text-[#A39A8F]">03</span>
              </div>
              <h3 className="text-base font-serif font-semibold text-[#191512]">
                {isTe ? 'గ్రౌండ్ సైట్ విజిట్స్' : 'Escorted Ground Visits'}
              </h3>
              <p className="text-xs text-[#61584F] leading-relaxed">
                {isTe ? 'సర్వే నంబర్లు మరియు హద్దుల ప్రత్యక్ష పరిశీలన.' : 'Boundary demarcation, master plan road widths, and FMB verification.'}
              </p>
            </div>
          </div>
        </div>

        {/* Regulatory Governance & Badges */}
        <div className="bg-[#F5F1EA] rounded-2xl p-6 sm:p-8 border border-[#E8E2D9] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8C653E]/10 border border-[#8C653E]/30 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-[#8C653E]" />
            </div>
            <div>
              <h4 className="text-sm font-serif font-semibold text-[#191512]">
                {isTe ? 'తెలంగాణ రెవెన్యూ నిబంధనల ప్రకారం సర్టిఫై చేయబడింది' : 'Compliant with Telangana Revenue & Municipal Directives'}
              </h4>
              <p className="text-xs text-[#61584F]">
                {isTe ? 'ధరణి & రిజిస్ట్రేషన్ల శాఖ నిబంధనలకు కట్టుబడి పనిచేస్తుంది.' : 'Strict alignment with Dharani Land Records, HMDA 2031 & RERA Framework.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/${locale}/properties`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#191512] text-white text-xs font-semibold hover:bg-[#2A241F] transition-colors shadow-sm"
            >
              <span>{dict.nav.properties}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
