'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface PropertiesErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PropertiesError({ error: _error, reset }: PropertiesErrorProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="max-w-md mx-auto bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-md text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Something went wrong
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We could not load the properties. Please try again or return to the homepage.
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
            href="/en"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors w-full sm:w-auto justify-center"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Go to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
