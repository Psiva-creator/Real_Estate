'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Edit3,
  Plus,
  CheckCircle2,
  Lock,
  Building2,
  MapPin,
  FileText,
  SlidersHorizontal,
  IndianRupee,
  Calendar,
  Layers,
  ShieldCheck,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { AdminPropertyDetails } from '@/types/adminDetails';
import {
  loadAdminDetails,
  hasBuyerFacingDetails,
} from '@/lib/adminDetailsStorage';
import { saveAdminPropertyDetailsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import AdminPropertyDetailsEditor from './AdminPropertyDetailsEditor';

interface AdminPropertyDetailsCardProps {
  propertyId: string;
  propertyTitle: string;
  initialDetails?: AdminPropertyDetails | null;
  publishedDetails?: AdminPropertyDetails | null;
  publishedAt?: string | null;
  hasUnpublishedChanges?: boolean;
  onDetailsUpdated?: (updated: AdminPropertyDetails, isPublished?: boolean) => void;
}

export default function AdminPropertyDetailsCard({
  propertyId,
  propertyTitle,
  initialDetails,
  publishedDetails,
  publishedAt: initialPublishedAt,
  hasUnpublishedChanges: initialHasUnpublishedChanges,
  onDetailsUpdated,
}: AdminPropertyDetailsCardProps) {
  const { token } = useAuth();
  const [details, setDetails] = useState<AdminPropertyDetails | null>(() => {
    return loadAdminDetails(propertyId, initialDetails);
  });
  const [publishedAt, setPublishedAt] = useState<string | null>(initialPublishedAt || null);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState<boolean>(
    Boolean(initialHasUnpublishedChanges)
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  // Sync if initialDetails updates
  useEffect(() => {
    const loaded = loadAdminDetails(propertyId, initialDetails);
    setDetails(loaded);
  }, [propertyId, initialDetails]);

  useEffect(() => {
    if (initialPublishedAt !== undefined) {
      setPublishedAt(initialPublishedAt);
    }
  }, [initialPublishedAt]);

  useEffect(() => {
    if (initialHasUnpublishedChanges !== undefined) {
      setHasUnpublishedChanges(initialHasUnpublishedChanges);
    }
  }, [initialHasUnpublishedChanges]);

  // Listen to custom event for multi-tab or reactive sync
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{
        propertyId: string;
        details: AdminPropertyDetails;
      }>;
      if (customEvent.detail?.propertyId === propertyId) {
        setDetails(customEvent.detail.details);
      }
    };
    window.addEventListener('trh-admin-details-changed', handleSync);
    return () => window.removeEventListener('trh-admin-details-changed', handleSync);
  }, [propertyId]);

  const handleSave = async (updated: AdminPropertyDetails, publishToSeller: boolean = false) => {
    setDetails(updated);
    if (onDetailsUpdated) {
      onDetailsUpdated(updated, publishToSeller);
    }

    if (token) {
      const res = await saveAdminPropertyDetailsApi(token, propertyId, updated, publishToSeller);
      if (res.backendPersisted) {
        if (publishToSeller) {
          setSavedNotification('Details saved & published to seller successfully.');
          setPublishedAt(res.adminDetailsPublishedAt || new Date().toISOString());
          setHasUnpublishedChanges(false);
        } else {
          setSavedNotification('Draft saved internally (not visible to seller).');
          setHasUnpublishedChanges(true);
        }
      } else {
        setSavedNotification(publishToSeller ? 'Details published locally.' : 'Draft saved locally.');
      }
    } else {
      setSavedNotification('Details saved locally.');
    }

    setIsEditorOpen(false);
    setTimeout(() => setSavedNotification(null), 4000);
  };

  const hasBuyerData = hasBuyerFacingDetails(details);
  const hasInternalNotes = Boolean(details?.internalNotes?.trim());
  const hasAnyDetails = hasBuyerData || hasInternalNotes;

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-800">Admin Added Details</h3>
                {hasUnpublishedChanges ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    <ShieldCheck className="w-3 h-3 text-amber-600" />
                    Draft (Unpublished Changes)
                  </span>
                ) : publishedAt ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Published to Seller
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    <ShieldCheck className="w-3 h-3" />
                    Staff Draft
                  </span>
                )}
                {savedNotification && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600 text-white animate-in fade-in">
                    <CheckCircle2 className="w-3 h-3" />
                    {savedNotification}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Buyer-facing curated highlights, amenities, specifications & private staff notes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsEditorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              {hasAnyDetails ? (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Details
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Add Details
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          {!hasAnyDetails ? (
            <div className="py-8 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">No Admin Details Added Yet</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enhance this seller listing by adding curated buyer-facing property highlights,
                  verified amenities, connectivity advantages, landmarks, and private negotiation notes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Admin Details
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Top Summary Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Highlights
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {details?.highlights?.length ?? 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Curated Amenities
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {details?.amenities?.length ?? 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Specs & Features
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {(details?.additionalSpecifications?.length ?? 0) +
                      (details?.specialFeatures?.length ?? 0)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80">
                  <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider block">
                    Internal Notes
                  </span>
                  <span className="text-sm font-bold text-amber-900">
                    {hasInternalNotes ? 'Present' : 'None'}
                  </span>
                </div>
              </div>

              {/* 1. Curated Project Description */}
              {details?.projectDescription && (
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Curated Project Description (Buyer-Facing)</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {details.projectDescription}
                  </p>
                </div>
              )}

              {/* 2. Highlights & Special Features */}
              {((details?.highlights && details.highlights.length > 0) ||
                (details?.specialFeatures && details.specialFeatures.length > 0)) && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Property Highlights & Special Features</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {details?.highlights?.map((h, i) => (
                      <div
                        key={`h-${i}`}
                        className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs text-slate-800"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                    {details?.specialFeatures?.map((f, i) => (
                      <div
                        key={`f-${i}`}
                        className="flex items-start gap-2 p-2 rounded-lg bg-blue-50/50 border border-blue-100 text-xs text-slate-800"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Curated Amenities */}
              {details?.amenities && details.amenities.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Curated Amenities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {details.amenities.map((a, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Location Advantages & Landmarks */}
              {((details?.locationAdvantages && details.locationAdvantages.length > 0) ||
                (details?.nearbyLandmarks && details.nearbyLandmarks.length > 0)) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  {details?.locationAdvantages && details.locationAdvantages.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        Location Advantages
                      </span>
                      <ul className="space-y-1">
                        {details.locationAdvantages.map((adv, i) => (
                          <li
                            key={i}
                            className="text-xs text-slate-700 flex items-start gap-2 py-0.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                            <span>{adv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {details?.nearbyLandmarks && details.nearbyLandmarks.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        Nearby Landmarks
                      </span>
                      <ul className="space-y-1">
                        {details.nearbyLandmarks.map((lm, i) => (
                          <li
                            key={i}
                            className="text-xs text-slate-700 flex items-start gap-2 py-0.5"
                          >
                            <MapPin className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                            <span>{lm}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 5. Additional Specifications */}
              {details?.additionalSpecifications &&
                details.additionalSpecifications.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
                      Additional Specifications
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {details.additionalSpecifications.map((spec) => (
                        <div
                          key={spec.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200"
                        >
                          <span className="font-semibold text-slate-500 uppercase tracking-wide">
                            {spec.label}
                          </span>
                          <span className="font-medium text-slate-800">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* 6. Pricing & Site Visit Instructions */}
              {(details?.pricingNotes || details?.siteVisitInstructions) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  {details.pricingNotes && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <IndianRupee className="w-3 h-3 text-emerald-700" />
                        Pricing Notes
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {details.pricingNotes}
                      </p>
                    </div>
                  )}
                  {details.siteVisitInstructions && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-700" />
                        Site Visit Instructions
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {details.siteVisitInstructions}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 7. Custom Sections & Additional Notes */}
              {(details?.additionalNotes ||
                (details?.customSections && details.customSections.length > 0)) && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {details.additionalNotes && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <FileText className="w-3 h-3 text-emerald-700" />
                        Additional Buyer Notes
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {details.additionalNotes}
                      </p>
                    </div>
                  )}
                  {details.customSections?.map((sec) => (
                    <div
                      key={sec.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1"
                    >
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <Layers className="w-3 h-3 text-emerald-700" />
                        {sec.title}
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {sec.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* 8. Internal Admin Notes (Strictly Private) */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Internal Admin Notes
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-200/80 text-amber-900 border border-amber-300">
                    Confidential · Private
                  </span>
                </div>
                <div className="text-xs text-amber-900 font-mono leading-relaxed bg-white/70 p-3 rounded-lg border border-amber-200/60 whitespace-pre-line">
                  {details?.internalNotes?.trim() ? (
                    details.internalNotes
                  ) : (
                    <span className="italic text-amber-700/80">
                      No internal notes recorded. Click &apos;Edit Details&apos; to add confidential seller negotiation notes or title background.
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-amber-700 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  This note is never rendered on public buyer-facing property pages.
                </p>
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>
                  {details?.updatedAt
                    ? `Last updated: ${new Date(details.updatedAt).toLocaleString('en-IN')}`
                    : 'Curated by TRH Team'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(true)}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2"
                >
                  Modify Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      <AdminPropertyDetailsEditor
        propertyId={propertyId}
        propertyTitle={propertyTitle}
        initialDetails={details}
        publishedDetails={publishedDetails}
        publishedAt={publishedAt}
        hasUnpublishedChanges={hasUnpublishedChanges}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
