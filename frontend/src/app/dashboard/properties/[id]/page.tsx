'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  MapPin,
  AlertCircle,
  Loader2,
  User,
  Phone,
  Mail,
  CreditCard,
  IndianRupee,
  Layers,
  CalendarDays,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getAdminPropertyDetailApi, InternalPropertyDetail } from '@/lib/api';
import { formatINR } from '@/lib/formatters';
import DocumentVerificationReviewer from '@/components/dashboard/DocumentVerificationReviewer';

// ─── Status Chip ──────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    VERIFIED:    'bg-emerald-100 text-emerald-800 border-emerald-200',
    LIVE:        'bg-blue-100 text-blue-800 border-blue-200',
    UNDER_REVIEW:'bg-amber-100 text-amber-800 border-amber-200',
    DRAFT:       'bg-slate-100 text-slate-600 border-slate-200',
    SOLD:        'bg-purple-100 text-purple-800 border-purple-200',
    OFF_MARKET:  'bg-slate-100 text-slate-500 border-slate-200',
  };
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
        map[status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
      }`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide w-40 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-slate-800 font-medium flex-1">{value}</span>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <Icon className="w-4 h-4 text-emerald-700 shrink-0" />
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PropertyInternalReviewPage() {
  const params = useParams();
  const propertyId = typeof params?.id === 'string' ? params.id : (params?.id?.[0] ?? '');
  const { token, isStaff } = useAuth();

  const [property, setProperty] = useState<InternalPropertyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadProperty = useCallback(async () => {
    if (!token || !propertyId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const detail = await getAdminPropertyDetailApi(token, propertyId);
      setProperty(detail);
    } catch (err) {
      setLoadError((err as Error).message || 'Failed to load property details');
    } finally {
      setIsLoading(false);
    }
  }, [token, propertyId]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  // ── Access guard ────────────────────────────────────────────────────────
  if (!isStaff) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center max-w-md mx-auto space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-600">
          Only Admin and Agent users can access the internal property review.
        </p>
      </div>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-slate-500 text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
        Loading property details…
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────
  if (loadError || !property) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 px-3 py-2 rounded-lg border border-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Properties
        </Link>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{loadError ?? 'Property not found.'}</span>
          <button
            type="button"
            onClick={loadProperty}
            className="ml-auto text-xs font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────
  const verified = property.verificationStatus?.verifiedDocuments ?? 0;
  const total = property.verificationStatus?.totalDocuments ?? 13;

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <Link
          href="/dashboard/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 px-3 py-2 rounded-lg border border-slate-200 transition-colors shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Properties
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 leading-tight">{property.titleEn}</h1>
            <StatusChip status={property.status} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {property.location.village}, {property.location.mandal},{' '}
            {property.location.district} ·{' '}
            <span className="font-mono text-emerald-700 font-bold">{property.id}</span>
          </p>
        </div>
        {/* Doc count */}
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50">
          <ShieldCheck
            className={`w-4 h-4 ${verified >= total && total > 0 ? 'text-emerald-600' : 'text-amber-500'}`}
          />
          {verified}/{total} Docs Verified
        </div>
      </div>

      {/* Property Details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Property Info */}
        <SectionCard title="Property Details" icon={Building2}>
          <InfoRow label="Type" value={property.type} />
          <InfoRow label="Status" value={<StatusChip status={property.status} />} />
          <InfoRow
            label="Description"
            value={
              <span className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {property.descriptionEn}
              </span>
            }
          />
          {property.land && (
            <>
              <InfoRow label="Total Acres" value={`${property.land.totalAcres ?? '—'} acres`} />
              {property.land.sqYards && (
                <InfoRow label="Sq Yards" value={`${property.land.sqYards} sq.yd`} />
              )}
              {property.land.surveyNumbers && property.land.surveyNumbers.length > 0 && (
                <InfoRow label="Survey Nos." value={property.land.surveyNumbers.join(', ')} />
              )}
              {property.land.soilType && (
                <InfoRow label="Soil Type" value={property.land.soilType} />
              )}
              {property.land.roadWidthFt && (
                <InfoRow label="Road Width" value={`${property.land.roadWidthFt} ft`} />
              )}
              <InfoRow
                label="Water"
                value={
                  property.land.waterAvailable === undefined
                    ? undefined
                    : property.land.waterAvailable
                    ? 'Available'
                    : 'Not Available'
                }
              />
              <InfoRow
                label="Electricity"
                value={
                  property.land.electricityAvailable === undefined
                    ? undefined
                    : property.land.electricityAvailable
                    ? 'Available'
                    : 'Not Available'
                }
              />
            </>
          )}
          {property.flat && (
            <>
              <InfoRow
                label="Area"
                value={`${property.flat.sqft ?? '—'} sq.ft`}
              />
              <InfoRow
                label="Bedrooms"
                value={`${property.flat.bedrooms ?? '—'} BHK`}
              />
              <InfoRow label="Floor" value={`${property.flat.floor ?? '—'} / ${property.flat.totalFloors ?? '—'}`} />
              <InfoRow label="Possession" value={property.flat.possessionStatus?.replace(/_/g, ' ')} />
              <InfoRow label="Furnishing" value={property.flat.furnishingStatus?.replace(/_/g, ' ')} />
            </>
          )}
        </SectionCard>

        {/* Location */}
        <SectionCard title="Location" icon={MapPin}>
          <InfoRow label="Village" value={property.location.village} />
          <InfoRow label="Mandal" value={property.location.mandal} />
          <InfoRow label="District" value={property.location.district} />
          {property.location.distanceFromOrrKm !== undefined && (
            <InfoRow label="ORR Distance" value={`${property.location.distanceFromOrrKm} km`} />
          )}
          {property.location.zone && (
            <InfoRow label="Zone" value={property.location.zone} />
          )}
          {property.location.tier && (
            <InfoRow label="Tier" value={property.location.tier} />
          )}
          {property.location.landmark && (
            <InfoRow label="Landmark" value={property.location.landmark} />
          )}
        </SectionCard>

        {/* Pricing */}
        <SectionCard title="Pricing" icon={IndianRupee}>
          <InfoRow label="Total Price" value={formatINR(property.pricing.totalPrice)} />
          {property.pricing.pricePerAcre && (
            <InfoRow label="Per Acre" value={formatINR(property.pricing.pricePerAcre)} />
          )}
          {property.pricing.pricePerSqft && (
            <InfoRow label="Per Sq.ft" value={formatINR(property.pricing.pricePerSqft)} />
          )}
          {property.pricing.pricePerSqYard && (
            <InfoRow label="Per Sq.Yd" value={formatINR(property.pricing.pricePerSqYard)} />
          )}
          <InfoRow label="Negotiable" value={property.pricing.isNegotiable ? 'Yes' : 'No'} />
        </SectionCard>

        {/* Seller Details — private, admin/agent only */}
        {property.seller && (
          <SectionCard title="Seller Details (Private — Not Public)" icon={User}>
            <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              This information is confidential and is NOT exposed on the public property page.
            </div>
            <InfoRow label="Name" value={
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {property.seller.name}
              </span>
            } />
            <InfoRow label="Phone" value={
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {property.seller.phone}
              </span>
            } />
            {property.seller.whatsapp && (
              <InfoRow label="WhatsApp" value={property.seller.whatsapp} />
            )}
            {property.seller.email && (
              <InfoRow label="Email" value={
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {property.seller.email}
                </span>
              } />
            )}
            {property.seller.aadharNumber && (
              <InfoRow label="Aadhaar" value={
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  {property.seller.aadharNumber}
                </span>
              } />
            )}
          </SectionCard>
        )}

        {/* Submission metadata */}
        <SectionCard title="Submission Info" icon={CalendarDays}>
          <InfoRow label="Property ID" value={<span className="font-mono text-emerald-700 font-bold">{property.id}</span>} />
          <InfoRow label="Submitted" value={new Date(property.createdAt).toLocaleString('en-IN')} />
          <InfoRow label="Last Updated" value={new Date(property.updatedAt).toLocaleString('en-IN')} />
          {property.verificationStatus && (
            <>
              <InfoRow
                label="Docs Verified"
                value={`${property.verificationStatus.verifiedDocuments} / ${property.verificationStatus.totalDocuments}`}
              />
              <InfoRow
                label="Ready for Live"
                value={property.verificationStatus.isFullyVerified ? '✓ Yes — all mandatory docs verified' : '✗ No — verification pending'}
              />
            </>
          )}
        </SectionCard>

        {/* Photos summary */}
        {(property.galleryImages?.length > 0 || property.mainImage) && (
          <SectionCard title="Property Photos" icon={Layers}>
            <div className="grid grid-cols-3 gap-2">
              {[property.mainImage, ...(property.galleryImages ?? [])]
                .filter(Boolean)
                .slice(0, 9)
                .map((imgUrl, i) => {
                  const apiBase =
                    process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') ||
                    'http://localhost:5000';
                  const absUrl = imgUrl.startsWith('http') ? imgUrl : `${apiBase}${imgUrl}`;
                  return (
                    <a
                      key={i}
                      href={absUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200 hover:border-emerald-400 transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={absUrl}
                        alt={`Property photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  );
                })}
            </div>
          </SectionCard>
        )}
      </div>

      {/* Document Verification Reviewer */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileCheck className="w-5 h-5 text-emerald-700" />
          <h2 className="text-lg font-bold text-slate-900">13-Document Legal Verification</h2>
        </div>
        <DocumentVerificationReviewer
          propertyId={property.id}
          propertyTitle={property.titleEn}
        />
      </div>
    </div>
  );
}
