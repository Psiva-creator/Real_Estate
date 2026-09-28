'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Layers,
  Home,
  CheckCircle2,
  Compass,
  Heart,
  Sparkles,
} from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { MockProperty } from '@/lib/mockData';
import { formatINR, formatAcreage, formatOrrDistance } from '@/lib/formatters';
import { useFavorites } from '@/lib/favorites';

interface PropertyCardProps {
  property: MockProperty;
  locale: Locale;
  onBookVisit?: (propertyId: string) => void;
}

export default function PropertyCard({ property, locale, onBookVisit }: PropertyCardProps) {
  const [imgSrc, setImgSrc] = useState(property.mainImage);
  const isTe = locale === 'te';
  const { isSaved, toggleSave } = useFavorites();
  const saved = isSaved(property.id);

  const title = isTe && property.titleTe ? property.titleTe : property.title;
  const landmark = isTe && property.location.landmarkTe ? property.location.landmarkTe : property.location.landmark;

  const isSold = property.status === 'SOLD';

  // Format area details based on Land, Flat, or Villa
  const getAreaString = () => {
    if (property.type === 'LAND') {
      if (property.land?.totalAcres) {
        return formatAcreage(property.land.totalAcres);
      }
      if (property.land?.sqYards) {
        return `${property.land.sqYards} Sq.Yds`;
      }
      return 'Plot';
    }
    if (property.type === 'VILLA' && property.villa) {
      return `${property.villa.bedrooms} BHK (${property.villa.builtUpSqft} sq.ft / ${property.villa.plotSqYards} sq.yd)`;
    }
    if (property.type === 'FLAT' && property.flat) {
      return `${property.flat.bedrooms} BHK (${property.flat.sqft} sq.ft)`;
    }
    if (property.type === 'VILLA' && property.villa) {
      return `${property.villa.configuration || 'Villa'} (${property.villa.builtUpAreaSqFt} sq.ft)`;
    }
    return 'Residential';
  };

  const getTypeBadgeLabel = () => {
    if (property.type === 'LAND') {
      return isTe ? 'భూమి / ప్లాట్' : 'Land / Plot';
    }
    if (property.type === 'FLAT') {
      return isTe ? 'ఫ్లాట్ / అపార్ట్‌మెంట్' : 'Apartment';
    }
    if (property.type === 'VILLA') {
      return isTe ? 'లగ్జరీ విల్లా' : 'Luxury Villa';
    }
    return 'Residential';
  };

  const handleBookVisit = (e: React.MouseEvent) => {
    if (onBookVisit) {
      e.preventDefault();
      onBookVisit(property.id);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-[#E8E2D9] shadow-[0_4px_24px_-4px_rgba(25,21,18,0.04)] hover:shadow-[0_16px_40px_-8px_rgba(25,21,18,0.09)] hover:border-[#8C653E]/40 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Media & Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F5F1EA]">
        <Image
          src={imgSrc}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={() => {
            // Fallback to local placeholder
            setImgSrc('/images/property-placeholder.svg');
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none gap-2">
          {/* Status & Property Type Badges */}
          <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
            {isSold && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm bg-[#7A2E22] text-white border border-white/20">
                {isTe ? 'అమ్మబడింది' : 'Sold'}
              </span>
            )}
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider shadow-sm backdrop-blur-sm ${
                property.type === 'LAND'
                  ? 'bg-[#8C653E]/90 text-white border border-[#8C653E]/50'
                  : property.type === 'VILLA'
                  ? 'bg-amber-600/90 text-white border border-amber-400/50'
                  : 'bg-[#191512]/90 text-[#FAF8F5] border border-white/20'
              }`}
            >
              {getTypeBadgeLabel()}
            </span>
          </div>

          {/* Right: 13-Doc Verification Shield & Heart Save Control */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[#191512] text-[11px] font-semibold shadow-sm border border-[#E8E2D9]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8C653E] shrink-0" />
              <span>{isTe ? '13 డాక్స్ వెరిఫైడ్' : '13-Doc Verified'}</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSave(property.id);
              }}
              className="w-7 h-7 rounded-full bg-white/95 hover:bg-white text-[#191512] flex items-center justify-center shadow-sm border border-[#E8E2D9] transition-transform active:scale-90 cursor-pointer"
              title={saved ? (isTe ? 'సేవ్ చేసిన వాటి నుండి తొలగించు' : 'Remove from Saved') : (isTe ? 'ప్రాపర్టీని సేవ్ చేయండి' : 'Save Property')}
              aria-label={saved ? 'Remove from Saved' : 'Save Property'}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${
                  saved ? 'fill-rose-500 text-rose-500' : 'text-[#8C653E] hover:text-rose-500'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bottom Bar on Image: ORR Distance */}
        {property.location.distanceFromOrrKm !== undefined && (
          <div className="absolute bottom-3 left-3.5 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-sm text-[#FAF8F5] text-[11px] font-medium border border-white/10">
              <Compass className="w-3 h-3 text-[#C5A880]" />
              <span>{formatOrrDistance(property.location.distanceFromOrrKm)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Location Line */}
          <div className="flex items-center gap-1.5 text-xs text-[#8C827A] mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#8C653E] shrink-0" />
            <span className="truncate">
              {property.location.village}, {property.location.mandal},{' '}
              {property.location.district}
            </span>
          </div>

          {/* Title */}
          <Link href={`/${locale}/properties/${property.id}`} className="block group-hover:text-[#8C653E] transition-colors">
            <h3 className="font-serif text-lg font-bold text-[#191512] leading-snug line-clamp-2">
              {title}
            </h3>
          </Link>

          {/* Landmark / Subtext */}
          {landmark && (
            <p className="text-xs text-[#574F48] mt-1 line-clamp-1 italic font-serif">
              {landmark}
            </p>
          )}

          {/* Key Specs Row */}
          <div className="mt-3.5 pt-3.5 border-t border-[#E8E2D9]/70 flex items-center justify-between text-xs text-[#574F48]">
            <div className="flex items-center gap-1.5 font-medium">
              {property.type === 'LAND' ? (
                <Layers className="w-3.5 h-3.5 text-[#8C653E] shrink-0" />
              ) : property.type === 'VILLA' ? (
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              ) : (
                <Home className="w-3.5 h-3.5 text-[#8C653E] shrink-0" />
              )}
              <span>{getAreaString()}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[#5C4026] font-semibold bg-[#F5F1EA] px-2.5 py-0.5 rounded-full border border-[#E8E2D9]">
              <CheckCircle2 className="w-3 h-3 text-[#8C653E]" />
              <span>{property.location.zone.split(' ')[0]} Zone</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTAs */}
        <div className="pt-3.5 border-t border-[#E8E2D9]/70 space-y-3.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[9px] uppercase font-bold text-[#8C827A] tracking-[0.18em] block">
                {isTe ? 'మొత్తం ధర' : 'Investment'}
              </span>
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#191512]">
                {formatINR(property.pricing.totalPrice)}
              </span>
            </div>

            {/* Sub-rate */}
            <div className="text-right">
              {property.pricing.pricePerAcre && (
                <span className="text-xs text-[#8C827A] block font-mono">
                  {formatINR(property.pricing.pricePerAcre)} / Acre
                </span>
              )}
              {property.pricing.pricePerSqft && (
                <span className="text-xs text-[#8C827A] block font-mono">
                  ₹{property.pricing.pricePerSqft.toLocaleString('en-IN')} / sq.ft
                </span>
              )}
              {property.pricing.pricePerSqYard && (
                <span className="text-xs text-[#8C827A] block font-mono">
                  ₹{property.pricing.pricePerSqYard.toLocaleString('en-IN')} / sq.yd
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isSold ? (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/${locale}/properties/${property.id}`}
                className="px-3 py-2.5 rounded-full border border-[#E8E2D9] text-[#191512] hover:bg-[#F5F1EA] text-xs font-semibold tracking-wider uppercase text-center transition-colors tap-target flex items-center justify-center"
              >
                {isTe ? 'వివరాలు' : 'Details'}
              </Link>
              <Link
                href={`/${locale}/properties?status=FOR_SALE&type=${property.type}`}
                className="px-3 py-2.5 rounded-full bg-[#8C653E] hover:bg-[#6D4C2D] text-white text-xs font-semibold tracking-wider uppercase shadow-sm transition-all text-center tap-target flex items-center justify-center"
              >
                <span>{isTe ? 'ఇలాంటివి' : 'Similar Units'}</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/${locale}/properties/${property.id}`}
                className="px-3 py-2.5 rounded-full border border-[#E8E2D9] text-[#191512] hover:bg-[#F5F1EA] text-xs font-semibold tracking-wider uppercase text-center transition-colors tap-target flex items-center justify-center"
              >
                {isTe ? 'వివరాలు' : 'Details'}
              </Link>

              <button
                type="button"
                onClick={handleBookVisit}
                className="px-3 py-2.5 rounded-full bg-[#191512] hover:bg-[#8C653E] text-[#FAF8F5] text-xs font-semibold tracking-wider uppercase shadow-sm transition-all text-center tap-target flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <Calendar className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                <span>{isTe ? 'సైట్ విజిట్' : 'Site Visit'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
