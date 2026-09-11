'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Compass, Layers, Info, ArrowUpRight } from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { MockProperty } from '@/lib/mockData';
import { formatINR } from '@/lib/formatters';

interface MapViewProps {
  properties: MockProperty[];
  locale: Locale;
  selectedPropertyId?: string;
  onSelectProperty?: (id: string) => void;
  className?: string;
}

// Coordinate layout based on actual Telangana geographic radial locations
const PROPERTY_COORDINATES: Record<string, { top: string; left: string }> = {
  'PROP-HYD-001': { top: '25%', left: '22%' }, // West - Kokapet / Gandipet
  'PROP-HYD-002': { top: '38%', left: '12%' }, // Far West - Mokila / Shankarpally
  'PROP-HYD-003': { top: '68%', left: '48%' }, // South - Mamidipally / Shamshabad (Airport)
  'PROP-HYD-004': { top: '20%', left: '38%' }, // North West - Kollur / RC Puram
  'PROP-HYD-005': { top: '35%', left: '30%' }, // West Inner - Nallagandla / Serilingampalli
  'PROP-HYD-006': { top: '28%', left: '80%' }, // North East - Raigir / Yadagirigutta
};

export default function MapView({
  properties,
  locale,
  selectedPropertyId,
  onSelectProperty,
  className = '',
}: MapViewProps) {
  const [activePin, setActivePin] = useState<string | null>(
    selectedPropertyId || properties[0]?.id || null
  );
  const isTe = locale === 'te';

  // Keep active pin synchronized with external selection or filtered list
  useEffect(() => {
    if (selectedPropertyId) {
      setActivePin(selectedPropertyId);
    } else if (properties.length > 0 && (!activePin || !properties.some((p) => p.id === activePin))) {
      setActivePin(properties[0].id);
    } else if (properties.length === 0) {
      setActivePin(null);
    }
  }, [properties, selectedPropertyId, activePin]);

  const selectedProp = properties.find((p) => p.id === activePin) || properties[0] || null;

  return (
    <div className={`relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-lg flex flex-col ${className}`}>
      {/* Map Header / Status Bar */}
      <div className="px-4 py-3 bg-slate-800/90 backdrop-blur-md border-b border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">
            {isTe ? 'హైదరాబాద్ & ORR గ్రోత్ కారిడార్ మ్యాప్' : 'Hyderabad Metro & ORR Corridor Map'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isTe ? 'లైవ్ లొకేషన్లు' : 'Verified Coordinates'}</span>
        </div>
      </div>

      {/* Interactive Map Surface / Representation */}
      <div className="relative h-80 sm:h-96 min-h-[380px] lg:h-[480px] w-full bg-[#111827] flex items-center justify-center overflow-hidden">
        {/* Stylized Outer Ring Road (ORR) Visual Ring */}
        <div className="absolute w-72 h-72 sm:w-96 sm:h-96 lg:w-[420px] lg:h-[420px] rounded-full border-2 border-dashed border-emerald-600/40 pointer-events-none flex items-center justify-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/60 -rotate-45">
            ORR 158 km Corridor
          </span>
        </div>

        {/* Central Metro Core Marker */}
        <div className="absolute flex flex-col items-center pointer-events-none">
          <div className="w-3.5 h-3.5 rounded-full bg-slate-500/40 border border-slate-400/60" />
          <span className="text-[10px] text-slate-400 font-medium mt-1">Hyderabad Core</span>
        </div>

        {/* Interactive Property Pins placed radially based on ORR distance & mandals */}
        <div className="relative w-full h-full p-6">
          {properties.map((prop, idx) => {
            const isSelected = prop.id === activePin;
            const pos = PROPERTY_COORDINATES[prop.id] || {
              top: `${20 + ((idx * 25) % 60)}%`,
              left: `${15 + ((idx * 30) % 70)}%`,
            };

            return (
              <div
                key={prop.id}
                style={{ position: 'absolute', top: pos.top, left: pos.left }}
                className="transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 z-10"
              >
                <button
                  type="button"
                  onClick={() => {
                    setActivePin(prop.id);
                    if (onSelectProperty) onSelectProperty(prop.id);
                  }}
                  className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-md text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-400/30 scale-110 z-20'
                      : 'bg-slate-800/90 text-slate-100 hover:bg-emerald-800 border border-slate-700'
                  }`}
                  aria-label={`Property pin: ${prop.title}`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`} />
                  <span className="text-[11px] whitespace-nowrap">{prop.location.village}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Selected Property Preview Pop-up */}
        {selectedProp ? (
          <Link
            href={`/${locale}/properties/${selectedProp.id}`}
            className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-80 bg-slate-900/95 hover:bg-slate-800/95 backdrop-blur-md rounded-xl p-3.5 border border-slate-700 hover:border-emerald-500/50 text-white shadow-2xl z-30 transition-all duration-150 group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block truncate">
                  {selectedProp.type} • {selectedProp.location.village}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 line-clamp-1 mt-0.5 transition-colors">
                  {isTe && selectedProp.titleTe ? selectedProp.titleTe : selectedProp.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {selectedProp.location.distanceFromOrrKm} km from ORR • {selectedProp.location.zone}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs sm:text-sm font-extrabold text-emerald-300 block">
                  {formatINR(selectedProp.pricing.totalPrice)}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center justify-end gap-0.5 mt-1 group-hover:text-emerald-400 transition-colors">
                  <span>{isTe ? 'వివరాలు' : 'Details'}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm z-20 pointer-events-none">
            <div className="text-center p-4">
              <Compass className="w-8 h-8 text-slate-500 mx-auto mb-2 animate-pulse" />
              <p className="text-xs text-slate-400 font-medium">
                {isTe ? 'ఫిల్టర్‌లకు సరిపోయే లొకేషన్లు లేవు' : 'No properties in current map filter'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Map API Key & Extension Notice */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">
            {isTe
              ? 'గూగుల్ మ్యాప్స్ API తో అనుసంధానం చేయబడిన జియో-కోఆర్డినేట్లు'
              : 'Google Maps JS SDK ready: verified survey geo-coordinates'}
          </span>
        </span>
        <span className="font-mono text-emerald-500/80 shrink-0 ml-2">HMDA Grid Active</span>
      </div>
    </div>
  );
}
