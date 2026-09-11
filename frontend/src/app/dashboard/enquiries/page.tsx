import React from 'react';
import Link from 'next/link';
import { Calendar, Phone, MessageSquare, CheckCircle, Clock, UserCheck } from 'lucide-react';

const MOCK_LEADS = [
  {
    id: 'LEAD-001',
    buyerName: 'K. Raghunath Reddy',
    phone: '+91 98480 23456',
    propertyId: 'PROP-HYD-001',
    propertyTitle: 'Luxury 3 BHK High-Rise in Neopolis Corridor',
    enquiryType: 'SITE_VISIT',
    status: 'ASSIGNED',
    agentName: 'Vikram Rao (Senior Broker)',
    date: 'Today, 10:30 AM',
    notes: 'Buyer requested Sunday morning visit with family and architect.',
  },
  {
    id: 'LEAD-002',
    buyerName: 'P. Venkat Ramana',
    phone: '+91 94401 56789',
    propertyId: 'PROP-HYD-003',
    propertyTitle: 'Clear Title Agricultural Farm Land near Airport',
    enquiryType: 'CALL',
    status: 'NEW',
    agentName: 'Pending Assignment',
    date: 'Today, 09:15 AM',
    notes: 'Enquired about Dharani passbook survey number 182/1.',
  },
  {
    id: 'LEAD-003',
    buyerName: 'Dr. Srinivas Murthy',
    phone: '+91 98850 88765',
    propertyId: 'PROP-HYD-002',
    propertyTitle: 'Gated Villa Plot in Shankarpally Growth Belt',
    enquiryType: 'SITE_VISIT',
    status: 'SITE_VISIT_SCHEDULED',
    agentName: 'Mahesh Kumar',
    date: 'Yesterday',
    notes: 'Site visit scheduled for Saturday 4 PM at Mokila venture gate.',
  },
];

export default function DashboardEnquiriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Buyer Lead & Site Visit Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Incoming buyer requests routed to certified deal mediators.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
            {MOCK_LEADS.length} Active Enquiries
          </span>
        </div>
      </div>

      {/* Lead Pipeline Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Lead & Contact</th>
                <th className="px-6 py-3.5">Target Property</th>
                <th className="px-6 py-3.5">Enquiry Type</th>
                <th className="px-6 py-3.5">Assigned Agent</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_LEADS.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 block">
                      {lead.buyerName}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {lead.phone}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-[11px] text-emerald-800 font-bold block">
                      {lead.propertyId}
                    </span>
                    <span className="text-xs text-slate-600 line-clamp-1 max-w-xs">
                      {lead.propertyTitle}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                        lead.enquiryType === 'SITE_VISIT'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}
                    >
                      {lead.enquiryType === 'SITE_VISIT' ? (
                        <Calendar className="w-3 h-3" />
                      ) : (
                        <Phone className="w-3 h-3" />
                      )}
                      <span>{lead.enquiryType}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-800">
                      {lead.agentName}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-xs">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-500 italic max-w-xs block truncate">
                      {lead.notes}
                    </span>
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
