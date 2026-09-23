'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Navigation, Compass, ExternalLink, Info, MapPin } from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import { MockProperty } from '@/lib/mockData';
import { formatOrrDistance } from '@/lib/formatters';

interface PropertyLocationMapProps {
  property: MockProperty;
  locale: Locale;
}

const HYDERABAD_CENTER: [number, number] = [17.4065, 78.4772];
const DEFAULT_ZOOM = 14;

export default function PropertyLocationMap({ property, locale }: PropertyLocationMapProps) {
  const dict = getDictionary(locale);
  const isTe = locale === 'te';

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const lat = property.location.latitude;
  const lng = property.location.longitude;
  const hasValidCoordinates =
    typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);

  const landmark =
    isTe && property.location.landmarkTe
      ? property.location.landmarkTe
      : property.location.landmark;

  // Build external Google Maps search URL with exact coordinates when available
  const googleMapsQuery = hasValidCoordinates
    ? `${lat},${lng}`
    : encodeURIComponent(
        `${property.location.village}, ${property.location.mandal}, ${property.location.district}, Telangana`
      );

  // Initialize single property map on client
  useEffect(() => {
    let isMounted = true;
    let resizeObserver: ResizeObserver | null = null;

    async function initLeaflet() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const center: [number, number] = hasValidCoordinates ? [lat!, lng!] : HYDERABAD_CENTER;
      const zoom = hasValidCoordinates ? DEFAULT_ZOOM : 11;

      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: true,
      });

      // Standard OpenStreetMap Tiles (No API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add zoom control top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      resizeObserver = null;

      if (hasValidCoordinates) {
        const size = 38;
        const markerHtml = `
          <div style="position: relative; width: ${size}px; height: ${size}px; cursor: pointer;">
            <div style="position: absolute; inset: -6px; border-radius: 50%; background: rgba(140, 101, 62, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="
              width: ${size}px;
              height: ${size}px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              background: #8C653E;
              border: 2.5px solid #FFFFFF;
              box-shadow: 0 4px 14px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #FAF8F5;
              "></div>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'realty-detail-marker',
          html: markerHtml,
          iconSize: [size, size],
          iconAnchor: [size / 2, size],
        });

        markerRef.current = L.marker([lat!, lng!], {
          icon: customIcon,
          title: `${property.location.village}, ${property.location.mandal}`,
        }).addTo(map);
      }

      mapInstanceRef.current = map;
      setIsMapReady(true);

      setTimeout(() => {
        if (isMounted && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);

      // Auto-invalidate map size on container resize
      if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        });
        resizeObserver.observe(mapContainerRef.current);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [hasValidCoordinates, lat, lng, property.location.village, property.location.mandal]);

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
            <strong className="font-semibold text-[#191512]">{dict.propertyDetail.landmark}:</strong>{' '}
            {landmark}
          </span>
        </div>
      )}

      {/* Single Property Map Presentation Surface */}
      <div className="relative h-72 sm:h-84 md:h-96 w-full rounded-2xl bg-[#141210] overflow-hidden border border-[#2A241F] shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Bottom Coordinates Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-[#C5BDB5] bg-[#191512]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 pointer-events-none z-[1001]">
          <span className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
            <span className="truncate">
              {property.location.village}, {property.location.mandal}
              {property.location.distanceFromOrrKm !== undefined
                ? ` • ${formatOrrDistance(property.location.distanceFromOrrKm)}`
                : ''}
            </span>
          </span>
          <span className="font-mono text-[#C5A880] text-[10px] shrink-0 ml-2">
            {hasValidCoordinates
              ? `${lat?.toFixed(4)}, ${lng?.toFixed(4)}`
              : isTe
              ? 'సాధారణ లొకేషన్'
              : 'General Location'}
          </span>
        </div>
      </div>

      {/* Map attribution notice */}
      <p className="text-[11px] text-[#8C827A] leading-normal italic flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-[#8C653E] shrink-0" />
        <span>
          {isTe
            ? 'మ్యాప్ డేటా © OpenStreetMap కాంట్రిబ్యూటర్స్. ఖచ్చితమైన నావిగేషన్ కోసం "గూగుల్ మ్యాప్స్‌లో తెరవండి" క్లిక్ చేయండి.'
            : 'Map data © OpenStreetMap contributors. Click "Open in Google Maps" for live GPS turn-by-turn navigation.'}
        </span>
      </p>
    </div>
  );
}
