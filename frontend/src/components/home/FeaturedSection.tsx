'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, MapPin, ArrowRight, ShieldCheck, CheckCircle2, Phone, Calendar, X } from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import { MOCK_PROPERTIES, MockProperty } from '@/lib/mockData';
import PropertyCard from '../properties/PropertyCard';

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

  const handleBookVisit = (propertyId: string) => {
    const prop = MOCK_PROPERTIES.find((p) => p.id === propertyId);
    if (prop) {
      setSelectedVisitProperty(prop);
      setVisitSubmitted(false);
    }
  };

  const handleSubmitVisit = (e: React.FormEvent) => {
    e.preventDefault();
    setVisitSubmitted(true);
  };

  return (
    <section className="py-20 sm:py-28 bg-[#FAF8F5] border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#8C653E]">
              {isTe ? 'ధృవీకరించబడిన ప్రాపర్టీలు' : 'Curated Portfolio'}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#191512] tracking-tight">
              {isTe
                ? 'హైదరాబాద్ & తెలంగాణలో ప్రముఖ ప్రాపర్టీలు'
                : 'Prime Land Ventures & Architectural Flats'}
            </h2>
            <p className="text-sm sm:text-base text-[#574F48] leading-relaxed">
              {isTe
                ? 'ప్రతి లిస్టింగ్ 13 రికార్డులతో లీగల్ చెక్ చేయబడి, సైట్ విజిట్ కోసం సిద్ధంగా ఉన్నవి.'
                : '100% verified title clearance with Dharani portal records and HMDA sanctioned layouts.'}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F5F1EA] rounded-full border border-[#E8E2D9] self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-all tap-target ${
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
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-all tap-target ${
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
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-all tap-target ${
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
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-all tap-target ${
                activeFilter === 'ORR'
                  ? 'bg-[#191512] text-[#FAF8F5] shadow-sm'
                  : 'text-[#574F48] hover:text-[#191512]'
              }`}
            >
              {isTe ? 'ORR కారిడార్' : 'ORR Corridor'}
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.slice(0, 6).map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              locale={locale}
              onBookVisit={handleBookVisit}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center pt-8">
          <Link
            href={`/${locale}/properties`}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#191512] hover:bg-[#8C653E] text-[#FAF8F5] text-xs font-semibold tracking-widest uppercase shadow-md hover:shadow-xl transition-all tap-target active:scale-[0.98]"
          >
            <span>{isTe ? 'అన్ని లిస్టింగ్‌లు చూడండి' : 'Browse All Verified Properties'}</span>
            <ArrowRight className="w-4 h-4 text-[#C5A880]" />
          </Link>
        </div>
      </div>

      {/* Quick Site Visit Booking Modal */}
      {selectedVisitProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#E8E2D9] overflow-hidden my-8">
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
              <div className="bg-[#F5F1EA] p-4 rounded-xl border border-[#E8E2D9] text-xs">
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
