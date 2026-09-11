'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Phone,
  MessageSquare,
  CheckCircle,
  Clock,
  UserCheck,
  Search,
  Filter,
  X,
  ChevronDown,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type EnquiryStatus = 'NEW' | 'ASSIGNED' | 'SITE_VISIT_SCHEDULED' | 'COMPLETED' | 'CANCELLED';
type EnquiryType = 'SITE_VISIT' | 'CALL' | 'QUESTION';
type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

interface Lead {
  id: string;
  buyerName: string;
  phone: string;
  propertyId: string;
  propertyTitle: string;
  enquiryType: EnquiryType;
  status: EnquiryStatus;
  agentName: string;
  date: string;
  notes: string;
  priority: Priority;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_LEADS: Lead[] = [
  {
    id: 'LEAD-001',
    buyerName: 'K. Raghunath Reddy',
    phone: '+91 98480 23456',
    propertyId: 'PROP-HYD-001',
    propertyTitle: 'Luxury 3 BHK High-Rise in Neopolis Corridor',
    enquiryType: 'SITE_VISIT',
    status: 'ASSIGNED',
    agentName: 'Vikram Rao',
    date: 'Today, 10:30 AM',
    notes: 'Buyer requested Sunday morning visit with family.',
    priority: 'HIGH',
  },
  {
    id: 'LEAD-002',
    buyerName: 'P. Venkat Ramana',
    phone: '+91 94401 56789',
    propertyId: 'PROP-HYD-003',
    propertyTitle: 'Clear Title Agricultural Farm Land near Airport',
    enquiryType: 'CALL',
    status: 'NEW',
    agentName: 'Unassigned',
    date: 'Today, 09:15 AM',
    notes: 'Enquired about Dharani passbook survey number 182/1.',
    priority: 'MEDIUM',
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
    date: 'Yesterday, 4:00 PM',
    notes: 'Site visit scheduled for Saturday 4 PM at Mokila venture gate.',
    priority: 'HIGH',
  },
  {
    id: 'LEAD-004',
    buyerName: 'Sita Lakshmi',
    phone: '+91 99887 76655',
    propertyId: 'PROP-HYD-004',
    propertyTitle: '2.5 BHK Tech Corridor Smart Residence',
    enquiryType: 'QUESTION',
    status: 'COMPLETED',
    agentName: 'Anita Reddy',
    date: 'Sep 05, 2026',
    notes: 'Wanted to know maintenance charges. Answered via WhatsApp.',
    priority: 'LOW',
  }
];

const AGENTS = ['Unassigned', 'Vikram Rao', 'Mahesh Kumar', 'Anita Reddy', 'Suresh Patel'];

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardEnquiriesPage() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<EnquiryType | 'ALL'>('ALL');

