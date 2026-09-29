'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, X } from 'lucide-react';
import { Locale } from '@/lib/i18n';

interface CookieConsentProps {
  locale: Locale;
}

export default function CookieConsent({ locale }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const isTe = locale === 'te';

  useEffect(() => {
    // Only check in browser
    try {
      const consent = localStorage.getItem('trh_cookie_consent');
      if (!consent) {
        // Show after a brief delay for smoother UX
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('trh_cookie_consent', 'accepted');
    } catch {}
    setIsVisible(false);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem('trh_cookie_consent', 'dismissed');
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#1E1B18]/95 backdrop-blur-md text-[#FAF8F5] border border-[#8C653E]/40 rounded-2xl p-4 sm:p-5 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#8C653E]/20 text-[#C5A880] flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="space-y-2 flex-1">
          <p className="text-xs text-[#D8CFC4] leading-relaxed">
            {isTe
              ? 'మేము చట్టబద్ధమైన డాక్యుమెంట్ వెరిఫికేషన్, షార్ట్‌లిస్ట్ సేకరణ మరియు విచారణల సమన్వయం కోసం ప్రాథమిక కుకీలను ఉపయోగిస్తాము. కొనసాగడం ద్వారా మీరు మా '
              : 'We use essential cookies and session storage for legal document auditing, saved property shortlists, and direct advisor inquiries. By using our platform, you agree to our '}
            <Link
              href={`/${locale}/privacy`}
              className="text-[#C5A880] underline underline-offset-2 hover:text-[#FAF8F5] transition-colors"
            >
              {isTe ? 'గోప్యతా విధానం' : 'Privacy Policy'}
            </Link>
            .
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleAccept}
              className="px-4 py-1.5 rounded-full bg-[#C5A880] hover:bg-[#B39368] text-[#191512] font-semibold text-xs transition-colors shadow-xs cursor-pointer"
            >
              {isTe ? 'అంగీకరించు' : 'Accept & Continue'}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#D8CFC4] text-xs transition-colors cursor-pointer"
            >
              {isTe ? 'మూసివేయి' : 'Dismiss'}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-[#8C827A] hover:text-[#FAF8F5] p-1 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
