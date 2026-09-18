'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Navigation, Compass, ArrowUpRight, Info } from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { MockProperty } from '@/lib/mockData';
import { formatINR } from '@/lib/formatters';
import { useGoogleMaps } from '@/lib/useGoogleMaps';
import MapStatusFallback from './MapStatusFallback';

interface MapViewProps {
  properties: MockProperty[];
  locale: Locale;
  selectedPropertyId?: string;
  onSelectProperty?: (id: string) => void;
  className?: string;
}

const HYDERABAD_CENTER = { lat: 17.4065, lng: 78.4772 };
const DEFAULT_ZOOM = 11;

const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#161311' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#161311' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#C5BDB5' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#FAF8F5' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8C827A' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#26201B' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#191512' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8C827A' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#4A3B2C' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#191512' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#C5A880' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0F1722' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#455A75' }],
  },
];

function createMarkerIcon(isSelected: boolean): google.maps.Symbol {
  return {
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    fillColor: isSelected ? '#C5A880' : '#191512',
    fillOpacity: 1,
    strokeColor: isSelected ? '#FFFFFF' : '#C5A880',
    strokeWeight: isSelected ? 2.5 : 1.5,
    scale: isSelected ? 1.7 : 1.3,
    anchor: typeof google !== 'undefined' && google.maps?.Point ? new google.maps.Point(12, 22) : undefined,
  };
}

export default function MapView({
  properties,
  locale,
  selectedPropertyId,
  onSelectProperty,
  className = '',
}: MapViewProps) {
  const { isLoaded, status } = useGoogleMaps();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const markersMapRef = useRef<Map<string, google.maps.Marker>>(new Map());

  const [activePin, setActivePin] = useState<string | null>(
    selectedPropertyId || properties[0]?.id || null
  );

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

  // Handle marker selection callback
  const handleMarkerClick = useCallback(
    (propertyId: string, lat?: number, lng?: number) => {
      setActivePin(propertyId);
      if (onSelectProperty) {
        onSelectProperty(propertyId);
      }
      if (mapInstanceRef.current && lat !== undefined && lng !== undefined) {
        mapInstanceRef.current.panTo({ lat, lng });
      }
    },
    [onSelectProperty]
  );

  // Initialize Map Instance once loaded
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current) return;

    let isCancelled = false;

    const initMap = async () => {
      try {
        const { Map } = await google.maps.importLibrary('maps');
        if (isCancelled || !mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
          const map = new Map(mapContainerRef.current, {
            center: HYDERABAD_CENTER,
            zoom: DEFAULT_ZOOM,
            styles: DARK_MAP_STYLES,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
          });
          mapInstanceRef.current = map;
          setMapInstance(map);
        }
      } catch (err) {
        console.error('Failed to initialize Google Map:', err);
      }
    };

    initMap();

    return () => {
      isCancelled = true;
    };
  }, [isLoaded]);

  // Update Markers whenever properties, isLoaded, or activePin changes
  useEffect(() => {
    if (!isLoaded || !mapInstance) return;

    const map = mapInstance;
    const currentMarkers = markersMapRef.current;

    // Remove existing markers
    currentMarkers.forEach((marker) => marker.setMap(null));
    currentMarkers.clear();

    const bounds = new google.maps.LatLngBounds();
    let validCount = 0;

    properties.forEach((prop) => {
      const lat = prop.location.latitude;
      const lng = prop.location.longitude;

      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        return;
      }

      validCount++;
      const pos = { lat, lng };
      bounds.extend(pos);

      const isSelected = prop.id === activePin;

      const marker = new google.maps.Marker({
        position: pos,
        map,
        title: `${prop.location.village} - ${isTe && prop.titleTe ? prop.titleTe : prop.title}`,
        icon: createMarkerIcon(isSelected),
        zIndex: isSelected ? 999 : 1,
      });

      marker.addListener('click', () => {
        handleMarkerClick(prop.id, lat, lng);
      });

      currentMarkers.set(prop.id, marker);
    });

    // Fit bounds or center gracefully
    if (validCount > 1) {
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 100, left: 50 });
      // Prevent over-zooming on tight bounds
      const listener = google.maps.event.addListener(map, 'idle', () => {
        const zoom = map.getZoom();
        if (zoom !== undefined && zoom > 14) {
          map.setZoom(14);
        }
        google.maps.event.removeListener(listener);
      });
    } else if (validCount === 1) {
      const firstValid = properties.find(
        (p) => typeof p.location.latitude === 'number' && typeof p.location.longitude === 'number'
      );
      if (firstValid && firstValid.location.latitude && firstValid.location.longitude) {
        map.setCenter({ lat: firstValid.location.latitude, lng: firstValid.location.longitude });
        map.setZoom(13);
      }
    } else {
      map.setCenter(HYDERABAD_CENTER);
      map.setZoom(DEFAULT_ZOOM);
    }
  }, [isLoaded, mapInstance, properties, handleMarkerClick, activePin, isTe]);

  // Update selected marker highlighting & pan when activePin changes externally
  useEffect(() => {
    if (!isLoaded || !mapInstance) return;

    markersMapRef.current.forEach((marker, id) => {
      const isSelected = id === activePin;
      marker.setIcon(createMarkerIcon(isSelected));
      marker.setZIndex(isSelected ? 999 : 1);

      if (isSelected) {
        const pos = marker.getPosition();
        if (pos && mapInstance) {
          mapInstance.panTo(pos);
        }
      }
    });
  }, [isLoaded, mapInstance, activePin]);

  const selectedProp = properties.find((p) => p.id === activePin) || properties[0] || null;

  return (
    <div
      className={`relative bg-[#141210] rounded-2xl overflow-hidden border border-[#2A241F] shadow-xl flex flex-col ${className}`}
    >
      {/* Map Header / Status Bar */}
      <div className="px-5 py-3.5 bg-[#191512]/95 backdrop-blur-md border-b border-[#2A241F] flex items-center justify-between text-xs text-[#C5BDB5]">
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

      {/* Map Surface or Fallback */}
      <div className="relative h-80 sm:h-96 min-h-[380px] lg:h-[480px] w-full bg-[#110F0D] overflow-hidden">
        {status !== 'loaded' ? (
          <MapStatusFallback status={status} theme="dark" />
        ) : (
          <div ref={mapContainerRef} className="w-full h-full" />
        )}

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
          <div className="absolute inset-0 flex items-center justify-center bg-[#141210]/60 backdrop-blur-sm z-20 pointer-events-none">
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
      <div className="px-5 py-2.5 bg-[#0D0B0A] border-t border-[#2A241F] flex items-center justify-between text-[11px] text-[#8C827A]">
        <span className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-[#8C653E] shrink-0" />
          <span className="truncate">
            {isTe
              ? 'గూగుల్ మ్యాప్స్ ద్వారా ఆధారితం'
              : 'Powered by Google Maps JavaScript API'}
          </span>
        </span>
        <span className="font-mono text-[#C5A880] text-[10px] shrink-0 ml-2">
          {isTe ? 'హైదరాబాద్ మెట్రోపాలిటన్ ప్రాంతం' : 'Hyderabad Region'}
        </span>
      </div>
    </div>
  );
}
