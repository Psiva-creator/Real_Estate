'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Navigation, Compass, ArrowUpRight, Info } from 'lucide-react';
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

const HYDERABAD_CENTER: [number, number] = [17.4065, 78.4772];
const DEFAULT_ZOOM = 11;

export default function MapView({
  properties,
  locale,
  selectedPropertyId,
  onSelectProperty,
  className = '',
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const LRef = useRef<any>(null);

  const [activePin, setActivePin] = useState<string | null>(
    selectedPropertyId || properties[0]?.id || null
  );
  const [isMapReady, setIsMapReady] = useState(false);

  const isTe = locale === 'te';

  // Synchronize internal active pin with prop changes
  useEffect(() => {
    if (selectedPropertyId) {
      setActivePin(selectedPropertyId);
    } else if (properties.length > 0 && (!activePin || !properties.some((p) => p.id === activePin))) {
      setActivePin(properties[0].id);
    } else if (properties.length === 0) {
      setActivePin(null);
    }
  }, [properties, selectedPropertyId, activePin]);

  const activePinRef = useRef<string | null>(activePin);
  useEffect(() => {
    activePinRef.current = activePin;
  }, [activePin]);

  // Create SVG marker pin element
  const createMarkerHtml = (isSelected: boolean) => {
    const size = isSelected ? 38 : 28;
    const bg = isSelected ? '#C5A880' : '#191512';
    const stroke = isSelected ? '#FFFFFF' : '#C5A880';
    const pulse = isSelected
      ? `<div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(197, 168, 128, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
      : '';

    return `
      <div style="position: relative; width: ${size}px; height: ${size}px; cursor: pointer;">
        ${pulse}
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: ${bg};
          border: 2px solid ${stroke};
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease-in-out;
        ">
          <div style="
            width: ${isSelected ? '10px' : '7px'};
            height: ${isSelected ? '10px' : '7px'};
            border-radius: 50%;
            background: ${isSelected ? '#191512' : '#C5A880'};
          "></div>
        </div>
      </div>
    `;
  };

  // Handle marker selection callback
  const handleMarkerClick = useCallback(
    (propertyId: string, lat?: number, lng?: number) => {
      setActivePin(propertyId);
      if (onSelectProperty) {
        onSelectProperty(propertyId);
      }
      if (mapInstanceRef.current && lat !== undefined && lng !== undefined) {
        mapInstanceRef.current.panTo([lat, lng], { animate: true, duration: 0.5 });
      }
    },
    [onSelectProperty]
  );

  // Initialize Leaflet Map Instance once on client
  useEffect(() => {
    let isMounted = true;
    let resizeObserver: ResizeObserver | null = null;

    async function initLeaflet() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;
      if (!isMounted || !mapContainerRef.current) return;

      LRef.current = L;

      // Clean up previous instance if already existing on same container
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: HYDERABAD_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: false,
        attributionControl: true,
      });

      // Standard OpenStreetMap Tiles (No API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Custom top-right zoom control
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
      setIsMapReady(true);

      // Invalidate size once container renders
      setTimeout(() => {
        if (isMounted && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);

      // Observe container size changes (e.g., when switching from list to map tab on mobile)
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
  }, []);

  // Update Markers whenever properties or isMapReady changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    if (!isMapReady || !map || !L) return;

    const currentMarkers = markersRef.current;

    // Clear old markers
    currentMarkers.forEach((marker) => marker.remove());
    currentMarkers.clear();

    const validLatLngs: [number, number][] = [];

    properties.forEach((prop) => {
      const lat = prop.location.latitude;
      const lng = prop.location.longitude;

      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        return;
      }

      validLatLngs.push([lat, lng]);
      const isSelected = prop.id === activePinRef.current;
      const size = isSelected ? 38 : 28;

      const customIcon = L.divIcon({
        className: 'realty-map-marker',
        html: createMarkerHtml(isSelected),
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
      });

      const marker = L.marker([lat, lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 10,
        title: `${prop.location.village} - ${isTe && prop.titleTe ? prop.titleTe : prop.title}`,
      }).addTo(map);

      marker.on('click', () => {
        handleMarkerClick(prop.id, lat, lng);
      });

      currentMarkers.set(prop.id, marker);
    });

    // Auto fit bounds
    if (validLatLngs.length > 1) {
      map.fitBounds(validLatLngs, {
        padding: [50, 50],
        maxZoom: 14,
      });
    } else if (validLatLngs.length === 1) {
      map.setView(validLatLngs[0], 13);
    } else {
      map.setView(HYDERABAD_CENTER, DEFAULT_ZOOM);
    }
  }, [isMapReady, properties, handleMarkerClick, isTe]);

  // Update marker icons when activePin changes
  useEffect(() => {
    const L = LRef.current;
    if (!isMapReady || !L) return;

    markersRef.current.forEach((marker, id) => {
      const isSelected = id === activePin;
      const size = isSelected ? 38 : 28;
      marker.setIcon(
        L.divIcon({
          className: 'realty-map-marker',
          html: createMarkerHtml(isSelected),
          iconSize: [size, size],
          iconAnchor: [size / 2, size],
        })
      );
      marker.setZIndexOffset(isSelected ? 1000 : 10);

      if (isSelected && mapInstanceRef.current) {
        const latLng = marker.getLatLng();
        mapInstanceRef.current.panTo(latLng, { animate: true, duration: 0.4 });
      }
    });
  }, [activePin, isMapReady]);

  const selectedProp = properties.find((p) => p.id === activePin) || properties[0] || null;

  return (
    <div
      className={`relative bg-[#141210] rounded-2xl overflow-hidden border border-[#2A241F] shadow-xl flex flex-col ${className}`}
    >
      {/* Map Header / Status Bar */}
      <div className="px-5 py-3.5 bg-[#191512]/95 backdrop-blur-md border-b border-[#2A241F] flex items-center justify-between text-xs text-[#C5BDB5] z-10">
        <div className="flex items-center gap-2.5">
          <Navigation className="w-4 h-4 text-[#C5A880]" />
          <span className="font-serif font-medium text-white tracking-wide">
            {isTe ? 'హైదరాబాద్ & ORR గ్రోత్ కారిడార్ మ్యాప్' : 'Hyderabad & ORR Corridor Map'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[#A39A8F] text-[11px] font-mono">
          <span className="w-2 h-2 rounded-full bg-[#C5A880] animate-pulse" />
          <span>{isTe ? 'లైవ్ లొకేషన్లు' : 'Interactive Map'}</span>
        </div>
      </div>

      {/* Map Surface */}
      <div className="relative h-80 sm:h-96 min-h-[380px] lg:h-[480px] w-full bg-[#110F0D] overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Selected Property Preview Pop-up */}
        {selectedProp ? (
          <Link
            href={`/${locale}/properties/${selectedProp.id}`}
            className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-84 bg-[#191512]/95 hover:bg-[#221D18]/95 backdrop-blur-md rounded-2xl p-4 border border-[#2A241F] hover:border-[#8C653E] text-white shadow-2xl z-[1001] transition-all duration-200 group"
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
                  {selectedProp.location.distanceFromOrrKm !== undefined
                    ? `${selectedProp.location.distanceFromOrrKm} km from ORR • `
                    : ''}
                  {selectedProp.location.zone}
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
        ) : properties.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#141210]/60 backdrop-blur-sm z-[1001] pointer-events-none">
            <div className="text-center p-4">
              <Compass className="w-8 h-8 text-[#8C653E] mx-auto mb-2 animate-pulse" />
              <p className="text-xs text-[#A39A8F] font-light">
                {isTe ? 'ఫిల్టర్‌లకు సరిపోయే లొకేషన్లు లేవు' : 'No estates match current criteria'}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Map Footer Notice */}
      <div className="px-5 py-2.5 bg-[#0D0B0A] border-t border-[#2A241F] flex items-center justify-between text-[11px] text-[#8C827A] z-10">
        <span className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-[#8C653E] shrink-0" />
          <span className="truncate">
            {isTe
              ? 'మ్యాప్ డేటా © OpenStreetMap కాంట్రిబ్యూటర్స్'
              : 'Map data © OpenStreetMap contributors'}
          </span>
        </span>
        <span className="font-mono text-[#C5A880] text-[10px] shrink-0 ml-2">
          {isTe ? 'హైదరాబాద్ మెట్రోపాలిటన్ ప్రాంతం' : 'Hyderabad Region'}
        </span>
      </div>
    </div>
  );
}
