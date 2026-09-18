import React from 'react';
import { ShieldCheck, Search, Users, FileCheck2, ArrowRight } from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import Link from 'next/link';

interface ProcessSectionProps {
  locale: Locale;
}

export default function ProcessSection({ locale }: ProcessSectionProps) {
  const dict = getDictionary(locale);
  const isTe = locale === 'te';

  const steps = [
    {
      num: '01',
      title: isTe ? 'ప్రాపర్టీ & పత్రాల సమర్పణ' : 'Seller Listing & 13-Doc Submission',
      desc: isTe
        ? 'భూమి లేదా ఫ్లాట్ యజమానులు ప్రాపర్టీ వివరాలు మరియు సేల్ డీడ్, ఈసీ, పట్టాదారు పాస్‌బుక్ వంటి పత్రాలను అప్‌లోడ్ చేస్తారు.'
        : 'Sellers submit their land or apartment details along with the required 13 revenue and title records for pre-screening.',
    },
    {
      num: '02',
      title: isTe ? 'లీగల్ & రెవెన్యూ తనిఖీ' : '13-Point Legal Due Diligence',
      desc: isTe
        ? 'మా న్యాయ నిపుణులు ధరణి పోర్టల్, 30 ఏళ్ల ఈసీ, ఎఫ్.ఎం.బి కొలతలు మరియు హెచ్.ఎండి.ఎ అనుమతులను క్షుణ్ణంగా పరిశీలిస్తారు.'
        : 'Our advocate panel verifies the unbroken chain of link documents, Dharani records, FMB boundaries, and master plan zoning.',
    },
    {
      num: '03',
      title: isTe ? 'ప్రత్యక్ష సైట్ విజిట్' : 'Accompanied Site Inspection',
      desc: isTe
        ? 'కొనుగోలుదారులకు మా సర్టిఫైడ్ ఫీల్డ్ ఏజెంట్ దగ్గరుండి హద్దులు, సర్వే నంబర్లు మరియు చుట్టుపక్కల వాతావరణాన్ని చూపిస్తారు.'
        : 'Buyers get escorted on-ground visits with survey markers check, highway connectivity overview, and zero aggressive sales pressure.',
    },
    {
      num: '04',
      title: isTe ? 'రిజిస్ట్రేషన్ & సురక్షిత ముగింపు' : 'Transparent Deal & Registration',
      desc: isTe
        ? 'ధర లాక్ చేయడం, సేల్ అగ్రిమెంట్ మరియు సబ్-రిజిస్ట్రార్ ఆఫీసులో రిజిస్ట్రేషన్ పూర్తయ్యే వరకు మా టీమ్ అండగా ఉంటుంది.'
        : 'Direct negotiation with price lock, formal sale agreement drafting, and end-to-end guidance at the Sub-Registrar Office.',
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#FAF8F5] border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#8C653E]">
            {isTe ? 'పారదర్శక విధానం' : 'The Mediation Process'}
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#191512] tracking-tight">
            {isTe
              ? 'మేము డీల్‌ను ఎలా సురక్షితంగా నిర్వహిస్తాము?'
              : 'Our Four-Pillar Mediation Journey'}
          </h2>
          <p className="text-sm sm:text-base text-[#574F48] leading-relaxed">
            {isTe
              ? 'అనుమానాస్పద లిస్టింగ్‌లు లేవు. ప్రతి రూపాయికి పూర్తి చట్టబద్ధమైన స్పష్టత.'
              : 'Zero unverified listings. Total legal transparency from first phone call to final registration deed.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-7 border border-[#E8E2D9] shadow-[0_4px_24px_-4px_rgba(25,21,18,0.04)] relative flex flex-col justify-between group hover:border-[#8C653E]/40 hover:shadow-[0_12px_32px_-6px_rgba(25,21,18,0.08)] transition-all duration-300"
            >
              <div className="space-y-4">
                <span className="font-serif text-3xl sm:text-4xl font-normal text-[#C5A880] block">
                  {step.num}
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#191512] leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#574F48] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Concierge Seller Invitation Banner */}
        <div className="bg-[#141210] text-[#FAF8F5] rounded-3xl p-8 sm:p-10 border border-[#2C2520] flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-2.5 text-center md:text-left">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8C653E] block">
              {isTe ? 'సెల్లర్ ఆహ్వానం' : 'Concierge Seller Representation'}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#FAF8F5]">
              {isTe ? 'మీరు మీ ఆస్తిని అమ్మాలనుకుంటున్నారా?' : 'Are you a Land or Flat Owner?'}
            </h3>
            <p className="text-xs sm:text-sm text-[#A89F95] max-w-xl leading-relaxed">
              {isTe
                ? 'మీ ఆస్తి వివరాలు మరియు పత్రాలను సమర్పించండి. మా టీమ్ వెరిఫికేషన్ పూర్తి చేసి అర్హులైన కొనుగోలుదారులను కనెక్ట్ చేస్తుంది.'
                : 'Submit your property for our 13-document verification gate and access vetted, high-net-worth buyers without public marketplace spam.'}
            </p>
          </div>
          <Link
            href={`/${locale}/list-property`}
            className="px-8 py-4 rounded-full bg-[#FAF8F5] hover:bg-[#EFE9E0] text-[#191512] font-semibold text-xs tracking-wider uppercase transition-all shrink-0 tap-target flex items-center gap-2.5 shadow-lg active:scale-[0.98]"
          >
            <span>{dict.hero.ctaList}</span>
            <ArrowRight className="w-4 h-4 text-[#8C653E]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
