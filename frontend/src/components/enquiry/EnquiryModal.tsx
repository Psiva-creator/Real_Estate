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
  MessageCircle,
  ExternalLink,
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

interface VisitSlotOption {
  time: string;
  tag?: string;
  tagTe?: string;
}

interface VisitSlotGroup {
  period: string;
  periodTe: string;
  slots: VisitSlotOption[];
}

const VISIT_SLOT_GROUPS: VisitSlotGroup[] = [
  {
    period: 'Morning',
    periodTe: 'ఉదయం',
    slots: [
      { time: '09:30 AM - 11:00 AM', tag: 'Fresh Air', tagTe: 'ఆహ్లాదకరం' },
      { time: '11:00 AM - 12:30 PM', tag: 'Popular', tagTe: 'ఎక్కువ మంది ఎంపిక' },
    ],
  },
  {
    period: 'Afternoon',
    periodTe: 'మధ్యాహ్నం',
    slots: [
      { time: '01:30 PM - 03:00 PM', tag: 'Clear Sunlight', tagTe: 'స్పష్టమైన వెలుతురు' },
      { time: '03:00 PM - 04:30 PM', tag: 'Recommended', tagTe: 'సిఫార్సు' },
    ],
  },
  {
    period: 'Evening',
    periodTe: 'సాయంత్రం',
    slots: [
      { time: '04:30 PM - 06:00 PM', tag: 'Golden Hour', tagTe: 'గోల్డెన్ అవర్' },
      { time: '06:00 PM - 07:30 PM', tag: 'Post-Work', tagTe: 'ఆఫీస్ సమయం తర్వాత' },
    ],
  },
];

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
  const [selectedSlotTime, setSelectedSlotTime] = useState('11:00 AM - 12:30 PM');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
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

  const todayStr = new Date().toISOString().split('T')[0];

  const getQuickDates = () => {
    const today = new Date();

    const tmrw = new Date(today);
    tmrw.setDate(today.getDate() + 1);
    const tmrwStr = tmrw.toISOString().split('T')[0];

    const sat = new Date(today);
    const dayOfWeek = today.getDay();
    const daysUntilSat = (6 - dayOfWeek + 7) % 7 || 7;
    sat.setDate(today.getDate() + daysUntilSat);
    const satStr = sat.toISOString().split('T')[0];

    const sun = new Date(today);
    const daysUntilSun = (7 - dayOfWeek + 7) % 7 || 7;
    sun.setDate(today.getDate() + daysUntilSun);
    const sunStr = sun.toISOString().split('T')[0];

    return [
      { key: 'tomorrow', label: dict.enquiryModal.tomorrow || 'Tomorrow', date: tmrwStr },
      { key: 'thisSaturday', label: dict.enquiryModal.thisSaturday || 'This Saturday', date: satStr },
      { key: 'thisSunday', label: dict.enquiryModal.thisSunday || 'This Sunday', date: sunStr },
    ];
  };

  const getWhatsAppConfirmationUrl = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const isTe = locale === 'te';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://frontend-six-psi-ecroth2n1r.vercel.app';
    const propertyDirectLink = `${baseUrl}/${locale}/properties/${propertyId}`;

    const message = isTe
      ? `🏡 *సైట్ విజిట్ స్లాట్ బుకింగ్ వివరాలు*\n\nనమస్తే! నేను "${propertyTitle}" కోసం సైట్ విజిట్ స్లాట్ బుక్ చేసుకున్నాను.\n\n📅 *తేదీ:* ${preferredDate}\n⏰ *సమయం:* ${selectedSlotTime}\n🔖 *రిఫరెన్స్:* ${result?.referenceId}\n👤 *పేరు:* ${buyerName}\n📱 *ఫోన్:* +91 ${cleanPhone}\n\n👉 *బుక్ చేసిన ప్రాపర్టీ లింక్:*\n${propertyDirectLink}\n\nదయచేసి నా విజిట్ పాస్ మరియు గూగుల్ మ్యాప్స్ లొకేషన్ కోఆర్డినేట్లను పంపగలరు.`
      : `🏡 *Site Visit Slot Booking Request*\n\nHello! I have booked a site visit for "${propertyTitle}".\n\n📅 *Date:* ${preferredDate}\n⏰ *Time Slot:* ${selectedSlotTime}\n🔖 *Reference:* ${result?.referenceId}\n👤 *Name:* ${buyerName}\n📱 *Phone:* +91 ${cleanPhone}\n\n👉 *Direct Property Link:*\n${propertyDirectLink}\n\nKindly confirm my visit pass and exact Google Maps location coordinates.`;
    return `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
  };

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
        whatsapp: sendWhatsApp ? phone.trim() : undefined,
        enquiryType: activeType,
        preferredDate: activeType === 'SITE_VISIT' ? preferredDate : undefined,
        preferredTime: activeType === 'SITE_VISIT' ? selectedSlotTime : undefined,
        timeSlot: activeType === 'SITE_VISIT' ? selectedSlotTime : undefined,
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
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
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
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 overscroll-contain">
          {/* Success State */}
          {result ? (
            <div className="py-4 text-center space-y-4">
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

              {/* Site Visit Slot Summary Card */}
              {activeType === 'SITE_VISIT' && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4 text-left space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-700" />
                      <span>{locale === 'te' ? 'షెడ్యూల్ చేయబడిన సైట్ విజిట్' : 'Confirmed Site Visit Slot'}</span>
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded-full">
                      {locale === 'te' ? 'కన్ఫర్మ్డ్' : 'Confirmed'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                        {locale === 'te' ? 'తేదీ' : 'Visit Date'}
                      </span>
                      <span className="font-bold text-slate-800">
                        {preferredDate || 'Upcoming'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                        {locale === 'te' ? 'సమయం' : 'Timing Slot'}
                      </span>
                      <span className="font-bold text-emerald-800">
                        {selectedSlotTime}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs border-t border-emerald-200/60 pt-2">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      {locale === 'te' ? 'ప్రాపర్టీ' : 'Property'}
                    </span>
                    <span className="font-semibold text-slate-800 line-clamp-1">
                      {propertyTitle}
                    </span>
                  </div>
                </div>
              )}

              {/* Reference ID Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-w-xs mx-auto flex items-center justify-between gap-3">
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

              {/* WhatsApp Automated Dispatch Notice */}
              {phone && sendWhatsApp && (
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 text-xs text-slate-700 flex items-start gap-2.5 text-left">
                  <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-emerald-950">
                      {dict.enquiryModal.whatsappPassDispatched || 'Automated WhatsApp visit pass dispatched to'} +91 {phone}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      {locale === 'te'
                        ? 'లొకేషన్ కోఆర్డినేట్లు, గూగుల్ మ్యాప్స్ లింక్ మరియు ఏజెంట్ వివరాలు మీ వాట్సాప్‌కు పంపబడ్డాయి.'
                        : 'Includes exact coordinates, Google Maps route, and assigned field advisor direct contact.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Action CTAs */}
              <div className="pt-2 space-y-2">
                <a
                  href={getWhatsAppConfirmationUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                  <span>{dict.enquiryModal.openWhatsApp || 'Open WhatsApp Confirmation'}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
                >
                  {dict.enquiryModal.close}
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-4 min-w-0">
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
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
              <div className="space-y-1.5">
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

                {/* WhatsApp Notification Opt-in */}
                <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 cursor-pointer hover:bg-emerald-50 transition-colors mt-1.5">
                  <input
                    type="checkbox"
                    checked={sendWhatsApp}
                    onChange={(e) => setSendWhatsApp(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />
                  <div className="text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                      <span>{dict.enquiryModal.whatsappAlertConsent || 'Send instant slot confirmation & visit pass via WhatsApp'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {locale === 'te'
                        ? 'ఏజెంట్ వివరాలు, గేట్ ఎంట్రీ పాస్ మరియు లైవ్ గూగుల్ మ్యాప్స్ లొకేషన్ ఈ నంబర్‌కు పంపబడతాయి.'
                        : 'Official field advisor contact and Google Maps location pin will be messaged to this number.'}
                    </p>
                  </div>
                </label>
              </div>

              {/* Conditional Fields: SITE_VISIT */}
              {activeType === 'SITE_VISIT' && (
                <div className="space-y-4 pt-1 border-t border-slate-100">
                  {/* Preferred Date with Quick Select */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">
                        {dict.enquiryModal.preferredDate} <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {dict.enquiryModal.quickDates || 'Quick Select'}
                      </span>
                    </div>

                    {/* Quick Date Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {getQuickDates().map((qd) => (
                        <button
                          key={qd.key}
                          type="button"
                          onClick={() => {
                            setPreferredDate(qd.date);
                            if (errors.preferredDate) {
                              setErrors((prev) => ({ ...prev, preferredDate: '' }));
                            }
                          }}
                          className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-all cursor-pointer ${
                            preferredDate === qd.date
                              ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                          }`}
                        >
                          {qd.label}
                        </button>
                      ))}
                    </div>

                    <input
                      type="date"
                      min={todayStr}
                      value={preferredDate}
                      onChange={(e) => {
                        setPreferredDate(e.target.value);
                        if (errors.preferredDate) {
                          setErrors((prev) => ({ ...prev, preferredDate: '' }));
                        }
                      }}
                      className={`w-full h-11 px-3 rounded-xl bg-slate-50 border text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                        errors.preferredDate ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                      }`}
                    />
                    {errors.preferredDate && (
                      <p className="text-[11px] text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.preferredDate}</span>
                      </p>
                    )}
                  </div>

                  {/* Slot Booking Timings */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{dict.enquiryModal.selectVisitSlot || 'Select Site Visit Timing Slot'}</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {selectedSlotTime}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {VISIT_SLOT_GROUPS.map((group) => (
                        <div key={group.period} className="space-y-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block px-0.5">
                            {locale === 'te' ? group.periodTe : group.period}
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {group.slots.map((slot) => {
                              const isSelected = selectedSlotTime === slot.time;
                              const tagLabel = locale === 'te' ? slot.tagTe : slot.tag;
                              return (
                                <button
                                  key={slot.time}
                                  type="button"
                                  onClick={() => setSelectedSlotTime(slot.time)}
                                  className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                                    isSelected
                                      ? 'border-emerald-600 bg-emerald-50/90 text-emerald-950 ring-2 ring-emerald-600/30 shadow-xs'
                                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center justify-between w-full mb-1">
                                    <span className="text-xs font-bold font-mono">
                                      {slot.time}
                                    </span>
                                    {isSelected && (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    )}
                                  </div>
                                  {tagLabel && (
                                    <span
                                      className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                        isSelected
                                          ? 'bg-emerald-200/70 text-emerald-800'
                                          : 'bg-slate-100 text-slate-500'
                                      }`}
                                    >
                                      {tagLabel}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
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
