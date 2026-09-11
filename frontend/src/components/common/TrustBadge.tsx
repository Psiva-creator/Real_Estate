'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, X, ExternalLink, FileText } from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { VERIFIED_13_DOCS } from '@/lib/constants';

interface TrustBadgeProps {
  locale: Locale;
  variant?: 'compact' | 'pill' | 'banner';
  showModalOnClick?: boolean;
}

export default function TrustBadge({
  locale,
  variant = 'compact',
  showModalOnClick = true,
}: TrustBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isTe = locale === 'te';

  const badgeText = isTe ? '13-పాయింట్ల లీగల్ వెరిఫైడ్' : '13-Point Legally Verified';
  const subText = isTe ? 'ధరణి & ఈసీ రికార్డులతో తనిఖీ పూర్తయింది' : 'Dharani & 30-Yr EC Cleared';

  if (variant === 'pill') {
    return (
      <>
        <button
          type="button"
          onClick={() => showModalOnClick && setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold hover:bg-emerald-200 transition-colors border border-emerald-300/70"
          title={isTe ? '13 డాక్యుమెంట్ల ధృవీకరణ జాబితా చూడండి' : 'Click to view 13-document verification checklist'}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>{badgeText}</span>
        </button>
        {isOpen && <VerificationModal locale={locale} onClose={() => setIsOpen(false)} />}
      </>
    );
  }

  if (variant === 'banner') {
    return (
      <>
        <div className="bg-emerald-900/95 text-emerald-50 rounded-xl p-4 sm:p-5 shadow-sm border border-emerald-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white tracking-wide">{badgeText}</h4>
              <p className="text-xs sm:text-sm text-emerald-200">{subText}</p>
            </div>
          </div>
          {showModalOnClick && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-xs sm:text-sm font-semibold text-white transition-colors"
            >
              <span>{isTe ? '13 డాక్యుమెంట్ల జాబితా' : 'View 13 Checklist'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {isOpen && <VerificationModal locale={locale} onClose={() => setIsOpen(false)} />}
      </>
    );
  }

  // Default compact variant
  return (
    <>
      <button
        type="button"
        onClick={() => showModalOnClick && setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300/80 text-xs font-semibold hover:bg-emerald-100 transition-colors"
      >
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>{badgeText}</span>
      </button>
      {isOpen && <VerificationModal locale={locale} onClose={() => setIsOpen(false)} />}
    </>
  );
}

function VerificationModal({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const isTe = locale === 'te';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/80 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {isTe ? '13-పాయింట్ల చట్టపరమైన ధృవీకరణ నిబంధనలు' : 'The 13-Point Legal Verification Gate'}
              </h3>
              <p className="text-xs text-emerald-200">
                {isTe
                  ? 'ప్రతి ప్రాపర్టీ లిస్టింగ్‌కు ముందు లీగల్ టీమ్ ద్వారా పరిశీలించబడుతుంది'
                  : 'Mandatory due-diligence gate before any property goes Live'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700/50 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 mb-4 flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              {isTe
                ? 'తెలంగాణ రియల్టీ హబ్ ద్వారా లిస్ట్ చేయబడిన ప్రతి ల్యాండ్ మరియు ఫ్లాట్ ఈ 13 రికార్డుల ఖచ్చితత్వాన్ని పరిశీలించిన తర్వాతే బ్రోకరేజ్ ద్వారా కొనుగోలుదారులకు చూపబడుతుంది.'
                : 'Unlike open marketplaces with unverified or disputed listings, our certified legal team inspects all 13 official Telangana revenue and municipal documents before buyer site visits.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VERIFIED_13_DOCS.map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-200 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {doc.id}
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900">
                      {isTe ? doc.nameTe : doc.nameEn}
                    </h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {isTe ? doc.descTe : doc.descEn}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {isTe ? '100% పారదర్శక బ్రోకరేజ్ హామీ' : '100% Transparent Brokerage Guarantee'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            {isTe ? 'సరే, అర్థమైంది' : 'Understood'}
          </button>
        </div>
      </div>
    </div>
  );
}
