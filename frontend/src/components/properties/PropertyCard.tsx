'use client';

import React, { useState } from 'react';
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
  const isTe = locale === 'te';

  const title = isTe && property.titleTe ? property.titleTe : property.title;
  const landmark = isTe && property.location.landmarkTe ? property.location.landmarkTe : property.location.landmark;

  // Format area details based on Land or Flat
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
    <div className="group bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden hover:border-emerald-300/80">
      {/* Media & Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image
          src={imgSrc}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => {
            // Fallback to local placeholder
            setImgSrc('/images/property-placeholder.svg');
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Property Type Badge */}
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm pointer-events-auto ${
              property.type === 'LAND'
                ? 'bg-amber-800 text-amber-50'
                : 'bg-emerald-800 text-emerald-50'
            }`}
          >
            {property.type === 'LAND'
              ? isTe
                ? 'భూమి / ప్లాట్'
                : 'Land / Plot'
              : isTe
              ? 'ఫ్లాట్ / అపార్ట్‌మెంట్'
              : 'Apartment / Flat'}
          </span>

          {/* 13-Doc Verification Shield */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-900/90 backdrop-blur-sm text-emerald-300 text-xs font-semibold shadow-sm pointer-events-auto border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{isTe ? '13 డాక్స్ వెరిఫైడ్' : '13-Doc Verified'}</span>
          </div>
        </div>

        {/* Bottom Bar on Image: ORR Distance */}
        {property.location.distanceFromOrrKm !== undefined && (
          <div className="absolute bottom-2.5 left-3 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-medium">
              <Compass className="w-3 h-3 text-emerald-400" />
              <span>{formatOrrDistance(property.location.distanceFromOrrKm)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Location Line */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">
              {property.location.village}, {property.location.mandal},{' '}
              {property.location.district}
            </span>
          </div>

          {/* Title */}
          <Link href={`/${locale}/properties/${property.id}`} className="block group-hover:text-emerald-800 transition-colors">
            <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
              {title}
            </h3>
          </Link>

          {/* Landmark / Subtext */}
          {landmark && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">
              {landmark}
            </p>
          )}

          {/* Key Specs Row */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-medium">
              {property.type === 'LAND' ? (
                <Layers className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              ) : (
                <Home className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              )}
              <span>{getAreaString()}</span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{property.location.zone.split(' ')[0]} Zone</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTAs */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                {isTe ? 'మొత్తం ధర' : 'Total Price'}
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900">
                {formatINR(property.pricing.totalPrice)}
              </span>
            </div>

            {/* Sub-rate */}
            <div className="text-right">
              {property.pricing.pricePerAcre && (
                <span className="text-xs text-slate-500 block">
                  {formatINR(property.pricing.pricePerAcre)} / Acre
                </span>
              )}
              {property.pricing.pricePerSqft && (
                <span className="text-xs text-slate-500 block">
                  ₹{property.pricing.pricePerSqft.toLocaleString('en-IN')} / sq.ft
                </span>
              )}
              {property.pricing.pricePerSqYard && (
                <span className="text-xs text-slate-500 block">
                  ₹{property.pricing.pricePerSqYard.toLocaleString('en-IN')} / sq.yd
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/${locale}/properties/${property.id}`}
              className="px-3 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold text-center transition-colors tap-target flex items-center justify-center"
            >
              {isTe ? 'వివరాలు చూడండి' : 'View Details'}
            </Link>

            <button
              type="button"
              onClick={handleBookVisit}
              className="px-3 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all text-center tap-target flex items-center justify-center gap-1 active:scale-[0.98]"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
              <span>{isTe ? 'సైట్ విజిట్' : 'Book Visit'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
