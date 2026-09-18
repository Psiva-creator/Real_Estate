'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Building2,
  Filter,
  RotateCcw,
  Check,
  X,
  List,
  Map as MapIcon,
  SearchX,
  ShieldCheck,
  Compass,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import { MockProperty, MOCK_PROPERTIES } from '@/lib/mockData';
import { getProperties } from '@/lib/api';
import PropertyCard from './PropertyCard';
import MapView from './MapView';

interface PropertyDiscoveryProps {
  locale: Locale;
  initialParams: {
    type?: string;
    q?: string;
    location?: string;
    price?: string;
    area?: string;
    distance?: string;
    verification?: string;
  };
}

interface FilterState {
  type: string;
  query: string;
  location: string;
  priceRange: string;
  areaRange: string;
  orrDistance: string;
  verificationStatus: string;
}

export default function PropertyDiscovery({ locale, initialParams }: PropertyDiscoveryProps) {
  const router = useRouter();
  const dict = getDictionary(locale);
  const isTe = locale === 'te';

  // Available Mandal / Location options extracted from mock data
  const MANDAL_OPTIONS = [
    { value: 'ALL', labelEn: 'All Locations / Mandals', labelTe: 'అన్ని ప్రాంతాలు / మండలాలు' },
    { value: 'Gandipet', labelEn: 'Gandipet / Kokapet', labelTe: 'గండిపేట్ / కోకాపేట్' },
    { value: 'Shankarpally', labelEn: 'Shankarpally / Mokila', labelTe: 'శంకర్‌పల్లి / మోకిల' },
    { value: 'Shamshabad', labelEn: 'Shamshabad / Mamidipally', labelTe: 'శంషాబాద్ / మామిడిపల్లి' },
    { value: 'Ramachandrapuram', labelEn: 'Ramachandrapuram / Kollur', labelTe: 'రామచంద్రాపురం / కొల్లూరు' },
    { value: 'Serilingampalli', labelEn: 'Serilingampalli / Nallagandla', labelTe: 'శేరిలింగంపల్లి / నల్లగండ్ల' },
    { value: 'Yadagirigutta', labelEn: 'Yadagirigutta / Raigir', labelTe: 'యాదగిరిగుట్ట / రాయగిరి' },
  ];

  // Active form state (what the user is configuring in the controls)
  const [filters, setFilters] = useState<FilterState>({
    type: initialParams.type || 'ALL',
    query: initialParams.q || '',
    location: initialParams.location || 'ALL',
    priceRange: initialParams.price || 'ALL',
    areaRange: initialParams.area || 'ALL',
    orrDistance: initialParams.distance || 'ALL',
    verificationStatus: initialParams.verification || 'ALL',
  });

  // Applied state (what currently filters the displayed list)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    type: initialParams.type || 'ALL',
    query: initialParams.q || '',
    location: initialParams.location || 'ALL',
    priceRange: initialParams.price || 'ALL',
    areaRange: initialParams.area || 'ALL',
    orrDistance: initialParams.distance || 'ALL',
    verificationStatus: initialParams.verification || 'ALL',
  });

  // Backend-fetched properties (falls back to MOCK_PROPERTIES)
  const [allProperties, setAllProperties] = useState<MockProperty[]>(MOCK_PROPERTIES);
  const [isFetchingBackend, setIsFetchingBackend] = useState(true);

  // Fetch real properties from backend on mount
  useEffect(() => {
    let cancelled = false;
    setIsFetchingBackend(true);
    getProperties({ limit: 100 })
      .then(({ properties }) => {
        if (!cancelled) {
          setAllProperties(properties);
        }
      })
      .catch(() => {
        // Silently use mock fallback already set as default state
      })
      .finally(() => {
        if (!cancelled) setIsFetchingBackend(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // UI view states
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>(undefined);

  // Sync state with URL search params helper
  const syncUrlParams = (newApplied: FilterState) => {
    const params = new URLSearchParams();
    if (newApplied.type !== 'ALL') params.set('type', newApplied.type);
    if (newApplied.query.trim()) params.set('q', newApplied.query.trim());
    if (newApplied.location !== 'ALL') params.set('location', newApplied.location);
    if (newApplied.priceRange !== 'ALL') params.set('price', newApplied.priceRange);
    if (newApplied.areaRange !== 'ALL') params.set('area', newApplied.areaRange);
    if (newApplied.orrDistance !== 'ALL') params.set('distance', newApplied.orrDistance);
    if (newApplied.verificationStatus !== 'ALL') params.set('verification', newApplied.verificationStatus);

    const queryString = params.toString();
    const newUrl = queryString ? `/${locale}/properties?${queryString}` : `/${locale}/properties`;
    router.replace(newUrl, { scroll: false });
  };

  // Check if any non-default filters are applied
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.type !== 'ALL') count++;
    if (appliedFilters.query.trim()) count++;
    if (appliedFilters.location !== 'ALL') count++;
    if (appliedFilters.priceRange !== 'ALL') count++;
    if (appliedFilters.areaRange !== 'ALL') count++;
    if (appliedFilters.orrDistance !== 'ALL') count++;
    if (appliedFilters.verificationStatus !== 'ALL') count++;
    return count;
  }, [appliedFilters]);

  // Apply button handler with lightweight simulated async loading
  const handleApplyFilters = () => {
    setIsLoading(true);
    setAppliedFilters({ ...filters });
    syncUrlParams(filters);
    setTimeout(() => {
      setIsLoading(false);
    }, 250);
  };

  // Clear button handler
  const handleClearFilters = () => {
    const defaultState: FilterState = {
      type: 'ALL',
      query: '',
      location: 'ALL',
      priceRange: 'ALL',
      areaRange: 'ALL',
      orrDistance: 'ALL',
      verificationStatus: 'ALL',
    };
    setFilters(defaultState);
    setIsLoading(true);
    setAppliedFilters(defaultState);
    syncUrlParams(defaultState);
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  // Quick property type tab switch (instantly applies)
  const handleTypeTabClick = (type: string) => {
    const updated = { ...filters, type };
    setFilters(updated);
    setIsLoading(true);
    setAppliedFilters(updated);
    syncUrlParams(updated);
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  // Actual filtering based on appliedFilters (uses backend data or mock fallback)
  const filteredProperties = useMemo(() => {
    return allProperties.filter((prop) => {
      // 1. Property Type
      if (appliedFilters.type !== 'ALL' && prop.type !== appliedFilters.type) {
        return false;
      }

      // 2. Keyword Search (title, titleTe, village, mandal, district, landmarks, survey)
      if (appliedFilters.query.trim()) {
        const q = appliedFilters.query.toLowerCase().trim();
        const titleMatch =
          prop.title.toLowerCase().includes(q) || prop.titleTe.toLowerCase().includes(q);
        const locMatch =
          prop.location.village.toLowerCase().includes(q) ||
          prop.location.mandal.toLowerCase().includes(q) ||
          prop.location.district.toLowerCase().includes(q) ||
          (prop.location.landmark && prop.location.landmark.toLowerCase().includes(q)) ||
          (prop.location.landmarkTe && prop.location.landmarkTe.toLowerCase().includes(q));
        const surveyMatch =
          prop.land?.surveyNumbers.some((num) => num.toLowerCase().includes(q)) || false;

        if (!titleMatch && !locMatch && !surveyMatch) return false;
      }

      // 3. Location / Mandal
      if (appliedFilters.location !== 'ALL') {
        const targetLoc = appliedFilters.location.toLowerCase();
        const mandalMatch = prop.location.mandal.toLowerCase() === targetLoc;
        const villageMatch = prop.location.village.toLowerCase() === targetLoc;
        if (!mandalMatch && !villageMatch) return false;
      }

      // 4. Price Range
      if (appliedFilters.priceRange !== 'ALL') {
        const price = prop.pricing.totalPrice;
        switch (appliedFilters.priceRange) {
          case 'UNDER_50L':
            if (price >= 5000000) return false;
            break;
          case '50L_1CR':
            if (price < 5000000 || price > 10000000) return false;
            break;
          case '1CR_3CR':
            if (price < 10000000 || price > 30000000) return false;
            break;
          case '3CR_5CR':
            if (price < 30000000 || price > 50000000) return false;
            break;
          case 'ABOVE_5CR':
            if (price <= 50000000) return false;
            break;
          default:
            break;
        }
      }

      // 5. Area / Acreage
      if (appliedFilters.areaRange !== 'ALL') {
        switch (appliedFilters.areaRange) {
          case 'PLOT_UNDER_1_ACRE':
            if (prop.type !== 'LAND') return false;
            if (prop.land?.totalAcres && prop.land.totalAcres >= 1) return false;
            break;
          case '1_TO_3_ACRES':
            if (prop.type !== 'LAND') return false;
            if (!prop.land?.totalAcres || prop.land.totalAcres < 1 || prop.land.totalAcres > 3)
              return false;
            break;
          case 'ABOVE_3_ACRES':
            if (prop.type !== 'LAND') return false;
            if (!prop.land?.totalAcres || prop.land.totalAcres <= 3) return false;
            break;
          case 'FLAT_UNDER_1500':
            if (prop.type !== 'FLAT') return false;
            if (!prop.flat?.sqft || prop.flat.sqft > 1500) return false;
            break;
          case 'FLAT_ABOVE_1500':
            if (prop.type !== 'FLAT') return false;
            if (!prop.flat?.sqft || prop.flat.sqft <= 1500) return false;
            break;
          default:
            break;
        }
      }

      // 6. ORR Distance
      if (appliedFilters.orrDistance !== 'ALL') {
        const dist = prop.location.distanceFromOrrKm;
        if (dist === undefined) return false;
        switch (appliedFilters.orrDistance) {
          case 'WITHIN_2KM':
            if (dist > 2) return false;
            break;
          case 'WITHIN_5KM':
            if (dist > 5) return false;
            break;
          case 'WITHIN_10KM':
            if (dist > 10) return false;
            break;
          case 'BEYOND_10KM':
            if (dist <= 10) return false;
            break;
          default:
            break;
        }
      }

      // 7. Verification Status
      if (appliedFilters.verificationStatus !== 'ALL') {
        switch (appliedFilters.verificationStatus) {
          case 'DOCS_13':
            if (prop.verifiedDocsCount < 13) return false;
            break;
          case 'DHARANI':
            if (!prop.dharaniApproved) return false;
            break;
          case 'HMDA':
            if (!prop.hmdaApproved) return false;
            break;
          case 'RERA':
            if (!prop.reraApproved) return false;
            break;
          default:
            break;
        }
      }

      return true;
    });
  }, [appliedFilters, allProperties]);

  // Counts for quick tabs — derived from whichever source is active
  const landsCount = useMemo(
    () => allProperties.filter((p) => p.type === 'LAND').length,
    [allProperties]
  );
  const flatsCount = useMemo(
    () => allProperties.filter((p) => p.type === 'FLAT').length,
    [allProperties]
  );

  return (
    <div className="w-full max-w-full space-y-8 overflow-hidden">
      {/* Search & Main Filter Card */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-[0_4px_24px_-4px_rgba(25,21,18,0.04)] p-5 sm:p-6 space-y-5 overflow-hidden">
        {/* Top Row: Search Input & Quick Type Tabs */}
        <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
          {/* Search Input Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C827A]" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyFilters();
              }}
              placeholder={dict.filters.searchPlaceholder}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#F5F1EA] border border-[#E8E2D9] text-xs sm:text-sm text-[#191512] placeholder:text-[#8C827A] focus:outline-none focus:ring-2 focus:ring-[#8C653E]"
            />
            {filters.query && (
              <button
                type="button"
                onClick={() => setFilters({ ...filters, query: '' })}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C827A] hover:text-[#191512] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Property Type Tabs — scrollable on narrow screens */}
          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => handleTypeTabClick('ALL')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-all whitespace-nowrap ${
                appliedFilters.type === 'ALL'
                  ? 'bg-[#191512] text-[#FAF8F5] shadow-sm'
                  : 'bg-[#F5F1EA] text-[#574F48] hover:text-[#191512] border border-[#E8E2D9]'
              }`}
            >
              {isTe ? 'అన్నీ' : 'All Listings'} ({allProperties.length})
            </button>
            <button
              type="button"
              onClick={() => handleTypeTabClick('LAND')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-all whitespace-nowrap ${
                appliedFilters.type === 'LAND'
                  ? 'bg-[#191512] text-[#FAF8F5] shadow-sm'
                  : 'bg-[#F5F1EA] text-[#574F48] hover:text-[#191512] border border-[#E8E2D9]'
              }`}
            >
              {dict.nav.lands} ({landsCount})
            </button>
            <button
              type="button"
              onClick={() => handleTypeTabClick('FLAT')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-all whitespace-nowrap ${
                appliedFilters.type === 'FLAT'
                  ? 'bg-[#191512] text-[#FAF8F5] shadow-sm'
                  : 'bg-[#F5F1EA] text-[#574F48] hover:text-[#191512] border border-[#E8E2D9]'
              }`}
            >
              {dict.nav.flats} ({flatsCount})
            </button>
          </div>
        </div>

        {/* Multi-Criteria Filter Dropdowns (Location, Price, Area, ORR Distance, Verification) */}
        <div className="pt-4 border-t border-[#E8E2D9]">
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* 1. Location / Mandal Filter */}
            <div>
              <label className="block text-[10px] font-bold text-[#8C653E] uppercase tracking-[0.16em] mb-1.5">
                {dict.filters.location}
              </label>
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-[#F5F1EA] border border-[#E8E2D9] text-xs font-medium text-[#191512] focus:outline-none focus:ring-2 focus:ring-[#8C653E] cursor-pointer"
              >
                {MANDAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {isTe ? opt.labelTe : opt.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Price Range Filter */}
            <div>
              <label className="block text-[10px] font-bold text-[#8C653E] uppercase tracking-[0.16em] mb-1.5">
                {dict.filters.priceRange}
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-[#F5F1EA] border border-[#E8E2D9] text-xs font-medium text-[#191512] focus:outline-none focus:ring-2 focus:ring-[#8C653E] cursor-pointer"
              >
                <option value="ALL">{dict.filters.allPrices}</option>
                <option value="UNDER_50L">{dict.filters.under50L}</option>
                <option value="50L_1CR">{dict.filters.range50L1Cr}</option>
                <option value="1CR_3CR">{dict.filters.range1Cr3Cr}</option>
                <option value="3CR_5CR">{dict.filters.range3Cr5Cr}</option>
                <option value="ABOVE_5CR">{dict.filters.above5Cr}</option>
              </select>
            </div>

            {/* 3. Area / Acreage Filter */}
            <div>
              <label className="block text-[10px] font-bold text-[#8C653E] uppercase tracking-[0.16em] mb-1.5">
                {dict.filters.acres}
              </label>
              <select
                value={filters.areaRange}
                onChange={(e) => setFilters({ ...filters, areaRange: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-[#F5F1EA] border border-[#E8E2D9] text-xs font-medium text-[#191512] focus:outline-none focus:ring-2 focus:ring-[#8C653E] cursor-pointer"
              >
                <option value="ALL">{dict.filters.allAreas}</option>
                <option value="PLOT_UNDER_1_ACRE">{dict.filters.plotUnder1Acre}</option>
                <option value="1_TO_3_ACRES">{dict.filters.range1To3Acres}</option>
                <option value="ABOVE_3_ACRES">{dict.filters.above3Acres}</option>
                <option value="FLAT_UNDER_1500">{dict.filters.flatUnder1500}</option>
                <option value="FLAT_ABOVE_1500">{dict.filters.flatAbove1500}</option>
              </select>
            </div>

            {/* 4. ORR Distance Filter */}
            <div>
              <label className="block text-[10px] font-bold text-[#8C653E] uppercase tracking-[0.16em] mb-1.5">
                {dict.filters.distanceOrr}
              </label>
              <select
                value={filters.orrDistance}
                onChange={(e) => setFilters({ ...filters, orrDistance: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-[#F5F1EA] border border-[#E8E2D9] text-xs font-medium text-[#191512] focus:outline-none focus:ring-2 focus:ring-[#8C653E] cursor-pointer"
              >
                <option value="ALL">{dict.filters.allDistances}</option>
                <option value="WITHIN_2KM">{dict.filters.within2Km}</option>
                <option value="WITHIN_5KM">{dict.filters.within5Km}</option>
                <option value="WITHIN_10KM">{dict.filters.within10Km}</option>
                <option value="BEYOND_10KM">{dict.filters.beyond10Km}</option>
              </select>
            </div>

            {/* 5. Verification Status Filter */}
            <div>
              <label className="block text-[10px] font-bold text-[#8C653E] uppercase tracking-[0.16em] mb-1.5">
                {dict.filters.verificationStatus}
              </label>
              <select
                value={filters.verificationStatus}
                onChange={(e) => setFilters({ ...filters, verificationStatus: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-[#F5F1EA] border border-[#E8E2D9] text-xs font-medium text-[#191512] focus:outline-none focus:ring-2 focus:ring-[#8C653E] cursor-pointer"
              >
                <option value="ALL">{dict.filters.allVerified}</option>
                <option value="DOCS_13">{dict.filters.doc13Verified}</option>
                <option value="DHARANI">{dict.filters.dharaniApproved}</option>
                <option value="HMDA">{dict.filters.hmdaApproved}</option>
                <option value="RERA">{dict.filters.reraApproved}</option>
              </select>
            </div>
          </div>

          {/* Action Row: Apply & Clear Buttons */}
          <div className="mt-5 pt-4 border-t border-[#E8E2D9] flex flex-wrap items-center justify-between gap-3.5">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleApplyFilters}
                className="px-6 py-2.5 rounded-full bg-[#191512] hover:bg-[#8C653E] text-white font-semibold text-xs tracking-wider uppercase shadow-sm transition-all flex items-center gap-2 active:scale-[0.98]"
              >
                <Check className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>{dict.filters.applyFilters}</span>
              </button>

              <button
                type="button"
                onClick={handleClearFilters}
                className="px-5 py-2.5 rounded-full border border-[#E8E2D9] hover:bg-[#F5F1EA] text-[#574F48] hover:text-[#191512] font-semibold text-xs tracking-wider uppercase transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#8C827A]" />
                <span>{dict.filters.clearFilters}</span>
              </button>
            </div>

            {/* Filter Count & Active Badges indicator */}
            <div className="text-xs text-[#8C827A] font-medium">
              {activeFilterCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F1EA] text-[#8C653E] border border-[#E8E2D9] font-semibold text-xs">
                  <Filter className="w-3.5 h-3.5" />
                  <span>
                    {activeFilterCount} {dict.filters.filterCount}
                  </span>
                </span>
              ) : (
                <span className="text-[#8C827A]">
                  {isTe ? 'అన్ని ఫిల్టర్‌లు డిఫాల్ట్‌గా ఉన్నాయి' : 'Default filters applied'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Header & Mobile Toggle */}
      <div className="flex flex-col min-[480px]:flex-row items-stretch min-[480px]:items-center justify-between gap-3">
        <div className="font-serif text-base text-[#191512] flex items-center gap-2">
          <span>
            {isTe
              ? `${filteredProperties.length} ధృవీకరించిన ప్రాపర్టీలు అందుబాటులో ఉన్నాయి`
              : `Showing ${filteredProperties.length} verified listings`}
          </span>
          {(isLoading || isFetchingBackend) && (
            <span className="inline-flex items-center text-xs font-sans text-[#8C653E] font-normal animate-pulse">
              ({dict.filters.loadingProperties})
            </span>
          )}
        </div>

        {/* Mobile List / Map Toggle (visible only on < lg screens) */}
        <div className="flex lg:hidden items-center self-start min-[480px]:self-auto bg-[#F5F1EA] p-1 rounded-full border border-[#E8E2D9]">
          <button
            type="button"
            onClick={() => setMobileView('list')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
              mobileView === 'list'
                ? 'bg-[#191512] text-[#FAF8F5] shadow-sm'
                : 'text-[#574F48] hover:text-[#191512]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>{dict.filters.listView}</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileView('map')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
              mobileView === 'map'
                ? 'bg-[#191512] text-[#FAF8F5] shadow-sm'
                : 'text-[#574F48] hover:text-[#191512]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{dict.filters.mapView}</span>
          </button>
        </div>
      </div>

      {/* Main Content: Split Desktop Layout (List on Left, Map on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Property List (Desktop: lg:col-span-7, Mobile: depending on mobileView) */}
        <div
          className={`lg:col-span-7 space-y-6 ${
            mobileView === 'map' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Lightweight Loading Skeleton State */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl border border-[#E8E2D9] p-5 space-y-3.5 animate-pulse"
                >
                  <div className="aspect-[16/10] w-full bg-[#F5F1EA] rounded-xl" />
                  <div className="h-4 bg-[#F5F1EA] rounded w-3/4" />
                  <div className="h-3 bg-[#F5F1EA] rounded w-1/2" />
                  <div className="pt-2 border-t border-[#E8E2D9] flex justify-between">
                    <div className="h-6 bg-[#F5F1EA] rounded w-1/3" />
                    <div className="h-8 bg-[#F5F1EA] rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProperties.length > 0 ? (
            /* Property Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredProperties.map((prop) => (
                <div
                  key={prop.id}
                  onMouseEnter={() => setSelectedPropertyId(prop.id)}
                  className="transition-transform duration-200"
                >
                  <PropertyCard property={prop} locale={locale} />
                </div>
              ))}
            </div>
          ) : (
            /* Proper Empty State when no properties match */
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-10 sm:p-14 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#F5F1EA] text-[#8C653E] border border-[#E8E2D9] flex items-center justify-center mx-auto">
                <SearchX className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#191512]">
                  {dict.filters.noResultsTitle}
                </h3>
                <p className="text-xs sm:text-sm text-[#574F48] leading-relaxed">
                  {dict.filters.noResultsDesc}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#191512] hover:bg-[#8C653E] text-white font-semibold text-xs tracking-wider uppercase shadow-sm transition-all active:scale-[0.98]"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>{dict.filters.clearFiltersAction}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky MapView (Desktop: lg:col-span-5, Mobile: full view when mobileView === 'map') */}
        <div
          className={`lg:col-span-5 ${
            mobileView === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="lg:sticky lg:top-24">
            <MapView
              properties={filteredProperties}
              locale={locale}
              selectedPropertyId={selectedPropertyId}
              onSelectProperty={(id) => setSelectedPropertyId(id)}
              className="w-full shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
