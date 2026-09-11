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
    <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            {isTe ? 'పారదర్శక విధానం' : 'The Mediation Process'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {isTe
              ? 'మేము డీల్‌ను ఎలా సురక్షితంగా నిర్వహిస్తాము?'
              : 'How Our Safe Deal Brokerage Works'}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {isTe
              ? 'అనుమానాస్పద లిస్టింగ్‌లు లేవు. ప్రతి రూపాయికి పూర్తి చట్టబద్ధమైన స్పష్టత.'
              : 'Zero unverified listings. Total legal transparency from first phone call to final registration deed.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative flex flex-col justify-between"
            >
              <div className="space-y-4">
                <span className="text-3xl font-black text-emerald-900/20 font-mono block">
                  {step.num}
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-emerald-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg sm:text-2xl font-bold">
              {isTe ? 'మీరు మీ ఆస్తిని అమ్మాలనుకుంటున్నారా?' : 'Are you a Land or Flat Owner?'}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200 max-w-xl">
              {isTe
                ? 'మీ ఆస్తి వివరాలు మరియు పత్రాలను సమర్పించండి. మా టీమ్ వెరిఫికేషన్ పూర్తి చేసి అర్హులైన కొనుగోలుదారులను కనెక్ట్ చేస్తుంది.'
                : 'Submit your property for our 13-document verification gate and access verified buyers without broker spam.'}
            </p>
          </div>
          <Link
            href={`/${locale}/list-property`}
            className="px-6 py-3.5 rounded-xl bg-white text-emerald-950 font-bold text-sm shadow-md hover:bg-emerald-50 transition-all shrink-0 tap-target flex items-center gap-2"
          >
            <span>{dict.hero.ctaList}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
