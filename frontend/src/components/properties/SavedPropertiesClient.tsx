'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Heart, Trash2, ArrowRight, ShieldCheck, Sparkles, Building2, MapPin } from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import { MOCK_PROPERTIES, MockProperty } from '@/lib/mockData';
import { getProperties } from '@/lib/api';
import { useFavorites } from '@/lib/favorites';
import PropertyCard from '@/components/properties/PropertyCard';

interface SavedPropertiesClientProps {
  locale: Locale;
}

export default function SavedPropertiesClient({ locale }: SavedPropertiesClientProps) {
  const isTe = locale === 'te';
  const dict = getDictionary(locale);
  const { savedIds, isReady } = useFavorites();
  const [allProperties, setAllProperties] = useState<MockProperty[]>(MOCK_PROPERTIES);
  const [isLoading, setIsLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Fetch properties from backend with fallback
  useEffect(() => {
    let cancelled = false;
    getProperties({ limit: 100 })
      .then(({ properties, fromBackend }) => {
        if (!cancelled) {
          if (fromBackend) {
            const MOCK_SOLD = MOCK_PROPERTIES.filter((p) => p.status === 'SOLD');
            const backendIds = new Set(properties.map((p) => p.id));
            const missingSold = MOCK_SOLD.filter((p) => !backendIds.has(p.id));
            setAllProperties([...properties, ...missingSold]);
          } else {
            setAllProperties(properties);
          }
        }
      })
      .catch(() => {
        // Silently retain MOCK_PROPERTIES
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter properties matching savedIds
  const savedProperties = useMemo(() => {
    if (!savedIds || savedIds.length === 0) return [];
    return allProperties.filter((p) => savedIds.includes(p.id));
  }, [savedIds, allProperties]);

  const handleClearAll = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('trh_saved_properties', JSON.stringify([]));
      window.dispatchEvent(new CustomEvent('trh-favorites-changed', { detail: { savedIds: [] } }));
    }
    setShowClearConfirm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 min-h-[70vh]">
      {/* Breadcrumb & Header */}
      <div className="space-y-4">
        <nav className="text-xs text-[#8C827A] flex items-center gap-2" aria-label="Breadcrumb">
          <Link href={`/${locale}`} className="hover:text-[#191512] transition-colors">
            {dict.nav.home}
          </Link>
          <span>/</span>
          <span className="text-[#191512] font-semibold tracking-wide uppercase text-[10px]">
            {isTe ? 'భద్రపరిచిన ప్రాపర్టీలు' : 'Saved Properties'}
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E2D9] pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#8C653E]">
                {isTe ? 'మీ షార్ట్‌లిస్ట్' : 'Buyer Shortlist'}
              </span>
              {isReady && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#8C653E]/10 text-[#8C653E] border border-[#8C653E]/20 text-xs font-bold">
                  {savedProperties.length} {isTe ? 'ప్రాపర్టీలు' : 'Saved'}
                </span>
              )}
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#191512] tracking-tight">
              {isTe ? 'భద్రపరిచిన ప్రాపర్టీల జాబితా' : 'Your Saved Properties'}
            </h1>
            <p className="text-sm text-[#574F48] max-w-2xl leading-relaxed">
              {isTe
                ? 'మీరు ఇష్టపడిన మరియు ఆసక్తి చూపిన భూములు, అపార్ట్‌మెంట్లు మరియు విల్లాల సేకరణ. ఇక్కడి నుండి నేరుగా లీగల్ వెరిఫికేషన్ వివరాలను చూడవచ్చు.'
                : 'Review, compare, and inquire on your shortlisted verified properties across Hyderabad & Telangana with complete 13-document transparency.'}
            </p>
          </div>

          {savedProperties.length > 0 && (
            <div className="flex items-center gap-3 self-start sm:self-auto">
              {showClearConfirm ? (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full">
                  <span className="text-xs text-rose-700 font-medium">
                    {isTe ? 'ఖచ్చితంగా తొలగించాలా?' : 'Clear all saved?'}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-xs px-2.5 py-0.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors cursor-pointer"
                  >
                    {isTe ? 'అవును' : 'Yes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="text-xs px-2 py-0.5 rounded-full bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 font-medium transition-colors cursor-pointer"
                  >
                    {isTe ? 'వద్దు' : 'No'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                  title={isTe ? 'అన్నింటినీ తొలగించండి' : 'Clear All'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isTe ? 'అన్నింటినీ తీసివేయి' : 'Clear All'}</span>
                </button>
              )}

              <Link
                href={`/${locale}/properties`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#191512] hover:bg-[#8C653E] text-white text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                <span>{isTe ? 'మరిన్ని చూడండి' : 'Explore More'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {!isReady || isLoading ? (
        /* Loading skeleton */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden p-4 space-y-4 animate-pulse"
            >
              <div className="aspect-[16/10] bg-[#F5F1EA] rounded-xl w-full" />
              <div className="h-5 bg-[#F5F1EA] rounded w-3/4" />
              <div className="h-4 bg-[#F5F1EA] rounded w-1/2" />
              <div className="pt-2 border-t border-[#E8E2D9] flex justify-between">
                <div className="h-6 bg-[#F5F1EA] rounded w-1/3" />
                <div className="h-8 bg-[#F5F1EA] rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : savedProperties.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-[#E8E2D9] p-10 sm:p-16 text-center space-y-6 shadow-sm max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-[#F5F1EA] text-[#8C653E] border border-[#E8E2D9] flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-10 h-10 text-[#8C653E]" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#191512]">
              {isTe ? 'మీ సేవ్డ్ లిస్ట్ ఖాళీగా ఉంది' : 'No Saved Properties Yet'}
            </h2>
            <p className="text-sm text-[#574F48] leading-relaxed max-w-lg mx-auto">
              {isTe
                ? 'తెలంగాణలోని ధృవీకరించబడిన ల్యాండ్, అపార్ట్‌మెంట్లు మరియు విల్లాలను అన్వేషించండి. ఏదైనా ప్రాపర్టీపై ఉన్న గుండె గుర్తుపై క్లిక్ చేసి ఇక్కడ భద్రపరచండి.'
                : 'Explore legally verified ventures, gated communities, and luxury lands across Hyderabad. Tap the heart bookmark on any property to curate your shortlist.'}
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/${locale}/properties`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#191512] hover:bg-[#8C653E] text-white font-semibold text-xs tracking-wider uppercase shadow-sm transition-all active:scale-[0.98]"
            >
              <span>{isTe ? 'ప్రాపర్టీలను బ్రౌజ్ చేయండి' : 'Browse Verified Properties'}</span>
              <ArrowRight className="w-4 h-4 text-[#C5A880]" />
            </Link>
          </div>

          {/* Value Badges */}
          <div className="pt-8 border-t border-[#E8E2D9] grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-[#574F48]">
                <strong className="text-[#191512] block">{isTe ? '13 డాక్యుమెంట్లు' : '13-Doc Audited'}</strong>
                {isTe ? 'పూర్తి రెవెన్యూ పరిశీలన' : 'Rigorous title diligence'}
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#8C653E] shrink-0 mt-0.5" />
              <div className="text-xs text-[#574F48]">
                <strong className="text-[#191512] block">{isTe ? 'ORR సామీప్యత' : 'ORR Proximity'}</strong>
                {isTe ? 'ఖచ్చితమైన కి.మీ దూరం' : 'Accurate drive-time tags'}
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-[#574F48]">
                <strong className="text-[#191512] block">{isTe ? 'ప్రత్యక్ష సంప్రదింపు' : 'Direct Deal Desk'}</strong>
                {isTe ? 'బ్రోకర్ రహిత సంప్రదింపు' : 'Direct advisory support'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Saved Properties Grid */
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} locale={locale} />
            ))}
          </div>

          {/* Deal Desk Assistance Callout */}
          <div className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="font-serif text-lg font-bold text-[#191512]">
                {isTe ? 'సైట్ విజిట్ షెడ్యూల్ చేయాలనుకుంటున్నారా?' : 'Ready to schedule a site visit?'}
              </h3>
              <p className="text-xs sm:text-sm text-[#574F48]">
                {isTe
                  ? 'మీరు ఎంచుకున్న ప్రాపర్టీల కోసం మా సీనియర్ లీగల్ అడ్వైజర్ ప్రత్యక్ష సైట్ విజిట్ మరియు టైటిల్ డాక్యుమెంట్ల పరిశీలనను సమన్వయం చేస్తారు.'
                  : 'Our dedicated Telangana land advisors coordinate executive site tours, Dharani verification reports, and private negotiations.'}
              </p>
            </div>
            <Link
              href={`/${locale}/about#contact`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8C653E] hover:bg-[#725130] text-white text-xs font-semibold tracking-wider uppercase transition-all shrink-0 shadow-sm"
            >
              <span>{isTe ? 'డీల్ డెస్క్‌ను సంప్రదించండి' : 'Contact Deal Desk'}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
