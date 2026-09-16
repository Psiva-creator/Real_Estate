'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/formatters';
import { useAuth } from '@/lib/auth-context';
import { getAdminPropertiesApi } from '@/lib/api';
import {
  ShieldCheck,
  Search,
  Filter,
  FileCheck,
  Building2,
  MapPin,
  CalendarDays,
  X,
  AlertTriangle,
  ChevronDown,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type StatusFilter = 'ALL' | 'DRAFT' | 'UNDER_REVIEW' | 'VERIFIED' | 'LIVE' | 'SOLD' | 'OFF_MARKET';
type VerifFilter = 'ALL' | 'FULLY_VERIFIED' | 'PENDING';

interface AdminProperty {
  id: string;
  type: string;
  status: string;
  titleEn: string;
  location: { village: string; mandal: string; district: string };
  pricing: { totalPrice: number; isNegotiable: boolean };
  createdAt: string;
  verificationStatus?: {
    totalDocuments: number;
    verifiedDocuments: number;
    isFullyVerified: boolean;
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    VERIFIED: 'badge-verified',
    LIVE: 'badge-live',
    UNDER_REVIEW: 'badge-review',
    DRAFT: 'badge-draft',
    SOLD: 'badge-sold',
    OFF_MARKET: 'badge-draft',
  };
  return <span className={map[status] ?? 'badge-draft'}>{status.replace(/_/g, ' ')}</span>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardPropertiesPage() {
  const { token, isStaff } = useAuth();

  const [allProperties, setAllProperties] = useState<AdminProperty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [verifFilter, setVerifFilter] = useState<VerifFilter>('ALL');

  // ── Fetch from backend ────────────────────────────────────────────────────
  const loadProperties = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const { properties } = await getAdminPropertiesApi(token);
      setAllProperties(properties as unknown as AdminProperty[]);
    } catch (err) {
      setLoadError((err as Error).message || 'Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return allProperties.filter((prop) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hit =
          prop.titleEn.toLowerCase().includes(q) ||
          prop.id.toLowerCase().includes(q) ||
          prop.location.village.toLowerCase().includes(q) ||
          prop.location.mandal.toLowerCase().includes(q) ||
          prop.location.district.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (statusFilter !== 'ALL' && prop.status !== statusFilter) return false;
      const verified = prop.verificationStatus?.verifiedDocuments ?? 0;
      const total = prop.verificationStatus?.totalDocuments ?? 13;
      if (verifFilter === 'FULLY_VERIFIED' && verified < total) return false;
      if (verifFilter === 'PENDING' && verified >= total) return false;
      return true;
    });
  }, [allProperties, search, statusFilter, verifFilter]);

  const hasFilters = search.trim() || statusFilter !== 'ALL' || verifFilter !== 'ALL';

  const handleClear = () => {
    setSearch('');
    setStatusFilter('ALL');
    setVerifFilter('ALL');
  };

  // ── Access guard ──────────────────────────────────────────────────────────
  if (!isStaff) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center max-w-md mx-auto space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-600">
          Only Admin and Agent users can access the internal property listings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Property Listings</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Internal view of all submitted properties — seller details and documents are private.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            {filtered.length} / {allProperties.length} Listings
          </span>
          <button
            type="button"
            onClick={loadProperties}
            disabled={isLoading}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50"
            title="Refresh listings"
            aria-label="Refresh listings"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-12 text-slate-500 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          Loading properties from backend…
        </div>
      )}

      {/* Error */}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{loadError}</span>
          <button
            type="button"
            onClick={loadProperties}
            className="ml-auto text-xs font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Search & Filters */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, ID, or location…"
                  className="w-full h-10 pl-9 pr-9 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status filter */}
              <div className="relative min-w-[160px]">
                <label htmlFor="statusFilter" className="sr-only">Status filter</label>
                <select
                  id="statusFilter"
                  aria-label="Status filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full h-10 pl-3 pr-8 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer appearance-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="LIVE">Live</option>
                  <option value="SOLD">Sold</option>
                  <option value="OFF_MARKET">Off Market</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Verification filter */}
              <div className="relative min-w-[170px]">
                <label htmlFor="verifFilter" className="sr-only">Verification filter</label>
                <select
                  id="verifFilter"
                  aria-label="Verification filter"
                  value={verifFilter}
                  onChange={(e) => setVerifFilter(e.target.value as VerifFilter)}
                  className="w-full h-10 pl-3 pr-8 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer appearance-none"
                >
                  <option value="ALL">All Verifications</option>
                  <option value="FULLY_VERIFIED">13-Doc Cleared</option>
                  <option value="PENDING">Docs Pending</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Filter className="w-3.5 h-3.5" /> Filters:
                </span>
                {search.trim() && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                    &ldquo;{search.trim()}&rdquo;
                  </span>
                )}
                {statusFilter !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium">
                    Status: {statusFilter}
                  </span>
                )}
                {verifFilter !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs font-medium">
                    {verifFilter === 'FULLY_VERIFIED' ? '13-Doc Cleared' : 'Docs Pending'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-slate-300 text-slate-500 hover:text-slate-700 text-xs font-medium transition-colors"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              </div>
            )}
          </div>

          {/* Empty state */}
          {allProperties.length === 0 && !loadError && (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center space-y-3">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h2 className="text-lg font-bold text-slate-900">No properties yet</h2>
              <p className="text-sm text-slate-500">
                Property submissions from sellers will appear here.
              </p>
            </div>
          )}

          {/* Properties Table */}
          {allProperties.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-700 min-w-[760px]">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">ID &amp; Title</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">13-Doc Gate</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">
                          No properties match your filters.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((prop) => {
                        const verified = prop.verificationStatus?.verifiedDocuments ?? 0;
                        const total = prop.verificationStatus?.totalDocuments ?? 13;
                        return (
                          <tr key={prop.id} className="hover:bg-slate-50/60 transition-colors">
                            {/* ID & Title */}
                            <td className="px-4 py-3.5 max-w-[220px]">
                              <span className="font-mono text-[11px] text-emerald-800 font-bold block">
                                {prop.id}
                              </span>
                              <span className="font-semibold text-slate-900 line-clamp-1 text-xs sm:text-sm">
                                {prop.titleEn}
                              </span>
                            </td>

                            {/* Type */}
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                                  prop.type === 'LAND'
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {prop.type === 'LAND' ? (
                                  <MapPin className="w-3 h-3" />
                                ) : (
                                  <Building2 className="w-3 h-3" />
                                )}
                                {prop.type}
                              </span>
                            </td>

                            {/* Location */}
                            <td className="px-4 py-3.5">
                              <span className="font-medium text-slate-800 block text-xs">
                                {prop.location.village}, {prop.location.mandal}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {prop.location.district}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="px-4 py-3.5">
                              <span className="font-bold text-slate-900 block">
                                {formatINR(prop.pricing.totalPrice)}
                              </span>
                              {prop.pricing.isNegotiable && (
                                <span className="text-[11px] text-slate-400">Negotiable</span>
                              )}
                            </td>

                            {/* 13-Doc Gate */}
                            <td className="px-4 py-3.5">
                              {verified >= total && total > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  {verified}/{total}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px]">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  {verified}/{total}
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5">
                              <StatusBadge status={prop.status} />
                            </td>

                            {/* Submitted date */}
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                                <CalendarDays className="w-3 h-3" />
                                {formatDate(prop.createdAt)}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-right">
                              <Link
                                href={`/dashboard/properties/${prop.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                                title="Open internal review — seller details and documents"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                <span>Review</span>
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary row */}
          {allProperties.length > 0 && (
            <p className="text-xs text-slate-400 text-right">
              Showing {filtered.length} of {allProperties.length} total listings
            </p>
          )}
        </>
      )}
    </div>
  );
}
