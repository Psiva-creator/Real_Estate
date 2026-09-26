'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  FileCheck,
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
    VERIFIED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    LIVE: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    UNDER_REVIEW: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    DRAFT: 'bg-slate-800 text-slate-400 border-slate-700',
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
        map[status] ?? 'bg-slate-800 text-slate-400 border-slate-700'
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
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      )}
      <div className="flex-1 min-w-[70px]">
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isComplete ? 'bg-emerald-500' : 'bg-amber-400'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="text-[10px] font-bold text-slate-400 tabular-nums shrink-0">
        {verified}/{total}
      </span>
    </div>
  );
}

// ─── Main Content Component ───────────────────────────────────────────────────

function VerificationContent() {
  const { token, isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const propertyIdParam = searchParams.get('propertyId');

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
      const list = properties as unknown as QueueProperty[];
      setQueue(list);

      // If a propertyId query parameter is provided, auto-select it
      if (propertyIdParam && list.length > 0) {
        const found = list.find((p) => p.id === propertyIdParam);
        if (found) {
          setSelected(found);
        }
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to load verification queue');
    } finally {
      setIsLoading(false);
    }
  }, [token, propertyIdParam]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  if (!isAdmin) {
    return (
      <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl text-center max-w-md mx-auto space-y-3">
        <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Lead Admin Clearance Required</h2>
        <p className="text-xs text-slate-400">
          Only Lead Platform Administrators are authorized to review and verify legal property documents.
        </p>
      </div>
    );
  }

  // ── Detail view: a property is selected ────────────────────────────────────
  if (selected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Queue
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-white leading-tight truncate">
              {selected.titleEn}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {selected.location.village}, {selected.location.mandal} ·{' '}
              <span className="font-mono text-amber-400 font-bold">{selected.id}</span>
            </p>
          </div>
          <div className="ml-auto shrink-0">
            <StatusChip status={selected.status} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <DocumentVerificationReviewer
            propertyId={selected.id}
            propertyTitle={selected.titleEn}
          />
        </div>
      </div>
    );
  }

  // ── Queue list view ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              13-Document Legal Verification Reviewer
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Audit Dharani passbooks, Pahani 30-year chain, and Encumbrance Certificates before granting final Director sign-off.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            {queue.length} {queue.length === 1 ? 'Parcel' : 'Parcels'} in Queue
          </span>
          <button
            type="button"
            onClick={loadQueue}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
            title="Refresh queue"
            aria-label="Refresh verification queue"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-12 text-slate-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
          Synchronizing 13-Doc Verification Queue…
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm">
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
        <div className="bg-slate-900 rounded-2xl p-10 border border-slate-800 shadow-xl text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Verification Queue is Clear</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All submitted properties have been reviewed. New landowner packets will appear here automatically for Director clearance.
          </p>
        </div>
      )}

      {/* Property queue list */}
      {!isLoading && queue.length > 0 && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <ul className="divide-y divide-slate-800/80" role="list">
            {queue.map((prop) => (
              <li key={prop.id}>
                <button
                  type="button"
                  onClick={() => setSelected(prop)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-800/60 transition-colors text-left group"
                >
                  {/* Type icon */}
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>

                  {/* Title & ID */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {prop.titleEn}
                      </span>
                      <StatusChip status={prop.status} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {prop.location.village}, {prop.location.mandal},{' '}
                      {prop.location.district} ·{' '}
                      <span className="font-mono text-amber-400 font-semibold">{prop.id}</span>
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
                    <span className="hidden sm:inline-block text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
                      Open Audit Packet
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
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

export default function DashboardVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center gap-2 py-12 text-slate-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
          Loading Verification Reviewer…
        </div>
      }
    >
      <VerificationContent />
    </Suspense>
  );
}
