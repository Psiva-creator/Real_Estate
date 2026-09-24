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

interface PropertyCardProps {
  property: MockProperty;
  locale: Locale;
  onBookVisit?: (propertyId: string) => void;
}

export default function PropertyCard({ property, locale, onBookVisit }: PropertyCardProps) {
  const [imgSrc, setImgSrc] = useState(property.mainImage);
  const [isFavorite, setIsFavorite] = useState(false);
  const isTe = locale === 'te';

  useEffect(() => {
    try {
      const saved = localStorage.getItem('trh_saved_properties');
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          setIsFavorite(list.includes(property.id));
        }
      }
    } catch {}
  }, [property.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = localStorage.getItem('trh_saved_properties');
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(list)) list = [];
      if (list.includes(property.id)) {
        list = list.filter((id) => id !== property.id);
        setIsFavorite(false);
      } else {
        list.push(property.id);
        setIsFavorite(true);
      }
      localStorage.setItem('trh_saved_properties', JSON.stringify(list));
      window.dispatchEvent(new Event('trh_favorites_updated'));
    } catch {}
  };

  const title = isTe && property.titleTe ? property.titleTe : property.title;
  const landmark = isTe && property.location.landmarkTe ? property.location.landmarkTe : property.location.landmark;

  // Format area details based on Land, Flat or Villa
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

        {/* Top Badges & Favorite Toggle */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          {/* Property Type Badge */}
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider shadow-sm pointer-events-auto backdrop-blur-sm ${
              property.type === 'LAND'
                ? 'bg-[#8C653E]/90 text-white border border-[#8C653E]/50'
                : property.type === 'VILLA'
                ? 'bg-amber-600/90 text-white border border-amber-400/50'
                : 'bg-[#191512]/90 text-[#FAF8F5] border border-white/20'
            }`}
          >
            {property.type === 'LAND'
              ? isTe
                ? 'భూమి / ప్లాట్'
                : 'Land Parcel'
              : property.type === 'VILLA'
              ? isTe
                ? 'గేటెడ్ విల్లా'
                : 'Luxury Villa'
              : isTe
              ? 'ఫ్లాట్ / అపార్ట్‌మెంట్'
              : 'Residence / Flat'}
          </span>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* 13-Doc Verification Shield */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[#191512] text-[11px] font-semibold shadow-sm border border-[#E8E2D9]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8C653E] shrink-0" />
              <span>{isTe ? '13 డాక్స్ వెరిఫైడ్' : '13-Doc Verified'}</span>
            </div>

            {/* Favorite Bookmark Heart */}
            <button
              type="button"
              onClick={toggleFavorite}
              title={isFavorite ? 'Remove from Saved' : 'Save Property'}
              className={`p-1.5 rounded-full backdrop-blur-md transition-all shadow-sm ${
                isFavorite
                  ? 'bg-rose-500 text-white hover:bg-rose-600 scale-105'
                  : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
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
        </div>
      </div>
    </div>
  );
}
