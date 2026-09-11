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
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-700" />
            <span>{dict.propertyDetail.locationConnectivity}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {dict.propertyDetail.locationSubtext}
          </p>
        </div>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${googleMapsQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
          <span>{dict.propertyDetail.openGoogleMaps}</span>
        </a>
      </div>

      {/* Connectivity Specs Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {dict.propertyDetail.orrDistance}
          </span>
          <span className="text-base font-extrabold text-emerald-800 mt-0.5 block">
            {formatOrrDistance(property.location.distanceFromOrrKm)}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {dict.propertyDetail.serviceTier}
          </span>
          <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
            {property.location.tier} ({property.location.district})
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {dict.propertyDetail.zoning}
          </span>
          <span className="text-base font-extrabold text-slate-900 mt-0.5 block truncate">
            {property.location.zone}
          </span>
        </div>
      </div>

      {/* Landmark Notice if available */}
      {landmark && (
        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-950 flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong className="font-bold">{dict.propertyDetail.landmark}:</strong> {landmark}
          </span>
        </div>
      )}

      {/* Single Property Map Presentation Surface */}
      <div className="relative h-72 sm:h-80 w-full rounded-xl bg-[#111827] overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
        {/* Outer Ring Road (ORR) Visual Ring */}
        <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border-2 border-dashed border-emerald-600/40 pointer-events-none flex items-center justify-center">
          <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-500/60 -rotate-45">
            ORR 158 km Radial Belt
          </span>
        </div>

        {/* Hyderabad Core Marker */}
        <div className="absolute flex flex-col items-center pointer-events-none">
          <div className="w-3 h-3 rounded-full bg-slate-500/50 border border-slate-400/60" />
          <span className="text-[9px] text-slate-400 font-medium mt-1">Hyderabad Core</span>
        </div>

        {/* Target Property Marker with pulsating beacon */}
        <div
          style={{ position: 'absolute', top: pos.top, left: pos.left }}
          className="transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-8 h-8 rounded-full bg-emerald-400/30 animate-ping" />
            <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-slate-950 font-extrabold text-xs shadow-xl ring-4 ring-emerald-400/40">
              <MapPin className="w-3.5 h-3.5 text-slate-950" />
              <span className="whitespace-nowrap">{property.location.village}</span>
            </div>
          </div>
        </div>

        {/* Bottom Coordinates Overlay */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {property.location.village}, {property.location.mandal} • {formatOrrDistance(property.location.distanceFromOrrKm)}
            </span>
          </span>
          <span className="font-mono text-emerald-400/90 text-[10px]">Survey Verified</span>
        </div>
      </div>

      {/* Google Maps fallback notice */}
      <p className="text-[11px] text-slate-500 leading-normal italic flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>{dict.propertyDetail.googleMapsNotice}</span>
      </p>
    </div>
  );
}
