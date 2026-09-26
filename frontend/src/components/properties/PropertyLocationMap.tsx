'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Navigation, Compass, ExternalLink, Info, MapPin } from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import { MockProperty } from '@/lib/mockData';
import { formatOrrDistance } from '@/lib/formatters';

const LeafletPropertyMap = dynamic(() => import('./LeafletPropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 sm:h-84 md:h-96 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-slate-500">
        <div className="w-7 h-7 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold">Loading Property Coordinates...</span>
      </div>
    </div>
  ),
});

interface PropertyLocationMapProps {
  property: MockProperty;
  locale: Locale;
}

export default function PropertyLocationMap({ property, locale }: PropertyLocationMapProps) {
  const dict = getDictionary(locale);
  const isTe = locale === 'te';

  const lat = property.location.latitude;
  const lng = property.location.longitude;
  const hasValidCoordinates =
    typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);

  const landmark =
    isTe && property.location.landmarkTe
      ? property.location.landmarkTe
      : property.location.landmark;

  const googleMapsQuery = hasValidCoordinates
    ? `${lat},${lng}`
    : encodeURIComponent(
        `${property.location.village}, ${property.location.mandal}, ${property.location.district}, Telangana`
      );

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D9] shadow-sm space-y-6">
      {/* Header */}
      <div className="border-b border-[#E8E2D9] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#191512] flex items-center gap-2.5">
            <Navigation className="w-5 h-5 text-[#8C653E]" />
            <span>{dict.propertyDetail.locationConnectivity}</span>
          </h2>
          <p className="text-xs text-[#8C827A] mt-1 font-light">
            {dict.propertyDetail.locationSubtext}
          </p>
        </div>

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${googleMapsQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E8E2D9] hover:bg-[#FAF8F5] text-[#191512] text-xs font-medium self-start sm:self-auto transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#8C653E]" />
          <span>{dict.propertyDetail.openGoogleMaps}</span>
        </a>
      </div>

      {/* Connectivity Specs Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9]">
          <span className="text-[10px] font-mono text-[#8C827A] uppercase tracking-wider block">
            {dict.propertyDetail.orrDistance}
          </span>
          <span className="text-base sm:text-lg font-serif font-semibold text-[#8C653E] mt-1 block">
            {formatOrrDistance(property.location.distanceFromOrrKm)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9]">
          <span className="text-[10px] font-mono text-[#8C827A] uppercase tracking-wider block">
            {dict.propertyDetail.serviceTier}
          </span>
          <span className="text-base sm:text-lg font-serif font-semibold text-[#191512] mt-1 block">
            {property.location.tier} ({property.location.district})
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9]">
          <span className="text-[10px] font-mono text-[#8C827A] uppercase tracking-wider block">
            {dict.propertyDetail.zoning}
          </span>
          <span className="text-base sm:text-lg font-serif font-semibold text-[#191512] mt-1 block truncate">
            {property.location.zone}
          </span>
        </div>
      </div>

      {/* Landmark Notice if available */}
      {landmark && (
        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] text-xs text-[#61584F] flex items-center gap-2.5">
          <Compass className="w-4 h-4 text-[#8C653E] shrink-0" />
          <span>
            <strong className="font-semibold text-[#191512]">{dict.propertyDetail.landmark}:</strong>{' '}
            {landmark}
          </span>
        </div>
      )}

      {/* Interactive Single Property Location Map */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-[#2A241F]/10 shadow-xs">
        <LeafletPropertyMap
          properties={[property]}
          locale={locale}
          selectedPropertyId={property.id}
          singlePropertyMode={true}
          className="border-0"
        />
      </div>

      {/* Notice */}
      <p className="text-[11px] text-[#8C827A] leading-normal italic flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-[#8C827A] shrink-0" />
        <span>
          {isTe
            ? 'ఈ మ్యాప్ అధికారిక రెవెన్యూ సర్వే సరిహద్దులు మరియు ఓఆర్ఆర్ కనెక్టివిటీని ప్రతిబింబిస్తుంది.'
            : 'Interactive GIS map reflecting verified survey coordinates, Mandal location & ORR connectivity.'}
        </span>
      </p>
    </div>
  );
}
