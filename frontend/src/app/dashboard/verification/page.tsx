'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Loader2,
  AlertCircle,
  Building2,
  MapPin,
  ChevronRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getAdminPropertiesApi } from '@/lib/api';
import DocumentVerificationReviewer from '@/components/dashboard/DocumentVerificationReviewer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QueueProperty {
  id: string;
  type: string;
  status: string;
  titleEn: string;
  location: { village: string; mandal: string; district: string };
  verificationStatus?: {
    totalDocuments: number;
    verifiedDocuments: number;
    isFullyVerified: boolean;
  };
}

// ─── Status chip ─────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    VERIFIED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    LIVE: 'bg-blue-100 text-blue-800 border-blue-200',
    UNDER_REVIEW: 'bg-amber-100 text-amber-800 border-amber-200',
    DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
        map[status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

// ─── Doc progress bar ─────────────────────────────────────────────────────────

function DocProgress({ verified, total }: { verified: number; total: number }) {
  const pct = total > 0 ? Math.round((verified / total) * 100) : 0;
  const isComplete = verified >= total && total > 0;
  return (
    <div className="flex items-center gap-2">
      {isComplete ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
      ) : (
        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
      )}
      <div className="flex-1 min-w-[80px]">
        <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isComplete ? 'bg-emerald-500' : 'bg-amber-400'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="text-[11px] font-bold text-slate-600 tabular-nums shrink-0">
        {verified}/{total}
      </span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardVerificationPage() {
  const { token, isStaff } = useAuth();

  const [queue, setQueue] = useState<QueueProperty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<QueueProperty | null>(null);

  const loadQueue = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      // Fetch UNDER_REVIEW properties – these are the ones needing verification
      const { properties } = await getAdminPropertiesApi(token, 'UNDER_REVIEW');
      setQueue(properties as unknown as QueueProperty[]);
    } catch (err) {
      setError((err as Error).message || 'Failed to load verification queue');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  if (!isStaff) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center max-w-md mx-auto space-y-3">
        <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-600">
          Only Admin and Agent users can access the verification review queue.
        </p>
      </div>
    );
  }

  // ── Detail view: a property is selected ────────────────────────────────────
  if (selected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 px-3 py-2 rounded-lg border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Queue
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">{selected.titleEn}</h1>
            <p className="text-xs text-slate-500">
              {selected.location.village}, {selected.location.mandal} ·{' '}
              <span className="font-mono text-emerald-700 font-bold">{selected.id}</span>
            </p>
          </div>
          <div className="ml-auto">
            <StatusChip status={selected.status} />
          </div>
        </div>

        <DocumentVerificationReviewer
          propertyId={selected.id}
          propertyTitle={selected.titleEn}
        />
      </div>
    );
  }

  // ── Queue list view ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Verification Review Queue</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Audit and approve the 13-document revenue packets before publishing properties live.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {queue.length} {queue.length === 1 ? 'Listing' : 'Listings'} in Queue
          </span>
          <button
            type="button"
            onClick={loadQueue}
            disabled={isLoading}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50"
            title="Refresh queue"
            aria-label="Refresh verification queue"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-12 text-slate-500 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          Loading verification queue…
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={loadQueue}
            className="ml-auto text-xs font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && queue.length === 0 && (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Queue is clear</h2>
          <p className="text-sm text-slate-500">
            No properties are currently pending verification review. New submissions will appear
            here automatically.
          </p>
        </div>
      )}

      {/* Property queue list */}
      {!isLoading && queue.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <ul className="divide-y divide-slate-100" role="list">
            {queue.map((prop) => (
              <li key={prop.id}>
                <button
                  type="button"
                  onClick={() => setSelected(prop)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50/70 transition-colors text-left group"
                >
                  {/* Type icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      prop.type === 'LAND'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {prop.type === 'LAND' ? (
                      <MapPin className="w-5 h-5" />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                  </div>

                  {/* Title & ID */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-emerald-800 transition-colors">
                        {prop.titleEn}
                      </span>
                      <StatusChip status={prop.status} />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {prop.location.village}, {prop.location.mandal},{' '}
                      {prop.location.district} ·{' '}
                      <span className="font-mono text-emerald-700 font-semibold">{prop.id}</span>
                    </p>
                    {/* Doc progress */}
                    <div className="mt-1.5 max-w-[200px]">
                      <DocProgress
                        verified={prop.verificationStatus?.verifiedDocuments ?? 0}
                        total={prop.verificationStatus?.totalDocuments ?? 13}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block text-xs font-semibold text-emerald-700 group-hover:text-emerald-900 transition-colors">
                      Review
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
