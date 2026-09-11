import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidLocale, Locale, getDictionary } from '@/lib/i18n';
import { Scale, ShieldCheck } from 'lucide-react';

interface TermsPageProps {
  params: { locale: string };
}

export default function TermsPage({ params }: TermsPageProps) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isTe = locale === 'te';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <Scale className="w-4 h-4" />
          <span>{isTe ? 'చట్టపరమైన నిబంధనలు' : 'Legal Disclaimers'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {isTe ? 'బ్రోకరేజ్ మరియు మధ్యవర్తిత్వ నిబంధనలు' : 'Brokerage Mediation & Representation Terms'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Last updated: September 2026 • Telangana Jurisdiction
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            1. {isTe ? 'మధ్యవర్తిత్వ సేవా స్వభావం' : 'Fiduciary Mediation Representation'}
          </h2>
          <p>
            {isTe
              ? 'తెలంగాణ రియల్టీ హబ్ ఒక అధీకృత బ్రోకరేజ్ మరియు మధ్యవర్తిత్వ వేదిక. మేము అమ్మకందారులు మరియు కొనుగోలుదారుల మధ్య పారదర్శకమైన లావాదేవీలకు సహకరిస్తాము.'
              : 'Telangana Realty Hub acts as a licensed deal mediator and representative. We facilitate verified land and flat transactions by bridging buyers and sellers through verified legal documentation.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            2. {isTe ? '13 డాక్యుమెంట్ల ధృవీకరణ పరిమితులు' : 'The 13-Document Verification Standard'}
          </h2>
          <p>
            {isTe
              ? 'లిస్టింగ్ ప్రచురణకు ముందు సమర్పించిన 13 పత్రాలను మా న్యాయ నిపుణులు పరిశీలిస్తారు. అయితే అధికారిక ప్రభుత్వ రిజిస్ట్రేషన్ సమయంలో అసలు పత్రాల పరిశీలన తప్పనిసరి.'
              : 'Our 13-point verification process cross-references Telangana Dharani portal records, Encumbrance Certificates (EC), and municipal layout sanctions to ensure highest level of diligence.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            3. {isTe ? 'బ్రోకరేజ్ రుసుము మరియు చెల్లింపులు' : 'Brokerage Fee & Deal Completion'}
          </h2>
          <p>
            {isTe
              ? 'విజయవంతమైన సేల్ అగ్రిమెంట్ మరియు రిజిస్ట్రేషన్ ముగింపు సమయంలో మాత్రమే ఒప్పందం ప్రకారం బ్రోకరేజ్ ఫీజు వర్తిస్తుంది.'
              : 'Brokerage compensation is strictly milestone-based upon formal execution of sale deeds and completion of Sub-Registrar Office transfer.'}
          </p>
        </section>
      </div>
    </div>
  );
}
