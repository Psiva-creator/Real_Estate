import React from 'react';
import {
  Layers,
  Compass,
  FileText,
  CheckCircle2,
  XCircle,
  Droplets,
  Zap,
  Building,
  Home,
  Check,
  ShieldAlert,
  ShieldCheck,
  Maximize2,
  Calendar,
} from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import { MockProperty } from '@/lib/mockData';
import { formatAcreage } from '@/lib/formatters';

interface PropertySpecsProps {
  property: MockProperty;
  locale: Locale;
}

export default function PropertySpecs({ property, locale }: PropertySpecsProps) {
  const dict = getDictionary(locale);
  const isTe = locale === 'te';

  const isLand = property.type === 'LAND';
  const land = property.land;
  const flat = property.flat;

  // Development level localization helper
  const getDevLevelText = (lvl?: string) => {
    switch (lvl) {
      case 'RAW':
        return dict.propertyDetail.devRaw;
      case 'FENCED':
        return dict.propertyDetail.devFenced;
      case 'PARTIALLY_DEVELOPED':
        return dict.propertyDetail.devPartially;
      case 'VENTURE_READY':
        return dict.propertyDetail.devVentureReady;
      default:
        return lvl || 'N/A';
    }
  };

  // Soil type localization helper
  const getSoilTypeText = (soil?: string) => {
    switch (soil) {
      case 'RED':
        return dict.propertyDetail.soilRed;
      case 'BLACK':
        return dict.propertyDetail.soilBlack;
      case 'MIXED':
        return dict.propertyDetail.soilMixed;
      default:
        return soil || 'N/A';
    }
  };

  // Possession status localization helper
  const getPossessionText = (status?: string) => {
    switch (status) {
      case 'READY_TO_MOVE':
        return dict.propertyDetail.readyToMove;
      case 'UNDER_CONSTRUCTION':
        return dict.propertyDetail.underConstruction;
      default:
        return status || 'N/A';
    }
  };

  // Furnishing status localization helper
  const getFurnishingText = (furnishing?: string) => {
    switch (furnishing) {
      case 'UNFURNISHED':
        return dict.propertyDetail.unfurnished;
      case 'SEMI_FURNISHED':
        return dict.propertyDetail.semiFurnished;
      case 'FULLY_FURNISHED':
        return dict.propertyDetail.fullyFurnished;
      default:
        return furnishing || 'N/A';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
          {isLand ? (
            <Layers className="w-5 h-5 text-emerald-700" />
          ) : (
            <Building className="w-5 h-5 text-emerald-700" />
          )}
          <span>
            {isLand ? dict.propertyDetail.landSpecs : dict.propertyDetail.flatSpecs}
          </span>
        </h2>
      </div>

      {/* Specifications Grid */}
      {isLand && land && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Total Acres */}
          {land.totalAcres !== undefined && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {dict.propertyDetail.totalAcres}
              </span>
              <span className="text-base font-extrabold text-slate-900 mt-1 block">
                {formatAcreage(land.totalAcres)}
              </span>
            </div>
          )}

          {/* Sq. Yards */}
          {land.sqYards !== undefined && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {dict.propertyDetail.sqYards}
              </span>
              <span className="text-base font-extrabold text-slate-900 mt-1 block">
                {land.sqYards.toLocaleString('en-IN')} Sq.Yds
              </span>
            </div>
          )}

          {/* Survey Numbers */}
          {land.surveyNumbers && land.surveyNumbers.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {dict.propertyDetail.surveyNumbers}
              </span>
              <span className="text-sm font-extrabold font-mono text-emerald-800 mt-1 block truncate">
                {land.surveyNumbers.join(', ')}
              </span>
            </div>
          )}

          {/* Approach Road Width */}
          {land.roadWidthFt !== undefined && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {dict.propertyDetail.roadWidth}
              </span>
              <span className="text-base font-extrabold text-slate-900 mt-1 block">
                {land.roadWidthFt} Feet
              </span>
            </div>
          )}

          {/* Soil Type */}
          {land.soilType && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {dict.propertyDetail.soilType}
              </span>
              <span className="text-base font-extrabold text-slate-900 mt-1 block">
                {getSoilTypeText(land.soilType)}
              </span>
            </div>
          )}

          {/* Development Status */}
          {land.developmentLevel && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {dict.propertyDetail.developmentLevel}
              </span>
              <span className="text-sm font-extrabold text-slate-900 mt-1 block truncate">
                {getDevLevelText(land.developmentLevel)}
              </span>
            </div>
          )}

          {/* Water Availability */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {dict.propertyDetail.waterAvailable}
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {land.waterAvailable ? dict.propertyDetail.yes : dict.propertyDetail.no}
              </span>
            </div>
            {land.waterAvailable ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-slate-400 shrink-0" />
            )}
          </div>

          {/* Electricity Connection */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {dict.propertyDetail.electricityAvailable}
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {land.electricityAvailable ? dict.propertyDetail.yes : dict.propertyDetail.no}
              </span>
            </div>
            {land.electricityAvailable ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-slate-400 shrink-0" />
            )}
          </div>
        </div>
      )}

      {/* Flat Specifications */}
      {!isLand && flat && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Bedrooms */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {dict.propertyDetail.bedrooms}
              </span>
              <span className="text-base font-extrabold text-slate-900 mt-1 block">
                {flat.bedrooms} BHK
              </span>
            </div>

            {/* Super Builtup Area */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {dict.propertyDetail.superBuiltup}
              </span>
              <span className="text-base font-extrabold text-slate-900 mt-1 block">
                {flat.sqft.toLocaleString('en-IN')} sq.ft
              </span>
            </div>

            {/* Bathrooms */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {dict.propertyDetail.bathrooms}
              </span>
              <span className="text-base font-extrabold text-slate-900 mt-1 block">
                {flat.bathrooms} Baths
              </span>
            </div>

            {/* Floor Level */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {dict.propertyDetail.floorNumber}
              </span>
              <span className="text-base font-extrabold text-slate-900 mt-1 block">
                {flat.floor} of {flat.totalFloors}
              </span>
            </div>

            {/* Possession Status */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {dict.propertyDetail.possessionStatus}
              </span>
              <span className="text-sm font-extrabold text-emerald-800 mt-1 block truncate">
                {getPossessionText(flat.possessionStatus)}
              </span>
            </div>

            {/* Furnishing Status */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {dict.propertyDetail.furnishingStatus}
              </span>
              <span className="text-sm font-extrabold text-slate-900 mt-1 block truncate">
                {getFurnishingText(flat.furnishingStatus)}
              </span>
            </div>

            {/* Master Plan Zone */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 col-span-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {dict.propertyDetail.zoning}
              </span>
              <span className="text-sm font-extrabold text-slate-900 mt-1 block truncate">
                {property.location.zone}
              </span>
            </div>
          </div>

          {/* Flat Amenities Chips */}
          {flat.amenities && flat.amenities.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                {dict.propertyDetail.amenities}
              </span>
              <div className="flex flex-wrap gap-2">
                {flat.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-900 text-xs font-semibold"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{amenity}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
