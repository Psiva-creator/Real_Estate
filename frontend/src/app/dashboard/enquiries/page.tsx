'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  ArrowRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  getEnquiriesApi,
  updateEnquiryStatusApi,
  BackendEnquiry,
  BackendEnquiryStatus,
} from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
type EnquiryStatus =
  | BackendEnquiryStatus
  | 'COMPLETED'
  | 'CANCELLED';

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

// ─── Offline Fallback Demo Leads ──────────────────────────────────────────────
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
    status: 'DEAL_CLOSED',
    agentName: 'Anita Reddy',
    date: 'Sep 05, 2026',
    notes: 'Wanted to know maintenance charges. Answered via WhatsApp.',
    priority: 'LOW',
  },
];

const AGENTS = ['Unassigned', 'Vikram Rao', 'Mahesh Kumar', 'Anita Reddy', 'Suresh Patel'];

function toBackendStatus(s: EnquiryStatus): BackendEnquiryStatus {
  if (s === 'COMPLETED') return 'DEAL_CLOSED';
  if (s === 'CANCELLED') return 'DROPPED';
  return s;
}

function transformBackendEnquiry(be: BackendEnquiry): Lead {
  const priority: Priority =
    (be.leadScore ?? 0) >= 70
      ? 'HIGH'
      : (be.leadScore ?? 0) >= 40
      ? 'MEDIUM'
      : 'LOW';

  const dateStr = be.createdAt
    ? new Date(be.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
    : 'Recent';

  return {
    id: be.id,
    buyerName: be.buyerName,
    phone: be.phone,
    propertyId: be.propertyId,
    propertyTitle: be.notes && be.notes.length > 5 ? be.notes : `Property ${be.propertyId}`,
    enquiryType: be.enquiryType,
    status: be.status,
    agentName: be.assignedTo || 'Unassigned',
    date: dateStr,
    notes: be.notes || '',
    priority,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardEnquiriesPage() {
  const { token } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Fetch real enquiries from the backend
  const fetchEnquiries = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (token) {
        const res = await getEnquiriesApi(token);
        if (res.enquiries && res.enquiries.length > 0) {
          setLeads(res.enquiries.map(transformBackendEnquiry));
        } else {
          // Real backend returned 0 records -> show empty state (no fake data)
          setLeads([]);
        }
      } else {
        // Fallback for standalone preview when unauthenticated
        setLeads(INITIAL_LEADS);
      }
    } catch (err: unknown) {
      console.error('[Enquiries] Failed to fetch enquiries from backend:', err);
      setErrorMessage((err as Error)?.message || 'Failed to load enquiries from server.');
      // Keep existing leads or fallback gracefully
      setLeads((prev) => (prev.length > 0 ? prev : INITIAL_LEADS));
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

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
      if (statusFilter !== 'ALL') {
        const matchesStatus =
          lead.status === statusFilter ||
          (statusFilter === 'DEAL_CLOSED' && lead.status === 'COMPLETED') ||
          (statusFilter === 'DROPPED' && lead.status === 'CANCELLED');
        if (!matchesStatus) return false;
      }
      if (typeFilter !== 'ALL' && lead.enquiryType !== typeFilter) return false;
      return true;
    });
  }, [leads, search, statusFilter, typeFilter]);

  // Update lead assignment (local state)
  const updateAgent = (id: string, newAgent: string) => {
    setLeads(
      leads.map((l) =>
        l.id === id
          ? {
              ...l,
              agentName: newAgent,
              status: l.status === 'NEW' && newAgent !== 'Unassigned' ? 'ASSIGNED' : l.status,
            }
          : l
      )
    );
  };

  // Update status via real backend API: PATCH /api/enquiries/:id/status
  const updateStatus = async (id: string, newStatus: EnquiryStatus) => {
    const prevLeads = [...leads];
    const backendStatus = toBackendStatus(newStatus);

    // Optimistic UI update
    setLeads(leads.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    setIsUpdatingStatus(id);
    setErrorMessage(null);

    if (token) {
      try {
        const res = await updateEnquiryStatusApi(token, id, backendStatus);
        setSuccessMessage(`Enquiry ${id} updated to ${res.enquiry?.status || newStatus}`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: unknown) {
        console.error('[Enquiries] Failed to update enquiry status on backend:', err);
        setErrorMessage((err as Error)?.message || 'Failed to update enquiry status on server');
        // Revert on error
        setLeads(prevLeads);
      } finally {
        setIsUpdatingStatus(null);
      }
    } else {
      setIsUpdatingStatus(null);
    }
  };

  // UI Helpers
  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case 'HIGH':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW':
        return 'bg-slate-100 text-slate-600 border-slate-200';
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
          <button
            type="button"
            onClick={() => fetchEnquiries()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh pipeline from backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
            {filtered.length} Active Enquiries
          </span>
        </div>
      </div>

      {/* Error & Success Feedback Banners */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-rose-100 rounded text-rose-600"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="p-1 hover:bg-emerald-100 rounded text-emerald-600"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
          <div className="relative min-w-[190px]">
            <label htmlFor="statusFilter" className="sr-only">
              Status filter
            </label>
            <select
              id="statusFilter"
              aria-label="Status filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 pl-3 pr-8 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer appearance-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="CONTACTED">Contacted</option>
              <option value="SITE_VISIT_SCHEDULED">Site Visit Scheduled</option>
              <option value="IN_NEGOTIATION">In Negotiation</option>
              <option value="DEAL_CLOSED">Deal Closed / Completed</option>
              <option value="DROPPED">Dropped / Cancelled</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Type filter */}
          <div className="relative min-w-[150px]">
            <label htmlFor="typeFilter" className="sr-only">
              Type filter
            </label>
            <select
              id="typeFilter"
              aria-label="Type filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
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
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      <span>Loading real enquiry pipeline from server...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
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
                      <span className="font-mono text-xs text-slate-500">{lead.phone}</span>
                    </td>

                    {/* Target Property */}
                    <td className="px-4 py-3.5 max-w-[200px]">
                      <span className="font-mono text-[11px] text-emerald-800 font-bold block">
                        {lead.propertyId}
                      </span>
                      <span
                        className="text-xs text-slate-600 line-clamp-2"
                        title={lead.propertyTitle}
                      >
                        {lead.propertyTitle}
                      </span>
                    </td>

                    {/* Date/Time */}
                    <td className="px-4 py-3.5 text-xs text-slate-600">{lead.date}</td>

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
                        <label htmlFor={`agentSelect-${lead.id}`} className="sr-only">
                          Assigned Agent
                        </label>
                        <select
                          id={`agentSelect-${lead.id}`}
                          aria-label="Assigned Agent"
                          value={lead.agentName}
                          onChange={(e) => updateAgent(lead.id, e.target.value)}
                          className="w-full h-8 px-2 pr-6 rounded-md bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer appearance-none"
                        >
                          {AGENTS.map((agent) => (
                            <option key={agent} value={agent}>
                              {agent}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <div className="relative">
                        <label htmlFor={`statusSelect-${lead.id}`} className="sr-only">
                          Status
                        </label>
                        <select
                          id={`statusSelect-${lead.id}`}
                          aria-label="Status"
                          value={lead.status}
                          disabled={isUpdatingStatus === lead.id}
                          onChange={(e) => updateStatus(lead.id, e.target.value as EnquiryStatus)}
                          className={`w-full h-8 px-2 pr-6 rounded-md border text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer appearance-none ${
                            lead.status === 'NEW'
                              ? 'bg-violet-50 text-violet-800 border-violet-200'
                              : lead.status === 'ASSIGNED'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : lead.status === 'CONTACTED'
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : lead.status === 'SITE_VISIT_SCHEDULED'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : lead.status === 'IN_NEGOTIATION'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : lead.status === 'COMPLETED' || lead.status === 'DEAL_CLOSED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="ASSIGNED">ASSIGNED</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="SITE_VISIT_SCHEDULED">VISIT SCHEDULED</option>
                          <option value="IN_NEGOTIATION">IN NEGOTIATION</option>
                          <option value="DEAL_CLOSED">DEAL CLOSED</option>
                          <option value="DROPPED">DROPPED</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-current opacity-70 pointer-events-none" />
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(
                          lead.priority
                        )}`}
                      >
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
