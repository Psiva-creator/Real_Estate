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
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg space-y-6 sticky top-24">
        {/* Price & Sub-rate */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
              {isTe ? 'అమ్మకపు ధర' : 'Asking Price'}
            </span>
            {property.pricing.isNegotiable && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                {isTe ? 'చర్చించదగినది' : 'Negotiable'}
              </span>
            )}
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1 tracking-tight">
            {formatINR(property.pricing.totalPrice)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
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
        <div className="space-y-2.5 pt-4 border-t border-slate-100">
          {/* Action 1: Book Free Site Visit */}
          <button
            type="button"
            onClick={() => openEnquiry('SITE_VISIT')}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-emerald-200" />
            <span>{dict.propertyDetail.bookVisitBtn}</span>
          </button>

          {/* Action 2: Request Callback */}
          <button
            type="button"
            onClick={() => openEnquiry('CALL')}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>{dict.propertyDetail.requestCallBtn}</span>
          </button>

          {/* Action 3: Ask Legal/Property Question */}
          <button
            type="button"
            onClick={() => openEnquiry('QUESTION')}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>{dict.propertyDetail.askQuestionBtn}</span>
          </button>

          {/* Direct Telephone Mediation desk link */}
          <div className="pt-1 flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Direct Desk:</span>
            <a
              href="tel:+919440012345"
              className="font-mono font-bold text-emerald-800 hover:underline flex items-center gap-1"
            >
              +91 94400 12345
            </a>
          </div>
        </div>

        {/* Certified Deal Mediation Desk Card */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                {dict.propertyDetail.agentName}
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                {dict.propertyDetail.agentDesignation}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <Clock className="w-3 h-3 text-emerald-600" />
              <span>{dict.propertyDetail.agentResponse}</span>
            </div>
            <div className="text-slate-500">
              {dict.propertyDetail.agentHours}
            </div>
          </div>

          {/* Privacy disclaimer */}
          <p className="text-[10px] text-slate-500 leading-normal italic">
            {dict.propertyDetail.agentDisclaimer}
          </p>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="w-full py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">{dict.propertyDetail.copied}</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{dict.propertyDetail.share}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar (visible on < lg) */}
      <div className="fixed lg:hidden bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 px-4 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {isTe ? 'మొత్తం ధర' : 'Total Price'}
          </span>
          <span className="text-base font-extrabold text-slate-900">
            {formatINR(property.pricing.totalPrice)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openEnquiry('CALL')}
            className="py-2.5 px-3.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span>{dict.enquiryModal.tabCall}</span>
          </button>

          <button
            type="button"
            onClick={() => openEnquiry('SITE_VISIT')}
            className="py-2.5 px-4 rounded-xl bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-200" />
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
