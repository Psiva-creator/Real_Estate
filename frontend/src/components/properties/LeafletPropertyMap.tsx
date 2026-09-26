'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Navigation,
  Compass,
  Building2,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Layers,
  Sparkles,
  ArrowRight,
  Maximize2,
  ChevronRight,
  Globe,
  Map,
  Eye,
} from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import { MockProperty } from '@/lib/mockData';
import { formatINR, formatOrrDistance } from '@/lib/formatters';
import {
  ORR_LOOP_COORDINATES,
  ORR_EXITS,
  TELANGANA_CORRIDORS,
  CorridorInfo,
} from '@/lib/telanganaMapData';

interface LeafletPropertyMapProps {
  properties: MockProperty[];
  locale: Locale;
  selectedPropertyId?: string;
  onSelectProperty?: (id: string) => void;
  className?: string;
  singlePropertyMode?: boolean;
}

type MapLayerMode = 'satellite' | 'street' | 'imagery';

export default function LeafletPropertyMap({
  properties,
  locale,
  selectedPropertyId,
  onSelectProperty,
  className = '',
  singlePropertyMode = false,
}: LeafletPropertyMapProps) {
  const dict = getDictionary(locale);
  const isTe = locale === 'te';

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const orrLayerRef = useRef<any>(null);
  const singlePropertyCircleRef = useRef<any>(null);

  // Default to High-Definition Satellite view
  const [mapMode, setMapMode] = useState<MapLayerMode>('satellite');
  const [activeCorridor, setActiveCorridor] = useState<string>('all');
  const [showOrrLayer, setShowOrrLayer] = useState<boolean>(true);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<'ALL' | 'LAND' | 'FLAT' | 'VILLA'>('ALL');
  const [activeProperty, setActiveProperty] = useState<MockProperty | null>(null);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);

  // Filter properties according to active type filter
  const visibleProperties = useMemo(() => {
    if (singlePropertyMode) return properties;
    if (propertyTypeFilter === 'ALL') return properties;
    return properties.filter((p) => p.type === propertyTypeFilter);
  }, [properties, propertyTypeFilter, singlePropertyMode]);

  // Helper to create tile layer based on mode (Zero watermarks, high performance)
  const getTileLayer = (L: any, mode: MapLayerMode) => {
    const tilePerfOptions = {
      updateWhenZooming: false, // Never request new tiles mid-animation (eliminates zoom lag)
      updateWhenIdle: true,     // Only fetch tiles when camera is steady
      keepBuffer: 6,           // Keep existing tiles in GPU memory
      maxNativeZoom: 19,
    };

    if (mode === 'satellite') {
      // High-Definition Satellite Hybrid (Aerial photo + crisp road labels, No API key, No watermark)
      return L.tileLayer(
        'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        {
          ...tilePerfOptions,
          maxZoom: 20,
          subdomains: ['0', '1', '2', '3'],
        }
      );
    } else if (mode === 'imagery') {
      // Pure Raw Drone/Satellite Imagery (Esri World Imagery)
      return L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          ...tilePerfOptions,
          maxZoom: 19,
        }
      );
    } else {
      // Clean OpenStreetMap Street Tiles
      return L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          ...tilePerfOptions,
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
        }
      );
    }
  };

  // Initialize Leaflet Map on client side
  useEffect(() => {
    let isCancelled = false;

    async function initLeaflet() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;
      if (isCancelled || !mapContainerRef.current) return;

      // Center on single property or Hyderabad metro center
      const initialCenter: [number, number] =
        singlePropertyMode && properties[0]?.location?.latitude && properties[0]?.location?.longitude
          ? [properties[0].location.latitude, properties[0].location.longitude]
          : [17.4200, 78.4300];

      const initialZoom = singlePropertyMode ? 15 : 11;

      // Initialize map with GPU canvas acceleration and smooth zoom controls
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        minZoom: 8,
        maxZoom: 20,
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true, // Render polylines & vector circles directly on GPU Canvas (eliminates SVG DOM lag)
        wheelPxPerZoomLevel: 100, // Buttery smooth scroll wheel zooming
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
      });

      // Add Zoom control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add default tile layer (Satellite Hybrid)
      const initialTileLayer = getTileLayer(L, 'satellite').addTo(map);
      tileLayerRef.current = initialTileLayer;

      // Create Layer Groups
      const orrGroup = L.layerGroup().addTo(map);
      const markersGroup = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = markersGroup;
      orrLayerRef.current = orrGroup;

      // Render 158km Outer Ring Road (ORR) on hardware-accelerated canvas
      const orrPolyline = L.polyline(ORR_LOOP_COORDINATES, {
        color: '#F59E0B', // Glowing Golden Amber
        weight: 3.5,
        opacity: 0.9,
        dashArray: '8, 6',
      });
      orrPolyline.bindTooltip(
        '<div class="font-bold text-xs" style="color:#D97706;">Hyderabad 158km Outer Ring Road (ORR)</div>',
        { sticky: true }
      );
      orrGroup.addLayer(orrPolyline);

      // Add Key ORR Exit Markers with GPU-friendly CSS (no heavy backdrop-filter)
      ORR_EXITS.forEach((exit) => {
        const exitIcon = L.divIcon({
          className: 'custom-exit-marker',
          html: `
            <div style="
              background: #191512;
              color: #FBBF24;
              border: 1.5px solid #F59E0B;
              border-radius: 9999px;
              padding: 2px 7px;
              font-size: 10px;
              font-weight: 700;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 3px;
              will-change: transform;
            ">
              <span style="background:#F59E0B;color:#191512;border-radius:4px;padding:0 3px;font-size:9px;">E${exit.exitNo}</span>
              <span>${exit.nameEn.split('/')[0]}</span>
            </div>
          `,
          iconSize: [80, 20],
          iconAnchor: [40, 10],
        });

        const exitMarker = L.marker([exit.lat, exit.lng], { icon: exitIcon });
        exitMarker.bindTooltip(
          `<strong>Exit ${exit.exitNo}: ${exit.nameEn}</strong><br/><span style="color:#666">${exit.nameTe}</span>`,
          { direction: 'top' }
        );
        orrGroup.addLayer(exitMarker);
      });

      // If Single Property Mode: Draw real cadastral boundary polygon if available, else boundary circle
      if (singlePropertyMode && properties[0]) {
        const coords = properties[0].boundaryCoordinates;
        if (coords && Array.isArray(coords) && coords.length >= 3) {
          const latLngs = coords.map((c: any) => [c.lat ?? c[0], c.lng ?? c[1]]);
          const surveyPolygon = L.polygon(latLngs, {
            color: '#F59E0B',
            fillColor: '#10B981',
            fillOpacity: 0.28,
            weight: 2.5,
          }).addTo(map);

          surveyPolygon.bindTooltip(
            '<div style="font-size:11px;font-weight:bold;color:#065F46;">📍 Verified Cadastral Plot Boundary</div>',
            { sticky: true }
          );
          singlePropertyCircleRef.current = surveyPolygon;
          map.fitBounds(surveyPolygon.getBounds(), { padding: [30, 30] });
        } else if (properties[0]?.location?.latitude && properties[0]?.location?.longitude) {
          const pLat = properties[0].location.latitude;
          const pLng = properties[0].location.longitude;

          const surveyCircle = L.circle([pLat, pLng], {
            radius: 180,
            color: '#10B981',
            fillColor: '#10B981',
            fillOpacity: 0.22,
            weight: 2,
            dashArray: '4, 4',
          }).addTo(map);

          surveyCircle.bindTooltip(
            '<div style="font-size:11px;font-weight:bold;color:#065F46;">📍 Verified Land Demarcation Zone</div>',
            { sticky: true }
          );

          singlePropertyCircleRef.current = surveyCircle;
        }
      }

      setIsMapReady(true);
    }

    initLeaflet();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [singlePropertyMode]);

  // Handle Layer Mode Switching (Satellite Hybrid vs Street vs Pure Aerial)
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;

    import('leaflet').then((LModule) => {
      const L = LModule.default;
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      const newLayer = getTileLayer(L, mapMode);
      newLayer.addTo(mapInstanceRef.current);
      tileLayerRef.current = newLayer;
    });
  }, [mapMode, isMapReady]);

  // Update Property Markers on Map
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !markersGroupRef.current) return;

    async function updateMarkers() {
      const L = (await import('leaflet')).default;
      const markersGroup = markersGroupRef.current;
      markersGroup.clearLayers();

      visibleProperties.forEach((property) => {
        const lat = property.location?.latitude;
        const lng = property.location?.longitude;
        if (!lat || !lng) return;

        const isLand = property.type === 'LAND';
        const isSelected = selectedPropertyId === property.id;
        const primaryColor = isLand ? '#059669' : '#2563EB';
        const priceLabel = formatINR(property.pricing.totalPrice);

        const customIcon = L.divIcon({
          className: 'custom-property-pin',
          html: `
            <div style="
              cursor: pointer;
              transform: ${isSelected ? 'scale(1.18)' : 'scale(1)'};
              transition: transform 0.2s ease;
            ">
              <div style="
                background: ${primaryColor};
                color: #FFFFFF;
                border: 2px solid #FFFFFF;
                border-radius: 9999px;
                padding: 4px 10px;
                font-size: 11px;
                font-weight: 700;
                box-shadow: 0 4px 12px rgba(0,0,0,0.35);
                display: flex;
                align-items: center;
                gap: 5px;
                white-space: nowrap;
              ">
                <span style="font-size: 12px;">${isLand ? '🌾' : '🏢'}</span>
                <span>${priceLabel}</span>
              </div>
              <div style="
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 7px solid ${primaryColor};
                margin: -1px auto 0;
              "></div>
            </div>
          `,
          iconSize: [95, 38],
          iconAnchor: [47, 38],
        });

        const marker = L.marker([lat, lng], { icon: customIcon });

        // Popup Content
        const popupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 230px; max-width: 270px; padding: 4px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: ${primaryColor}; margin-bottom: 2px;">
              ${property.type} • ${property.location.district}
            </div>
            <div style="font-weight: 700; font-size: 14px; color: #191512; line-height: 1.3; margin-bottom: 4px;">
              ${isTe && property.titleTe ? property.titleTe : property.title}
            </div>
            <div style="font-size: 11px; color: #6B7280; margin-bottom: 8px;">
              📍 ${property.location.village}, ${property.location.mandal}
              ${property.location.distanceFromOrrKm ? `<br/>🛣️ ${formatOrrDistance(property.location.distanceFromOrrKm)}` : ''}
            </div>
            <div style="display: flex; align-items: baseline; justify-content: space-between; border-top: 1px solid #E5E7EB; padding-top: 6px; margin-bottom: 8px;">
              <span style="font-size: 11px; color: #6B7280;">Price:</span>
              <span style="font-size: 15px; font-weight: 800; color: #059669;">${formatINR(property.pricing.totalPrice)}</span>
            </div>
            <div style="display: flex; gap: 6px;">
              <a href="/${locale}/properties/${property.id}" style="
                flex: 1;
                text-align: center;
                background: #191512;
                color: #FFFFFF;
                font-size: 11px;
                font-weight: 600;
                padding: 6px 10px;
                border-radius: 8px;
                text-decoration: none;
                display: block;
              ">View Property →</a>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="
                background: #F3F4F6;
                color: #191512;
                font-size: 11px;
                font-weight: 600;
                padding: 6px 8px;
                border-radius: 8px;
                text-decoration: none;
                display: flex;
                align-items: center;
                justify-content: center;
              " title="Open Google Maps Navigation">🧭</a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          setActiveProperty(property);
          if (onSelectProperty) onSelectProperty(property.id);
        });

        markersGroup.addLayer(marker);
      });
    }

    updateMarkers();
  }, [visibleProperties, isMapReady, selectedPropertyId, locale, isTe, onSelectProperty]);

  // Toggle ORR Layer Visibility
  useEffect(() => {
    if (!orrLayerRef.current || !mapInstanceRef.current) return;
    if (showOrrLayer) {
      if (!mapInstanceRef.current.hasLayer(orrLayerRef.current)) {
        mapInstanceRef.current.addLayer(orrLayerRef.current);
      }
    } else {
      if (mapInstanceRef.current.hasLayer(orrLayerRef.current)) {
        mapInstanceRef.current.removeLayer(orrLayerRef.current);
      }
    }
  }, [showOrrLayer]);

  // Jump to Corridor
  const handleCorridorJump = (corridor: CorridorInfo) => {
    setActiveCorridor(corridor.id);
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([corridor.lat, corridor.lng], corridor.zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  };

  return (
    <div className={`relative flex flex-col w-full rounded-2xl overflow-hidden border border-[#E8E2D9] bg-white shadow-sm ${className}`}>
      {/* Top Corridor & View Controls Bar */}
      <div className="bg-[#191512] text-white p-3 sm:p-4 border-b border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-bold text-xs sm:text-sm tracking-wide flex items-center gap-1.5 text-white">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>
                {singlePropertyMode
                  ? isTe ? 'ఆస్తి శాటిలైట్ లొకేషన్ మ్యాప్' : 'Property Satellite Location Map'
                  : isTe ? 'తెలంగాణ శాటిలైట్ మాస్టర్ మ్యాప్' : 'Telangana Satellite Master Map'}
              </span>
            </h3>
          </div>

          {/* Layer & Mode Controls */}
          <div className="flex items-center gap-2 text-xs">
            {/* Satellite / Street / Aerial View Toggle */}
            <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => setMapMode('satellite')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                  mapMode === 'satellite'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Satellite View with Road Names"
              >
                <Globe className="w-3 h-3" />
                <span>Satellite</span>
              </button>
              <button
                type="button"
                onClick={() => setMapMode('street')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                  mapMode === 'street'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Street Vector Map"
              >
                <Map className="w-3 h-3" />
                <span>Street</span>
              </button>
            </div>

            {/* ORR 158km Layer Toggle */}
            {!singlePropertyMode && (
              <button
                type="button"
                onClick={() => setShowOrrLayer(!showOrrLayer)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                  showOrrLayer
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
                title="Toggle 158km Outer Ring Road overlay"
              >
                <Layers className="w-3 h-3" />
                <span>ORR 158km</span>
              </button>
            )}

            {/* Property Type Toggles */}
            {!singlePropertyMode && (
              <div className="hidden sm:flex items-center bg-white/10 rounded-lg p-0.5">
                {(['ALL', 'LAND', 'FLAT'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPropertyTypeFilter(type)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                      propertyTypeFilter === type
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Corridor Selection Pills (Multi-Property Mode) */}
        {!singlePropertyMode && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {TELANGANA_CORRIDORS.map((corridor) => (
              <button
                key={corridor.id}
                type="button"
                onClick={() => handleCorridorJump(corridor)}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all duration-150 shrink-0 ${
                  activeCorridor === corridor.id
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-slate-300'
                }`}
              >
                {isTe ? corridor.nameTe : corridor.nameEn.split('(')[0].trim()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Presentation Surface */}
      <div className="relative w-full h-[380px] sm:h-[480px] md:h-[560px] bg-[#141210]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-[400] bg-[#191512]/90 backdrop-blur-md text-white px-3 py-2 rounded-xl border border-white/10 text-[10px] sm:text-xs flex flex-wrap items-center gap-3 pointer-events-none shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm" />
            <span className="text-slate-200 font-medium">{isTe ? 'వ్యవసాయ భూములు (ధరణి)' : 'Agricultural Land'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-sm" />
            <span className="text-slate-200 font-medium">{isTe ? 'అపార్ట్‌మెంట్లు / ఫ్లాట్లు' : 'Flats & Villas'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-amber-500 inline-block rounded shadow-sm" />
            <span className="text-amber-400 font-semibold">158km ORR</span>
          </div>
        </div>

        {/* Top-Left Quick Native GPS Deep Link */}
        {singlePropertyMode && properties[0]?.location && (
          <div className="absolute top-3 left-3 z-[400]">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${properties[0].location.latitude},${properties[0].location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-slate-900 px-3.5 py-1.5 rounded-full shadow-lg text-xs font-bold hover:bg-white transition-colors border border-slate-200"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isTe ? 'గూగుల్ మ్యాప్స్‌లో నావిగేట్ చేయండి' : 'Open in Google Maps'}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
