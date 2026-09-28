'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  MapPin,
  SlidersHorizontal,
  IndianRupee,
  Calendar,
  Layers,
  FileText,
  Building2,
  Check,
} from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { BuyerFacingAdminDetails, AdminPropertyDetails } from '@/types/adminDetails';
import {
  stripInternalNotes,
  hasBuyerFacingDetails,
  loadAdminDetails,
} from '@/lib/adminDetailsStorage';

interface PropertyAdminCuratedSectionProps {
  propertyId: string;
  initialDetails?: BuyerFacingAdminDetails | AdminPropertyDetails | null;
  locale: Locale;
}

export default function PropertyAdminCuratedSection({
  propertyId,
  initialDetails,
  locale,
}: PropertyAdminCuratedSectionProps) {
  const isTe = locale === 'te';

  // Strip internal notes immediately at state initialization
  const [details, setDetails] = useState<BuyerFacingAdminDetails | null>(() => {
    const loaded = loadAdminDetails(propertyId, initialDetails);
    return stripInternalNotes(loaded);
  });

  // Re-sync on propertyId or initialDetails change
  useEffect(() => {
    const loaded = loadAdminDetails(propertyId, initialDetails);
    setDetails(stripInternalNotes(loaded));
  }, [propertyId, initialDetails]);

  // Reactive listener for local updates in the same browser session
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{
        propertyId: string;
        details: AdminPropertyDetails;
      }>;
      if (customEvent.detail?.propertyId === propertyId) {
        setDetails(stripInternalNotes(customEvent.detail.details));
      }
    };
    window.addEventListener('trh-admin-details-changed', handleSync);
    return () => window.removeEventListener('trh-admin-details-changed', handleSync);
  }, [propertyId]);

  if (!hasBuyerFacingDetails(details)) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D9] shadow-[0_4px_24px_-4px_rgba(25,21,18,0.04)] space-y-6">
      {/* Section Header */}
      <div className="border-b border-[#E8E2D9] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#F5F1EA] text-[#8C653E] border border-[#E8E2D9] flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#191512]">
                {isTe ? 'TRH డెస్క్ ధృవీకరించిన అదనపు సమాచారం' : 'Admin Curated & Verified Insights'}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F5F1EA] text-[#5C4026] border border-[#E8E2D9]">
                <CheckCircle2 className="w-3 h-3 text-[#8C653E]" />
                {isTe ? 'TRH క్యూరేటెడ్' : 'TRH Desk Curated'}
              </span>
            </div>
            <p className="text-xs text-[#8C827A] mt-0.5">
              {isTe
                ? 'మా సీనియర్ ప్రాపర్టీ అడ్వైజర్లచే ప్రత్యేకంగా పరిశీలించబడిన కొనుగోలుదారుల సమాచారం'
                : 'Buyer-facing property intelligence, specifications & instructions curated by TRH Desk'}
            </p>
          </div>
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-[#191512] text-[#FAF8F5] text-xs font-semibold tracking-wider uppercase self-start sm:self-auto">
          {isTe ? 'అధికారిక డోసియర్' : 'Curated Dossier'}
        </span>
      </div>

      {/* 1. Curated Project Description */}
      {details?.projectDescription && (
        <div className="p-5 rounded-xl bg-[#FAF8F5] border-l-4 border-[#8C653E] border-t border-r border-b border-[#E8E2D9] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#191512] uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-[#8C653E]" />
            <span>{isTe ? 'ప్రాజెక్ట్ ముఖ్యాంశాల నివేదిక' : 'Curated Project Overview'}</span>
          </div>
          <p className="text-sm text-[#574F48] leading-relaxed whitespace-pre-line">
            {details.projectDescription}
          </p>
        </div>
      )}

      {/* 2. Highlights & Special Features */}
      {((details?.highlights && details.highlights.length > 0) ||
        (details?.specialFeatures && details.specialFeatures.length > 0)) && (
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#8C827A] block">
            {isTe ? 'ప్రాపర్టీ ప్రత్యేకతలు & ముఖ్యాంశాలు' : 'Property Highlights & Key Features'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {details?.highlights?.map((highlight, idx) => (
              <div
                key={`hl-${idx}`}
                className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-full bg-white text-[#8C653E] border border-[#E8E2D9] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[#8C653E]" />
                </div>
                <span className="text-xs text-[#191512] font-medium leading-relaxed">
                  {highlight}
                </span>
              </div>
            ))}
            {details?.specialFeatures?.map((feature, idx) => (
              <div
                key={`sf-${idx}`}
                className="p-3.5 rounded-xl bg-[#F5F1EA]/60 border border-[#E8E2D9] flex items-start gap-2.5"
              >
                <Sparkles className="w-4 h-4 text-[#8C653E] mt-0.5 shrink-0" />
                <span className="text-xs text-[#5C4026] font-medium leading-relaxed">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Curated Amenities */}
      {details?.amenities && details.amenities.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-[#E8E2D9]">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#8C827A] block">
            {isTe ? 'అదనపు సౌకర్యాలు' : 'Curated Amenities & Infrastructure'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {details.amenities.map((amenity, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E8E2D9] text-[#191512] text-xs font-medium"
              >
                <Check className="w-3.5 h-3.5 text-[#8C653E]" />
                <span>{amenity}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4. Location Advantages & Landmarks */}
      {((details?.locationAdvantages && details.locationAdvantages.length > 0) ||
        (details?.nearbyLandmarks && details.nearbyLandmarks.length > 0)) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E8E2D9]">
          {details?.locationAdvantages && details.locationAdvantages.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#8C827A] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8C653E]" />
                {isTe ? 'కనెక్టివిటీ ప్రయోజనాలు' : 'Location Advantages'}
              </span>
              <ul className="space-y-1.5">
                {details.locationAdvantages.map((adv, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-[#574F48] flex items-start gap-2 py-0.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C653E] mt-1.5 shrink-0" />
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {details?.nearbyLandmarks && details.nearbyLandmarks.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#8C827A] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8C653E]" />
                {isTe ? 'సమీప ల్యాండ్‌మార్కులు' : 'Nearby Landmarks & Proximity'}
              </span>
              <ul className="space-y-1.5">
                {details.nearbyLandmarks.map((lm, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-[#574F48] flex items-start gap-2 py-0.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#8C827A] mt-0.5 shrink-0" />
                    <span>{lm}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 5. Additional Specifications (Key-Value Grid) */}
      {details?.additionalSpecifications && details.additionalSpecifications.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-[#E8E2D9]">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8C827A] flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#8C653E]" />
            {isTe ? 'అదనపు సాంకేతిక వివరాలు' : 'Additional Specifications'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {details.additionalSpecifications.map((spec) => (
              <div
                key={spec.id}
                className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-between gap-3 text-xs"
              >
                <span className="font-semibold text-[#8C827A] uppercase tracking-wide">
                  {spec.label}
                </span>
                <span className="font-medium text-[#191512] text-right truncate">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Pricing Notes & Site Visit Instructions */}
      {(details?.pricingNotes || details?.siteVisitInstructions) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E8E2D9]">
          {details.pricingNotes && (
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] space-y-1.5">
              <span className="text-xs font-bold text-[#191512] uppercase tracking-wider flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-[#8C653E]" />
                {isTe ? 'ధర మరియు చెల్లింపు వివరాలు' : 'Pricing & Financial Notes'}
              </span>
              <p className="text-xs text-[#574F48] leading-relaxed">
                {details.pricingNotes}
              </p>
            </div>
          )}

          {details.siteVisitInstructions && (
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] space-y-1.5">
              <span className="text-xs font-bold text-[#191512] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#8C653E]" />
                {isTe ? 'సైట్ సందర్శన నిబంధనలు' : 'Site Visit & Inspection Protocol'}
              </span>
              <p className="text-xs text-[#574F48] leading-relaxed">
                {details.siteVisitInstructions}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 7. Additional Notes & Custom Sections */}
      {(details?.additionalNotes ||
        (details?.customSections && details.customSections.length > 0)) && (
        <div className="space-y-3 pt-3 border-t border-[#E8E2D9]">
          {details.additionalNotes && (
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] space-y-1">
              <span className="text-xs font-bold text-[#191512] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#8C653E]" />
                {isTe ? 'అదనపు గమనికలు' : 'Additional Buyer Notes'}
              </span>
              <p className="text-xs text-[#574F48] leading-relaxed">
                {details.additionalNotes}
              </p>
            </div>
          )}

          {details.customSections?.map((section) => (
            <div
              key={section.id}
              className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] space-y-1"
            >
              <span className="text-xs font-bold text-[#191512] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#8C653E]" />
                {section.title}
              </span>
              <p className="text-xs text-[#574F48] leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Footer Trust Attribution */}
      <div className="pt-2 text-right border-t border-[#E8E2D9]/60">
        <span className="text-[11px] text-[#8C827A] italic">
          {isTe
            ? 'ఈ సమాచారం TRH డెడికేటెడ్ లీగల్ & సైట్ వెరిఫికేషన్ డెస్క్ ద్వారా ధృవీకరించబడింది.'
            : 'Vetted and verified by Telangana Real-Estate Brokerage & Mediation Deal Desk.'}
        </span>
      </div>
    </div>
  );
}
