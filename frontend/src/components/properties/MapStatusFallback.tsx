'use client';

import React from 'react';
import { AlertCircle, KeyRound, Loader2 } from 'lucide-react';
import { GoogleMapsStatus } from '@/lib/useGoogleMaps';

interface MapStatusFallbackProps {
  status: GoogleMapsStatus;
  className?: string;
  theme?: 'dark' | 'light';
}

export default function MapStatusFallback({
  status,
  className = '',
  theme = 'dark',
}: MapStatusFallbackProps) {
  const isDark = theme === 'dark';
  const containerBg = isDark ? 'bg-[#141210] text-[#C5BDB5]' : 'bg-[#FAF8F5] text-[#574F48]';
  const borderColor = isDark ? 'border-[#2A241F]' : 'border-[#E8E2D9]';

  if (status === 'loading') {
    return (
      <div
        className={`w-full h-full min-h-[280px] flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border ${borderColor} ${containerBg} ${className}`}
        role="status"
        aria-live="polite"
      >
        <Loader2 className="w-8 h-8 text-[#C5A880] animate-spin" />
        <p className="text-sm font-medium tracking-wide">Loading map...</p>
      </div>
    );
  }

  if (status === 'missing-key') {
    return (
      <div
        className={`w-full h-full min-h-[280px] flex flex-col items-center justify-center gap-3 p-6 text-center rounded-2xl border ${borderColor} ${containerBg} ${className}`}
        role="alert"
      >
        <div className="w-12 h-12 rounded-full bg-[#8C653E]/20 text-[#C5A880] flex items-center justify-center">
          <KeyRound className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold">Google Maps API key is not configured.</p>
        <p className="text-xs text-[#8C827A] max-w-sm">
          Please provide a valid NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in the environment configuration.
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        className={`w-full h-full min-h-[280px] flex flex-col items-center justify-center gap-3 p-6 text-center rounded-2xl border ${borderColor} ${containerBg} ${className}`}
        role="alert"
      >
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold">Unable to load Google Maps.</p>
        <p className="text-xs text-[#8C827A] max-w-sm">
          Please check your network connection or verify API restrictions in Google Cloud Console.
        </p>
      </div>
    );
  }

  return null;
}
