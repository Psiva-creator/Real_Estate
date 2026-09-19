'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Locale } from '@/lib/i18n';
import { MockProperty } from '@/lib/mockData';

const LeafletPropertyMap = dynamic(() => import('./LeafletPropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] bg-[#FAF8F5] flex items-center justify-center text-slate-500 rounded-2xl border border-[#E8E2D9]">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-600">Loading Telangana Interactive Map...</span>
      </div>
    </div>
  ),
});

interface MapViewProps {
  properties: MockProperty[];
  locale: Locale;
  selectedPropertyId?: string;
  onSelectProperty?: (id: string) => void;
  className?: string;
}

export default function MapView({
  properties,
  locale,
  selectedPropertyId,
  onSelectProperty,
  className = '',
}: MapViewProps) {
  return (
    <LeafletPropertyMap
      properties={properties}
      locale={locale}
      selectedPropertyId={selectedPropertyId}
      onSelectProperty={onSelectProperty}
      className={className}
    />
  );
}
