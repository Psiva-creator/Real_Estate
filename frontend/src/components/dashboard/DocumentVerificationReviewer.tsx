'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Eye,
  Check,
  Clock,
  Loader2,
  ExternalLink,
  RefreshCw,
  Upload,
  AlertTriangle,
  X,
} from 'lucide-react';
import { VERIFIED_13_DOCS, DocumentKey } from '@/lib/constants';
import {
  getPropertyDocumentsApi,
  verifyPropertyDocumentApi,
  PropertyDocumentRecord,
  resolveUploadUrl,
} from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocumentVerificationReviewerProps {
  propertyId: string;
  propertyTitle: string;
}

type DocStatus = 'NOT_UPLOADED' | 'UPLOADED' | 'VERIFIED' | 'REJECTED' | 'PENDING';

interface DocRowState {
  status: DocStatus;
  fileUrl?: string;
  rejectionReason?: string;
  verifiedAt?: string;
  /** local UI state: which action is in-flight */
  loading?: 'VERIFIED' | 'REJECTED' | null;
  /** local success flash */
  justSaved?: boolean;
  /** local error message */
  error?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapBackendStatus(s: string): DocStatus {
  if (s === 'UPLOADED') return 'UPLOADED';
  if (s === 'VERIFIED') return 'VERIFIED';
  if (s === 'REJECTED') return 'REJECTED';
  if (s === 'PENDING') return 'PENDING';
  return 'NOT_UPLOADED';
}

function buildDocMap(records: PropertyDocumentRecord[]): Record<string, DocRowState> {
  const map: Record<string, DocRowState> = {};
  for (const r of records) {
    map[r.documentType] = {
      status: mapBackendStatus(r.status),
      fileUrl: r.fileUrl,
      rejectionReason: r.rejectionReason,
      verifiedAt: r.verifiedAt,
    };
  }
  return map;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: DocStatus }) {
  if (status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
      </span>
    );
  }
  if (status === 'REJECTED') {
    return (
      <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-xs bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
        <XCircle className="w-3.5 h-3.5" /> Rejected
      </span>
    );
  }
  if (status === 'UPLOADED') {
    return (
      <span className="inline-flex items-center gap-1 text-blue-700 font-bold text-xs bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
        <Upload className="w-3.5 h-3.5" /> Uploaded
      </span>
    );
  }
  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
        <Clock className="w-3.5 h-3.5" /> Pending
      </span>
    );
  }
  // NOT_UPLOADED
  return (
    <span className="inline-flex items-center gap-1 text-slate-500 font-semibold text-xs bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
      <AlertCircle className="w-3.5 h-3.5" /> Not Uploaded
    </span>
  );
}

// ─── Rejection Reason Modal ───────────────────────────────────────────────────

