import React from 'react';
import Link from 'next/link';
import { MOCK_PROPERTIES } from '@/lib/mockData';
import { formatINR } from '@/lib/formatters';
import { ShieldCheck, CheckCircle2, AlertTriangle, Eye, ArrowRight } from 'lucide-react';
import { VERIFIED_13_DOCS } from '@/lib/constants';

export default function DashboardPropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Property Document Verification Reviewer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review 13-document revenue packets and gate listings before publishing Live.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            {MOCK_PROPERTIES.length} Listings Audited
          </span>
        </div>
      </div>

      {/* Property Review Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Listing ID & Title</th>
                <th className="px-6 py-3.5">Location & Mandal</th>
                <th className="px-6 py-3.5">Type & Price</th>
                <th className="px-6 py-3.5">13-Doc Gate</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_PROPERTIES.map((prop) => (
                <tr key={prop.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-[11px] text-emerald-800 font-bold block">
                      {prop.id}
                    </span>
                    <span className="font-semibold text-slate-900 line-clamp-1 max-w-xs">
                      {prop.title}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-800 block">
                      {prop.location.village}, {prop.location.mandal}
                    </span>
                    <span className="text-xs text-slate-500">
                      {prop.location.distanceFromOrrKm} km from ORR
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 block">
                      {formatINR(prop.pricing.totalPrice)}
                    </span>
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">
                      {prop.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      13 / 13 Cleared
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                      {prop.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/en/properties/${prop.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
