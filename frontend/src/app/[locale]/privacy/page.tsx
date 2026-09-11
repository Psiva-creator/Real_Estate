import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidLocale, Locale } from '@/lib/i18n';
import { ShieldCheck } from 'lucide-react';

interface PrivacyPageProps {
  params: { locale: string };
}

export default function PrivacyPage({ params }: PrivacyPageProps) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isTe = locale === 'te';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>{isTe ? 'గోప్యతా భద్రత' : 'Data Privacy'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {isTe ? 'గోప్యతా విధానం & డేటా రక్షణ' : 'Privacy Policy & Owner Protection'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Last updated: September 2026 • Telangana Realty Hub
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {isTe ? 'యజమానుల సంప్రదింపు వివరాల రక్షణ' : 'Direct Owner Data Shielding'}
          </h2>
          <p>
            {isTe
              ? 'మేము భూమి మరియు ఫ్లాట్ యజమానుల ఫోన్ నంబర్లు లేదా గుర్తింపు పత్రాలను పబ్లిక్ సైట్‌లో ప్రదర్శించము. అన్ని విచారణలు మా అధికారిక బ్రోకరేజ్ ఏజెంట్ల ద్వారా మాత్రమే నిర్వహించబడతాయి.'
              : 'We never publish seller phone numbers, Aadhaar details, or direct contact cards publicly. All buyer enquiries are filtered and facilitated through certified deal mediators to safeguard owners from spam.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {isTe ? 'డాక్యుమెంట్ భద్రత' : 'Document Storage & Confidentiality'}
          </h2>
          <p>
            {isTe
              ? 'ధృవీకరణ కోసం సమర్పించబడిన సేల్ డీడ్, ఈసీ, మరియు రెవెన్యూ పత్రాలు ఎన్‌క్రిప్ట్ చేయబడి భద్రపరచబడతాయి. కేవలం లీగల్ ఆడిట్ మరియు రిజిస్ట్రేషన్ అవసరాలకు మాత్రమే ఉపయోగించబడతాయి.'
              : 'All 13 legal verification documents uploaded during onboarding are stored in encrypted cloud storage and accessible solely by our authorized legal verification officers.'}
          </p>
        </section>
      </div>
    </div>
  );
}
