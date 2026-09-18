import React from 'react';
import { MapPin, Navigation, Compass, ExternalLink, Info, CheckCircle2 } from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import { MockProperty } from '@/lib/mockData';
import { formatOrrDistance } from '@/lib/formatters';

interface PropertyLocationMapProps {
  property: MockProperty;
  locale: Locale;
}

// Coordinates by property ID for Telangana & ORR radial layout
const PROPERTY_COORDINATES: Record<string, { top: string; left: string }> = {
  'PROP-HYD-001': { top: '25%', left: '22%' }, // Kokapet (West)
  'PROP-HYD-002': { top: '38%', left: '12%' }, // Mokila (Far West)
  'PROP-HYD-003': { top: '68%', left: '48%' }, // Shamshabad (South)
  'PROP-HYD-004': { top: '20%', left: '38%' }, // Kollur (North West)
  'PROP-HYD-005': { top: '35%', left: '30%' }, // Nallagandla (West Inner)
  'PROP-HYD-006': { top: '28%', left: '80%' }, // Yadagirigutta (North East)
};

export default function PropertyLocationMap({ property, locale }: PropertyLocationMapProps) {
  const dict = getDictionary(locale);
  const isTe = locale === 'te';

  const pos = PROPERTY_COORDINATES[property.id] || { top: '45%', left: '45%' };
  const landmark = isTe && property.location.landmarkTe
    ? property.location.landmarkTe
    : property.location.landmark;

  const googleMapsQuery = encodeURIComponent(
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
          href={`https://www.google.com/maps/search/?api=1&query=${googleMapsQuery}`}
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
            <strong className="font-semibold text-[#191512]">{dict.propertyDetail.landmark}:</strong> {landmark}
          </span>
        </div>
      )}

      {/* Single Property Map Presentation Surface */}
      <div className="relative h-72 sm:h-84 w-full rounded-2xl bg-[#141210] overflow-hidden border border-[#2A241F] flex items-center justify-center shadow-inner">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#C5A880 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Outer Ring Road (ORR) Visual Ring */}
        <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border-2 border-dashed border-[#8C653E]/40 pointer-events-none flex items-center justify-center">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#C5A880]/70 -rotate-45">
            ORR 158 km Radial Belt
          </span>
        </div>

        {/* Hyderabad Core Marker */}
        <div className="absolute flex flex-col items-center pointer-events-none">
          <div className="w-3.5 h-3.5 rounded-full bg-[#8C653E]/60 border border-[#C5A880]/80" />
          <span className="text-[10px] text-[#A39A8F] font-serif mt-1">Hyderabad Core</span>
        </div>

        {/* Target Property Marker with pulsating beacon */}
        <div
          style={{ position: 'absolute', top: pos.top, left: pos.left }}
          className="transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-8 h-8 rounded-full bg-[#C5A880]/30 animate-ping" />
            <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C5A880] text-[#141210] font-serif font-bold text-xs shadow-2xl ring-4 ring-[#C5A880]/30">
              <MapPin className="w-3.5 h-3.5 text-[#141210]" />
              <span className="whitespace-nowrap">{property.location.village}</span>
            </div>
          </div>
        </div>

        {/* Bottom Coordinates Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-[#C5BDB5] bg-[#191512]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>
              {property.location.village}, {property.location.mandal} • {formatOrrDistance(property.location.distanceFromOrrKm)}
            </span>
          </span>
          <span className="font-mono text-[#C5A880] text-[10px]">Survey Verified</span>
        </div>
      </div>

      {/* Google Maps fallback notice */}
      <p className="text-[11px] text-[#8C827A] leading-normal italic flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-[#8C827A] shrink-0" />
        <span>{dict.propertyDetail.googleMapsNotice}</span>
      </p>
    </div>
  );
}
