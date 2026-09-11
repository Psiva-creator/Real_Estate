import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidLocale, Locale, getDictionary } from '@/lib/i18n';
import { ShieldCheck, Scale, Users, MapPin, Award, CheckCircle2 } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          {isTe ? 'మా గురించి & మా లక్ష్యం' : 'About Our Brokerage'}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          {dict.brand.name}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {dict.brand.tagline}
        </p>
      </div>

      {/* Narrative Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
          <p>
            {isTe
              ? 'తెలంగాణ రియల్ ఎస్టేట్ మార్కెట్‌లో కొనుగోలుదారులు మరియు అమ్మకందారులు ఎదుర్కొనే ప్రధాన సమస్య అస్పష్టమైన రికార్డులు మరియు అవాంఛనీయ మధ్యవర్తుల గందరగోళం. మేము ఈ సమస్యకు శాశ్వత పరిష్కారంగా చట్టపరమైన స్పష్టతతో కూడిన ప్రొఫెషనల్ బ్రోకరేజ్ సేవలను అందిస్తున్నాము.'
              : 'The real estate landscape across Hyderabad and Telangana has long suffered from ambiguous land records, unverified listings, and unregulated middlemen. Telangana Realty Hub was established to bring corporate transparency and legal diligence to every land and apartment transaction.'}
          </p>
          <p>
            {isTe
              ? 'ప్రతి ప్రాపర్టీ లిస్టింగ్‌కు ముందు ధరణి పోర్టల్ రికార్డులు, 30 ఏళ్ల నిరభ్యంతర ఈసీ, లింక్ డాక్యుమెంట్లు మరియు లేఅవుట్ అనుమతులను మా న్యాయవాదుల బృందం క్షుణ్ణంగా పరిశీలిస్తుంది. పూర్తి క్లియరెన్స్ లభించిన తర్వాతే బ్రోకరేజ్ డీల్ ప్రాసెస్ ప్రారంభమవుతుంది.'
              : 'Unlike open classified websites that allow anyone to post unverified listings, our model functions as a fiduciary mediator. We inspect all 13 official Telangana revenue and municipal documents, escort buyers on ground site visits, and coordinate registry documentation end-to-end.'}
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <Scale className="w-6 h-6 text-emerald-700 mb-2" />
            <h3 className="text-sm font-bold text-slate-900">
              {isTe ? '100% చట్టపరమైన స్పష్టత' : 'Legal Due Diligence'}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {isTe ? '13 డాక్యుమెంట్ల కఠినమైన తనిఖీ.' : 'Rigorous 13-document revenue audit.'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <Users className="w-6 h-6 text-emerald-700 mb-2" />
            <h3 className="text-sm font-bold text-slate-900">
              {isTe ? 'సర్టిఫైడ్ డీల్ ఏజెంట్లు' : 'Certified Mediators'}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {isTe ? 'ఇరుపక్షాలకు న్యాయమైన సంప్రదింపులు.' : 'Balanced deal negotiation & price lock.'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <MapPin className="w-6 h-6 text-emerald-700 mb-2" />
            <h3 className="text-sm font-bold text-slate-900">
              {isTe ? 'గ్రౌండ్ సైట్ విజిట్స్' : 'Escorted Site Visits'}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {isTe ? 'సర్వే నంబర్లు మరియు హద్దుల ప్రత్యక్ష పరిశీలన.' : 'Boundary, road width, and FMB checks.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
