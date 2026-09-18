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
} from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import { MockProperty } from '@/lib/mockData';
import { formatINR } from '@/lib/formatters';
import { EnquiryType } from '@/lib/api';
import EnquiryModal from '@/components/enquiry/EnquiryModal';

interface PropertyDetailActionsProps {
  property: MockProperty;
  locale: Locale;
}

export default function PropertyDetailActions({ property, locale }: PropertyDetailActionsProps) {
  const dict = getDictionary(locale);
  const isTe = locale === 'te';

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

  return (
    <>
      {/* Desktop Sticky Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E8E2D9] shadow-sm space-y-6 sticky top-24">
        {/* Price & Sub-rate */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-[#8C827A] tracking-widest block">
              {isTe ? 'అమ్మకపు ధర' : 'Acquisition Value'}
            </span>
            {property.pricing.isNegotiable && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#F5F1EA] border border-[#E8E2D9] text-[#8C653E]">
                {isTe ? 'చర్చించదగినది' : 'Negotiable'}
              </span>
            )}
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

          {/* Direct Telephone Mediation desk link */}
          <div className="pt-2 flex items-center justify-between text-xs text-[#8C827A] px-1">
            <span>Direct Mediation Desk:</span>
            <a
              href="tel:+919440012345"
              className="font-mono font-semibold text-[#8C653E] hover:underline flex items-center gap-1"
            >
              +91 94400 12345
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

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="w-full py-2.5 px-3 rounded-xl border border-[#E8E2D9] hover:bg-[#FAF8F5] text-[#61584F] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
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
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar (visible on < lg) */}
      <div className="fixed lg:hidden bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E8E2D9] p-3 px-4 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-mono text-[#8C827A] block">
            {isTe ? 'మొత్తం ధర' : 'Total Price'}
          </span>
          <span className="text-base font-serif font-semibold text-[#191512]">
            {formatINR(property.pricing.totalPrice)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openEnquiry('CALL')}
            className="py-2.5 px-3.5 rounded-full border border-[#E8E2D9] bg-white text-[#191512] font-medium text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-[#8C653E]" />
            <span>{dict.enquiryModal.tabCall}</span>
          </button>

          <button
            type="button"
            onClick={() => openEnquiry('SITE_VISIT')}
            className="py-2.5 px-4 rounded-full bg-[#191512] text-white font-medium text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>{dict.propertyDetail.bookVisitBtn}</span>
          </button>
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
