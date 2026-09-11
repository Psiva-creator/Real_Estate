'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Eye,
  Check,
  Clock
} from 'lucide-react';
import { VERIFIED_13_DOCS, DocumentKey } from '@/lib/constants';

interface DocumentVerificationReviewerProps {
  propertyId: string;
  propertyTitle: string;
  // Mocking initial state from backend
  initialDocs?: Record<string, { status: 'PENDING' | 'APPROVED' | 'REJECTED'; url: string }>;
}

export default function DocumentVerificationReviewer({
  propertyId,
  propertyTitle,
  initialDocs = {}
}: DocumentVerificationReviewerProps) {
  // Initialize state with all 13 docs as PENDING if not provided
  const [docStatuses, setDocStatuses] = useState<Record<string, 'PENDING' | 'APPROVED' | 'REJECTED'>>(() => {
    const initialState: Record<string, 'PENDING' | 'APPROVED' | 'REJECTED'> = {};
    VERIFIED_13_DOCS.forEach(doc => {
      initialState[doc.key] = initialDocs[doc.key]?.status || 'PENDING';
    });
    return initialState;
  });

  const handleUpdateStatus = (key: DocumentKey, newStatus: 'APPROVED' | 'REJECTED') => {
    setDocStatuses(prev => ({
      ...prev,
      [key]: newStatus
    }));
  };

  const approvedCount = Object.values(docStatuses).filter(s => s === 'APPROVED').length;
  const totalDocs = VERIFIED_13_DOCS.length;
  const isFullyCleared = approvedCount === totalDocs;

  return (
    <div className="space-y-6">
      {/* Header */}
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

          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="text-center">
              <span className="block text-2xl font-extrabold text-emerald-700">
                {approvedCount}<span className="text-slate-400 text-lg">/{totalDocs}</span>
              </span>
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Cleared</span>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
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
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 min-w-[700px]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Document Name</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Current Status</th>
                <th className="px-5 py-3 text-right">Review Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {VERIFIED_13_DOCS.map(doc => {
                const status = docStatuses[doc.key];
                return (
                  <tr key={doc.key} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 max-w-[300px]">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-900 block truncate">
                            {doc.nameEn}
                          </span>
                          <span className="text-xs text-slate-500 block truncate">
                            {doc.descEn}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                       {doc.isMandatory ? (
                         <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded">Mandatory</span>
                       ) : (
                         <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">Optional</span>
                       )}
                    </td>
                    <td className="px-5 py-3.5">
                      {status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      )}
                      {status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-xs bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" /> Rejected
                        </span>
                      )}
                      {status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <div className="w-px h-6 bg-slate-200 mx-1" />

                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(doc.key, 'APPROVED')}
                          disabled={status === 'APPROVED'}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                            status === 'APPROVED' 
                            ? 'bg-emerald-100 text-emerald-800 opacity-50 cursor-not-allowed'
                            : 'bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(doc.key, 'REJECTED')}
                          disabled={status === 'REJECTED'}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                            status === 'REJECTED' 
                            ? 'bg-rose-100 text-rose-800 opacity-50 cursor-not-allowed'
                            : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
