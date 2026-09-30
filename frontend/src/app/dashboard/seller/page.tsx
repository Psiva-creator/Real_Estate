'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  PlusCircle,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  MapPin,
  User,
  Phone,
  Mail,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getSellerProfileApi, SellerProfileResponse } from '@/lib/api';
import { VERIFIED_13_DOCS } from '@/lib/constants';
import { formatINR } from '@/lib/formatters';
import { stripInternalNotes, hasBuyerFacingDetails } from '@/lib/adminDetailsStorage';

const DOC_NAME_MAP: Record<string, string> = Object.fromEntries(
  VERIFIED_13_DOCS.map((d) => [d.key, d.nameEn])
);

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();

  const [profileData, setProfileData] = useState<SellerProfileResponse | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsedChecklists, setCollapsedChecklists] = useState<Record<string, boolean>>({});

  const fetchSellerData = useCallback(
    async (isManualRefresh = false) => {
      if (!token) return;
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoadingData(true);
      }
      try {
        const data = await getSellerProfileApi(token);
        setProfileData(data);
        setError(null);
      } catch (err: unknown) {
        console.error('[SellerDashboard] Error fetching seller data:', err);
        setError((err as Error)?.message || 'Failed to load seller submissions');
      } finally {
        setLoadingData(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/en/login?redirect=/dashboard/seller');
      return;
    }

    if (token) {
      fetchSellerData(false);
    }
  }, [token, isAuthenticated, authLoading, router, fetchSellerData]);

  const toggleChecklist = (propertyId: string) => {
    setCollapsedChecklists((prev) => ({
      ...prev,
      [propertyId]: !prev[propertyId],
    }));
  };

  if (authLoading || (loadingData && !profileData)) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 rounded-2xl w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="h-24 bg-slate-200 rounded-xl" />
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  const seller = profileData?.seller;
  const properties = profileData?.properties || [];

  const getPropertyReviewSummary = (prop: SellerProfileResponse['properties'][number]) => {
    const checklist = prop.verificationStatus?.documentsChecklist ?? [];
    const verifiedDocs =
      prop.verificationStatus?.verifiedDocuments ??
      checklist.filter((d) => d.status === 'VERIFIED').length;
    const totalDocs = prop.verificationStatus?.totalDocuments ?? 13;
    const rejectedDocs = checklist.filter((d) => d.status === 'REJECTED');
    const rejectedCount = prop.verificationStatus?.rejectedDocuments ?? rejectedDocs.length;
    const hasRejected =
      rejectedCount > 0 || prop.verificationStatus?.reviewStatus === 'REJECTED';
    const isVerified =
      !hasRejected &&
      (prop.status === 'VERIFIED' ||
        prop.status === 'LIVE' ||
        Boolean(prop.verificationStatus?.isFullyVerified) ||
        prop.verificationStatus?.reviewStatus === 'VERIFIED');
    const isLive = prop.status === 'LIVE';
    const reviewStatus: 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' = hasRejected
      ? 'REJECTED'
      : isVerified
      ? 'VERIFIED'
      : 'UNDER_REVIEW';
    const reviewLabel =
      reviewStatus === 'REJECTED'
        ? 'Rejected'
        : reviewStatus === 'VERIFIED'
        ? 'Verified'
        : 'Under Review';

    return {
      checklist,
      verifiedDocs,
      totalDocs,
      rejectedDocs,
      rejectedCount,
      hasRejected,
      isVerified,
      isLive,
      reviewStatus,
      reviewLabel,
    };
  };

  const summaries = properties.map(getPropertyReviewSummary);
  const verifiedPropsCount = summaries.filter((s) => s.reviewStatus === 'VERIFIED').length;
  const underReviewPropsCount = summaries.filter((s) => s.reviewStatus === 'UNDER_REVIEW').length;
  const rejectedPropsCount = summaries.filter((s) => s.reviewStatus === 'REJECTED').length;
  const verifiedDocsTotal = summaries.reduce((acc, s) => acc + s.verifiedDocs, 0);
  const totalDocsPossible = properties.length * 13;

  return (
    <div className="space-y-6">
      {/* Top Banner & Seller Identity */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Verified Seller Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {user?.name || seller?.name || 'Seller'}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">{user?.phone || seller?.phone || 'N/A'}</span>
            </span>
            {(user?.email || seller?.email) && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email || seller?.email}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Direct Property Owner</span>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center gap-3">
          <Link
            href="/en/list-property"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm hover:shadow transition-all"
          >
            <PlusCircle className="w-4 h-4 text-emerald-200" />
            <span>Submit Land or Apartment</span>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Submissions
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {properties.length}
            </span>
            <span className="text-xs text-slate-400">listings</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Verified
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-700">
              {verifiedPropsCount}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Approved</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Under Review
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600">
              {underReviewPropsCount}
            </span>
            {rejectedPropsCount > 0 ? (
              <span className="text-xs text-rose-600 font-semibold">
                {rejectedPropsCount} Rejected
              </span>
            ) : (
              <span className="text-xs text-amber-600 font-medium">Legal Check</span>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Docs Verified
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {properties.length > 0 ? `${verifiedDocsTotal}/${totalDocsPossible}` : verifiedDocsTotal}
            </span>
            <span className="text-xs text-slate-400">cleared</span>
          </div>
        </div>
      </div>

      {/* Submissions Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              My Property Submissions
            </h2>
            <p className="text-xs text-slate-500">
              Only you and authorized brokerage advisors can view your submitted private records.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchSellerData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <span className="text-xs font-semibold text-slate-400">
              {properties.length} {properties.length === 1 ? 'property' : 'properties'}
            </span>
          </div>
        </div>

        {error && (
          <div className="m-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {properties.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                No property listings submitted yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Submit your agricultural land, commercial parcel, or residential apartment to begin the 13-document verification process.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/en/list-property"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Your First Property</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {properties.map((prop) => {
              const {
                checklist,
                verifiedDocs,
                totalDocs,
                rejectedDocs,
                rejectedCount,
                hasRejected,
                isVerified,
                isLive,
                reviewLabel,
              } = getPropertyReviewSummary(prop);

              const progressPercent = Math.round((verifiedDocs / totalDocs) * 100);
              const underReviewDocsCount = Math.max(0, totalDocs - verifiedDocs - rejectedCount);
              const isChecklistCollapsed = Boolean(collapsedChecklists[prop.id]);

              // Staff-updated details from PostgreSQL (with internalNotes strictly stripped)
              const staffDetails = stripInternalNotes(prop.adminDetails);
              const hasStaffCuratedContent = hasBuyerFacingDetails(staffDetails);
              const cleanHighlights = staffDetails?.highlights?.filter((h) => h.trim().length > 0) ?? [];
              const cleanAmenities = staffDetails?.amenities?.filter((a) => a.trim().length > 0) ?? [];
              const cleanLocationAdvantages =
                staffDetails?.locationAdvantages?.filter((l) => l.trim().length > 0) ?? [];
              const cleanNearbyLandmarks =
                staffDetails?.nearbyLandmarks?.filter((n) => n.trim().length > 0) ?? [];
              const cleanSpecs =
                staffDetails?.additionalSpecifications?.filter(
                  (s) => s.label.trim().length > 0 && s.value.trim().length > 0
                ) ?? [];
              const cleanSpecialFeatures =
                staffDetails?.specialFeatures?.filter((f) => f.trim().length > 0) ?? [];
              const cleanCustomSections =
                staffDetails?.customSections?.filter(
                  (c) => c.title.trim().length > 0 && c.content.trim().length > 0
                ) ?? [];

              return (
                <div key={prop.id} className="p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Primary Verification Review Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            hasRejected
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : isVerified
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {hasRejected ? (
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          ) : isVerified ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                          )}
                          <span>{reviewLabel}</span>
                        </span>

                        {isLive && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            LIVE
                          </span>
                        )}

                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {prop.type}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          Ref: {prop.id.substring(0, 12)}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {prop.titleEn}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {prop.location.village}, {prop.location.mandal},{' '}
                            {prop.location.district}
                          </span>
                        </span>

                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <span>{formatINR(prop.pricing.totalPrice)}</span>
                        </span>

                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <FileText className="w-3.5 h-3.5" />
                          <span>
                            {verifiedDocs}/{totalDocs} Documents Verified ({progressPercent}%)
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Right Status & Action Controls */}
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      {hasRejected ? (
                        <span className="text-xs text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 flex items-center gap-1.5 font-semibold">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>
                            Rejected ({rejectedCount} {rejectedCount === 1 ? 'Document' : 'Documents'})
                          </span>
                        </span>
                      ) : isVerified ? (
                        <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1.5 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Under Review</span>
                        </span>
                      )}

                      {isLive && (
                        <Link
                          href={`/en/properties/${prop.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <span>View Live Listing</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleChecklist(prop.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
                      >
                        <span>{isChecklistCollapsed ? 'Show 13-Doc Status' : 'Hide 13-Doc Status'}</span>
                        {isChecklistCollapsed ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronUp className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Verification Progress Bar & Counts */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-3 font-medium">
                        <span className="text-slate-700 font-semibold">
                          Verification Progress: {verifiedDocs} of {totalDocs} Verified
                        </span>
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{verifiedDocs} Verified</span>
                        </span>
                        {rejectedCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{rejectedCount} Rejected</span>
                          </span>
                        )}
                        {underReviewDocsCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-amber-700">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{underReviewDocsCount} Under Review</span>
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-700">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          hasRejected
                            ? 'bg-rose-500'
                            : isVerified
                            ? 'bg-emerald-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.max(progressPercent, hasRejected ? 8 : 0)}%` }}
                      />
                    </div>
                  </div>

                  {/* Rejected Documents & Rejection Reasons Callout */}
                  {rejectedDocs.length > 0 && (
                    <div
                      role="alert"
                      className="rounded-xl bg-rose-50 border border-rose-200 p-4 space-y-2.5"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>
                          Rejected Documents ({rejectedDocs.length}) — Rejection Reason Details
                        </span>
                      </div>
                      <div className="space-y-2">
                        {rejectedDocs.map((doc) => {
                          const docTitle = DOC_NAME_MAP[doc.documentType] || doc.documentType;
                          return (
                            <div
                              key={doc.documentType}
                              className="bg-white rounded-lg p-3 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">{docTitle}</span>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">
                                    Rejected
                                  </span>
                                </div>
                                <p className="text-rose-800 font-medium">
                                  <span className="font-bold">Rejection Reason: </span>
                                  {doc.rejectionReason || 'Document requires correction and re-submission.'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Staff Updated Details Section (Strictly seller-safe fields from PostgreSQL) */}
                  <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 overflow-hidden">
                    <div className="px-4 py-2.5 bg-emerald-50/80 border-b border-emerald-200/70 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Staff Updated Details</span>
                      </div>
                      {staffDetails?.updatedAt && (
                        <span className="text-[11px] text-emerald-800 font-medium">
                          Updated: {new Date(staffDetails.updatedAt).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {!hasStaffCuratedContent ? (
                      <div className="p-4 text-xs text-slate-500">
                        No staff-updated details have been published for this property yet.
                      </div>
                    ) : (
                      <div className="p-4 space-y-4 text-xs">
                        {/* Project Description */}
                        {staffDetails?.projectDescription?.trim() && (
                          <div className="space-y-1">
                            <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                              Project Description
                            </div>
                            <p className="text-slate-800 whitespace-pre-line leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80">
                              {staffDetails.projectDescription}
                            </p>
                          </div>
                        )}

                        {/* Highlights */}
                        {cleanHighlights.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                              Highlights
                            </div>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {cleanHighlights.map((item, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200/80 text-slate-800"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Amenities */}
                        {cleanAmenities.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                              Amenities
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {cleanAmenities.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-full bg-white border border-emerald-200 text-emerald-900 font-medium"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Location Advantages */}
                        {cleanLocationAdvantages.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                              Location Advantages
                            </div>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {cleanLocationAdvantages.map((item, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200/80 text-slate-800"
                                >
                                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Nearby Landmarks */}
                        {cleanNearbyLandmarks.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                              Nearby Landmarks
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {cleanNearbyLandmarks.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Additional Specifications */}
                        {cleanSpecs.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                              Additional Specifications
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {cleanSpecs.map((spec, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white p-2.5 rounded-lg border border-slate-200/80"
                                >
                                  <div className="text-[10px] font-semibold text-slate-500 uppercase">
                                    {spec.label}
                                  </div>
                                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                                    {spec.value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Special Features */}
                        {cleanSpecialFeatures.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                              Special Features
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {cleanSpecialFeatures.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-900 font-semibold"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pricing Notes */}
                        {staffDetails?.pricingNotes?.trim() && (
                          <div className="space-y-1">
                            <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                              Pricing Notes
                            </div>
                            <p className="text-slate-800 whitespace-pre-line bg-white p-3 rounded-lg border border-slate-200/80">
                              {staffDetails.pricingNotes}
                            </p>
                          </div>
                        )}

                        {/* Site Visit Instructions */}
                        {staffDetails?.siteVisitInstructions?.trim() && (
                          <div className="space-y-1">
                            <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                              Site Visit Instructions
                            </div>
                            <p className="text-slate-800 whitespace-pre-line bg-white p-3 rounded-lg border border-slate-200/80">
                              {staffDetails.siteVisitInstructions}
                            </p>
                          </div>
                        )}

                        {/* Additional Notes */}
                        {staffDetails?.additionalNotes?.trim() && (
                          <div className="space-y-1">
                            <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                              Additional Notes
                            </div>
                            <p className="text-slate-800 whitespace-pre-line bg-white p-3 rounded-lg border border-slate-200/80">
                              {staffDetails.additionalNotes}
                            </p>
                          </div>
                        )}

                        {/* Custom Sections */}
                        {cleanCustomSections.length > 0 && (
                          <div className="space-y-2">
                            <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                              Custom Sections
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {cleanCustomSections.map((sec, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white p-3 rounded-lg border border-slate-200/80 space-y-1"
                                >
                                  <div className="font-bold text-slate-900">{sec.title}</div>
                                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                                    {sec.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 13-Document Verification Status Breakdown */}
                  {!isChecklistCollapsed && checklist.length > 0 && (
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span>13-Document Verification Status</span>
                        <span>
                          {verifiedDocs}/{totalDocs} Verified
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100 grid grid-cols-1 md:grid-cols-2">
                        {VERIFIED_13_DOCS.map((docMeta) => {
                          const docRecord = checklist.find(
                            (d) => d.documentType === docMeta.key
                          );
                          const status = docRecord?.status || 'PENDING';
                          const isDocVerified = status === 'VERIFIED';
                          const isDocRejected = status === 'REJECTED';

                          return (
                            <div
                              key={docMeta.key}
                              className={`p-3 flex items-start justify-between gap-3 text-xs ${
                                isDocRejected
                                  ? 'bg-rose-50/40'
                                  : isDocVerified
                                  ? 'bg-emerald-50/20'
                                  : 'bg-white'
                              }`}
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                                    {docMeta.id}
                                  </span>
                                  <span className="font-semibold text-slate-800 truncate">
                                    {docMeta.nameEn}
                                  </span>
                                </div>
                                {isDocRejected && docRecord?.rejectionReason && (
                                  <p className="text-rose-700 font-medium pl-7">
                                    <span className="font-semibold">Reason: </span>
                                    {docRecord.rejectionReason}
                                  </p>
                                )}
                              </div>

                              <div className="shrink-0">
                                {isDocVerified ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Verified</span>
                                  </span>
                                ) : isDocRejected ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200">
                                    <XCircle className="w-3 h-3 text-rose-600" />
                                    <span>Rejected</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>Under Review</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security Notice for Sellers */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-800">Direct Contact & Legal Privacy Guarantee</span>
          <p className="leading-relaxed">
            Your mobile number, Aadhaar, and revenue documents are never exposed to public viewers or unauthorized third parties. All inquiries are screened by certified deal mediators.
          </p>
        </div>
      </div>
    </div>
  );
}
