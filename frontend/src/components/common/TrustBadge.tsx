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
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F1EA] text-[#5C4026] text-xs font-semibold hover:bg-[#EFE9E0] transition-colors border border-[#E8E2D9] shadow-sm tracking-wide"
          title={isTe ? '13 డాక్యుమెంట్ల ధృవీకరణ జాబితా చూడండి' : 'Click to view 13-document verification checklist'}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#8C653E]" />
          <span>{badgeText}</span>
        </button>
        {isOpen && <VerificationModal locale={locale} onClose={() => setIsOpen(false)} />}
      </>
    );
  }

  if (variant === 'banner') {
    return (
      <>
        <div className="bg-[#1E1B18] text-[#FAF8F5] rounded-2xl p-5 sm:p-6 shadow-md border border-[#2C2520] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#141210] border border-[#8C653E]/50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#C5A880]" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-[#FAF8F5] tracking-wide">{badgeText}</h4>
              <p className="text-xs sm:text-sm text-[#A89F95] mt-0.5">{subText}</p>
            </div>
          </div>
          {showModalOnClick && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#8C653E] hover:bg-[#755231] text-xs font-semibold tracking-wide uppercase text-white transition-all shadow-sm shrink-0"
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
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F1EA] text-[#191512] border border-[#E8E2D9] text-xs font-semibold hover:bg-[#EFE9E0] transition-colors shadow-sm"
      >
        <ShieldCheck className="w-4 h-4 text-[#8C653E] shrink-0" />
        <span>{badgeText}</span>
      </button>
      {isOpen && <VerificationModal locale={locale} onClose={() => setIsOpen(false)} />}
    </>
  );
}

function VerificationModal({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const isTe = locale === 'te';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#E8E2D9] overflow-hidden max-h-[90vh] flex flex-col my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-[#141210] text-[#FAF8F5] border-b border-[#2C2520] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#1E1B18] border border-[#8C653E]/50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold tracking-wide">
                {isTe ? '13-పాయింట్ల చట్టపరమైన ధృవీకరణ నిబంధనలు' : 'The 13-Point Legal Verification Gate'}
              </h3>
              <p className="text-xs text-[#A89F95] mt-0.5">
                {isTe
                  ? 'ప్రతి ప్రాపర్టీ లిస్టింగ్‌కు ముందు లీగల్ టీమ్ ద్వారా పరిశీలించబడుతుంది'
                  : 'Mandatory due-diligence gate before any property goes Live'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#A89F95] hover:text-[#FAF8F5] hover:bg-[#1E1B18] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-[#F5F1EA] border border-[#E8E2D9] rounded-2xl p-4 text-xs text-[#574F48] flex items-start gap-3">
            <FileText className="w-4 h-4 text-[#8C653E] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isTe
                ? 'తెలంగాణ రియల్టీ హబ్ ద్వారా లిస్ట్ చేయబడిన ప్రతి ల్యాండ్ మరియు ఫ్లాట్ ఈ 13 రికార్డుల ఖచ్చితత్వాన్ని పరిశీలించిన తర్వాతే బ్రోకరేజ్ ద్వారా కొనుగోలుదారులకు చూపబడుతుంది.'
                : 'Unlike open classified websites with unverified or disputed listings, our certified legal advisory panel inspects all 13 official Telangana revenue and municipal documents before buyer site visits.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VERIFIED_13_DOCS.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl border border-[#E8E2D9] bg-white hover:border-[#8C653E]/50 transition-colors shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#191512] text-[#C5A880] text-[11px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {doc.id}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#191512]">
                      {isTe ? doc.nameTe : doc.nameEn}
                    </h5>
                    <p className="text-[11px] text-[#574F48] mt-1 leading-relaxed">
                      {isTe ? doc.descTe : doc.descEn}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F5F1EA] border-t border-[#E8E2D9] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#574F48] flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#8C653E]" />
            {isTe ? '100% పారదర్శక బ్రోకరేజ్ హామీ' : '100% Transparent Brokerage Guarantee'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#191512] hover:bg-[#8C653E] text-white text-xs font-semibold tracking-wide uppercase rounded-full transition-colors"
          >
            {isTe ? 'సరే, అర్థమైంది' : 'Understood'}
          </button>
        </div>
      </div>
    </div>
  );
}
