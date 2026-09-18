'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Users,
  Compass,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import TrustBadge from '../common/TrustBadge';

interface TrustSectionProps {
  locale: Locale;
}

export default function TrustSection({ locale }: TrustSectionProps) {
  const dict = getDictionary(locale);
  const isTe = locale === 'te';

  const trustPillars = [
    {
      icon: ShieldCheck,
      badge: isTe ? '13 డాక్యుమెంట్లు' : '13 Legal Gates',
      title: dict.trust.verifiedBadge,
      desc: isTe
        ? 'సేల్ డీడ్, 30 ఏళ్ల ఈసీ, పహానీ, ధరణి పాస్‌బుక్, ఎఫ్.ఎం.బి మరియు హెచ్.ఎండి.ఎ అనుమతులను మా లీగల్ టీమ్ ప్రత్యక్షంగా పరిశీలిస్తుంది.'
        : 'Every parcel and unit undergoes verification of Sale Deed, 30-Year EC, Dharani Passbook, Pahani, FMB sketch, and HMDA layout approval.',
      color: 'emerald',
    },
    {
      icon: Users,
      badge: isTe ? 'మధ్యవర్తిత్వ రక్షణ' : 'Professional Brokerage',
      title: dict.trust.brokerageModel,
      desc: dict.trust.brokerageDesc,
      color: 'blue',
    },
    {
      icon: Compass,
      badge: isTe ? 'హైదరాబాద్ & ORR' : 'Corridor Specialists',
      title: dict.trust.orrAccess,
      desc: isTe
        ? 'కోకాపేట్, మోకిల, కొల్లూరు, శంషాబాద్, ఘట్‌కేసర్ వంటి ORR 5–10 కి.మీ వృద్ధి ప్రాంతాలపై ప్రత్యేక దృష్టి.'
        : 'Specialized focus on high-growth corridors within 5–10km of the Outer Ring Road (Kokapet, Mokila, Kollur, Shamshabad, Medchal).',
      color: 'amber',
    },
    {
      icon: Award,
      badge: isTe ? 'జీరో స్పామ్' : 'Direct Protection',
      title: dict.trust.noDirectSpam,
      desc: isTe
        ? 'యజమానుల ఫోన్ నంబర్లు బహిరంగంగా ఉంచబడవు. మా సర్టిఫైడ్ ఏజెంట్లు ఇరుపక్షాల మధ్య సరైన సంప్రదింపులను నిర్వహిస్తారు.'
        : 'No nuisance calls or fake seller numbers. All inquiries are screened and managed end-to-end by licensed deal mediators.',
      color: 'purple',
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#FAF8F5] border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5F1EA] text-[#8C653E] border border-[#E8E2D9] text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#8C653E]" />
            <span>{isTe ? 'నమ్మకం & చట్టపరమైన భద్రత' : 'The Fiduciary Advantage'}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#191512] tracking-tight">
            {isTe
              ? 'మేము సాధారణ క్లాసిఫైడ్స్ సైట్ కాదు — నిజమైన డీల్ మీడియేటర్స్'
              : 'Not an Open Classifieds Board. A Certified Deal Mediator.'}
          </h2>
          <p className="text-sm sm:text-base text-[#574F48] leading-relaxed max-w-2xl mx-auto">
            {isTe
              ? 'తెలంగాణలో భూమి లేదా ఫ్లాట్ కొనుగోలు చేసేటప్పుడు ఎదురయ్యే చట్టపరమైన చిక్కులను నివారించడానికి మా 13-పాయింట్ల వెరిఫికేషన్ ప్రక్రియ మీకు సంపూర్ణ రక్షణనిస్తుంది.'
              : 'High-value real estate transactions in Telangana require deep revenue and title diligence. We bridge sellers and buyers with certified legal checks and ground presence.'}
          </p>
        </div>

        {/* 4 Trust Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            const indexStr = String(idx + 1).padStart(2, '0');
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-7 border border-[#E8E2D9] shadow-[0_4px_24px_-4px_rgba(25,21,18,0.04)] hover:shadow-[0_12px_32px_-6px_rgba(25,21,18,0.08)] hover:border-[#8C653E]/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-full bg-[#F5F1EA] text-[#8C653E] border border-[#E8E2D9] flex items-center justify-center group-hover:bg-[#191512] group-hover:text-[#FAF8F5] transition-colors duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-serif text-2xl font-normal text-[#E8E2D9] group-hover:text-[#C5A880] transition-colors">
                      {indexStr}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C653E] block mb-1">
                      {pillar.badge}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#191512] leading-snug">
                      {pillar.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#574F48] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 13-Doc Verification Banner Component */}
        <div className="max-w-4xl mx-auto">
          <TrustBadge locale={locale} variant="banner" showModalOnClick={true} />
        </div>
      </div>
    </section>
  );
}