interface RejectionModalProps {
  docName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

function RejectionModal({ docName, onConfirm, onCancel }: RejectionModalProps) {
  const [reason, setReason] = useState('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 id="reject-modal-title" className="text-base font-bold text-slate-900">
              Reject Document
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{docName}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label
            htmlFor="rejection-reason"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Rejection reason <span className="text-rose-600">*</span>
          </label>
          <textarea
            id="rejection-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Document is illegible, wrong survey number, expired EC..."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
          />
          {reason.trim().length === 0 && (
            <p className="text-[11px] text-slate-400 mt-1">A reason is required to reject a document.</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (reason.trim()) onConfirm(reason.trim());
            }}
            disabled={!reason.trim()}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DocumentVerificationReviewer({
  propertyId,
  propertyTitle,
}: DocumentVerificationReviewerProps) {
  const { token, isAdmin } = useAuth();

  const [docStates, setDocStates] = useState<Record<string, DocRowState>>(() => {
    const init: Record<string, DocRowState> = {};
    VERIFIED_13_DOCS.forEach((d) => {
      init[d.key] = { status: 'NOT_UPLOADED' };
    });
    return init;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // rejection modal state
  const [rejectTarget, setRejectTarget] = useState<{ key: DocumentKey; name: string } | null>(null);

  // ── Load documents from backend ───────────────────────────────────────────
  const loadDocuments = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const records = await getPropertyDocumentsApi(token, propertyId);
      const mapped = buildDocMap(records);

      setDocStates((prev) => {
        const next = { ...prev };
        VERIFIED_13_DOCS.forEach((d) => {
          next[d.key] = mapped[d.key] ?? { status: 'NOT_UPLOADED' };
        });
        return next;
      });
    } catch (err) {
      setLoadError((err as Error).message || 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, [token, propertyId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // ── View document ──────────────────────────────────────────────────────────
  const handleViewDocument = useCallback(
    async (key: DocumentKey) => {
      const row = docStates[key];
      if (!row?.fileUrl) return;

      // fileUrl is a relative server path like /uploads/propId/doctype_filename.pdf
      // Construct absolute URL pointing to backend uploads
      const absUrl = resolveUploadUrl(row.fileUrl);

      window.open(absUrl, '_blank', 'noopener,noreferrer');
    },
    [docStates]
  );

  // ── Verify document ────────────────────────────────────────────────────────
  const handleVerify = useCallback(
    async (key: DocumentKey) => {
      if (!token || !isAdmin) return;

      setDocStates((prev) => ({
        ...prev,
        [key]: { ...prev[key], loading: 'VERIFIED', error: undefined },
      }));

      try {
        const result = await verifyPropertyDocumentApi(token, propertyId, key, 'VERIFIED');
        setDocStates((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            status: mapBackendStatus(result.document.status),
            verifiedAt: result.document.verifiedAt,
            rejectionReason: undefined,
            loading: null,
            justSaved: true,
            error: undefined,
          },
        }));
        // clear flash after 2.5 s
        setTimeout(() => {
          setDocStates((prev) => ({
            ...prev,
            [key]: { ...prev[key], justSaved: false },
          }));
        }, 2500);
      } catch (err) {
        setDocStates((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            loading: null,
            error: (err as Error).message || 'Verification failed',
          },
        }));
      }
    },
    [token, propertyId, isAdmin]
  );

  // ── Reject document (requires reason) ─────────────────────────────────────
  const handleRejectConfirm = useCallback(
    async (key: DocumentKey, reason: string) => {
      setRejectTarget(null);
      if (!token || !isAdmin) return;

      setDocStates((prev) => ({
        ...prev,
        [key]: { ...prev[key], loading: 'REJECTED', error: undefined },
      }));

      try {
        const result = await verifyPropertyDocumentApi(
          token,
          propertyId,
          key,
          'REJECTED',
          reason
        );
        setDocStates((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            status: mapBackendStatus(result.document.status),
            rejectionReason: result.document.rejectionReason,
            loading: null,
            justSaved: true,
            error: undefined,
          },
        }));
        setTimeout(() => {
          setDocStates((prev) => ({
            ...prev,
            [key]: { ...prev[key], justSaved: false },
          }));
        }, 2500);
      } catch (err) {
        setDocStates((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            loading: null,
            error: (err as Error).message || 'Rejection failed',
          },
        }));
      }
    },
    [token, propertyId, isAdmin]
  );

  // ── Derived counts ─────────────────────────────────────────────────────────
  const verifiedCount = Object.values(docStates).filter((s) => s.status === 'VERIFIED').length;
  const uploadedCount = Object.values(docStates).filter(
    (s) => s.status === 'UPLOADED' || s.status === 'VERIFIED'
  ).length;
  const totalDocs = VERIFIED_13_DOCS.length;
  const isFullyCleared = verifiedCount === totalDocs;

  return (
    <>
      {/* Rejection modal */}
      {rejectTarget && (
        <RejectionModal
          docName={rejectTarget.name}
          onConfirm={(reason) => handleRejectConfirm(rejectTarget.key, reason)}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-slate-900">13-Document Review</h2>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-[11px] rounded font-bold">
                  {propertyId}
                </span>
              </div>
              <p className="text-sm text-slate-600 line-clamp-1">{propertyTitle}</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Counters */}
              <div className="flex items-center gap-4 bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">
                <div className="text-center">
                  <span className="block text-2xl font-extrabold text-emerald-700">
                    {verifiedCount}
                    <span className="text-slate-400 text-lg">/{totalDocs}</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Verified
                  </span>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div className="text-center">
                  <span className="block text-2xl font-extrabold text-blue-700">
                    {uploadedCount}
                    <span className="text-slate-400 text-lg">/{totalDocs}</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Uploaded
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <div>
                {isFullyCleared ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Ready for Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 font-bold text-sm">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Review Pending
                  </span>
                )}
              </div>

              {/* Refresh */}
              <button
                type="button"
                onClick={loadDocuments}
                disabled={isLoading}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                title="Refresh document statuses"
                aria-label="Refresh document statuses"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Admin-only notice */}
        {!isAdmin && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              You can view documents, but only Administrators can Verify or Reject documents.
            </span>
          </div>
        )}

        {/* Load error */}
        {loadError && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
            <button
              type="button"
              onClick={loadDocuments}
              className="ml-auto text-xs font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* Document Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-slate-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              Loading document statuses…
            </div>
          )}

          {!isLoading && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 min-w-[780px]">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Document Name</th>
                    <th className="px-5 py-3">Applies To</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Current Status</th>
                    <th className="px-5 py-3 text-right">Review Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {VERIFIED_13_DOCS.map((doc) => {
                    const row = docStates[doc.key] ?? { status: 'NOT_UPLOADED' };
                    const hasFile = !!row.fileUrl;
                    const isRowLoading = !!row.loading;

                    return (
                      <tr
                        key={doc.key}
                        className={`hover:bg-slate-50/60 transition-colors ${
                          row.justSaved ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        {/* Document Name */}
                        <td className="px-5 py-3.5 max-w-[260px]">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slate-900 block text-sm leading-tight">
                                {doc.nameEn}
                              </span>
                              <span className="text-xs text-slate-500 block mt-0.5 leading-tight">
                                {doc.descEn}
                              </span>
                              {/* Rejection reason */}
                              {row.status === 'REJECTED' && row.rejectionReason && (
                                <span className="text-[11px] text-rose-600 mt-1 block font-medium">
                                  Reason: {row.rejectionReason}
                                </span>
                              )}
                              {/* Row-level error */}
                              {row.error && (
                                <span className="text-[11px] text-rose-600 mt-1 block font-medium">
                                  ⚠ {row.error}
                                </span>
                              )}
                              {/* Just saved flash */}
                              {row.justSaved && (
                                <span className="text-[11px] text-emerald-700 mt-1 block font-bold">
                                  ✓ Saved successfully
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Applies To */}
                        <td className="px-5 py-3.5">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                            {doc.appliesTo === 'BOTH' ? 'Land & Flat' : doc.appliesTo}
                          </span>
                        </td>

                        {/* Mandatory / Optional */}
                        <td className="px-5 py-3.5">
                          {doc.isMandatory ? (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded border border-rose-200">
                              Mandatory
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                              Optional
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <StatusPill status={row.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* View / Open button — shown only when file is uploaded */}
                            {hasFile ? (
                              <button
                                type="button"
                                onClick={() => handleViewDocument(doc.key)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-semibold transition-colors"
                                title="Open document in new tab"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                View
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-300 text-xs font-semibold cursor-not-allowed"
                                title="No file uploaded yet"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                No File
                              </button>
                            )}

                            <div className="w-px h-6 bg-slate-200 mx-0.5" />

                            {/* Verify button — ADMIN only, only when UPLOADED */}
                            <button
                              type="button"
                              onClick={() => handleVerify(doc.key)}
                              disabled={
                                !isAdmin ||
                                isRowLoading ||
                                row.status === 'VERIFIED' ||
                                row.status === 'NOT_UPLOADED' ||
                                row.status === 'PENDING'
                              }
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                                !isAdmin ||
                                row.status === 'VERIFIED' ||
                                row.status === 'NOT_UPLOADED' ||
                                row.status === 'PENDING'
                                  ? 'bg-emerald-50 text-emerald-400 border border-emerald-100 opacity-50 cursor-not-allowed'
                                  : 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title={
                                !isAdmin
                                  ? 'Only Admins can verify'
                                  : row.status !== 'UPLOADED'
                                  ? 'Document must be uploaded first'
                                  : 'Mark as Verified'
                              }
                            >
                              {row.loading === 'VERIFIED' ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              {row.loading === 'VERIFIED' ? 'Saving…' : 'Verify'}
                            </button>

                            {/* Reject button — ADMIN only, only when UPLOADED or VERIFIED */}
                            <button
                              type="button"
                              onClick={() =>
                                setRejectTarget({ key: doc.key, name: doc.nameEn })
                              }
                              disabled={
                                !isAdmin ||
                                isRowLoading ||
                                row.status === 'REJECTED' ||
                                row.status === 'NOT_UPLOADED' ||
                                row.status === 'PENDING'
                              }
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                                !isAdmin ||
                                row.status === 'REJECTED' ||
                                row.status === 'NOT_UPLOADED' ||
                                row.status === 'PENDING'
                                  ? 'bg-rose-50 text-rose-300 border border-rose-100 opacity-50 cursor-not-allowed'
                                  : 'bg-white border border-rose-300 text-rose-700 hover:bg-rose-50'
                              }`}
                              title={
                                !isAdmin
                                  ? 'Only Admins can reject'
                                  : row.status !== 'UPLOADED' && row.status !== 'VERIFIED'
                                  ? 'Document must be uploaded first'
                                  : 'Reject this document'
                              }
                            >
                              {row.loading === 'REJECTED' ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              {row.loading === 'REJECTED' ? 'Saving…' : 'Reject'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center flex-wrap gap-4 text-xs text-slate-500 pt-1">
          <span className="font-semibold text-slate-600">Status legend:</span>
          <StatusPill status="NOT_UPLOADED" />
          <StatusPill status="UPLOADED" />
          <StatusPill status="VERIFIED" />
          <StatusPill status="REJECTED" />
        </div>
      </div>
    </>
  );
}
