'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Download,
  Send,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  getEnquiriesApi,
  updateEnquiryStatusApi,
  getProperties,
  getPropertyById,
  BackendEnquiry,
  BackendEnquiryStatus,
} from '@/lib/api';
import { MOCK_PROPERTIES } from '@/lib/mockData';

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
  propertyTitleTe?: string;
  propertyRef?: string;
  propertyUrl?: string;
  enquiryType: EnquiryType;
  status: EnquiryStatus;
  agentName: string;
  date: string;
  notes: string;
  priority: Priority;
}

export interface PropertyLookup {
  id: string;
  titleEn: string;
  titleTe?: string;
  ref: string;
  url: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(str: string): boolean {
  return UUID_REGEX.test(str.trim());
}

function getCleanPropertyRef(propertyId: string): string {
  if (!propertyId) return '#PROP';
  if (propertyId.startsWith('PROP-')) return propertyId;
  if (isUuid(propertyId)) return `#${propertyId.slice(0, 8).toUpperCase()}`;
  return propertyId.length > 8 ? `#${propertyId.slice(0, 8).toUpperCase()}` : `#${propertyId}`;
}

function resolveAgentName(assignedTo: string | undefined | null, currentUserName?: string): string {
  if (!assignedTo || assignedTo === 'Unassigned') {
    return currentUserName || 'Suresh Reddy (Senior Land Advisor)';
  }
  if (isUuid(assignedTo)) {
    return currentUserName || 'Suresh Reddy (Senior Land Advisor)';
  }
  return assignedTo;
}

// ─── Offline Fallback Demo Leads ──────────────────────────────────────────────
const INITIAL_LEADS: Lead[] = [
  {
    id: 'LEAD-001',
    buyerName: 'K. Raghunath Reddy',
    phone: '+91 98480 23456',
    propertyId: 'PROP-HYD-001',
    propertyTitle: 'Luxury 3 BHK High-Rise in Neopolis Corridor',
    propertyTitleTe: 'నియోపోలిస్ కారిడార్‌లో లగ్జరీ 3 BHK హై-రైజ్',
    propertyRef: 'PROP-HYD-001',
    propertyUrl: 'https://frontend-six-psi-ecroth2n1r.vercel.app/en/properties/PROP-HYD-001',
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
    propertyTitleTe: 'ఎయిర్‌పోర్ట్ సమీపంలో క్లియర్ టైటిల్ వ్యవసాయ భూమి',
    propertyRef: 'PROP-HYD-003',
    propertyUrl: 'https://frontend-six-psi-ecroth2n1r.vercel.app/en/properties/PROP-HYD-003',
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
    propertyTitleTe: 'శంకర్‌పల్లి గ్రోత్ బెల్ట్‌లో గేటెడ్ విల్లా ప్లాట్',
    propertyRef: 'PROP-HYD-002',
    propertyUrl: 'https://frontend-six-psi-ecroth2n1r.vercel.app/en/properties/PROP-HYD-002',
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
    propertyTitleTe: 'టెక్ కారిడార్‌లో 2.5 BHK స్మార్ట్ రెసిడెన్స్',
    propertyRef: 'PROP-HYD-004',
    propertyUrl: 'https://frontend-six-psi-ecroth2n1r.vercel.app/en/properties/PROP-HYD-004',
    enquiryType: 'QUESTION',
    status: 'DEAL_CLOSED',
    agentName: 'Anita Reddy',
    date: 'Sep 05, 2026',
    notes: 'Wanted to know maintenance charges. Answered via WhatsApp.',
    priority: 'LOW',
  },
];

const BASE_AGENTS = ['Unassigned', 'Vikram Rao', 'Mahesh Kumar', 'Anita Reddy', 'Suresh Patel'];

function toBackendStatus(s: EnquiryStatus): BackendEnquiryStatus {
  if (s === 'COMPLETED') return 'DEAL_CLOSED';
  if (s === 'CANCELLED') return 'DROPPED';
  return s;
}

function transformBackendEnquiry(
  be: BackendEnquiry,
  propertyMap?: Record<string, PropertyLookup>,
  currentUserName?: string
): Lead {
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

  const ref = getCleanPropertyRef(be.propertyId);
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://frontend-six-psi-ecroth2n1r.vercel.app';

  // Check lookup map first
  const prop = propertyMap ? propertyMap[be.propertyId] : undefined;
  let cleanTitle = prop?.titleEn;
  const cleanTitleTe = prop?.titleTe;

  if (!cleanTitle) {
    // Check if first line of notes has a real title (not slot timing or dates)
    if (
      be.notes &&
      !be.notes.toLowerCase().includes('booked slot') &&
      !be.notes.toLowerCase().includes('preferred date') &&
      !be.notes.startsWith('[')
    ) {
      const firstLine = be.notes.split('\n')[0].split('|')[0].trim();
      if (firstLine.length > 3 && !firstLine.includes('http') && !isUuid(firstLine)) {
        cleanTitle = firstLine.substring(0, 70);
      }
    }
  }

  if (!cleanTitle) {
    cleanTitle = `Verified Telangana Realty Listing (${ref})`;
  }

  const propertyUrl = prop?.url || `${origin}/en/properties/${be.propertyId}`;
  const agentName = resolveAgentName(be.assignedTo, currentUserName);

  return {
    id: be.id,
    buyerName: be.buyerName,
    phone: be.phone,
    propertyId: be.propertyId,
    propertyTitle: cleanTitle,
    propertyTitleTe: cleanTitleTe || cleanTitle,
    propertyRef: ref,
    propertyUrl,
    enquiryType: be.enquiryType,
    status: be.status,
    agentName,
    date: dateStr,
    notes: be.notes || '',
    priority,
  };
}

export default function DashboardEnquiriesPage() {
  const router = useRouter();
  const { token, user, isStaff, isSeller, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (!token || !isStaff) {
        router.replace('/en/trh-internal-desk');
      } else if (isSeller) {
        router.replace('/dashboard/seller');
      }
    }
  }, [authLoading, token, isStaff, isSeller, router]);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [propertyMap, setPropertyMap] = useState<Record<string, PropertyLookup>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Message Client Modal State
  const [selectedLeadForMessage, setSelectedLeadForMessage] = useState<Lead | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<'confirmation' | 'site_visit' | 'legal_docs' | 'custom'>('confirmation');
  const [messageLang, setMessageLang] = useState<'en' | 'te'>('en');
  const [customMessageText, setCustomMessageText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const getTemplateText = useCallback((lead: Lead, template: string, lang: 'en' | 'te') => {
    const buyer = lead.buyerName;
    const propertyTitle = lang === 'te' && lead.propertyTitleTe ? lead.propertyTitleTe : lead.propertyTitle;
    const propertyRef = lead.propertyRef || (lead.propertyId.length > 8 ? `#${lead.propertyId.slice(0, 8).toUpperCase()}` : lead.propertyId);
    const agent = resolveAgentName(lead.agentName, user?.name);

    // Extract booked slot timing if present in notes
    const slotMatch =
      lead.notes?.match(/(?:Booked slot timing|Booked Slot Timing):\s*([^\n|\]]+)/i) ||
      lead.notes?.match(/\[Booked Slot Timing:\s*([^\]]+)\]/i);
    const slotInfo = slotMatch ? slotMatch[1].trim() : '';

    const baseUrl =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://frontend-six-psi-ecroth2n1r.vercel.app';
    const propertyUrl = `${baseUrl}/${lang}/properties/${lead.propertyId}`;

    if (template === 'confirmation') {
      return lang === 'te'
        ? `🏢 *ప్రాపర్టీ కన్సల్టేషన్ వివరాలు | తెలంగాణ రియల్టీ హబ్*

నమస్కారం ${buyer} గారు,

${propertyTitle} (Ref: ${propertyRef}) ప్రాపర్టీ పట్ల ఆసక్తి చూపించినందుకు ధన్యవాదాలు.

నేను ${agent}, మీ నియమిత సీనియర్ ప్రాపర్టీ అడ్వైజర్. మీ అభ్యర్థన మా డీల్ డెస్క్ వద్ద విజయవంతంగా నమోదు చేయబడింది.

🔗 *మా వెబ్‌సైట్‌లో పూర్తి ప్రాపర్టీ & విక్రేత పత్రాలను ఇక్కడ చూడండి:*
${propertyUrl}

కీలక ప్రయోజనాలు:
✅ 13 చట్టపరమైన చెక్‌పాయింట్ల ద్వారా ధ్రువీకరించబడిన క్లియర్ టైటిల్
✅ ధరణి రికార్డులు & 30 సంవత్సరాల EC పరిశీలన పూర్తయింది
✅ యజమానితో నేరుగా సమన్వయం & పారదర్శక ధర

వివరాలపై మాట్లాడటానికి ఈ రోజు లేదా రేపు మీకు ఏ సమయం అనుకూలంగా ఉంటుంది?

భవదీయుడు,
${agent}
తెలంగాణ రియల్టీ హబ్ (+91 94400 12345)`
        : `🏢 *Property Consultation Confirmed | Telangana Realty Hub*

Hello ${buyer},

Thank you for your enquiry regarding ${propertyTitle} (Ref: ${propertyRef}).

I am ${agent}, your dedicated Senior Property Advisor. Your enquiry has been received and prioritized at our Deal Desk.

🔗 *View Verified Property Listing & Seller Documents:*
${propertyUrl}

Key Highlights:
✅ 100% Clear Title verified across 13 government checkpoints
✅ Dharani Revenue Records & 30-Year EC validated
✅ Direct owner-verified pricing & instant site visit scheduling

Would today or tomorrow be a convenient time for a brief 10-minute briefing call?

Best regards,
${agent}
Telangana Realty Hub Deal Desk (+91 94400 12345)`;
    }

    if (template === 'site_visit') {
      const slotMention = slotInfo ? slotInfo : 'Scheduled on Request';
      const slotMentionTe = slotInfo ? `${slotInfo} స్లాట్` : 'అభ్యర్థన మేరకు షెడ్యూల్ చేయబడింది';
      return lang === 'te'
        ? `🏡 *సైట్ విజిట్ స్లాట్ బుకింగ్ నిర్ధారించబడింది | తెలంగాణ రియల్టీ హబ్*

నమస్కారం ${buyer} గారు,

మీరు కోరిన ప్రాపర్టీ కోసం మా సర్టిఫైడ్ అడ్వైజర్ ${agent} తో సైట్ విజిట్ స్లాట్ విజయవంతంగా బుక్ చేయబడింది.

📋 *ప్రాపర్టీ:* ${propertyTitle} (Ref: ${propertyRef})
🕒 *స్లాట్ సమయం:* ${slotMentionTe}
📍 *పరిశీలన:* ఆన్-గ్రౌండ్ రెవెన్యూ సర్వే & బౌండరీ వెరిఫికేషన్

🔗 *విక్రేత దరఖాస్తు చేసిన భూమి / ప్రాపర్టీ వివరాలను మా వెబ్‌సైట్‌లో చూడండి:*
${propertyUrl}

మా అడ్వైజర్ ధరణి పట్టాదారు పాస్‌బుక్, 30 ఏళ్ల EC మరియు ధ్రువీకరించబడిన సర్వే పత్రాలతో మీకు మార్గనిర్దేశం చేస్తారు.

ఏవైనా సందేహాలుంటే ఈ వాట్సాప్ నంబర్‌కు రిప్లై ఇవ్వండి లేదా +91 94400 12345 కి కాల్ చేయండి.

భవదీయుడు,
తెలంగాణ రియల్టీ హబ్ బృందం`
        : `🏡 *Site Visit Slot Confirmed | Telangana Realty Hub*

Dear ${buyer},

Your site visit slot has been successfully booked with our certified property advisor, ${agent}.

📋 *Property:* ${propertyTitle} (Ref: ${propertyRef})
🕒 *Booked Slot:* ${slotMention}
📍 *Meeting Point:* On-ground boundary & survey inspection site

🔗 *View Verified Property & Land Details on Our Website:*
${propertyUrl}

Our advisor will accompany you with the Dharani Pattadar Passbook, certified survey boundary maps, and 30-year Encumbrance Certificate (EC).

For immediate coordination or directions, reply directly to this message or call our Deal Desk at +91 94400 12345.

Looking forward to meeting you!
— Telangana Realty Hub Team`;
    }

    if (template === 'legal_docs') {
      return lang === 'te'
        ? `📑 *చట్టపరమైన పత్రాల పరిశీలన నివేదిక (Dossier) | తెలంగాణ రియల్టీ హబ్*

నమస్కారం ${buyer} గారు,

${propertyTitle} (Ref: ${propertyRef}) ప్రాపర్టీకి సంబంధించిన 13-పాయింట్ల సమగ్ర లీగల్ వెరిఫికేషన్ డాసియర్ సిద్ధంగా ఉంది.

🔗 *పూర్తి డాక్యుమెంట్లు & ప్రాపర్టీ వివరాలను మా వెబ్‌సైట్‌లో చూడండి:*
${propertyUrl}

పరిశీలన ముఖ్యాంశాలు:
• 30 ఏళ్ల నిల్ ఎన్‌కంబ్రెన్స్ సర్టిఫికేట్ (EC)
• ధరణి డిజిటల్ పట్టాదారు పాస్‌బుక్ & సర్వే నంబర్ల మ్యాప్
• HMDA / RERA మాస్టర్ ప్లాన్ జోనింగ్ క్లియరెన్స్
• కోర్టు వివాదాలు లేవని ధ్రువీకరించిన లీగల్ ఒపీనియన్

ఈ PDF కాపీని వాట్సాప్‌లో పొందడానికి "SEND DOSSIER" అని రిప్లై ఇవ్వండి లేదా +91 94400 12345 కి కాల్ చేయండి.

భవదీయుడు,
${agent}
తెలంగాణ రియల్టీ హబ్`
        : `📑 *Legal Due Diligence Dossier Ready | Telangana Realty Hub*

Dear ${buyer},

The comprehensive 13-point legal due diligence dossier for ${propertyTitle} (Ref: ${propertyRef}) is now ready for your review.

🔗 *View Complete Property & Document Overview:*
${propertyUrl}

Dossier Summary:
• 30-Year Non-Encumbrance Certificate (Nil Encumbrance)
• Dharani Digital Pattadar Passbook & Revenue Survey Map
• HMDA / RERA / SRO Master Plan Verification
• Certified Litigations Check across Revenue & Civil Courts

To receive the downloadable PDF dossier on WhatsApp or schedule an in-person legal review, please reply "SEND DOSSIER" or reach out to our legal desk at +91 94400 12345.

Warm regards,
${agent}
Telangana Realty Hub`;
    }

    return customMessageText;
  }, [customMessageText, user?.name]);

  const handleOpenMessageModal = (lead: Lead) => {
    const initialTemplate = lead.enquiryType === 'SITE_VISIT' ? 'site_visit' : 'confirmation';
    setSelectedLeadForMessage(lead);
    setSelectedTemplate(initialTemplate);
    setMessageLang('en');
    setCustomMessageText(getTemplateText(lead, initialTemplate, 'en'));
    setIsCopied(false);
  };

  const handleTemplateChange = (template: 'confirmation' | 'site_visit' | 'legal_docs' | 'custom', lang: 'en' | 'te') => {
    setSelectedTemplate(template);
    setMessageLang(lang);
    if (selectedLeadForMessage && template !== 'custom') {
      setCustomMessageText(getTemplateText(selectedLeadForMessage, template, lang));
    }
  };

  const handleSendWhatsApp = (lead: Lead) => {
    const rawPhone = lead.phone.replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const textToSend = customMessageText || getTemplateText(lead, selectedTemplate, messageLang);
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank');

    if (lead.status === 'NEW' || lead.status === 'ASSIGNED') {
      updateStatus(lead.id, 'CONTACTED');
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Fetch real enquiries and property metadata from backend
  const fetchEnquiries = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const pMap: Record<string, PropertyLookup> = {};
      const origin =
        typeof window !== 'undefined' && window.location.origin
          ? window.location.origin
          : 'https://frontend-six-psi-ecroth2n1r.vercel.app';

      // 1. Seed with offline mock properties
      MOCK_PROPERTIES.forEach((p) => {
        pMap[p.id] = {
          id: p.id,
          titleEn: p.title,
          titleTe: p.titleTe || p.title,
          ref: getCleanPropertyRef(p.id),
          url: `${origin}/en/properties/${p.id}`,
        };
      });

      // 2. Fetch live properties catalog
      try {
        const { properties } = await getProperties({ limit: 100 });
        if (properties && properties.length > 0) {
          properties.forEach((p) => {
            pMap[p.id] = {
              id: p.id,
              titleEn: p.title,
              titleTe: p.titleTe || p.title,
              ref: getCleanPropertyRef(p.id),
              url: `${origin}/en/properties/${p.id}`,
            };
          });
        }
      } catch (catErr) {
        console.warn('[Enquiries] Could not fetch catalog properties:', catErr);
      }

      if (token) {
        const res = await getEnquiriesApi(token);
        if (res.enquiries && res.enquiries.length > 0) {
          // Identify any enquiries with property IDs not yet in pMap
          const missingIds = Array.from(
            new Set(
              res.enquiries
                .map((e) => e.propertyId)
                .filter((pid) => pid && !pMap[pid])
            )
          );

          if (missingIds.length > 0) {
            await Promise.allSettled(
              missingIds.map(async (pid) => {
                try {
                  const single = await getPropertyById(pid);
                  if (single) {
                    pMap[single.id] = {
                      id: single.id,
                      titleEn: single.title,
                      titleTe: single.titleTe || single.title,
                      ref: getCleanPropertyRef(single.id),
                      url: `${origin}/en/properties/${single.id}`,
                    };
                  }
                } catch {
                  // Fallback to ref-based label
                }
              })
            );
          }

          setPropertyMap(pMap);
          setLeads(res.enquiries.map((be) => transformBackendEnquiry(be, pMap, user?.name)));
        } else {
          setPropertyMap(pMap);
          // Real backend returned 0 records -> show empty state (no fake data)
          setLeads([]);
        }
      } else {
        setPropertyMap(pMap);
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
  }, [token, user?.name]);

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
          (lead.propertyRef && lead.propertyRef.toLowerCase().includes(q)) ||
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

  // Export filtered leads to CSV
  const exportToCsv = () => {
    if (filtered.length === 0) return;
    const headers = [
      'Lead ID',
      'Buyer Name',
      'Phone',
      'Property Ref',
      'Property Title',
      'Listing URL',
      'Enquiry Type',
      'Status',
      'Assigned Agent',
      'Date',
      'Priority',
      'Notes',
    ];
    const rows = filtered.map((l) => [
      `"${l.id}"`,
      `"${l.buyerName.replace(/"/g, '""')}"`,
      `"${l.phone.replace(/"/g, '""')}"`,
      `"${l.propertyRef || l.propertyId}"`,
      `"${l.propertyTitle.replace(/"/g, '""')}"`,
      `"${l.propertyUrl || ''}"`,
      `"${l.enquiryType}"`,
      `"${l.status}"`,
      `"${l.agentName.replace(/"/g, '""')}"`,
      `"${l.date}"`,
      `"${l.priority}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `telangana-realty-leads-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <button
            type="button"
            onClick={exportToCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            title="Export filtered enquiries to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
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
                <th className="px-4 py-3 text-right">Message Client</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      <span>Loading real enquiry pipeline from server...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">
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
                    <td className="px-4 py-3.5 max-w-[240px]">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-[11px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {lead.propertyRef || (lead.propertyId.length > 8 ? `#${lead.propertyId.slice(0, 8).toUpperCase()}` : lead.propertyId)}
                        </span>
                        {lead.propertyUrl && (
                          <a
                            href={lead.propertyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                            title="Open verified listing page in new tab"
                          >
                            <span>View Listing</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      <span
                        className="text-xs text-slate-800 font-medium line-clamp-2 block"
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
                        <span>{lead.enquiryType.replace('_', ' ')}</span>
                      </span>
                      {lead.notes && lead.notes.includes('Booked slot timing:') && (
                        <span className="block mt-1 font-mono text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 w-fit">
                          🕒 {lead.notes.split('Booked slot timing:')[1]?.split('\n')[0]?.trim()}
                        </span>
                      )}
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
                          {Array.from(new Set([...BASE_AGENTS, lead.agentName]))
                            .filter(Boolean)
                            .map((agent) => (
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

                    {/* Message Client */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenMessageModal(lead)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        title={`Message ${lead.buyerName} via WhatsApp`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Send Consultation Message Modal ─────────────────────────────── */}
      {selectedLeadForMessage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="message-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <MessageSquare className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 id="message-modal-title" className="text-base font-bold text-slate-900">
                      Send Consultation Message
                    </h3>
                    <p className="text-xs text-slate-500">
                      To <span className="font-semibold text-slate-800">{selectedLeadForMessage.buyerName}</span> ({selectedLeadForMessage.phone})
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                  <span className="font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                    {selectedLeadForMessage.propertyRef || (selectedLeadForMessage.propertyId.length > 8 ? `#${selectedLeadForMessage.propertyId.slice(0, 8).toUpperCase()}` : selectedLeadForMessage.propertyId)}
                  </span>
                  <span className="font-semibold text-slate-800 truncate max-w-[280px]">
                    {selectedLeadForMessage.propertyTitle}
                  </span>
                  {selectedLeadForMessage.propertyUrl && (
                    <a
                      href={selectedLeadForMessage.propertyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline ml-auto"
                      title="View listing details on website"
                    >
                      <span>View Listing</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeadForMessage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Template Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Choose Template
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleTemplateChange('confirmation', messageLang)}
                    className={`px-3 py-2 rounded-lg text-left font-medium border transition-colors cursor-pointer ${
                      selectedTemplate === 'confirmation'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    1. Consultation Time
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTemplateChange('site_visit', messageLang)}
                    className={`px-3 py-2 rounded-lg text-left font-medium border transition-colors cursor-pointer ${
                      selectedTemplate === 'site_visit'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    2. Site Visit Inspection
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTemplateChange('legal_docs', messageLang)}
                    className={`px-3 py-2 rounded-lg text-left font-medium border transition-colors cursor-pointer ${
                      selectedTemplate === 'legal_docs'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    3. Legal Clearance Dossier
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTemplateChange('custom', messageLang)}
                    className={`px-3 py-2 rounded-lg text-left font-medium border transition-colors cursor-pointer ${
                      selectedTemplate === 'custom'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    4. Custom Message
                  </button>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Language:</span>
                <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
                  <button
                    type="button"
                    onClick={() => handleTemplateChange(selectedTemplate, 'en')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      messageLang === 'en'
                        ? 'bg-white shadow-xs font-bold text-slate-900'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTemplateChange(selectedTemplate, 'te')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      messageLang === 'te'
                        ? 'bg-white shadow-xs font-bold text-emerald-800'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    తెలుగు (Telugu)
                  </button>
                </div>
              </div>

              {/* Editable Text Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="messageText" className="text-xs font-semibold text-slate-700">
                    Message Preview / Edit:
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {customMessageText.length} chars
                  </span>
                </div>
                <textarea
                  id="messageText"
                  rows={9}
                  value={customMessageText}
                  onChange={(e) => setCustomMessageText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none transition-colors"
                  placeholder="Type your message here..."
                />
                <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span>💡</span>
                  <span>
                    Clicking &quot;Send via WhatsApp&quot; opens WhatsApp Web or Mobile with this message pre-filled. No SMS gateway fees required.
                  </span>
                </p>
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleCopyText(customMessageText)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLeadForMessage(null)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSendWhatsApp(selectedLeadForMessage)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
