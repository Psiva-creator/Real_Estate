'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  const classMap: Record<string, string> = {
    VERIFIED:     'bg-[#EDE6DA] text-[#3A241C] border border-[#C79A6B]',
    LIVE:         'bg-[#EDE6DA] text-[#5A382B] border border-[#C79A6B]',
    UNDER_REVIEW: 'bg-amber-100 text-amber-800 border border-amber-200',
    DRAFT:        'bg-[#F5F0E8] text-[#8B624C] border border-[#E2CFB6]',
  };
  const defaultClass = 'bg-[#F5F0E8] text-[#8B624C] border border-[#E2CFB6]';
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
        classMap[status] ?? defaultClass
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
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      )}
      <div className="flex-1 min-w-[70px]">
        <div className="h-1.5 rounded-full overflow-hidden bg-[#E2CFB6]">
          <div
            className={`h-full rounded-full transition-all ${
              isComplete ? 'bg-emerald-600' : 'bg-amber-600'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="text-[10px] font-bold tabular-nums shrink-0 text-[#8B624C]">
        {verified}/{total}
      </span>
    </div>
  );
}

// ─── Main Content Component ───────────────────────────────────────────────────

function VerificationContent() {
  const router = useRouter();
  const { token, isAdmin, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const propertyIdParam = searchParams.get('propertyId');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace('/en/trh-internal-desk');
    }
  }, [authLoading, isAdmin, router]);

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
      <div className="rounded-2xl p-8 text-center max-w-md mx-auto space-y-3 bg-white border border-[#E2CFB6] shadow-sm">
        <XCircle className="w-10 h-10 text-rose-700 mx-auto" />
        <h2 className="text-lg font-bold text-[#201512]">Lead Admin Clearance Required</h2>
        <p className="text-xs text-[#6D4D3A]">
          Only Lead Platform Administrators are authorized to review and verify legal property documents.
        </p>
      </div>
    );
  }

  // ── Detail view: a property is selected ────────────────────────────────────
  if (selected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-[#E2CFB6] shadow-sm">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors text-[#5A382B] bg-[#F5F0E8] hover:bg-[#E2CFB6] border border-[#E2CFB6]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Queue
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold leading-tight truncate text-[#201512]">
              {selected.titleEn}
            </h1>
            <p className="text-xs mt-0.5 text-[#8B624C]">
              {selected.location.village}, {selected.location.mandal} ·{' '}
              <span className="font-mono font-bold text-[#8C653E]">{selected.id}</span>
            </p>
          </div>
          <div className="ml-auto shrink-0">
            <StatusChip status={selected.status} />
          </div>
        </div>

        <div className="rounded-2xl p-6 bg-white border border-[#E2CFB6] shadow-sm">
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
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight text-[#201512]">
              13-Document Legal Verification Reviewer
            </h1>
          </div>
          <p className="text-xs sm:text-sm mt-1 text-[#6D4D3A]">
            Audit Dharani passbooks, Pahani 30-year chain, and Encumbrance Certificates before granting final Director sign-off.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#F5F0E8] text-[#5A382B] border border-[#C79A6B]">
            <ShieldCheck className="w-4 h-4 text-[#8C653E]" />
            {queue.length} {queue.length === 1 ? 'Parcel' : 'Parcels'} in Queue
          </span>
          <button
            type="button"
            onClick={loadQueue}
            disabled={isLoading}
            className="p-2 rounded-xl transition-colors disabled:opacity-50 bg-[#F5F0E8] hover:bg-[#E2CFB6] border border-[#E2CFB6] text-[#8B624C]"
            title="Refresh queue"
            aria-label="Refresh verification queue"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#8B624C]">
          <Loader2 className="w-5 h-5 animate-spin text-[#C79A6B]" />
          Synchronizing 13-Doc Verification Queue…
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm bg-rose-50 border border-rose-200 text-rose-800">
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
        <div className="rounded-2xl p-10 text-center space-y-3 bg-white border border-[#E2CFB6] shadow-sm">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" />
          <h2 className="text-lg font-bold text-[#201512]">Verification Queue is Clear</h2>
          <p className="text-xs max-w-sm mx-auto text-[#6D4D3A]">
            All submitted properties have been reviewed. New landowner packets will appear here automatically for Director clearance.
          </p>
        </div>
      )}

      {/* Property queue list */}
      {!isLoading && queue.length > 0 && (
        <div className="rounded-2xl overflow-hidden bg-white border border-[#E2CFB6] shadow-sm">
          <ul className="divide-y divide-[#E2CFB6]" role="list">
            {queue.map((prop) => (
              <li key={prop.id}>
                <button
                  type="button"
                  onClick={() => setSelected(prop)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#F5F0E8] transition-colors text-left group"
                >
                  {/* Type icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#F5F0E8] border border-[#C79A6B] text-[#8C653E]">
                    <FileCheck className="w-5 h-5" />
                  </div>

                  {/* Title & ID */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm line-clamp-1 transition-colors text-[#201512]">
                        {prop.titleEn}
                      </span>
                      <StatusChip status={prop.status} />
                    </div>
                    <p className="text-[11px] mt-0.5 text-[#8B624C]">
                      {prop.location.village}, {prop.location.mandal},{' '}
                      {prop.location.district} ·{' '}
                      <span className="font-mono font-semibold text-[#8C653E]">{prop.id}</span>
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
                    <span className="hidden sm:inline-block text-xs font-bold text-[#8C653E]">
                      Open Audit Packet
                    </span>
                    <ChevronRight className="w-5 h-5 text-[#C79A6B]" />
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
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#8B624C]">
          <Loader2 className="w-5 h-5 animate-spin text-[#C79A6B]" />
          Loading Verification Reviewer…
        </div>
      }
    >
      <VerificationContent />
    </Suspense>
  );
}
