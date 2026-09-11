'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { MOCK_PROPERTIES } from '@/lib/mockData';
import { formatINR } from '@/lib/formatters';
import {
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Building2,
  MapPin,
  CalendarDays,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type StatusFilter = 'ALL' | 'DRAFT' | 'UNDER_REVIEW' | 'VERIFIED' | 'LIVE' | 'SOLD' | 'OFF_MARKET';
type VerifFilter = 'ALL' | 'FULLY_VERIFIED' | 'PENDING';

// ─── Listing dates (mock, since MockProperty doesn't include them) ─────────────
const LISTING_DATES: Record<string, string> = {
  'PROP-HYD-001': '2026-08-15',
  'PROP-HYD-002': '2026-08-22',
  'PROP-HYD-003': '2026-09-01',
  'PROP-HYD-004': '2026-09-05',
  'PROP-HYD-005': '2026-07-30',
  'PROP-HYD-006': '2026-07-10',
};

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
  return <span className={map[status] ?? 'badge-draft'}>{status.replace('_', ' ')}</span>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardPropertiesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [verifFilter, setVerifFilter] = useState<VerifFilter>('ALL');

  const filtered = useMemo(() => {
    return MOCK_PROPERTIES.filter((prop) => {
      // Search: title, ID, location
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hit =
          prop.title.toLowerCase().includes(q) ||
          prop.id.toLowerCase().includes(q) ||
          prop.location.village.toLowerCase().includes(q) ||
          prop.location.mandal.toLowerCase().includes(q) ||
          prop.location.district.toLowerCase().includes(q);
        if (!hit) return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && prop.status !== statusFilter) return false;
      // Verification filter
      if (verifFilter === 'FULLY_VERIFIED' && prop.verifiedDocsCount < 13) return false;
      if (verifFilter === 'PENDING' && prop.verifiedDocsCount >= 13) return false;
      return true;
    });
  }, [search, statusFilter, verifFilter]);

  const hasFilters = search.trim() || statusFilter !== 'ALL' || verifFilter !== 'ALL';

  const handleClear = () => {
    setSearch('');
    setStatusFilter('ALL');
    setVerifFilter('ALL');
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Property Listings</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage and review all brokerage property listings.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            {filtered.length} / {MOCK_PROPERTIES.length} Listings
          </span>
        </div>
      </div>

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
            <label className="sr-only">Status filter</label>
            <select
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
            <label className="sr-only">Verification filter</label>
            <select
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

      {/* Properties Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700 min-w-[700px]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">ID & Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">13-Doc Gate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Listed On</th>
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
                filtered.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* ID & Title */}
                    <td className="px-4 py-3.5 max-w-[200px]">
                      <span className="font-mono text-[11px] text-emerald-800 font-bold block">
                        {prop.id}
                      </span>
                      <span className="font-semibold text-slate-900 line-clamp-1 text-xs sm:text-sm">
                        {prop.title}
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
                      {prop.verifiedDocsCount >= 13 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          13 / 13
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px]">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          {prop.verifiedDocsCount} / 13
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={prop.status} />
                    </td>

                    {/* Listing Date */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                        <CalendarDays className="w-3 h-3" />
                        {formatDate(LISTING_DATES[prop.id] ?? '2026-01-01')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/en/properties/${prop.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary row */}
      <p className="text-xs text-slate-400 text-right">
        Showing {filtered.length} of {MOCK_PROPERTIES.length} total listings
      </p>
    </div>
  );
}
