'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, RotateCcw, ArrowLeft } from 'lucide-react';

interface PropertyDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PropertyDetailError({
  error: _error,
  reset,
}: PropertyDetailErrorProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="max-w-md mx-auto bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-md text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Could not load property
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We were unable to load this property listing. It may have been temporarily
            unavailable. Please try again or browse other verified properties.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all active:scale-[0.98] w-full sm:w-auto justify-center"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/en/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back to Properties</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
