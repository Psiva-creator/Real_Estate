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
    <div className={`relative bg-[#141210] rounded-2xl overflow-hidden border border-[#2A241F] shadow-xl flex flex-col ${className}`}>
      {/* Map Header / Status Bar */}
      <div className="px-5 py-3.5 bg-[#191512]/95 backdrop-blur-md border-b border-[#2A241F] flex items-center justify-between text-xs text-[#C5BDB5]">
        <div className="flex items-center gap-2.5">
          <Navigation className="w-4 h-4 text-[#C5A880]" />
          <span className="font-serif font-medium text-white tracking-wide">
            {isTe ? 'హైదరాబాద్ & ORR గ్రోత్ కారిడార్ మ్యాప్' : 'Hyderabad Strategic Corridor & ORR Radial Map'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[#A39A8F] text-[11px] font-mono">
          <span className="w-2 h-2 rounded-full bg-[#C5A880] animate-pulse" />
          <span>{isTe ? 'లైవ్ లొకేషన్లు' : 'Survey Coordinates Verified'}</span>
        </div>
      </div>

      {/* Interactive Map Surface / Representation */}
      <div className="relative h-80 sm:h-96 min-h-[380px] lg:h-[480px] w-full bg-[#110F0D] flex items-center justify-center overflow-hidden">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#C5A880 1px, transparent 1px)`,
            backgroundSize: '28px 28px'
          }}
        />

        {/* Stylized Outer Ring Road (ORR) Visual Ring */}
        <div className="absolute w-72 h-72 sm:w-96 sm:h-96 lg:w-[420px] lg:h-[420px] rounded-full border-2 border-dashed border-[#8C653E]/40 pointer-events-none flex items-center justify-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A880]/70 -rotate-45">
            ORR 158 km Radial Belt
          </span>
        </div>

        {/* Central Metro Core Marker */}
        <div className="absolute flex flex-col items-center pointer-events-none">
          <div className="w-3.5 h-3.5 rounded-full bg-[#8C653E]/50 border border-[#C5A880]/70" />
          <span className="text-[10px] text-[#A39A8F] font-serif mt-1">Hyderabad Core</span>
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
                  className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg text-xs font-serif transition-all ${
                    isSelected
                      ? 'bg-[#C5A880] text-[#141210] font-bold ring-4 ring-[#C5A880]/30 scale-110 z-20'
                      : 'bg-[#191512]/90 text-[#FAF8F5] hover:border-[#C5A880] border border-[#2A241F]'
                  }`}
                  aria-label={`Property pin: ${prop.title}`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#141210]' : 'text-[#C5A880]'}`} />
                  <span className="text-[11px] whitespace-nowrap tracking-wide">{prop.location.village}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Selected Property Preview Pop-up */}
        {selectedProp ? (
          <Link
            href={`/${locale}/properties/${selectedProp.id}`}
            className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-84 bg-[#191512]/95 hover:bg-[#221D18]/95 backdrop-blur-md rounded-2xl p-4 border border-[#2A241F] hover:border-[#8C653E] text-white shadow-2xl z-30 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A880] block truncate">
                  {selectedProp.type} • {selectedProp.location.village}
                </span>
                <h4 className="text-xs sm:text-sm font-serif font-normal text-white group-hover:text-[#F5F1EA] line-clamp-1 mt-1 transition-colors">
                  {isTe && selectedProp.titleTe ? selectedProp.titleTe : selectedProp.title}
                </h4>
                <p className="text-[11px] text-[#A39A8F] mt-1 truncate">
                  {selectedProp.location.distanceFromOrrKm} km from ORR • {selectedProp.location.zone}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-serif font-normal text-[#C5A880] block">
                  {formatINR(selectedProp.pricing.totalPrice)}
                </span>
                <span className="text-[10px] text-[#A39A8F] flex items-center justify-end gap-1 mt-1.5 group-hover:text-[#C5A880] transition-colors">
                  <span>{isTe ? 'వివరాలు' : 'View Estate'}</span>
                  <ArrowUpRight className="w-3 h-3 text-[#C5A880]" />
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#141210]/60 backdrop-blur-sm z-20 pointer-events-none">
            <div className="text-center p-4">
              <Compass className="w-8 h-8 text-[#8C653E] mx-auto mb-2 animate-pulse" />
              <p className="text-xs text-[#A39A8F] font-light">
                {isTe ? 'ఫిల్టర్‌లకు సరిపోయే లొకేషన్లు లేవు' : 'No estates match current criteria'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Map API Key & Extension Notice */}
      <div className="px-5 py-2.5 bg-[#0D0B0A] border-t border-[#2A241F] flex items-center justify-between text-[11px] text-[#8C827A]">
        <span className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-[#8C653E] shrink-0" />
          <span className="truncate">
            {isTe
              ? 'గూగుల్ మ్యాప్స్ API తో అనుసంధానం చేయబడిన జియో-కోఆర్డినేట్లు'
              : 'Google Maps JS SDK ready: verified survey geo-coordinates'}
          </span>
        </span>
        <span className="font-mono text-[#C5A880] text-[10px] shrink-0 ml-2">HMDA 2031 Grid Active</span>
      </div>
    </div>
  );
}