  // Filtering
  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hit =
          lead.buyerName.toLowerCase().includes(q) ||
          lead.propertyTitle.toLowerCase().includes(q) ||
          lead.propertyId.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (statusFilter !== 'ALL' && lead.status !== statusFilter) return false;
      if (typeFilter !== 'ALL' && lead.enquiryType !== typeFilter) return false;
      return true;
    });
  }, [leads, search, statusFilter, typeFilter]);

  const hasFilters = search.trim() || statusFilter !== 'ALL' || typeFilter !== 'ALL';

  const handleClear = () => {
    setSearch('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
  };

  // State updates (mock backend)
  const updateAgent = (id: string, newAgent: string) => {
    setLeads(leads.map(l => l.id === id ? {
      ...l,
      agentName: newAgent,
      status: (l.status === 'NEW' && newAgent !== 'Unassigned') ? 'ASSIGNED' : l.status
    } : l));
  };

  const updateStatus = (id: string, newStatus: EnquiryStatus) => {
    setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  // UI Helpers
  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case 'HIGH': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW': return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Buyer Lead & Enquiry Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Incoming buyer requests routed to certified deal mediators.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
            {filtered.length} Active Enquiries
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
              placeholder="Search buyer, property..."
              className="w-full h-10 pl-9 pr-9 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
          <div className="relative min-w-[170px]">
            <label htmlFor="statusFilter" className="sr-only">Status filter</label>
            <select
              id="statusFilter"
              aria-label="Status filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EnquiryStatus | 'ALL')}
              className="w-full h-10 pl-3 pr-8 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer appearance-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="SITE_VISIT_SCHEDULED">Site Visit Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Type filter */}
          <div className="relative min-w-[150px]">
            <label htmlFor="typeFilter" className="sr-only">Type filter</label>
            <select
              id="typeFilter"
              aria-label="Type filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as EnquiryType | 'ALL')}
              className="w-full h-10 pl-3 pr-8 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer appearance-none"
            >
              <option value="ALL">All Types</option>
              <option value="SITE_VISIT">Site Visit</option>
              <option value="CALL">Call Request</option>
              <option value="QUESTION">Question</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Lead Pipeline Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700 min-w-[950px]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Lead & Contact</th>
                <th className="px-4 py-3 max-w-[200px]">Target Property</th>
                <th className="px-4 py-3">Date/Time</th>
                <th className="px-4 py-3">Enquiry Type</th>
                <th className="px-4 py-3">Assigned Agent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-sm">
                    No enquiries match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Lead & Contact */}
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900 block text-sm">
                        {lead.buyerName}
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        {lead.phone}
                      </span>
                    </td>

                    {/* Target Property */}
                    <td className="px-4 py-3.5 max-w-[200px]">
                      <span className="font-mono text-[11px] text-emerald-800 font-bold block">
                        {lead.propertyId}
                      </span>
                      <span className="text-xs text-slate-600 line-clamp-2" title={lead.propertyTitle}>
                        {lead.propertyTitle}
                      </span>
                    </td>

                    {/* Date/Time */}
                    <td className="px-4 py-3.5 text-xs">
                      {lead.date}
                    </td>

                    {/* Enquiry Type */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                          lead.enquiryType === 'SITE_VISIT'
                            ? 'bg-amber-50 text-amber-900 border border-amber-200'
                            : lead.enquiryType === 'CALL'
                            ? 'bg-blue-50 text-blue-900 border border-blue-200'
                            : 'bg-purple-50 text-purple-900 border border-purple-200'
                        }`}
                      >
                        {lead.enquiryType === 'SITE_VISIT' ? (
                          <Calendar className="w-3 h-3" />
                        ) : lead.enquiryType === 'CALL' ? (
                          <Phone className="w-3 h-3" />
                        ) : (
                          <MessageSquare className="w-3 h-3" />
                        )}
                        <span>{lead.enquiryType}</span>
                      </span>
                    </td>

                    {/* Assigned Agent */}
                    <td className="px-4 py-3.5">
                       <div className="relative">
                        <label htmlFor={`agentSelect-${lead.id}`} className="sr-only">Assigned Agent</label>
                        <select
                          id={`agentSelect-${lead.id}`}
                          aria-label="Assigned Agent"
                          value={lead.agentName}
                          onChange={(e) => updateAgent(lead.id, e.target.value)}
                          className="w-full h-8 px-2 pr-6 rounded-md bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer appearance-none"
                        >
                          {AGENTS.map(agent => (
                            <option key={agent} value={agent}>{agent}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                       <div className="relative">
                        <label htmlFor={`statusSelect-${lead.id}`} className="sr-only">Status</label>
                        <select
                          id={`statusSelect-${lead.id}`}
                          aria-label="Status"
                          value={lead.status}
                          onChange={(e) => updateStatus(lead.id, e.target.value as EnquiryStatus)}
                          className={`w-full h-8 px-2 pr-6 rounded-md border text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer appearance-none ${
                            lead.status === 'NEW' ? 'bg-violet-50 text-violet-800 border-violet-200' :
                            lead.status === 'ASSIGNED' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            lead.status === 'SITE_VISIT_SCHEDULED' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            lead.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="ASSIGNED">ASSIGNED</option>
                          <option value="SITE_VISIT_SCHEDULED">VISIT SCHEDULED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-current opacity-70 pointer-events-none" />
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(lead.priority)}`}>
                        {lead.priority}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
