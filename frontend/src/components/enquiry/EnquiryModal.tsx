'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Calendar,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import { EnquiryType, submitEnquiry, EnquirySubmissionResult } from '@/lib/api';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  locale: Locale;
  initialType?: EnquiryType;
}

export default function EnquiryModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  locale,
  initialType = 'SITE_VISIT',
}: EnquiryModalProps) {
  const dict = getDictionary(locale);

  const [activeType, setActiveType] = useState<EnquiryType>(initialType);
  const [buyerName, setBuyerName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('MORNING');
  const [callingWindow, setCallingWindow] = useState('IMMEDIATE');
  const [question, setQuestion] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<EnquirySubmissionResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveType(initialType);
      setErrors({});
      setResult(null);
      setIsCopied(false);
    }
  }, [isOpen, initialType]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!buyerName.trim()) {
      errs.buyerName = dict.enquiryModal.errorNameRequired;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      errs.phone = dict.enquiryModal.errorPhoneInvalid;
    }
    if (activeType === 'SITE_VISIT' && !preferredDate) {
      errs.preferredDate = dict.enquiryModal.errorDateRequired;
    }
    if (activeType === 'QUESTION' && !question.trim()) {
      errs.question = dict.enquiryModal.errorQuestionRequired;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await submitEnquiry({
        propertyId,
        propertyTitle,
        buyerName: buyerName.trim(),
        phone: phone.trim(),
        enquiryType: activeType,
        preferredDate: activeType === 'SITE_VISIT' ? preferredDate : undefined,
        preferredTime: activeType === 'SITE_VISIT' ? preferredTime : undefined,
        callingWindow: activeType === 'CALL' ? callingWindow : undefined,
        message: activeType === 'QUESTION' ? question.trim() : undefined,
      });
      setResult(res);
    } catch {
      const dict2 = getDictionary(locale);
      setErrors({ form: dict2.states?.enquiryError ?? 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRef = () => {
    if (result?.referenceId) {
      navigator.clipboard.writeText(result.referenceId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      <div
        ref={modalRef}
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 id="modal-headline" className="text-base sm:text-lg font-extrabold text-slate-900">
              {activeType === 'SITE_VISIT' && dict.enquiryModal.titleSiteVisit}
              {activeType === 'CALL' && dict.enquiryModal.titleCall}
              {activeType === 'QUESTION' && dict.enquiryModal.titleQuestion}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
              {propertyTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label={dict.enquiryModal.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Success State */}
          {result ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xl font-extrabold text-slate-900">
                  {dict.enquiryModal.successTitle}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  {activeType === 'SITE_VISIT' && dict.enquiryModal.successSiteVisitDesc}
                  {activeType === 'CALL' && dict.enquiryModal.successCallDesc}
                  {activeType === 'QUESTION' && dict.enquiryModal.successQuestionDesc}
                </p>
              </div>

              {/* Reference ID Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 max-w-xs mx-auto flex items-center justify-between gap-3">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    {dict.enquiryModal.referenceId}
                  </span>
                  <span className="font-mono text-sm font-extrabold text-emerald-800">
                    {result.referenceId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1 transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
                >
                  {dict.enquiryModal.close}
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Switch Tabs */}
              <div role="tablist" aria-label="Enquiry type" className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeType === 'SITE_VISIT'}
                  onClick={() => {
                    setActiveType('SITE_VISIT');
                    setErrors({});
                  }}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeType === 'SITE_VISIT'
                      ? 'bg-white text-emerald-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  aria-label={dict.enquiryModal.tabSiteVisit}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{dict.enquiryModal.tabSiteVisit}</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeType === 'CALL'}
                  onClick={() => {
                    setActiveType('CALL');
                    setErrors({});
                  }}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeType === 'CALL'
                      ? 'bg-white text-emerald-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  aria-label={dict.enquiryModal.tabCall}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{dict.enquiryModal.tabCall}</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeType === 'QUESTION'}
                  onClick={() => {
                    setActiveType('QUESTION');
                    setErrors({});
                  }}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeType === 'QUESTION'
                      ? 'bg-white text-emerald-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  aria-label={dict.enquiryModal.tabQuestion}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{dict.enquiryModal.tabQuestion}</span>
                </button>
              </div>

              {/* Subtitle / Trust reminder */}
              <p className="text-xs text-slate-500 leading-relaxed">
                {dict.enquiryModal.subtitle}
              </p>

              {/* Input: Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {dict.enquiryModal.fullName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder={dict.enquiryModal.fullNamePlaceholder}
                  className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 border text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                    errors.buyerName ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                  }`}
                />
                {errors.buyerName && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.buyerName}</span>
                  </p>
                )}
              </div>

              {/* Input: Phone Number */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {dict.enquiryModal.phone} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={dict.enquiryModal.phonePlaceholder}
                    maxLength={10}
                    className={`w-full h-11 pl-12 pr-3.5 rounded-xl bg-slate-50 border text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                      errors.phone ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              {/* Conditional Fields: SITE_VISIT */}
              {activeType === 'SITE_VISIT' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      {dict.enquiryModal.preferredDate} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className={`w-full h-11 px-3 rounded-xl bg-slate-50 border text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                        errors.preferredDate ? 'border-red-400' : 'border-slate-200'
                      }`}
                    />
                    {errors.preferredDate && (
                      <p className="text-[11px] text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.preferredDate}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      {dict.enquiryModal.preferredTime}
                    </label>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                    >
                      <option value="MORNING">{dict.enquiryModal.slotMorning}</option>
                      <option value="AFTERNOON">{dict.enquiryModal.slotAfternoon}</option>
                      <option value="EVENING">{dict.enquiryModal.slotEvening}</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Conditional Fields: CALL */}
              {activeType === 'CALL' && (
                <div className="space-y-1 pt-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {dict.enquiryModal.callingWindow}
                  </label>
                  <select
                    value={callingWindow}
                    onChange={(e) => setCallingWindow(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                  >
                    <option value="IMMEDIATE">{dict.enquiryModal.callImmediate}</option>
                    <option value="MORNING">{dict.enquiryModal.callMorning}</option>
                    <option value="AFTERNOON">{dict.enquiryModal.callAfternoon}</option>
                    <option value="EVENING">{dict.enquiryModal.callEvening}</option>
                  </select>
                </div>
              )}

              {/* Conditional Fields: QUESTION */}
              {activeType === 'QUESTION' && (
                <div className="space-y-1 pt-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {dict.enquiryModal.question} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={dict.enquiryModal.questionPlaceholder}
                    className={`w-full p-3 rounded-xl bg-slate-50 border text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 resize-none ${
                      errors.question ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                    }`}
                  />
                  {errors.question && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.question}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Form-level error (API failure) */}
              {errors.form && (
                <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-3 text-[11px] text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errors.form}</span>
                </div>
              )}

              {/* Privacy protection notice */}
              <div className="bg-emerald-50 rounded-xl p-3 text-[11px] text-emerald-900 border border-emerald-200/70 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>{dict.enquiryModal.privacyNotice}</span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>{dict.enquiryModal.submitting}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-emerald-200" />
                    <span>
                      {activeType === 'SITE_VISIT' && dict.enquiryModal.submitSiteVisit}
                      {activeType === 'CALL' && dict.enquiryModal.submitCall}
                      {activeType === 'QUESTION' && dict.enquiryModal.submitQuestion}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
