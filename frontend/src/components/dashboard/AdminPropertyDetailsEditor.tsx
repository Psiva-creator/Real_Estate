'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lock,
  Building2,
  MapPin,
  FileText,
  SlidersHorizontal,
  IndianRupee,
  Calendar,
  Layers,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import {
  AdminPropertyDetails,
  AdminCustomField,
  AdminCustomSection,
} from '@/types/adminDetails';

interface AdminPropertyDetailsEditorProps {
  propertyId: string;
  propertyTitle: string;
  initialDetails?: AdminPropertyDetails | null;
  publishedDetails?: AdminPropertyDetails | null;
  publishedAt?: string | null;
  hasUnpublishedChanges?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: AdminPropertyDetails, publishToSeller?: boolean) => Promise<void> | void;
}

type TabKey = 'highlights' | 'amenities' | 'specs' | 'custom' | 'internal';

export default function AdminPropertyDetailsEditor({
  propertyId,
  propertyTitle,
  initialDetails,
  publishedDetails,
  publishedAt,
  hasUnpublishedChanges: initialHasUnpublishedChanges,
  isOpen,
  onClose,
  onSave,
}: AdminPropertyDetailsEditorProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('highlights');

  // Form states
  const [projectDescription, setProjectDescription] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState('');

  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');

  const [locationAdvantages, setLocationAdvantages] = useState<string[]>([]);
  const [newLocationAdvantage, setNewLocationAdvantage] = useState('');

  const [nearbyLandmarks, setNearbyLandmarks] = useState<string[]>([]);
  const [newNearbyLandmark, setNewNearbyLandmark] = useState('');

  const [additionalSpecifications, setAdditionalSpecifications] = useState<AdminCustomField[]>([]);
  const [newSpecLabel, setNewSpecLabel] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const [specialFeatures, setSpecialFeatures] = useState<string[]>([]);
  const [newSpecialFeature, setNewSpecialFeature] = useState('');

  const [pricingNotes, setPricingNotes] = useState('');
  const [siteVisitInstructions, setSiteVisitInstructions] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [customSections, setCustomSections] = useState<AdminCustomSection[]>([]);
  const [newCustomTitle, setNewCustomTitle] = useState('');
  const [newCustomContent, setNewCustomContent] = useState('');

  const [internalNotes, setInternalNotes] = useState('');

  const [isDirty, setIsDirty] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saveDraftSuccess, setSaveDraftSuccess] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Initialize or reset form from initialDetails
  const resetForm = React.useCallback(() => {
    const d = initialDetails || {};
    setProjectDescription(d.projectDescription || '');
    setHighlights(d.highlights ? [...d.highlights] : []);
    setAmenities(d.amenities ? [...d.amenities] : []);
    setLocationAdvantages(d.locationAdvantages ? [...d.locationAdvantages] : []);
    setNearbyLandmarks(d.nearbyLandmarks ? [...d.nearbyLandmarks] : []);
    setAdditionalSpecifications(
      d.additionalSpecifications ? d.additionalSpecifications.map((s) => ({ ...s })) : []
    );
    setSpecialFeatures(d.specialFeatures ? [...d.specialFeatures] : []);
    setPricingNotes(d.pricingNotes || '');
    setSiteVisitInstructions(d.siteVisitInstructions || '');
    setAdditionalNotes(d.additionalNotes || '');
    setCustomSections(d.customSections ? d.customSections.map((c) => ({ ...c })) : []);
    setInternalNotes(d.internalNotes || '');
    setIsDirty(false);
    setSaveDraftSuccess(false);
    setPublishSuccess(false);
  }, [initialDetails]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  if (!isOpen) return null;

  const markDirty = () => {
    setIsDirty(true);
    setSaveDraftSuccess(false);
    setPublishSuccess(false);
  };

  // ── Highlights Helpers ──
  const addHighlight = () => {
    if (!newHighlight.trim()) return;
    setHighlights((prev) => [...prev, newHighlight.trim()]);
    setNewHighlight('');
    markDirty();
  };

  const removeHighlight = (idx: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== idx));
    markDirty();
  };

  // ── Amenities Helpers ──
  const addAmenity = () => {
    if (!newAmenity.trim()) return;
    setAmenities((prev) => [...prev, newAmenity.trim()]);
    setNewAmenity('');
    markDirty();
  };

  const removeAmenity = (idx: number) => {
    setAmenities((prev) => prev.filter((_, i) => i !== idx));
    markDirty();
  };

  // ── Location Advantages Helpers ──
  const addLocationAdvantage = () => {
    if (!newLocationAdvantage.trim()) return;
    setLocationAdvantages((prev) => [...prev, newLocationAdvantage.trim()]);
    setNewLocationAdvantage('');
    markDirty();
  };

  const removeLocationAdvantage = (idx: number) => {
    setLocationAdvantages((prev) => prev.filter((_, i) => i !== idx));
    markDirty();
  };

  // ── Nearby Landmarks Helpers ──
  const addNearbyLandmark = () => {
    if (!newNearbyLandmark.trim()) return;
    setNearbyLandmarks((prev) => [...prev, newNearbyLandmark.trim()]);
    setNewNearbyLandmark('');
    markDirty();
  };

  const removeNearbyLandmark = (idx: number) => {
    setNearbyLandmarks((prev) => prev.filter((_, i) => i !== idx));
    markDirty();
  };

  // ── Specifications Helpers ──
  const addSpecification = () => {
    if (!newSpecLabel.trim() || !newSpecValue.trim()) return;
    setAdditionalSpecifications((prev) => [
      ...prev,
      {
        id: `spec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        label: newSpecLabel.trim(),
        value: newSpecValue.trim(),
      },
    ]);
    setNewSpecLabel('');
    setNewSpecValue('');
    markDirty();
  };

  const removeSpecification = (id: string) => {
    setAdditionalSpecifications((prev) => prev.filter((s) => s.id !== id));
    markDirty();
  };

  // ── Special Features Helpers ──
  const addSpecialFeature = () => {
    if (!newSpecialFeature.trim()) return;
    setSpecialFeatures((prev) => [...prev, newSpecialFeature.trim()]);
    setNewSpecialFeature('');
    markDirty();
  };

  const removeSpecialFeature = (idx: number) => {
    setSpecialFeatures((prev) => prev.filter((_, i) => i !== idx));
    markDirty();
  };

  // ── Custom Sections Helpers ──
  const addCustomSection = () => {
    if (!newCustomTitle.trim() || !newCustomContent.trim()) return;
    setCustomSections((prev) => [
      ...prev,
      {
        id: `section-${Date.now()}`,
        title: newCustomTitle.trim(),
        content: newCustomContent.trim(),
      },
    ]);
    setNewCustomTitle('');
    setNewCustomContent('');
    markDirty();
  };

  const removeCustomSection = (id: string) => {
    setCustomSections((prev) => prev.filter((c) => c.id !== id));
    markDirty();
  };

  const buildDetailsToSave = (): AdminPropertyDetails => ({
    projectDescription: projectDescription.trim() || undefined,
    highlights: highlights.length > 0 ? highlights : undefined,
    amenities: amenities.length > 0 ? amenities : undefined,
    locationAdvantages: locationAdvantages.length > 0 ? locationAdvantages : undefined,
    nearbyLandmarks: nearbyLandmarks.length > 0 ? nearbyLandmarks : undefined,
    additionalSpecifications:
      additionalSpecifications.length > 0 ? additionalSpecifications : undefined,
    specialFeatures: specialFeatures.length > 0 ? specialFeatures : undefined,
    pricingNotes: pricingNotes.trim() || undefined,
    siteVisitInstructions: siteVisitInstructions.trim() || undefined,
    additionalNotes: additionalNotes.trim() || undefined,
    customSections: customSections.length > 0 ? customSections : undefined,
    internalNotes: internalNotes.trim() || undefined,
    updatedAt: new Date().toISOString(),
    updatedBy: 'Admin / Staff Reviewer',
  });

  // ── Save Draft (Admin side only, not exposed to seller) ──
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setSaveDraftSuccess(false);
    setPublishSuccess(false);
    try {
      const detailsToSave = buildDetailsToSave();
      await onSave(detailsToSave, false);
      setIsDirty(false);
      setSaveDraftSuccess(true);
      setTimeout(() => setSaveDraftSuccess(false), 4500);
    } catch (err) {
      console.error('Failed to save admin draft details:', err);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // ── Save Changes & Send to Seller ──
  const handleSaveAndSend = async () => {
    setIsPublishing(true);
    setSaveDraftSuccess(false);
    setPublishSuccess(false);
    try {
      const detailsToSave = buildDetailsToSave();
      await onSave(detailsToSave, true);
      setIsDirty(false);
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to save and publish admin property details:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes in the Admin Details Editor. Do you want to discard them?'
      );
      if (!confirmed) return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900 truncate">
                  Admin Property Details Editor
                </h2>
                {isDirty ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    <AlertCircle className="w-3 h-3" />
                    Unsaved Edits
                  </span>
                ) : publishSuccess ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Published to Seller
                  </span>
                ) : saveDraftSuccess ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Draft Saved (Internal)
                  </span>
                ) : initialHasUnpublishedChanges ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    <AlertCircle className="w-3 h-3" />
                    Draft (Unpublished Changes)
                  </span>
                ) : publishedAt ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Published {new Date(publishedAt).toLocaleDateString('en-IN')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-200/70 text-slate-700">
                    Draft Only (Not Sent to Seller)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {propertyTitle} · <span className="font-mono text-emerald-700 font-semibold">{propertyId}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title="Close editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Banners */}
        {saveDraftSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Draft saved successfully. Changes remain internal and are <strong>not visible to the seller</strong> until published.
              </span>
            </div>
            <button onClick={() => setSaveDraftSuccess(false)} className="text-blue-500 hover:text-blue-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {publishSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Details saved and published to seller! The seller portal now reflects these updated details. Confidential internal notes remain private.
              </span>
            </div>
            <button onClick={() => setPublishSuccess(false)} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-white overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('highlights')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'highlights'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Highlights & Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('amenities')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'amenities'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Amenities & Location
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'specs'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Specs & Pricing
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'custom'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Custom Sections & Notes
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('internal')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'internal'
                ? 'border-amber-600 text-amber-800 font-bold'
                : 'border-transparent text-amber-700 hover:text-amber-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            Internal Notes (Private)
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Highlights & Overview */}
          {activeTab === 'highlights' && (
            <div className="space-y-6">
              {/* Project Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                    Curated Project / Property Overview
                  </label>
                  <span className="text-[11px] text-slate-400">Buyer-Facing Description</span>
                </div>
                <textarea
                  value={projectDescription}
                  onChange={(e) => {
                    setProjectDescription(e.target.value);
                    markDirty();
                  }}
                  rows={4}
                  placeholder="Provide an editorial summary, architecture notes, builder pedigree, or prime layout context written by TRH advisors..."
                  className="w-full text-sm rounded-xl border border-slate-200 p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Property Highlights */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    Property Highlights
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {highlights.length} {highlights.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addHighlight();
                      }
                    }}
                    placeholder="e.g., 30-Year clear title vetted by independent legal counsel"
                    className="flex-1 text-sm rounded-xl border border-slate-200 px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addHighlight}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shrink-0 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>

                {highlights.length > 0 ? (
                  <div className="space-y-2">
                    {highlights.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 group"
                      >
                        <span className="text-sm text-slate-800 flex items-start gap-2 flex-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeHighlight(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No highlights added yet.</p>
                )}
              </div>

              {/* Special Features */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Special Features
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {specialFeatures.length} {specialFeatures.length === 1 ? 'feature' : 'features'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSpecialFeature}
                    onChange={(e) => setNewSpecialFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSpecialFeature();
                      }
                    }}
                    placeholder="e.g., 100% Vastu Compliant North-East facing plot"
                    className="flex-1 text-sm rounded-xl border border-slate-200 px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addSpecialFeature}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shrink-0 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>

                {specialFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {specialFeatures.map((feat, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium"
                      >
                        <span>{feat}</span>
                        <button
                          type="button"
                          onClick={() => removeSpecialFeature(idx)}
                          className="hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Amenities & Location */}
          {activeTab === 'amenities' && (
            <div className="space-y-6">
              {/* Curated Amenities */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Curated Amenities
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {amenities.length} {amenities.length === 1 ? 'amenity' : 'amenities'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addAmenity();
                      }
                    }}
                    placeholder="e.g., Underground Drainage & Sewage Treatment Plant"
                    className="flex-1 text-sm rounded-xl border border-slate-200 px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addAmenity}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shrink-0 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>

                {amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {amenities.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-medium"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => removeAmenity(idx)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Advantages */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    Location Advantages
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {locationAdvantages.length} items
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newLocationAdvantage}
                    onChange={(e) => setNewLocationAdvantage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addLocationAdvantage();
                      }
                    }}
                    placeholder="e.g., 5 mins drive to ORR Exit 1 (Kokapet)"
                    className="flex-1 text-sm rounded-xl border border-slate-200 px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addLocationAdvantage}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shrink-0 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>

                {locationAdvantages.length > 0 && (
                  <div className="space-y-2">
                    {locationAdvantages.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <span className="text-sm text-slate-800 flex items-start gap-2 flex-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                          <span>{item}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLocationAdvantage(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nearby Landmarks */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Nearby Landmarks
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {nearbyLandmarks.length} landmarks
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newNearbyLandmark}
                    onChange={(e) => setNewNearbyLandmark(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addNearbyLandmark();
                      }
                    }}
                    placeholder="e.g., Continental Hospital — 4.5 km"
                    className="flex-1 text-sm rounded-xl border border-slate-200 px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addNearbyLandmark}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shrink-0 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>

                {nearbyLandmarks.length > 0 && (
                  <div className="space-y-2">
                    {nearbyLandmarks.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <span className="text-sm text-slate-800 flex items-start gap-2 flex-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-1 shrink-0" />
                          <span>{item}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNearbyLandmark(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Specs & Pricing */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              {/* Additional Specifications (Key-Value) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
                    Additional Specifications (Flexible Key-Value Pairs)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {additionalSpecifications.length} specs
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    value={newSpecLabel}
                    onChange={(e) => setNewSpecLabel(e.target.value)}
                    placeholder="Specification Name (e.g., Facing, Water Source)"
                    className="w-full sm:w-1/3 text-sm rounded-lg border border-slate-200 px-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSpecification();
                      }
                    }}
                    placeholder="Value (e.g., East Facing Corner, HMWS&SB + Borewell)"
                    className="w-full sm:flex-1 text-sm rounded-lg border border-slate-200 px-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Spec
                  </button>
                </div>

                {additionalSpecifications.length > 0 ? (
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                    {additionalSpecifications.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between gap-4 px-4 py-2.5 bg-white hover:bg-slate-50/50"
                      >
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-48 shrink-0">
                          {s.label}
                        </span>
                        <span className="text-sm font-medium text-slate-800 flex-1 truncate">
                          {s.value}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSpecification(s.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No custom specifications added.</p>
                )}
              </div>

              {/* Pricing Notes */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-700" />
                  Pricing Notes & Loan Approvals
                </label>
                <textarea
                  value={pricingNotes}
                  onChange={(e) => {
                    setPricingNotes(e.target.value);
                    markDirty();
                  }}
                  rows={3}
                  placeholder="e.g., Base price quoted. Registration and stamp duty extra. Pre-approved home loan available from SBI and HDFC."
                  className="w-full text-sm rounded-xl border border-slate-200 p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Site Visit Instructions */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  Site Visit Instructions (Buyer-Facing)
                </label>
                <textarea
                  value={siteVisitInstructions}
                  onChange={(e) => {
                    setSiteVisitInstructions(e.target.value);
                    markDirty();
                  }}
                  rows={3}
                  placeholder="e.g., Prior 2-hour notice required for site visits. Gate pass issued by TRH mediation desk. Advisor will accompany buyer."
                  className="w-full text-sm rounded-xl border border-slate-200 p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Custom Sections & Additional Notes */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              {/* Additional Buyer Notes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  Additional Notes (Buyer-Facing)
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => {
                    setAdditionalNotes(e.target.value);
                    markDirty();
                  }}
                  rows={3}
                  placeholder="Any additional remarks, upcoming infrastructure projects, or general information for buyers..."
                  className="w-full text-sm rounded-xl border border-slate-200 p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Fully Flexible Arbitrary Custom Sections */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-700" />
                    Flexible Custom Sections
                  </label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add any arbitrary custom section with a title and rich narrative without requiring code changes.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <input
                    type="text"
                    value={newCustomTitle}
                    onChange={(e) => setNewCustomTitle(e.target.value)}
                    placeholder="Section Title (e.g., Development Roadmap, Investment Analysis)"
                    className="w-full text-sm rounded-lg border border-slate-200 px-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <textarea
                    value={newCustomContent}
                    onChange={(e) => setNewCustomContent(e.target.value)}
                    rows={2}
                    placeholder="Section Content..."
                    className="w-full text-sm rounded-lg border border-slate-200 p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={addCustomSection}
                    className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Custom Section
                  </button>
                </div>

                {customSections.length > 0 && (
                  <div className="space-y-3">
                    {customSections.map((sec) => (
                      <div
                        key={sec.id}
                        className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 relative group"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm font-bold text-slate-900">{sec.title}</h4>
                          <button
                            type="button"
                            onClick={() => removeCustomSection(sec.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                          {sec.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Internal Admin Notes (Private) */}
          {activeTab === 'internal' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <h4 className="font-bold uppercase tracking-wider text-amber-900">
                    Confidential Internal Notes
                  </h4>
                  <p className="text-amber-800 leading-relaxed">
                    This section is strictly for TRH staff, administrators, and assigned senior agents.
                    Information recorded here is <strong>NEVER exposed on public property pages</strong> or shared with buyers.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Internal Remarks & Negotiation Context
                </label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => {
                    setInternalNotes(e.target.value);
                    markDirty();
                  }}
                  rows={8}
                  placeholder="Record confidential seller negotiation thresholds, legal background notes, agent commission agreements, dispute vetting history, or visit feedback..."
                  className="w-full text-sm rounded-xl border border-amber-200 bg-amber-50/20 p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetForm}
            disabled={!isDirty || isSavingDraft || isPublishing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Original
          </button>

          <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            {/* Save Draft */}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || isPublishing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
              title="Save draft changes internally for staff only without updating seller portal"
            >
              {isSavingDraft ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving Draft…
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Draft
                </>
              )}
            </button>

            {/* Save Changes & Send to Seller */}
            <button
              type="button"
              onClick={handleSaveAndSend}
              disabled={isSavingDraft || isPublishing}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-700/60 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              title="Save changes and immediately publish them to the seller portal"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Publishing to Seller…
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Save Changes & Send to Seller
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
