'use client';

import React, { useEffect, useRef } from 'react';
import { Navigation, Compass, ExternalLink, Info, MapPin } from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import { MockProperty } from '@/lib/mockData';
import { formatOrrDistance } from '@/lib/formatters';
import { useGoogleMaps } from '@/lib/useGoogleMaps';
import MapStatusFallback from './MapStatusFallback';

interface PropertyLocationMapProps {
  property: MockProperty;
  locale: Locale;
}

const HYDERABAD_CENTER = { lat: 17.4065, lng: 78.4772 };
const DEFAULT_ZOOM = 14;

const LIGHT_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#f5f1ea' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#574f48' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#191512' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8c827a' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e8e2d9' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#574f48' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#eddac2' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#d8c2a8' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8c653e' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#d2e3f0' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6889a7' }],
  },
];

export default function PropertyLocationMap({ property, locale }: PropertyLocationMapProps) {
  const dict = getDictionary(locale);
  const isTe = locale === 'te';

  const { isLoaded, status } = useGoogleMaps();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

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

  // Initialize and update single property map
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current) return;

    let isCancelled = false;

    const initOrUpdateMap = async () => {
      try {
        const { Map } = await google.maps.importLibrary('maps');
        if (isCancelled || !mapContainerRef.current) return;

        const center = hasValidCoordinates ? { lat: lat!, lng: lng! } : HYDERABAD_CENTER;
        const zoom = hasValidCoordinates ? DEFAULT_ZOOM : 11;

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new Map(mapContainerRef.current, {
            center,
            zoom,
            styles: LIGHT_MAP_STYLES,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
          });
        } else {
          mapInstanceRef.current.setCenter(center);
          mapInstanceRef.current.setZoom(zoom);
        }

        // Set or update marker
        if (markerRef.current) {
          markerRef.current.setMap(null);
          markerRef.current = null;
        }

        if (hasValidCoordinates && mapInstanceRef.current) {
          markerRef.current = new google.maps.Marker({
            position: center,
            map: mapInstanceRef.current,
            title: `${property.location.village}, ${property.location.mandal}`,
            icon: {
              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
              fillColor: '#8C653E',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
              scale: 1.8,
              anchor: typeof google !== 'undefined' && google.maps?.Point ? new google.maps.Point(12, 22) : undefined,
            },
          });
        }
      } catch (err) {
        console.error('Failed to initialize Google Map in PropertyLocationMap:', err);
      }
    };

    initOrUpdateMap();

    return () => {
      isCancelled = true;
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [isLoaded, hasValidCoordinates, lat, lng, property.location.village, property.location.mandal]);

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
        {status !== 'loaded' ? (
          <MapStatusFallback status={status} theme="dark" />
        ) : (
          <div ref={mapContainerRef} className="w-full h-full" />
        )}

        {/* Bottom Coordinates Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-[#C5BDB5] bg-[#191512]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 pointer-events-none">
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

      {/* Google Maps notice */}
      <p className="text-[11px] text-[#8C827A] leading-normal italic flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-[#8C827A] shrink-0" />
        <span>{dict.propertyDetail.googleMapsNotice}</span>
      </p>
    </div>
  );
}
