'use client';

import React from 'react';
import {
  ShieldCheck,
  FileText,
  Users,
  Compass,
  CheckCircle,
  Award,
  Sparkles,
  ArrowRight,
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
      num: '01',
      badge: isTe ? '13 చట్టపరమైన గేట్లు' : '13-Point Title Gate',
      title: dict.trust.verifiedBadge || 'Rigorous Due Diligence',
      desc: isTe
        ? 'సేల్ డీడ్, 30 ఏళ్ల ఈసీ, పహానీ, ధరణి పాస్‌బుక్, ఎఫ్.ఎం.బి మరియు హెచ్.ఎండి.ఎ అనుమతులను మా లీగల్ టీమ్ ప్రత్యక్షంగా పరిశీలిస్తుంది.'
        : 'Every parcel and unit undergoes independent verification of Sale Deed, 30-Year EC, Dharani Passbook, Pahani, FMB sketch, and HMDA layout approvals.',
    },
    {
      num: '02',
      badge: isTe ? 'ప్రత్యక్ష మీడియేషన్' : 'Licensed Deal Mediation',
      title: dict.trust.brokerageModel || 'Fiduciary Representation',
      desc: dict.trust.brokerageDesc ||
        'We bridge sellers and buyers directly with professional contract drafting, legal escorts, and transparent negotiations.',
    },
    {
      num: '03',
      badge: isTe ? 'ORR గ్రోత్ బెల్ట్' : 'Radial Corridor Authority',
      title: dict.trust.orrAccess || 'Strategic Micro-Markets',
      desc: isTe
        ? 'కోకాపేట్, మోకిల, కొల్లూరు, శంషాబాద్, ఘట్‌కేసర్ వంటి ORR 5–10 కి.మీ వృద్ధి ప్రాంతాలపై ప్రత్యక్ష ఫీల్డ్ కమాండ్.'
        : 'Deep specialization in high-growth corridors within 5–10km of the Outer Ring Road (Kokapet, Mokila, Kollur, Shamshabad, Tellapur).',
    },
    {
      num: '04',
      badge: isTe ? 'జీరో స్పామ్ రక్షణ' : 'Discreet Anti-Spam Shield',
      title: dict.trust.noDirectSpam || 'Confidential Advisory',
      desc: isTe
        ? 'యజమానుల ఫోన్ నంబర్లు బహిరంగంగా ఉంచబడవు. మా సర్టిఫైడ్ ఏజెంట్లు ఇరుపక్షాల మధ్య సరైన సంప్రదింపులను నిర్వహిస్తారు.'
        : 'No nuisance broker spam or leaked owner numbers. Inquiries are vetted and personally escorted by certified advisors.',
    },
  ];

  return (
    <section className="py-20 sm:py-32 bg-[#FAF8F5] border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4 border-b border-[#E8E2D9]/80">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#8C653E] block">
              {isTe ? 'నమ్మకం & చట్టపరమైన భద్రత' : 'The Fiduciary Standard'}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#191512] leading-[1.1] tracking-tight">
              {isTe ? (
                <>
                  సాధారణ క్లాసిఫైడ్స్ కాదు. <span className="italic font-light text-[#8C653E]">ధృవీకరించబడిన</span> మీడియేషన్.
                </>
              ) : (
                <>
                  Not an Open Classifieds Board. <span className="italic font-light text-[#8C653E]">A Certified</span> Fiduciary.
                </>
              )}
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-xs sm:text-sm text-[#574F48] leading-relaxed">
              {isTe
                ? 'తెలంగాణలో అధిక విలువ కలిగిన ప్రాపర్టీ లావాదేవీలకు లోతైన రెవెన్యూ మరియు రిజిస్ట్రేషన్ తనిఖీలు అవసరం. మా 13-పాయింట్ల వెరిఫికేషన్ ప్రక్రియ కొనుగోలుదారులు మరియు అమ్మకందారులకు సంపూర్ణ రక్షణనిస్తుంది.'
                : 'High-value real estate transactions in Telangana require deep revenue and title diligence. We eliminate title ambiguity before buyer discovery.'}
            </p>
          </div>
        </div>

        {/* Asymmetrical 2-Column Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Architectural Verification Artwork & Key Seal (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#E8E2D9] bg-[#EFE9E0] shadow-[0_12px_40px_-10px_rgba(25,21,18,0.08)]">
              <div className="aspect-[4/5] relative w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80"
                  alt="Modern Corporate & Architectural Diligence"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#191512]/85 via-[#191512]/30 to-transparent" />
              </div>

              {/* Architectural Seal Caption Card */}
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-[#FAF8F5]/95 backdrop-blur-md border border-[#E8E2D9]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-[#191512] text-[#C5A880] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C653E] font-bold block">
                      Revenue Protocol
                    </span>
                    <h4 className="font-serif text-base font-bold text-[#191512]">
                      Dharani & High Court Panel
                    </h4>
                  </div>
                </div>
                <p className="text-[11px] text-[#574F48] leading-relaxed">
                  Every parcel undergoes boundary GPS cross-referencing against Dharani digital survey maps and 30-year non-encumbrance verification.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Editorial Trust Pillars with Divider Lines (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="divide-y divide-[#E8E2D9]">
              {trustPillars.map((pillar, idx) => (
                <div key={idx} className="py-6 first:pt-0 last:pb-0 group">
                  <div className="flex items-start gap-6">
                    <span className="font-serif text-2xl sm:text-3xl font-normal text-[#C5A880] group-hover:text-[#8C653E] transition-colors shrink-0 pt-0.5">
                      {pillar.num}
                    </span>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C653E] font-bold">
                          {pillar.badge}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-[#191512]">
                        {pillar.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#574F48] leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 13-Doc Verification Banner Component */}
        <div className="max-w-4xl mx-auto pt-6">
          <TrustBadge locale={locale} variant="banner" showModalOnClick={true} />
        </div>

      </div>
    </section>
  );
}
