'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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
  Pencil,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Check,
  AlertCircle,
  Info,
  Plus,
  Target,
  Crosshair,
  Square,
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
import { calculatePolygonArea, PolygonAreaResult } from '@/lib/polygonArea';

export interface LeafletPropertyMapProps {
  properties?: MockProperty[];
  locale: Locale;
  selectedPropertyId?: string;
  onSelectProperty?: (id: string) => void;
  className?: string;
  singlePropertyMode?: boolean;
  // Boundary / Plot demarcation props:
  boundaryMode?: boolean;
  initialPolygon?: Array<[number, number]>;
  onPolygonChange?: (polygon: Array<[number, number]>, areaSqYards: number, areaAcres: number) => void;
  centerCoordinates?: [number, number];
  locationName?: string;
  onApplyAreaToForm?: (acres: number, sqYards: number) => void;
}

type MapLayerMode = 'satellite' | 'street' | 'imagery';

const EMPTY_PROPERTIES: MockProperty[] = [];

export default function LeafletPropertyMap({
  properties = EMPTY_PROPERTIES,
  locale,
  selectedPropertyId,
  onSelectProperty,
  className = '',
  singlePropertyMode = false,
  boundaryMode = false,
  initialPolygon = [],
  onPolygonChange,
  centerCoordinates,
  locationName,
  onApplyAreaToForm,
}: LeafletPropertyMapProps) {
  const dict = getDictionary(locale);
  const isTe = locale === 'te';

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const orrLayerRef = useRef<any>(null);
  const singlePropertyCircleRef = useRef<any>(null);

  // Boundary specific refs
  const boundaryLayerRef = useRef<any>(null);
  const vertexMarkersGroupRef = useRef<any>(null);
  const midpointMarkersGroupRef = useRef<any>(null);
  const centerMarkerGroupRef = useRef<any>(null);
  const polygonCoordsRef = useRef<Array<[number, number]>>(initialPolygon || []);

  // Default to High-Definition Satellite view (optimal for land survey & parcels)
  const [mapMode, setMapMode] = useState<MapLayerMode>('satellite');
  const [activeCorridor, setActiveCorridor] = useState<string>('all');
  const [showOrrLayer, setShowOrrLayer] = useState<boolean>(!boundaryMode);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<'ALL' | 'LAND' | 'FLAT' | 'VILLA'>('ALL');
  const [activeProperty, setActiveProperty] = useState<MockProperty | null>(null);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);

  // Boundary tool state
  const [polygonCoords, setPolygonCoords] = useState<Array<[number, number]>>(initialPolygon || []);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(() => {
    return boundaryMode && (!initialPolygon || initialPolygon.length === 0);
  });
  const [appliedAreaFeedback, setAppliedAreaFeedback] = useState(false);

  const isDrawingModeRef = useRef<boolean>(isDrawingMode);
  const onPolygonChangeRef = useRef(onPolygonChange);

  useEffect(() => {
    onPolygonChangeRef.current = onPolygonChange;
  }, [onPolygonChange]);

  useEffect(() => {
    isDrawingModeRef.current = isDrawingMode;
  }, [isDrawingMode]);

  // Synchronize ref with state
  useEffect(() => {
    polygonCoordsRef.current = polygonCoords;
  }, [polygonCoords]);

  // Sync initialPolygon if passed late or step mounted
  useEffect(() => {
    if (initialPolygon && initialPolygon.length > 0 && polygonCoords.length === 0) {
      setPolygonCoords(initialPolygon);
      polygonCoordsRef.current = initialPolygon;
    }
  }, [initialPolygon]);

  // Compute real-time polygon area
  const areaResult: PolygonAreaResult = useMemo(() => {
    return calculatePolygonArea(polygonCoords);
  }, [polygonCoords]);

  // Notify parent on boundary change
  const triggerPolygonChange = useCallback(
    (coords: Array<[number, number]>) => {
      if (onPolygonChangeRef.current) {
        const area = calculatePolygonArea(coords);
        onPolygonChangeRef.current(coords, area.sqYards, area.acres);
      }
    },
    []
  );

  // Filter properties according to active type filter
  const visibleProperties = useMemo(() => {
    if (boundaryMode) return [];
    if (singlePropertyMode) return properties;
    if (propertyTypeFilter === 'ALL') return properties;
    return properties.filter((p) => p.type === propertyTypeFilter);
  }, [properties, propertyTypeFilter, singlePropertyMode, boundaryMode]);

  // Helper to create tile layer based on mode (Zero watermarks, high performance)
  const getTileLayer = (L: any, mode: MapLayerMode) => {
    const tilePerfOptions = {
      updateWhenZooming: false,
      updateWhenIdle: true,
      keepBuffer: 6,
      maxNativeZoom: 19,
    };

    if (mode === 'satellite') {
      // High-Definition Satellite Hybrid (Aerial photo + road labels)
      return L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        ...tilePerfOptions,
        maxZoom: 20,
        subdomains: ['0', '1', '2', '3'],
      });
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
      return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        ...tilePerfOptions,
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      });
    }
  };

  // Center coordinates primitives
  const centerLat = centerCoordinates?.[0];
  const centerLng = centerCoordinates?.[1];

  // Initialize Leaflet Map on client side
  useEffect(() => {
    let isCancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    async function initLeaflet() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;
      if (isCancelled || !mapContainerRef.current) return;

      // Determine center coordinates
      let initialCenter: [number, number] = [17.4065, 78.4772]; // Telangana / Hyderabad core
      let initialZoom = 12;

      if (boundaryMode) {
        if (polygonCoordsRef.current.length > 0) {
          // Center on polygon centroid
          let sumLat = 0;
          let sumLng = 0;
          polygonCoordsRef.current.forEach(([lat, lng]) => {
            sumLat += lat;
            sumLng += lng;
          });
          initialCenter = [
            sumLat / polygonCoordsRef.current.length,
            sumLng / polygonCoordsRef.current.length,
          ];
          initialZoom = 17;
        } else if (centerLat != null && centerLng != null && !isNaN(centerLat) && !isNaN(centerLng)) {
          initialCenter = [centerLat, centerLng];
          initialZoom = 16;
        } else {
          initialCenter = [17.4042, 78.3308]; // Kokapet / West Hyderabad growth corridor
          initialZoom = 14;
        }
      } else if (singlePropertyMode && properties[0]?.location?.latitude && properties[0]?.location?.longitude) {
        initialCenter = [properties[0].location.latitude, properties[0].location.longitude];
        initialZoom = 15;
      }

      // Initialize map instance
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        minZoom: 8,
        maxZoom: 20,
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true,
        wheelPxPerZoomLevel: 100,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
        tap: false,
        trackResize: true,
      });

      // Add Zoom control top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Default tile layer
      const initialTileLayer = getTileLayer(L, mapMode).addTo(map);
      tileLayerRef.current = initialTileLayer;

      // Layer groups
      const orrGroup = L.layerGroup();
      const markersGroup = L.layerGroup().addTo(map);
      const boundaryLayer = L.layerGroup().addTo(map);
      const vertexMarkersGroup = L.layerGroup().addTo(map);
      const midpointMarkersGroup = L.layerGroup().addTo(map);
      const centerMarkerGroup = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = markersGroup;
      orrLayerRef.current = orrGroup;
      boundaryLayerRef.current = boundaryLayer;
      vertexMarkersGroupRef.current = vertexMarkersGroup;
      midpointMarkersGroupRef.current = midpointMarkersGroup;
      centerMarkerGroupRef.current = centerMarkerGroup;

      if (!boundaryMode) {
        // Render 158km Outer Ring Road (ORR)
        const orrPolyline = L.polyline(ORR_LOOP_COORDINATES, {
          color: '#F59E0B',
          weight: 3.5,
          opacity: 0.9,
          dashArray: '8, 6',
        });
        orrPolyline.bindTooltip(
          '<div class="font-bold text-xs" style="color:#D97706;">Hyderabad 158km Outer Ring Road (ORR)</div>',
          { sticky: true }
        );
        orrGroup.addLayer(orrPolyline);

        // Add Key ORR Exit Markers
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

        if (showOrrLayer) {
          orrGroup.addTo(map);
        }

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
      }

      // Invalidate size to ensure proper tile projection after mount
      setTimeout(() => {
        if (!isCancelled && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      setTimeout(() => {
        if (!isCancelled && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 500);

      if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        });
        resizeObserver.observe(mapContainerRef.current);
      }

      setIsMapReady(true);
    }

    initLeaflet();

    return () => {
      isCancelled = true;
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      setIsMapReady(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singlePropertyMode, boundaryMode]);

  // Handle center coordinate changes dynamically in boundary mode and render reference marker
  useEffect(() => {
    if (!boundaryMode || !isMapReady || !mapInstanceRef.current || centerLat == null || centerLng == null || isNaN(centerLat) || isNaN(centerLng)) return;
    const targetCoords: [number, number] = [centerLat, centerLng];

    if (centerMarkerGroupRef.current) {
      centerMarkerGroupRef.current.clearLayers();
      import('leaflet').then((LModule) => {
        const L = LModule.default;
        if (!centerMarkerGroupRef.current) return;
        const centerIcon = L.divIcon({
          className: 'custom-center-marker pointer-events-none',
          html: `
            <div style="
              background: #201512;
              color: #FAF8F3;
              border: 1.5px solid #C79A6B;
              border-radius: 9999px;
              padding: 4px 10px;
              font-size: 11px;
              font-weight: 700;
              box-shadow: 0 4px 14px rgba(0,0,0,0.45);
              display: inline-flex;
              align-items: center;
              gap: 5px;
              white-space: nowrap;
              pointer-events: none;
            ">
              <span style="color: #C79A6B; font-size: 13px;">📍</span>
              <span>${locationName || (isTe ? 'ప్రాంతం కేంద్రం' : 'Locality Center')}</span>
            </div>
          `,
          iconSize: [140, 28],
          iconAnchor: [70, 14],
        });
        const cMarker = L.marker(targetCoords, {
          icon: centerIcon,
          interactive: false,
          title: locationName || 'Locality Center',
        });
        centerMarkerGroupRef.current.addLayer(cMarker);
      });
    }
    if (polygonCoordsRef.current.length === 0) {
      mapInstanceRef.current.setView(targetCoords, 16, { animate: true });
    }
  }, [boundaryMode, centerLat, centerLng, isMapReady, locationName, isTe]);

  // Handle Layer Mode Switching
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

  // ─── Interactive Plot Boundary Drawing & Vertex Editing ─────────────────────

  // Synchronize Leaflet map click listener for adding polygon vertices
  const handleMapClick = useCallback(
    (e: any) => {
      if (!isDrawingModeRef.current) return;
      if (!e || !e.latlng) return;
      const newPoint: [number, number] = [
        Number(e.latlng.lat.toFixed(6)),
        Number(e.latlng.lng.toFixed(6)),
      ];

      setPolygonCoords((prev) => {
        const next = [...prev, newPoint];
        triggerPolygonChange(next);
        return next;
      });
    },
    [triggerPolygonChange]
  );

  useEffect(() => {
    if (!boundaryMode || !isMapReady || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [boundaryMode, isMapReady, handleMapClick]);

  // Render Polygon, Vertex Drag Handles, and Midpoint Adders
  useEffect(() => {
    if (!boundaryMode || !isMapReady || !mapInstanceRef.current) return;
    if (!boundaryLayerRef.current || !vertexMarkersGroupRef.current || !midpointMarkersGroupRef.current) return;

    let isMounted = true;

    async function renderBoundary() {
      const L = (await import('leaflet')).default;
      if (!isMounted || !mapInstanceRef.current) return;

      const boundaryGroup = boundaryLayerRef.current;
      const vertexGroup = vertexMarkersGroupRef.current;
      const midpointGroup = midpointMarkersGroupRef.current;

      boundaryGroup.clearLayers();
      vertexGroup.clearLayers();
      midpointGroup.clearLayers();

      const coords = polygonCoords;
      if (coords.length === 0) return;

      // 1. Render Polygon or Preview Polyline
      if (coords.length >= 3) {
        const polygon = L.polygon(coords, {
          color: '#10B981',
          fillColor: '#10B981',
          fillOpacity: 0.28,
          weight: 3,
          dashArray: isDrawingMode ? '6, 6' : undefined,
        });

        // Allow clicking on polygon to continue adding points if in drawing mode
        polygon.on('click', (e: any) => {
          if (isDrawingModeRef.current) {
            handleMapClick(e);
          }
        });

        const tooltipText = isTe
          ? `<strong>విస్తీర్ణం:</strong> ${areaResult.formattedAcres} (${areaResult.formattedSqYards})`
          : `<strong>Parcel Area:</strong> ${areaResult.formattedAcres} (${areaResult.formattedSqYards})`;

        polygon.bindTooltip(
          `<div style="font-size:11px;font-family:sans-serif;padding:2px 4px;">${tooltipText}</div>`,
          { sticky: true }
        );

        boundaryGroup.addLayer(polygon);
      } else if (coords.length === 2) {
        const line = L.polyline(coords, {
          color: '#10B981',
          weight: 3,
          dashArray: '6, 6',
        });
        line.on('click', (e: any) => {
          if (isDrawingModeRef.current) {
            handleMapClick(e);
          }
        });
        boundaryGroup.addLayer(line);
      }

      // 2. Render Vertex Handles (Draggable Markers)
      coords.forEach((coord, idx) => {
        const isFirst = idx === 0;
        const vertexIcon = L.divIcon({
          className: 'polygon-vertex-pin',
          html: `
            <div style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: ${isFirst && isDrawingMode && coords.length >= 3 ? '#F59E0B' : '#10B981'};
              border: 2.5px solid #FFFFFF;
              box-shadow: 0 2px 8px rgba(0,0,0,0.5);
              color: #FFFFFF;
              font-size: 10px;
              font-weight: 800;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: grab;
              transition: transform 0.15s ease;
              ${isFirst && isDrawingMode && coords.length >= 3 ? 'animation: pulse 1.5s infinite;' : ''}
            ">
              ${idx + 1}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker(coord, {
          icon: vertexIcon,
          draggable: true,
          title: `Vertex ${idx + 1}: Drag to move`,
        });

        // Update polygon in real-time during drag
        marker.on('drag', (e: any) => {
          const latlng = e.latlng;
          const updated = [...polygonCoordsRef.current];
          updated[idx] = [Number(latlng.lat.toFixed(6)), Number(latlng.lng.toFixed(6))];

          const polyLayer = boundaryGroup.getLayers()[0];
          if (polyLayer) {
            polyLayer.setLatLngs(updated);
          }
        });

        // Commit coordinates on dragend
        marker.on('dragend', (e: any) => {
          const latlng = e.latlng;
          const updated = [...polygonCoordsRef.current];
          updated[idx] = [Number(latlng.lat.toFixed(6)), Number(latlng.lng.toFixed(6))];
          setPolygonCoords(updated);
          triggerPolygonChange(updated);
        });

        // Click vertex: close polygon if clicking first point while drawing, or open delete option
        marker.on('click', (e: any) => {
          L.DomEvent.stopPropagation(e);
          if (idx === 0 && isDrawingMode && coords.length >= 3) {
            setIsDrawingMode(false);
          }
        });

        vertexGroup.addLayer(marker);
      });

      // 3. Render Midpoint Insert Handles (Allow adding vertices to any boundary edge)
      if (coords.length >= 3 && !isDrawingMode) {
        for (let i = 0; i < coords.length; i++) {
          const nextIdx = (i + 1) % coords.length;
          const p1 = coords[i];
          const p2 = coords[nextIdx];
          const midLat = (p1[0] + p2[0]) / 2;
          const midLng = (p1[1] + p2[1]) / 2;

          const midIcon = L.divIcon({
            className: 'polygon-midpoint-pin',
            html: `
              <div style="
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #FFFFFF;
                border: 2px solid #10B981;
                box-shadow: 0 1px 4px rgba(0,0,0,0.3);
                color: #10B981;
                font-size: 11px;
                font-weight: 900;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
              ">+</div>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });

          const midMarker = L.marker([midLat, midLng], {
            icon: midIcon,
            title: isTe ? 'కొత్త బిందువును చేర్చండి' : 'Click to insert vertex along this boundary edge',
          });

          const insertIndex = i + 1;
          midMarker.on('click', (e: any) => {
            L.DomEvent.stopPropagation(e);
            const newCoords = [...polygonCoordsRef.current];
            newCoords.splice(insertIndex, 0, [Number(midLat.toFixed(6)), Number(midLng.toFixed(6))]);
            setPolygonCoords(newCoords);
            triggerPolygonChange(newCoords);
          });

          midpointGroup.addLayer(midMarker);
        }
      }
    }

    renderBoundary();

    return () => {
      isMounted = false;
    };
  }, [boundaryMode, isMapReady, polygonCoords, isDrawingMode, isTe, areaResult, triggerPolygonChange]);

  // Standard Property Markers on Multi-Property Map
  useEffect(() => {
    if (boundaryMode || !isMapReady || !mapInstanceRef.current || !markersGroupRef.current) return;

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
  }, [visibleProperties, isMapReady, selectedPropertyId, locale, isTe, onSelectProperty, boundaryMode]);

  // Toggle ORR Layer Visibility
  useEffect(() => {
    if (!orrLayerRef.current || !mapInstanceRef.current) return;
    if (showOrrLayer && !boundaryMode) {
      if (!mapInstanceRef.current.hasLayer(orrLayerRef.current)) {
        mapInstanceRef.current.addLayer(orrLayerRef.current);
      }
    } else {
      if (mapInstanceRef.current.hasLayer(orrLayerRef.current)) {
        mapInstanceRef.current.removeLayer(orrLayerRef.current);
      }
    }
  }, [showOrrLayer, boundaryMode]);

  // Jump to Corridor
  const handleCorridorJump = (corridor: CorridorInfo) => {
    setActiveCorridor(corridor.id);
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([corridor.lat, corridor.lng], corridor.zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  };

  // ─── Boundary Action Handlers ───────────────────────────────────────────────

  const handleClearPolygon = () => {
    setPolygonCoords([]);
    setIsDrawingMode(true);
    triggerPolygonChange([]);
  };

  const handleUndoPoint = () => {
    setPolygonCoords((prev) => {
      const next = prev.slice(0, -1);
      triggerPolygonChange(next);
      return next;
    });
  };

  const handleFinishBoundary = () => {
    if (polygonCoords.length >= 3) {
      setIsDrawingMode(false);
      triggerPolygonChange(polygonCoords);
    }
  };

  const handleApplyArea = () => {
    if (onApplyAreaToForm && areaResult.acres > 0) {
      onApplyAreaToForm(areaResult.acres, areaResult.sqYards);
      setAppliedAreaFeedback(true);
      setTimeout(() => setAppliedAreaFeedback(false), 2500);
    }
  };

  return (
    <div className={`relative flex flex-col w-full rounded-2xl overflow-hidden border border-[#E2CFB6] bg-[#FAF8F3] shadow-[0_12px_32px_-12px_rgba(32,21,18,0.12)] ${className}`}>
      {/* Top Controls Bar */}
      <div className="bg-[#201512] text-[#F5F0E8] p-3 sm:p-4 border-b border-[#3A241C] flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C79A6B] animate-pulse" />
            <h3 className="font-serif font-medium text-xs sm:text-sm tracking-wide flex items-center gap-1.5 text-[#F5F0E8]">
              <Compass className="w-4 h-4 text-[#C79A6B]" />
              <span>
                {boundaryMode
                  ? isTe ? 'ప్లాట్ / ల్యాండ్ సరిహద్దు డ్రాయింగ్ టూల్' : 'Interactive Plot Boundary Tool'
                  : singlePropertyMode
                  ? isTe ? 'ఆస్తి శాటిలైట్ లొకేషన్ మ్యాప్' : 'Property Satellite Location Map'
                  : isTe ? 'తెలంగాణ శాటిలైట్ మాస్టర్ మ్యాప్' : 'Telangana Satellite Master Map'}
              </span>
            </h3>
            {boundaryMode && locationName && (
              <span className="hidden sm:inline-block text-[11px] text-[#C79A6B] bg-[#2E1E18] px-2.5 py-0.5 rounded-full border border-[#C79A6B]/30 font-medium">
                📍 {locationName}
              </span>
            )}
          </div>

          {/* Layer & Mode Controls */}
          <div className="flex items-center gap-2 text-xs">
            {/* Satellite / Street / Aerial View Toggle */}
            <div className="flex items-center bg-[#2E1E18] rounded-xl p-0.5 border border-[#3A241C]">
              <button
                type="button"
                id="map-satellite-toggle"
                onClick={() => setMapMode('satellite')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                  mapMode === 'satellite'
                    ? 'bg-[#C79A6B] text-[#201512] shadow-sm font-bold'
                    : 'text-[#E2CFB6]/80 hover:text-white hover:bg-white/5'
                }`}
                title="Satellite View with Road Names"
              >
                <Globe className="w-3 h-3" />
                <span>Satellite</span>
              </button>
              <button
                type="button"
                id="map-street-toggle"
                onClick={() => setMapMode('street')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                  mapMode === 'street'
                    ? 'bg-[#FAF8F3] text-[#201512] shadow-sm font-bold'
                    : 'text-[#E2CFB6]/80 hover:text-white hover:bg-white/5'
                }`}
                title="Street Vector Map"
              >
                <Map className="w-3 h-3" />
                <span>Street</span>
              </button>
            </div>

            {/* ORR 158km Layer Toggle (Only in discovery mode) */}
            {!singlePropertyMode && !boundaryMode && (
              <button
                type="button"
                onClick={() => setShowOrrLayer(!showOrrLayer)}
                className={`px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                  showOrrLayer
                    ? 'bg-[#C79A6B]/20 border-[#C79A6B] text-[#C79A6B]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
                title="Toggle 158km Outer Ring Road overlay"
              >
                <Layers className="w-3 h-3" />
                <span>ORR 158km</span>
              </button>
            )}

            {/* Property Type Toggles (Discovery mode) */}
            {!singlePropertyMode && !boundaryMode && (
              <div className="hidden sm:flex items-center bg-[#2E1E18] rounded-xl p-0.5 border border-[#3A241C]">
                {(['ALL', 'LAND', 'FLAT'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPropertyTypeFilter(type)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                      propertyTypeFilter === type
                        ? 'bg-[#FAF8F3] text-[#201512] shadow-sm'
                        : 'text-[#E2CFB6]/70 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Boundary Drawing Action Toolbar (Active in Boundary Mode) */}
        {boundaryMode && (
          <div className="pt-2 border-t border-[#3A241C] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                id="map-plotting-mode-btn"
                onClick={() => setIsDrawingMode(!isDrawingMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                  isDrawingMode
                    ? 'bg-[#C79A6B] text-[#201512] font-bold ring-1 ring-[#FAF8F3]/40'
                    : 'bg-[#2E1E18] text-[#E2CFB6] border border-[#3A241C] hover:bg-[#3A241C] hover:text-white'
                }`}
                title={isDrawingMode ? 'Drawing mode is active: click map to place corners' : 'Enable drawing mode'}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>
                  {isDrawingMode
                    ? isTe ? 'డ్రాయింగ్ మోడ్ (సక్రియం)' : 'Plotting Mode (Active)'
                    : isTe ? 'బిందువులు జోడించు' : 'Add Points'}
                </span>
              </button>

              {isDrawingMode && polygonCoords.length >= 3 && (
                <button
                  type="button"
                  id="map-close-boundary-btn"
                  onClick={handleFinishBoundary}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF8F3] hover:bg-white text-[#201512] flex items-center gap-1.5 transition-all shadow-sm border border-[#E2CFB6]"
                >
                  <Check className="w-3.5 h-3.5 text-[#C79A6B]" />
                  <span>{isTe ? 'సరిహద్దు ముగించు' : 'Close Boundary'}</span>
                </button>
              )}

              {polygonCoords.length > 0 && (
                <button
                  type="button"
                  id="map-undo-btn"
                  onClick={handleUndoPoint}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-[#2E1E18] hover:bg-[#3A241C] text-[#E2CFB6] border border-[#3A241C] flex items-center gap-1 transition-all"
                  title="Remove last corner point"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#C79A6B]" />
                  <span>{isTe ? 'వెనుకకు' : 'Undo'}</span>
                </button>
              )}

              {polygonCoords.length > 0 && (
                <button
                  type="button"
                  id="map-clear-btn"
                  onClick={handleClearPolygon}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 border border-rose-800/40 flex items-center gap-1 transition-all"
                  title="Clear all points and start over"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isTe ? 'క్లియర్ చేయండి' : 'Clear & Redraw'}</span>
                </button>
              )}
            </div>

            {/* Vertices Count */}
            <div className="text-[11px] text-[#E2CFB6]/80 flex items-center gap-2">
              <span className="bg-[#2E1E18] px-2.5 py-0.5 rounded-full font-mono border border-[#3A241C] text-[#F5F0E8]">
                {polygonCoords.length} {isTe ? 'మూలలు' : 'Vertices'}
              </span>
              {isDrawingMode && (
                <span className="text-[#C79A6B] text-[11px] animate-pulse hidden xs:inline font-medium">
                  {isTe ? 'మ్యాప్‌పై క్లిక్ చేసి పాయింట్లను సెట్ చేయండి' : 'Click satellite map to plot corners'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Corridor Selection Pills (Multi-Property Mode) */}
        {!singlePropertyMode && !boundaryMode && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {TELANGANA_CORRIDORS.map((corridor) => (
              <button
                key={corridor.id}
                type="button"
                onClick={() => handleCorridorJump(corridor)}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all duration-150 shrink-0 ${
                  activeCorridor === corridor.id
                    ? 'bg-[#C79A6B] text-[#201512] font-semibold shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-[#E2CFB6]'
                }`}
              >
                {isTe ? corridor.nameTe : corridor.nameEn.split('(')[0].trim()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Presentation Surface */}
      <div className={`relative w-full ${boundaryMode ? 'h-[360px] sm:h-[440px]' : 'h-[380px] sm:h-[480px] md:h-[560px]'} bg-[#141210]`}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Boundary Drawing Area HUD (Real-time live calculated metrics) */}
        {boundaryMode && (
          <div id="map-parcel-area-hud" className="absolute top-3 left-3 right-3 sm:right-auto z-[400] max-w-sm">
            <div className="bg-[#201512]/95 backdrop-blur-md text-[#F5F0E8] p-3.5 sm:p-4 rounded-2xl border border-[#E2CFB6]/30 shadow-[0_16px_40px_rgba(0,0,0,0.5)] space-y-2.5">
              <div className="flex items-center justify-between gap-2 border-b border-[#3A241C] pb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#C79A6B] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C79A6B]" />
                  <span>{isTe ? 'లెక్కింపు విస్తీర్ణం' : 'Calculated Parcel Area'}</span>
                </span>
                <span className="text-[10px] text-[#E2CFB6]/70 font-mono">
                  {polygonCoords.length < 3
                    ? isTe ? 'కనీసం 3 బిందువులు అవసరం' : 'Need ≥ 3 corners'
                    : `${areaResult.perimeterMeters}m ${isTe ? 'చుట్టుకొలత' : 'Perimeter'}`}
                </span>
              </div>

              {polygonCoords.length >= 3 ? (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-[#FAF8F3] font-mono tracking-tight">
                      {areaResult.formattedAcres}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-[#C79A6B] font-mono">
                      {areaResult.formattedSqYards}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#E2CFB6]/80 flex items-center justify-between">
                    <span>{Math.round(areaResult.sqMeters).toLocaleString('en-IN')} m²</span>
                    <span className="text-[#C79A6B] font-medium">
                      {areaResult.wholeAcres} Ac {areaResult.wholeGuntas} Guntas
                    </span>
                  </div>

                  {onApplyAreaToForm && (
                    <button
                      type="button"
                      id="map-apply-area-btn"
                      onClick={handleApplyArea}
                      className="w-full mt-1.5 py-2 px-3 rounded-xl bg-[#C79A6B] hover:bg-[#B6895A] text-[#201512] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-[0.98]"
                    >
                      {appliedAreaFeedback ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#201512]" />
                          <span>{isTe ? 'ఫారమ్‌లోకి జోడించబడింది!' : 'Synced to Form Details!'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-[#201512]" />
                          <span>{isTe ? 'ఈ విస్తీర్ణాన్ని ఫారమ్‌లో వాడండి' : 'Apply Area to Listing Details'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#E2CFB6]/80 leading-relaxed">
                  {isTe
                    ? 'శాటిలైట్ మ్యాప్‌పై భూమి సరిహద్దు మూలలను క్లిక్ చేసి ప్లాట్ సరిహద్దును గీయండి. పాయింట్లను డ్రాగ్ చేసి ఖచ్చితంగా మార్చవచ్చు.'
                    : 'Click corners on the satellite map to outline the parcel boundary. Drag pins anytime to fine-tune vertices.'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Legend Overlay for Discovery Mode */}
        {!boundaryMode && (
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
        )}

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
