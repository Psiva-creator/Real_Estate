'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  PlusCircle,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin,
  IndianRupee,
  User,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getSellerProfileApi, SellerProfileResponse } from '@/lib/api';
import { formatINR } from '@/lib/formatters';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();

  const [profileData, setProfileData] = useState<SellerProfileResponse | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/en/login?redirect=/dashboard/seller');
      return;
    }

    if (token) {
      setLoadingData(true);
      getSellerProfileApi(token)
        .then((data) => {
          setProfileData(data);
          setError(null);
        })
        .catch((err) => {
          console.error('[SellerDashboard] Error fetching seller data:', err);
          setError(err.message || 'Failed to load seller submissions');
        })
        .finally(() => {
          setLoadingData(false);
        });
    }
  }, [token, isAuthenticated, authLoading, router]);

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

  const liveCount = properties.filter((p) => p.status === 'LIVE').length;
  const reviewCount = properties.filter((p) => p.status === 'UNDER_REVIEW' || p.status === 'DRAFT').length;
  const verifiedDocsTotal = properties.reduce(
    (acc, p) => acc + (p.verificationStatus?.verifiedDocuments || 0),
    0
  );

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
            Live on Market
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-700">{liveCount}</span>
            <span className="text-xs text-emerald-600 font-medium">Public</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Under Review
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600">{reviewCount}</span>
            <span className="text-xs text-amber-600 font-medium">Legal Check</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Docs Verified
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {verifiedDocsTotal}
            </span>
            <span className="text-xs text-slate-400">cleared</span>
          </div>
        </div>
      </div>

      {/* Submissions Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              My Property Submissions
            </h2>
            <p className="text-xs text-slate-500">
              Only you and authorized brokerage advisors can view your submitted private records.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </span>
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
          <div className="divide-y divide-slate-100">
            {properties.map((prop) => {
              const verifiedDocs = prop.verificationStatus?.verifiedDocuments ?? 0;
              const totalDocs = prop.verificationStatus?.totalDocuments ?? 13;
              const isLive = prop.status === 'LIVE';

              return (
                <div
                  key={prop.id}
                  className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isLive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {prop.status.replace('_', ' ')}
                      </span>
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

                      <span className="flex items-center gap-1 text-emerald-700 font-medium">
                        <FileText className="w-3.5 h-3.5" />
                        <span>
                          {verifiedDocs}/{totalDocs} Documents Verified
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {isLive ? (
                      <Link
                        href={`/en/properties/${prop.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <span>View Live Listing</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Legal Audit in Progress</span>
                      </span>
                    )}
                  </div>
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
