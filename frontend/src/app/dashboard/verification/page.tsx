'use client';

import React from 'react';
import DocumentVerificationReviewer from '@/components/dashboard/DocumentVerificationReviewer';
import { MOCK_PROPERTIES } from '@/lib/mockData';
import { ShieldCheck } from 'lucide-react';

export default function DashboardVerificationPage() {
  // Mock selecting the first property for review
  const targetProperty = MOCK_PROPERTIES[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Verification Review Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Audit and approve the 13-document revenue packets before publishing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            1 Listing in Queue
          </span>
        </div>
      </div>

      <DocumentVerificationReviewer 
        propertyId={targetProperty.id}
        propertyTitle={targetProperty.title}
      />
    </div>
  );
}
