import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidLocale, Locale, LOCALES, getDictionary } from '@/lib/i18n';
import { MOCK_PROPERTIES } from '@/lib/mockData';
import { getPropertyById } from '@/lib/api';
import { formatINR, formatOrrDistance } from '@/lib/formatters';
import {
  ShieldCheck,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  FileCheck,
  Building,
  Check,
} from 'lucide-react';
import TrustBadge from '@/components/common/TrustBadge';
import { VERIFIED_13_DOCS } from '@/lib/constants';
import PropertyGallery from '@/components/properties/PropertyGallery';
import PropertySpecs from '@/components/properties/PropertySpecs';
import PropertyLocationMap from '@/components/properties/PropertyLocationMap';
import PropertyDetailActions from '@/components/properties/PropertyDetailActions';

export const dynamicParams = true;

export function generateStaticParams() {
  const params: { locale: string; id: string }[] = [];
  LOCALES.forEach((locale) => {
    MOCK_PROPERTIES.forEach((prop) => {
      params.push({ locale, id: prop.id });
    });
  });
  return params;
}

interface PropertyDetailPageProps {
  params: {
    locale: string;
    id: string;
  };
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isTe = locale === 'te';
  const dict = getDictionary(locale);

  // Try backend first, fall back to mock
  const property = await getPropertyById(params.id);
  if (!property) notFound();

  const title = isTe && property.titleTe ? property.titleTe : property.title;
  const description = isTe && property.descriptionTe ? property.descriptionTe : property.description;

  // Filter 13-docs based on property applicability
  const relevantDocs = VERIFIED_13_DOCS.filter((doc) => {
    if (doc.appliesTo === 'BOTH') return true;
    if (property.type === 'LAND' && doc.appliesTo === 'LAND') return true;
    if (property.type === 'FLAT' && doc.appliesTo === 'FLAT') return true;
    return false;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 pb-28 lg:pb-16">
      {/* Top Navigation & Trust Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-5">
        <Link
          href={`/${locale}/properties`}
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#574F48] hover:text-[#191512] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#8C653E]" />
          <span>{isTe ? 'అన్ని ప్రాపర్టీలకు తిరిగి వెళ్ళండి' : 'Back to Curated Portfolio'}</span>
        </Link>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <TrustBadge locale={locale} variant="pill" />
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Media, Specs, 13-Docs, Map) & Right 1 Col (Sticky Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Property Gallery */}
          <PropertyGallery
            mainImage={property.mainImage}
            galleryImages={property.galleryImages}
            title={title}
            locale={locale}
          />

          {/* 2. Title, Badges & Location Line */}
          <div className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E2D9] shadow-[0_4px_24px_-4px_rgba(25,21,18,0.04)]">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  property.type === 'LAND'
                    ? 'bg-[#8C653E] text-white'
                    : 'bg-[#191512] text-[#FAF8F5]'
                }`}
              >
                {property.type === 'LAND'
                  ? isTe
                    ? 'భూమి / ప్లాట్'
                    : 'Land Parcel'
                  : isTe
                  ? 'ఫ్లాట్ / అపార్ట్‌మెంట్'
                  : 'Architectural Flat'}
              </span>

              <span className="px-3 py-1 rounded-full bg-[#F5F1EA] text-[#5C4026] text-xs font-semibold flex items-center gap-1.5 border border-[#E8E2D9]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8C653E] shrink-0" />
                <span>{dict.propertyDetail.verifiedCleared}</span>
              </span>

              {property.location.distanceFromOrrKm !== undefined && (
                <span className="px-3 py-1 rounded-full bg-[#F5F1EA] text-[#574F48] text-xs font-medium border border-[#E8E2D9]">
                  {formatOrrDistance(property.location.distanceFromOrrKm)}
                </span>
              )}
            </div>

            {/* Location Line */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#8C827A] pt-1">
              <MapPin className="w-4 h-4 text-[#8C653E] shrink-0" />
              <span className="font-medium text-[#191512]">
                {property.location.village}, {property.location.mandal}, {property.location.district}
              </span>
            </div>

            {/* Headline Title */}
            <h1 className="font-serif text-2xl sm:text-4xl font-normal text-[#191512] tracking-tight leading-snug">
              {title}
            </h1>

            {/* Description Paragraph */}
            <p className="text-sm sm:text-base text-[#574F48] leading-relaxed pt-1">
              {description}
            </p>
          </div>

          {/* 3. Detailed Specifications Grid */}
          <PropertySpecs property={property} locale={locale} />

          {/* 4. 13-Document Legal Verification Gate */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D9] shadow-[0_4px_24px_-4px_rgba(25,21,18,0.04)] space-y-6">
            <div className="border-b border-[#E8E2D9] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#F5F1EA] text-[#8C653E] border border-[#E8E2D9] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#191512]">
                    {dict.propertyDetail.verificationReport}
                  </h2>
                  <p className="text-xs text-[#8C827A] mt-0.5">
                    {dict.propertyDetail.verificationNote}
                  </p>
                </div>
              </div>

              <span className="px-4 py-1.5 rounded-full bg-[#191512] text-[#FAF8F5] text-xs font-semibold tracking-wider uppercase self-start sm:self-auto">
                {property.verifiedDocsCount} / {property.totalDocsRequired} {isTe ? 'పూర్తయింది' : 'Cleared'}
              </span>
            </div>

            {/* Statutory Authority Clearances Pills */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              {property.dharaniApproved && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F1EA] text-[#5C4026] text-xs font-semibold border border-[#E8E2D9]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8C653E] shrink-0" />
                  <span>{isTe ? 'ధరణి డిజిటల్ పట్టాదారు పాస్‌బుక్ ధృవీకరించబడింది' : 'Dharani Portal Digital Mutation Cleared'}</span>
                </div>
              )}
              {property.hmdaApproved && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F1EA] text-[#5C4026] text-xs font-semibold border border-[#E8E2D9]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8C653E] shrink-0" />
                  <span>{isTe ? 'HMDA ఆమోదిత లేఅవుట్ శాంక్షన్ పత్రం' : 'HMDA Sanctioned Layout Vetted'}</span>
                </div>
              )}
              {property.reraApproved && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F1EA] text-[#5C4026] text-xs font-semibold border border-[#E8E2D9]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8C653E] shrink-0" />
                  <span>{isTe ? 'తెలంగాణ RERA నమోదిత ప్రాజెక్ట్' : 'Telangana RERA Registered Project'}</span>
                </div>
              )}
            </div>

            {/* 13-Doc Verification Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {relevantDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] hover:border-[#8C653E]/50 transition-colors flex items-start gap-3 group"
                >
                  <div className="w-6 h-6 rounded-full bg-white text-[#8C653E] border border-[#E8E2D9] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#191512] truncate">
                        {isTe ? doc.nameTe : doc.nameEn}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 bg-[#F5F1EA] text-[#5C4026] border border-[#E8E2D9]">
                        {dict.propertyDetail.docStatusVerified}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#574F48] mt-1 line-clamp-2 leading-relaxed">
                      {isTe ? doc.descTe : doc.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Location & Map Section */}
          <PropertyLocationMap property={property} locale={locale} />
        </div>

        {/* Right Column (4 cols on lg): Sticky Pricing, Mediation Desk & Actions */}
        <div className="lg:col-span-4">
          <PropertyDetailActions property={property} locale={locale} />
        </div>
      </div>
    </div>
  );
}
