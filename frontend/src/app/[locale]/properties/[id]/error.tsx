'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, RotateCcw, ArrowLeft } from 'lucide-react';

interface PropertyDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PropertyDetailError({
  error: _error,
  reset,
}: PropertyDetailErrorProps) {
  const pathname = usePathname();
  const isTe = pathname?.startsWith('/te');
  const locale = isTe ? 'te' : 'en';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="max-w-md mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-[#E8E2D9] shadow-[0_12px_40px_-10px_rgba(25,21,18,0.08)] text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#E8E2D9] text-[#8C653E] flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-7 h-7 text-[#8C653E]" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#191512]">
            {isTe ? 'ప్రాపర్టీ వివరాలు లోడ్ కాలేదు' : 'Could Not Load Property'}
          </h2>
          <p className="text-xs sm:text-sm text-[#574F48] leading-relaxed">
            {isTe
              ? 'ఈ ప్రాపర్టీ లిస్టింగ్‌ను లోడ్ చేయలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి లేదా ఇతర ధృవీకరించిన ప్రాపర్టీలను చూడండి.'
              : 'Unable to retrieve this property listing right now. Please retry or browse other legally verified ventures.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#191512] hover:bg-[#8C653E] text-white font-semibold text-xs tracking-wider uppercase shadow-sm transition-all active:scale-[0.98] w-full sm:w-auto justify-center"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>{isTe ? 'మళ్లీ ప్రయత్నించండి' : 'Try Again'}</span>
          </button>

          <Link
            href={`/${locale}/properties`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#E8E2D9] bg-white hover:bg-[#FAF8F5] text-[#191512] font-semibold text-xs tracking-wider uppercase transition-colors w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#8C653E]" />
            <span>{isTe ? 'ప్రాపర్టీల జాబితాకు వెళ్లండి' : 'Back to Properties'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
