'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Calendar,
  X,
  Sparkles,
  Maximize2,
  Compass,
} from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import { MOCK_PROPERTIES, MockProperty } from '@/lib/mockData';

interface FeaturedSectionProps {
  locale: Locale;
}

export default function FeaturedSection({ locale }: FeaturedSectionProps) {
  const dict = getDictionary(locale);
  const isTe = locale === 'te';

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LAND' | 'FLAT' | 'ORR'>('ALL');
  const [selectedVisitProperty, setSelectedVisitProperty] = useState<MockProperty | null>(null);
  const [visitSubmitted, setVisitSubmitted] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');

  const filteredProperties = MOCK_PROPERTIES.filter((prop) => {
    if (activeFilter === 'LAND') return prop.type === 'LAND';
    if (activeFilter === 'FLAT') return prop.type === 'FLAT';
    if (activeFilter === 'ORR') return prop.isOrrCorridor;
    return true;
  });

  const leadProperty = filteredProperties[0] || MOCK_PROPERTIES[0];
  const secondaryProperties = filteredProperties.slice(1, 5);

  const handleBookVisit = (property: MockProperty) => {
    setSelectedVisitProperty(property);
    setVisitSubmitted(false);
  };

  const handleSubmitVisit = (e: React.FormEvent) => {
    e.preventDefault();
    setVisitSubmitted(true);
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} Lakhs`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <section className="py-20 sm:py-32 bg-[#FAF8F5] border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Editorial Section Header with Filters */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4 border-b border-[#E8E2D9]/80">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#8C653E] block">
              {isTe ? 'ధృవీకరించబడిన పోర్ట్‌ఫోలియో' : 'Curated Portfolio'}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#191512] leading-[1.1] tracking-tight">
              {isTe ? (
                <>
                  ప్రత్యేకమైన <span className="italic font-light text-[#8C653E]">భూములు & ఆర్కిటెక్చరల్</span> నివాసాలు
                </>
              ) : (
                <>
                  Distinguished <span className="italic font-light text-[#8C653E]">Land Parcels & Architectural</span> Flats
                </>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#574F48] leading-relaxed">
              {isTe
                ? 'ప్రతి లిస్టింగ్ 13 రికార్డులతో ధరణి మరియు రిజిస్ట్రేషన్ శాఖ ద్వారా లీగల్ చెక్ చేయబడి, ప్రత్యక్ష బ్రోకరేజ్ కోసం సిద్ధంగా ఉన్నవి.'
                : 'Zero unverified listings. Every asset has passed rigorous Dharani title trace, HMDA sanctioning, and 30-year encumbrance search.'}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#F5F1EA] rounded-full border border-[#E8E2D9] self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-[#191512] text-[#FAF8F5] shadow-sm'
                  : 'text-[#574F48] hover:text-[#191512]'
              }`}
            >
              {isTe ? 'అన్నీ' : 'All Listings'}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('LAND')}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                activeFilter === 'LAND'
                  ? 'bg-[#191512] text-[#FAF8F5] shadow-sm'
                  : 'text-[#574F48] hover:text-[#191512]'
              }`}
            >
              {isTe ? 'భూములు / ప్లాట్లు' : 'Land & Plots'}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('FLAT')}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                activeFilter === 'FLAT'
                  ? 'bg-[#191512] text-[#FAF8F5] shadow-sm'
                  : 'text-[#574F48] hover:text-[#191512]'
              }`}
            >
              {isTe ? 'అపార్ట్‌మెంట్లు' : 'Flats'}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('ORR')}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                activeFilter === 'ORR'
                  ? 'bg-[#191512] text-[#FAF8F5] shadow-sm'
                  : 'text-[#574F48] hover:text-[#191512]'
              }`}
            >
              {isTe ? 'ORR కారిడార్' : 'ORR Corridor'}
            </button>
          </div>
        </div>

        {/* ── 1. MAGAZINE HERO FEATURED LEAD PROPERTY ── */}
        {leadProperty && (
          <div className="bg-white rounded-3xl border border-[#E8E2D9] overflow-hidden shadow-[0_12px_40px_-10px_rgba(25,21,18,0.06)] hover:border-[#8C653E]/40 transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              
              {/* Lead Image (7 cols) */}
              <div className="lg:col-span-7 relative group overflow-hidden bg-[#EFE9E0] min-h-[380px] lg:min-h-[500px]">
                <img
                  src={leadProperty.mainImage}
                  alt={leadProperty.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#191512]/60 via-transparent to-transparent" />

                {/* Top Floating Badges */}
                <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5]/95 backdrop-blur-md text-[#191512] text-[11px] font-semibold border border-[#E8E2D9]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8C653E]" />
                    <span>{leadProperty.verifiedDocsCount}/{leadProperty.totalDocsRequired} Legal Gates Passed</span>
                  </span>
                  {leadProperty.isOrrCorridor && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#191512]/90 backdrop-blur-md text-[#C5A880] text-[11px] font-semibold">
                      <Compass className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>ORR Corridor</span>
                    </span>
                  )}
                </div>

                {/* Price Display on Image (Mobile) */}
                <div className="absolute bottom-5 left-5 lg:hidden">
                  <span className="px-4 py-2 rounded-full bg-[#FAF8F5]/95 backdrop-blur-md font-serif text-lg font-bold text-[#191512] shadow-md inline-block">
                    {formatPrice(leadProperty.pricing.totalPrice)}
                  </span>
                </div>
              </div>

              {/* Lead Information Panel (5 cols) */}
              <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#8C653E] font-bold">
                      {leadProperty.type === 'LAND' ? 'Verified Land Parcel' : 'Architectural Sky Residence'}
                    </span>
                    <span className="text-xs font-mono text-[#8C827A]">
                      ID: {leadProperty.id}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#191512] leading-tight">
                    {isTe && leadProperty.titleTe ? leadProperty.titleTe : leadProperty.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-[#574F48]">
                    <MapPin className="w-4 h-4 text-[#8C653E] shrink-0" />
                    <span>
                      {leadProperty.location.village}, {leadProperty.location.mandal} • {leadProperty.location.district}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#574F48] leading-relaxed line-clamp-3">
                    {isTe && leadProperty.descriptionTe ? leadProperty.descriptionTe : leadProperty.description}
                  </p>

                  {/* Key Specifications Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E8E2D9]">
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9]">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C827A] block">
                        Scale / Area
                      </span>
                      <span className="font-serif text-base font-bold text-[#191512] mt-0.5 block">
                        {leadProperty.type === 'LAND'
                          ? leadProperty.land?.totalAcres
                            ? `${leadProperty.land.totalAcres} Acres`
                            : `${leadProperty.land?.sqYards} Sq.Yards`
                          : `${leadProperty.flat?.sqft} Sq.Ft`}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9]">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C827A] block">
                        Zoning Authority
                      </span>
                      <span className="font-serif text-base font-bold text-[#191512] mt-0.5 block truncate">
                        {leadProperty.location.zone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pricing & Call to Actions */}
                <div className="pt-6 border-t border-[#E8E2D9] space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#8C827A]">
                      Guiding Consideration
                    </span>
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-[#191512]">
                      {formatPrice(leadProperty.pricing.totalPrice)}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => handleBookVisit(leadProperty)}
                      className="flex-1 py-3.5 px-6 rounded-full bg-[#191512] hover:bg-[#8C653E] text-[#FAF8F5] font-semibold text-xs tracking-wider uppercase transition-all text-center shadow-sm"
                    >
                      {isTe ? 'సైట్ విజిట్ బుక్ చేయండి' : 'Schedule Private Visit'}
                    </button>
                    <Link
                      href={`/${locale}/properties/${leadProperty.id}`}
                      className="py-3.5 px-6 rounded-full bg-[#FAF8F5] hover:bg-[#EFE9E0] text-[#191512] border border-[#E8E2D9] font-semibold text-xs tracking-wider uppercase transition-all text-center"
                    >
                      {isTe ? 'పూర్తి వివరాలు' : 'View Property'}
                    </Link>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ── 2. SECONDARY ASYMMETRICAL MAGAZINE PROPERTY GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {secondaryProperties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-3xl border border-[#E8E2D9] overflow-hidden shadow-sm hover:shadow-[0_12px_32px_-6px_rgba(25,21,18,0.08)] hover:border-[#8C653E]/50 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image & Overlay Badges */}
                <div className="aspect-[4/3] relative w-full overflow-hidden bg-[#EFE9E0]">
                  <img
                    src={property.mainImage}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-[#FAF8F5]/90 backdrop-blur-sm text-[10px] font-mono font-semibold uppercase text-[#191512] border border-[#E8E2D9]">
                      {property.type}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-3 py-1 rounded-full bg-[#191512]/90 backdrop-blur-sm text-[11px] font-serif font-bold text-[#FAF8F5]">
                      {formatPrice(property.pricing.totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#8C653E]">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{property.location.village}, {property.location.mandal}</span>
                  </div>

                  <h4 className="font-serif text-lg font-bold text-[#191512] leading-snug line-clamp-2">
                    <Link
                      href={`/${locale}/properties/${property.id}`}
                      className="hover:text-[#8C653E] transition-colors"
                    >
                      {isTe && property.titleTe ? property.titleTe : property.title}
                    </Link>
                  </h4>

                  <p className="text-xs text-[#574F48] line-clamp-2 leading-relaxed">
                    {isTe && property.descriptionTe ? property.descriptionTe : property.description}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-5 pt-0 border-t border-[#E8E2D9]/60 mt-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleBookVisit(property)}
                  className="text-xs font-semibold uppercase tracking-wider text-[#8C653E] hover:text-[#191512] transition-colors"
                >
                  {isTe ? 'విజిట్ షెడ్యూల్' : 'Book Visit'}
                </button>
                <Link
                  href={`/${locale}/properties/${property.id}`}
                  className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-center text-[#191512] group-hover:bg-[#191512] group-hover:text-white transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Listings CTA */}
        <div className="text-center pt-6">
          <Link
            href={`/${locale}/properties`}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#191512] hover:bg-[#8C653E] text-[#FAF8F5] text-xs font-semibold tracking-widest uppercase shadow-sm transition-all duration-300 active:scale-[0.98]"
          >
            <span>{isTe ? 'అన్ని లిస్టింగ్‌లు బ్రౌజ్ చేయండి' : 'Browse Complete Verified Portfolio'}</span>
            <ArrowRight className="w-4 h-4 text-[#C5A880]" />
          </Link>
        </div>

      </div>

      {/* ── SITE VISIT BOOKING MODAL (PRESERVED FUNCTIONALITY) ── */}
      {selectedVisitProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E8E2D9] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 bg-[#141210] text-[#FAF8F5] border-b border-[#2C2520] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1E1B18] border border-[#8C653E]/50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#C5A880]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold tracking-wide">
                    {isTe ? 'ఉచిత సైట్ విజిట్ బుక్ చేసుకోండి' : 'Schedule Accompanied Site Visit'}
                  </h3>
                  <p className="text-xs text-[#A89F95]">
                    {isTe ? 'సర్టిఫైడ్ డీల్ ఏజెంట్ సమక్షంలో' : 'Accompanied by licensed field advisor'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVisitProperty(null)}
                className="p-1.5 rounded-full text-[#A89F95] hover:text-[#FAF8F5] hover:bg-[#1E1B18] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-[#F5F1EA] p-4 rounded-2xl border border-[#E8E2D9] text-xs">
                <span className="font-mono text-[#8C653E] font-bold block">
                  {selectedVisitProperty.id} • {selectedVisitProperty.location.village}
                </span>
                <p className="font-serif text-sm font-bold text-[#191512] mt-1">
                  {isTe && selectedVisitProperty.titleTe ? selectedVisitProperty.titleTe : selectedVisitProperty.title}
                </p>
              </div>

              {visitSubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#F5F1EA] text-[#8C653E] border border-[#E8E2D9] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-[#191512]">
                    {isTe ? 'సైట్ విజిట్ అభ్యర్థన అందింది!' : 'Site Visit Request Confirmed'}
                  </h4>
                  <p className="text-xs text-[#574F48] max-w-xs mx-auto leading-relaxed">
                    {isTe
                      ? 'మా సర్టిఫైడ్ డీల్ ఏజెంట్ మీకు కాల్ చేసి సమయాన్ని ఖరారు చేస్తారు.'
                      : 'Our designated field brokerage advisor will call you within 2 business hours with route guidance and visit schedule.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedVisitProperty(null)}
                    className="mt-4 px-6 py-2.5 rounded-full bg-[#191512] hover:bg-[#8C653E] text-white text-xs font-semibold tracking-wide uppercase"
                  >
                    {isTe ? 'ముగించు' : 'Done'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitVisit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#191512] mb-1.5">
                      {isTe ? 'మీ పూర్తి పేరు' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder={isTe ? 'ఉదా. శ్రీకాంత్ రెడ్డి' : 'e.g. Srikant Reddy'}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E8E2D9] bg-white text-xs sm:text-sm text-[#191512] focus:outline-none focus:ring-2 focus:ring-[#8C653E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#191512] mb-1.5">
                      {isTe ? 'ఫోన్ లేదా వాట్సాప్ నంబర్' : 'Phone / WhatsApp Number'} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E8E2D9] bg-white text-xs sm:text-sm text-[#191512] focus:outline-none focus:ring-2 focus:ring-[#8C653E] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#191512] mb-1.5">
                      {isTe ? 'సందర్శించదలిచిన తేదీ' : 'Preferred Visit Date'}
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E8E2D9] bg-white text-xs sm:text-sm text-[#191512] focus:outline-none focus:ring-2 focus:ring-[#8C653E]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full h-12 bg-[#191512] hover:bg-[#8C653E] text-white font-semibold text-xs tracking-wider uppercase rounded-full transition-all shadow-md active:scale-[0.98]"
                    >
                      {isTe ? 'సైట్ విజిట్ బుక్ చేయండి' : 'Confirm Ground Site Visit'}
                    </button>
                    <p className="text-[11px] text-[#8C827A] text-center mt-2.5">
                      {isTe
                        ? 'ఉచిత ప్రయాణ రవాణా & రెవెన్యూ నిపుణుల తోడు'
                        : 'Free accompaniment by certified real estate advisory agent.'}
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
