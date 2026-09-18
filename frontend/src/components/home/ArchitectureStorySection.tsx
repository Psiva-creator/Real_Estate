'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, ShieldCheck, Award } from 'lucide-react';
import { Locale } from '@/lib/i18n';

interface ArchitectureStorySectionProps {
  locale: Locale;
}

export default function ArchitectureStorySection({ locale }: ArchitectureStorySectionProps) {
  const isTe = locale === 'te';

  return (
    <section className="py-20 sm:py-32 bg-[#FAF8F5] border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-[#E8E2D9]/80">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#8C653E] block">
              {isTe ? 'వాస్తు శిల్పం & భూమి నాణ్యత' : 'The Architectural Standard'}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#191512] leading-[1.1] tracking-tight">
              {isTe ? (
                <>
                  చట్టబద్ధమైన స్పష్టతతో కూడిన <span className="italic font-light text-[#8C653E]">అత్యుత్తమ</span> జీవనం
                </>
              ) : (
                <>
                  Elevated Living Rooted in <span className="italic font-light text-[#8C653E]">Unbroken Title</span> Clarity
                </>
              )}
            </h2>
          </div>
          <div className="max-w-md space-y-4">
            <p className="text-xs sm:text-sm text-[#574F48] leading-relaxed">
              {isTe
                ? 'హైదరాబాద్ వెస్ట్‌లోని స్కై విల్లాస్ నుండి శంకర్‌పల్లి, మోకిల మరియు శంషాబాద్ కారిడార్లలోని లగ్జరీ వెంచర్ల వరకు — మా ప్రతి ఆస్తి కేవలం అందమైన కట్టడం మాత్రమే కాదు, పకడ్బందీ 13-డాక్యుమెంట్ రక్షణ కలిగిన ఆస్తి.'
                : 'From sky villas towering over Neopolis to pristine venture parcels along the Outer Ring Road, our portfolio marries visionary architecture with bulletproof revenue diligence.'}
            </p>
            <Link
              href={`/${locale}/about`}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#191512] hover:text-[#8C653E] transition-colors group"
            >
              <span>{isTe ? 'మా తనిఖీ ప్రమాణాలు చదవండి' : 'Read Diligence Standards'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8C653E] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Asymmetrical Magazine Image Collage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Tall Featured Architectural Visual (7 cols) */}
          <div className="lg:col-span-7 relative group rounded-3xl overflow-hidden border border-[#E8E2D9] shadow-[0_12px_40px_-10px_rgba(25,21,18,0.06)] bg-[#EFE9E0] flex flex-col justify-end">
            <div className="aspect-[4/3] sm:aspect-[16/11] lg:aspect-auto lg:h-[580px] w-full relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85"
                alt="Sky Villa Architecture in Financial District"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#191512]/80 via-[#191512]/20 to-transparent" />
            </div>

            {/* Overlaid Editorial Meta */}
            <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-[#FAF8F5]/90 backdrop-blur-md border border-[#E8E2D9]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#8C653E] font-bold block">
                    Financial District • Sky Villa
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#191512] mt-0.5">
                    {isTe ? 'హైదరాబాద్ ఫైనాన్షియల్ డిస్ట్రిక్ట్ స్కై విల్లా' : 'The Panoramic Penthouse Residence'}
                  </h3>
                  <p className="text-xs text-[#574F48] mt-1">
                    4,800 Sq.Ft • 35th Floor • 100% HMDA & RERA Sanctioned
                  </p>
                </div>
                <Link
                  href={`/${locale}/properties/PROP-HYD-004`}
                  className="px-5 py-2.5 rounded-full bg-[#191512] hover:bg-[#8C653E] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 text-center"
                >
                  {isTe ? 'వివరాలు చూడండి' : 'View Residence'}
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Two Asymmetrical Complementary Image Cards (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-8">
            {/* Top Detail Card: Interior Lounge / Architectural Finish */}
            <div className="group rounded-3xl overflow-hidden border border-[#E8E2D9] shadow-sm bg-white p-5 flex flex-col sm:flex-row gap-5 items-center hover:border-[#8C653E]/40 transition-all duration-300">
              <div className="w-full sm:w-44 h-36 rounded-2xl overflow-hidden shrink-0 relative">
                <img
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"
                  alt="Curated Interior Lounge"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C653E] font-bold block">
                  Material & Design
                </span>
                <h4 className="font-serif text-lg font-bold text-[#191512] leading-snug">
                  {isTe ? 'అంతర్జాతీయ ఇంటీరియర్ ప్రమాణాలు' : 'Curated Architectural Finishes'}
                </h4>
                <p className="text-xs text-[#574F48] leading-relaxed">
                  {isTe
                    ? 'హై-ఎండ్ డబుల్-గ్లేజ్డ్ గ్లాస్ ముఖభాగాలు మరియు ప్రకృతి సహజ సిద్ధమైన వెంటిలేషన్.'
                    : 'Double-glazed thermal facades, open-concept floor plans, and double-height living sanctuaries.'}
                </p>
              </div>
            </div>

            {/* Bottom Detail Card: Strategic Land Venture / Landscape */}
            <div className="group rounded-3xl overflow-hidden border border-[#E8E2D9] shadow-sm bg-white p-5 flex flex-col sm:flex-row gap-5 items-center hover:border-[#8C653E]/40 transition-all duration-300">
              <div className="w-full sm:w-44 h-36 rounded-2xl overflow-hidden shrink-0 relative">
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80"
                  alt="Mokila Gated Venture Plot"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C653E] font-bold block">
                  Growth Corridors
                </span>
                <h4 className="font-serif text-lg font-bold text-[#191512] leading-snug">
                  {isTe ? 'ఓఆర్ఆర్ మోకిల విల్లా ప్లాట్లు' : 'Venture Lands & Villa Plots'}
                </h4>
                <p className="text-xs text-[#574F48] leading-relaxed">
                  {isTe
                    ? '40 అడుగుల బీటీ రోడ్లు, 1985 నుండి క్లియర్ లింక్ రికార్డులు మరియు స్పాట్ ధరణి మ్యుటేషన్.'
                    : 'Direct 40-foot avenue access, spot Dharani mutation, and pristine boundary demarcation.'}
                </p>
              </div>
            </div>

            {/* Fiduciary Assurance Quote Strip */}
            <div className="p-6 rounded-3xl bg-[#F5F1EA] border border-[#E8E2D9] flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#191512] text-[#C5A880] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-serif text-sm sm:text-base font-bold text-[#191512] leading-snug">
                  {isTe
                    ? '“ప్రతి కొనుగోలుకు ముందు 30 సంవత్సరాల టైటిల్ ఇన్వెస్టిగేషన్ రిపోర్ట్ మా న్యాయవాదుల నుండి పొందండి.”'
                    : '“Every transaction is backed by a 30-year certified title search conducted by senior High Court advocates.”'}
                </p>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#8C653E] mt-1 block">
                  Legal Compliance Protocol
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
