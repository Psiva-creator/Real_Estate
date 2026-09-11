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
    <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {isTe ? 'ధృవీకరించబడిన ప్రాపర్టీలు' : 'Verified Listings'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {isTe
                ? 'హైదరాబాద్ & తెలంగాణలో ప్రముఖ ప్రాపర్టీలు'
                : 'Curated Land Parcels & Verified Apartments'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {isTe
                ? 'ప్రతి లిస్టింగ్ 13 రికార్డులతో లీగల్ చెక్ చేయబడి, సైట్ విజిట్ కోసం సిద్ధంగా ఉన్నవి.'
                : '100% verified legal clearance with Dharani portal records and HMDA sanctions.'}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all tap-target ${
                activeFilter === 'ALL'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTe ? 'అన్నీ' : 'All Listings'}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('LAND')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all tap-target ${
                activeFilter === 'LAND'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTe ? 'భూములు / ప్లాట్లు' : 'Land & Plots'}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('FLAT')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all tap-target ${
                activeFilter === 'FLAT'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTe ? 'అపార్ట్‌మెంట్లు' : 'Flats'}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('ORR')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all tap-target ${
                activeFilter === 'ORR'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTe ? 'ORR కారిడార్' : 'ORR Corridor'}
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="text-center pt-6">
          <Link
            href={`/${locale}/properties`}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all tap-target active:scale-[0.98]"
          >
            <span>{isTe ? 'అన్ని లిస్టింగ్‌లు చూడండి' : 'Browse All Verified Properties'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Site Visit Booking Modal */}
      {selectedVisitProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-300" />
                <h3 className="text-base font-bold">
                  {isTe ? 'ఉచిత సైట్ విజిట్ బుక్ చేసుకోండి' : 'Schedule Free Ground Site Visit'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVisitProperty(null)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-emerald-800 block">
                  {selectedVisitProperty.id} • {selectedVisitProperty.location.village}
                </span>
                <p className="text-slate-800 font-semibold mt-0.5">
                  {isTe && selectedVisitProperty.titleTe ? selectedVisitProperty.titleTe : selectedVisitProperty.title}
                </p>
              </div>

              {visitSubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    {isTe ? 'సైట్ విజిట్ అభ్యర్థన అందింది!' : 'Site Visit Request Received!'}
                  </h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    {isTe
                      ? 'మా సర్టిఫైడ్ డీల్ ఏజెంట్ మీకు కాల్ చేసి సమయాన్ని ఖరారు చేస్తారు.'
                      : 'Our designated field brokerage agent will call you within 2 business hours with route map and visit confirmation.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedVisitProperty(null)}
                    className="mt-4 px-5 py-2.5 rounded-lg bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-700"
                  >
                    {isTe ? 'ముగించు' : 'Done'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitVisit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isTe ? 'మీ పూర్తి పేరు' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder={isTe ? 'ఉదా. శ్రీకాంత్ రెడ్డి' : 'e.g. Srikant Reddy'}
                      className="w-full h-11 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isTe ? 'ఫోన్ లేదా వాట్సాప్ నంబర్' : 'Phone / WhatsApp Number'} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full h-11 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isTe ? 'సందర్శించదలిచిన తేదీ' : 'Preferred Visit Date'}
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full h-12 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-[0.98]"
                    >
                      {isTe ? 'సైట్ విజిట్ బుక్ చేయండి' : 'Confirm Free Site Visit'}
                    </button>
                    <p className="text-[11px] text-slate-500 text-center mt-2">
                      {isTe
                        ? 'ఉచిత ప్రయాణ రవాణా & రెవెన్యూ నిపుణుల తోడు'
                        : 'Free accompaniment by certified real estate field agent.'}
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
