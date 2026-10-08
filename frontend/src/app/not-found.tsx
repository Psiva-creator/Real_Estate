import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Building2 } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-[#FAF8F5] text-[#191512]">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-12 border border-[#E8E2D9] shadow-[0_12px_40px_-10px_rgba(25,21,18,0.08)] text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E8E2D9] text-[#8C653E] flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8 text-[#8C653E]" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#8C653E] font-bold block">
            HTTP 404 • Listing Off-Market
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#191512]">
            Page or Property Not Located
          </h1>
          <p className="text-xs sm:text-sm text-[#574F48] leading-relaxed max-w-md mx-auto">
            The property listing or advisory section you requested could not be found, has been transacted, or is under private title verification.
          </p>
          <p className="text-xs text-[#8C827A] font-telugu pt-1">
            మీరు అభ్యర్థించిన ప్రాపర్టీ లేదా పేజీ ప్రస్తుతం అందుబాటులో లేదు లేదా ధృవీకరణ ప్రక్రియలో ఉంది.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/en"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#191512] hover:bg-[#8C653E] text-white text-xs font-semibold tracking-wider uppercase shadow-sm transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4 text-[#C5A880]" />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/en/properties"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#E8E2D9] bg-white hover:bg-[#FAF8F5] text-[#191512] text-xs font-semibold tracking-wider uppercase transition-all active:scale-[0.98]"
          >
            <Building2 className="w-4 h-4 text-[#8C653E]" />
            <span>Browse Properties</span>
          </Link>
        </div>

        <div className="pt-2 border-t border-[#E8E2D9] text-[11px] text-[#8C827A] flex items-center justify-center gap-3">
          <span>భాషను మార్చండి:</span>
          <Link href="/te" className="font-semibold text-[#8C653E] hover:underline font-telugu">
            తెలుగు హోమ్‌పేజీ
          </Link>
          <span>•</span>
          <Link href="/te/properties" className="font-semibold text-[#8C653E] hover:underline font-telugu">
            తెలుగు ప్రాపర్టీలు
          </Link>
        </div>
      </div>
    </div>
  );
}
