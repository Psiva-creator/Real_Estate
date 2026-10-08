'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Share2,
  Check,
  Heart,
  Printer,
} from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import { MockProperty } from '@/lib/mockData';
import { formatINR } from '@/lib/formatters';
import { EnquiryType } from '@/lib/api';
import EnquiryModal from '@/components/enquiry/EnquiryModal';
import { useFavorites } from '@/lib/favorites';
import { CONTACT_CONFIG } from '@/lib/constants';

interface PropertyDetailActionsProps {
  property: MockProperty;
  locale: Locale;
}

export default function PropertyDetailActions({ property, locale }: PropertyDetailActionsProps) {
  const dict = getDictionary(locale);
  const isTe = locale === 'te';
  const { isSaved, toggleSave } = useFavorites();
  const saved = isSaved(property.id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<EnquiryType>('SITE_VISIT');
  const [isCopied, setIsCopied] = useState(false);

  const openEnquiry = (type: EnquiryType) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const title = isTe && property.titleTe ? property.titleTe : property.title;
  const isSold = property.status === 'SOLD';

  return (
    <>
      {/* Desktop Sticky Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E8E2D9] shadow-sm space-y-6 sticky top-24 print:hidden">
        {/* Price & Sub-rate */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-[#8C827A] tracking-widest block">
              {isSold
                ? (isTe ? 'చివరి లిస్టింగ్ విలువ' : 'Last Listed Value')
                : (isTe ? 'అమ్మకపు ధర' : 'Acquisition Value')}
            </span>
            {isSold ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#7A2E22] text-white">
                {isTe ? 'అమ్మబడింది' : 'Sold'}
              </span>
            ) : property.pricing.isNegotiable ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#F5F1EA] border border-[#E8E2D9] text-[#8C653E]">
                {isTe ? 'చర్చించదగినది' : 'Negotiable'}
              </span>
            ) : null}
          </div>
          <div className="text-3xl sm:text-4xl font-serif font-normal text-[#191512] mt-1.5 tracking-tight">
            {formatINR(property.pricing.totalPrice)}
          </div>
          <div className="mt-1.5 text-xs text-[#8C827A] flex flex-wrap gap-2">
            {property.pricing.pricePerAcre && (
              <span>{formatINR(property.pricing.pricePerAcre)} / Acre</span>
            )}
            {property.pricing.pricePerSqft && (
              <span>₹{property.pricing.pricePerSqft.toLocaleString('en-IN')} / sq.ft</span>
            )}
            {property.pricing.pricePerSqYard && (
              <span>₹{property.pricing.pricePerSqYard.toLocaleString('en-IN')} / sq.yd</span>
            )}
          </div>
        </div>

        {/* Primary Functional Action Buttons */}
        <div className="space-y-2.5 pt-4 border-t border-[#E8E2D9]">
          {isSold ? (
            <>
              {/* Action 1 for Sold: Inquire Similar Properties */}
              <button
                type="button"
                onClick={() => openEnquiry('QUESTION')}
                className="w-full py-3.5 px-4 rounded-xl bg-[#8C653E] hover:bg-[#725232] text-white font-medium text-xs tracking-wide shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#F5F1EA]" />
                <span>{dict.propertyDetail.inquireSimilar}</span>
              </button>

              {/* Action 2 for Sold: Request Callback */}
              <button
                type="button"
                onClick={() => openEnquiry('CALL')}
                className="w-full py-3 px-4 rounded-xl border border-[#E8E2D9] hover:bg-[#FAF8F5] text-[#191512] font-medium text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#8C653E]" />
                <span>{dict.propertyDetail.requestCallBtn}</span>
              </button>
            </>
          ) : (
            <>
              {/* Action 1: Book Free Site Visit */}
              <button
                type="button"
                onClick={() => openEnquiry('SITE_VISIT')}
                className="w-full py-3.5 px-4 rounded-xl bg-[#191512] hover:bg-[#2A241F] text-white font-medium text-xs tracking-wide shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#C5A880]" />
                <span>{dict.propertyDetail.bookVisitBtn}</span>
              </button>

              {/* Action 2: Request Callback */}
              <button
                type="button"
                onClick={() => openEnquiry('CALL')}
                className="w-full py-3 px-4 rounded-xl bg-[#8C653E] hover:bg-[#725232] text-white font-medium text-xs tracking-wide transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#F5F1EA]" />
                <span>{dict.propertyDetail.requestCallBtn}</span>
              </button>

              {/* Action 3: Ask Legal/Property Question */}
              <button
                type="button"
                onClick={() => openEnquiry('QUESTION')}
                className="w-full py-2.5 px-4 rounded-xl border border-[#E8E2D9] hover:bg-[#FAF8F5] text-[#191512] font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#8C653E]" />
                <span>{dict.propertyDetail.askQuestionBtn}</span>
              </button>
            </>
          )}

          {/* Direct Telephone Mediation desk link */}
          <div className="pt-2 flex items-center justify-between text-xs text-[#8C827A] px-1">
            <span>Direct Mediation Desk:</span>
            <a
              href={`tel:${CONTACT_CONFIG.mediationDeskPhoneRaw}`}
              className="font-mono font-semibold text-[#8C653E] hover:underline flex items-center gap-1"
            >
              {CONTACT_CONFIG.mediationDeskPhone}
            </a>
          </div>
        </div>

        {/* Certified Deal Mediation Desk Card */}
        <div className="pt-4 border-t border-[#E8E2D9] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F5F1EA] border border-[#E8E2D9] text-[#8C653E] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-serif font-semibold text-[#191512]">
                {dict.propertyDetail.agentName}
              </h4>
              <p className="text-[11px] text-[#8C827A] line-clamp-1">
                {dict.propertyDetail.agentDesignation}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-[#61584F] space-y-1 bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E2D9]">
            <div className="flex items-center gap-1.5 text-[#8C653E] font-medium">
              <Clock className="w-3 h-3 text-[#8C653E]" />
              <span>{dict.propertyDetail.agentResponse}</span>
            </div>
            <div className="text-[#8C827A]">
              {dict.propertyDetail.agentHours}
            </div>
          </div>

          {/* Privacy disclaimer */}
          <p className="text-[10px] text-[#8C827A] leading-normal italic">
            {dict.propertyDetail.agentDisclaimer}
          </p>

          {/* Action Row: Save, Share & Print Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => toggleSave(property.id)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                saved
                  ? 'border-rose-300 bg-rose-50/70 text-rose-700'
                  : 'border-[#E8E2D9] hover:bg-[#FAF8F5] text-[#61584F]'
              }`}
              title={saved ? (isTe ? 'సేవ్ చేసిన వాటి నుండి తొలగించు' : 'Remove from Saved') : (isTe ? 'ప్రాపర్టీని సేవ్ చేయండి' : 'Save Property')}
            >
              <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-rose-500 text-rose-500' : 'text-[#8C653E]'}`} />
              <span>{saved ? (isTe ? 'భద్రపరచబడింది' : 'Saved') : (isTe ? 'సేవ్ చేయండి' : 'Save Property')}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="py-2.5 px-3 rounded-xl border border-[#E8E2D9] hover:bg-[#FAF8F5] text-[#61584F] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#8C653E]" />
                  <span className="text-[#8C653E]">{dict.propertyDetail.copied}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#8C653E]" />
                  <span>{dict.propertyDetail.share}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="col-span-2 py-2.5 px-3 rounded-xl border border-[#E8E2D9] hover:bg-[#FAF8F5] text-[#61584F] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title={isTe ? 'ప్రాపర్టీ సంక్షిప్త నివేదికను ముద్రించండి' : 'Print / Download Executive Brief'}
            >
              <Printer className="w-3.5 h-3.5 text-[#8C653E]" />
              <span>{isTe ? 'ఎగ్జిక్యూటివ్ బ్రీఫ్ ప్రింట్ / డౌన్‌లోడ్ చేయండి' : 'Print / Save Executive Brief'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar (visible on < lg) */}
      <div className="fixed lg:hidden bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E8E2D9] py-2.5 px-3 sm:py-3 sm:px-4 shadow-2xl flex items-center justify-between gap-2 sm:gap-3 print:hidden max-w-full overflow-hidden">
        <div className="shrink min-w-0 pr-1">
          <span className="text-[9px] sm:text-[10px] uppercase font-mono text-[#8C827A] block truncate">
            {isSold
              ? (isTe ? 'చివరి లిస్టింగ్' : 'Last Listed')
              : (isTe ? 'మొత్తం ధర' : 'Total Price')}
          </span>
          <span className="text-sm sm:text-base font-serif font-semibold text-[#191512] whitespace-nowrap block">
            {formatINR(property.pricing.totalPrice)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 justify-end">
          {/* Mobile Save Button */}
          <button
            type="button"
            onClick={() => toggleSave(property.id)}
            className={`p-2 sm:p-2.5 rounded-full border shadow-sm active:scale-95 transition-all shrink-0 ${
              saved
                ? 'border-rose-300 bg-rose-50 text-rose-600'
                : 'border-[#E8E2D9] bg-white text-[#574F48]'
            }`}
            title={saved ? (isTe ? 'సేవ్ చేసిన వాటి నుండి తొలగించు' : 'Remove from Saved') : (isTe ? 'సేవ్ చేయండి' : 'Save Property')}
            aria-label={saved ? 'Remove from Saved' : 'Save Property'}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${saved ? 'fill-rose-500 text-rose-500' : 'text-[#8C653E]'}`} />
          </button>

          <button
            type="button"
            onClick={() => openEnquiry('CALL')}
            className="py-2 px-2.5 sm:py-2.5 sm:px-3.5 rounded-full border border-[#E8E2D9] bg-white text-[#191512] font-medium text-xs flex items-center gap-1 sm:gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
            title={dict.enquiryModal.tabCall}
            aria-label={dict.enquiryModal.tabCall}
          >
            <Phone className="w-3.5 h-3.5 text-[#8C653E]" />
            <span className="hidden xs:inline sm:inline">{dict.enquiryModal.tabCall}</span>
          </button>

          {isSold ? (
            <button
              type="button"
              onClick={() => openEnquiry('QUESTION')}
              className="py-2 px-3 sm:py-2.5 sm:px-4 rounded-full bg-[#8C653E] text-white font-medium text-xs flex items-center gap-1 sm:gap-1.5 shadow-md active:scale-95 transition-all shrink-0 max-w-[150px] sm:max-w-none"
            >
              <MessageSquare className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="truncate">{isTe ? 'ఇలాంటివి' : 'Inquire Similar'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openEnquiry('SITE_VISIT')}
              className="py-2 px-2.5 sm:py-2.5 sm:px-4 rounded-full bg-[#191512] text-white font-medium text-xs flex items-center gap-1 sm:gap-1.5 shadow-md active:scale-95 transition-all shrink-0 max-w-[150px] sm:max-w-none"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
              <span className="truncate">{dict.propertyDetail.bookVisitBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Enquiry Modal */}
      <EnquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        propertyId={property.id}
        propertyTitle={title}
        locale={locale}
        initialType={modalType}
      />
    </>
  );
}
