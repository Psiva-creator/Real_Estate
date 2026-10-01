'use client';

import React, { useState } from 'react';
import {
  X,
  Building2,
  MapPin,
  IndianRupee,
  Layers,
  Save,
  Globe,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { InternalPropertyDetail, updatePropertyApi, updatePropertyStatusApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatINR } from '@/lib/formatters';

interface EditPropertyModalProps {
  property: InternalPropertyDetail;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: InternalPropertyDetail) => void;
}

export default function EditPropertyModal({
  property,
  isOpen,
  onClose,
  onSaved,
}: EditPropertyModalProps) {
  const { token } = useAuth();

  // Basic Details
  const [titleEn, setTitleEn] = useState(property.titleEn || '');
  const [titleTe, setTitleTe] = useState(property.titleTe || '');
  const [descriptionEn, setDescriptionEn] = useState(property.descriptionEn || '');
  const [descriptionTe, setDescriptionTe] = useState(property.descriptionTe || '');

  // Pricing
  const [totalPrice, setTotalPrice] = useState<number>(property.pricing.totalPrice || 0);
  const [pricePerAcre, setPricePerAcre] = useState<number | undefined>(property.pricing.pricePerAcre);
  const [pricePerSqYard, setPricePerSqYard] = useState<number | undefined>(property.pricing.pricePerSqYard);
  const [pricePerSqft, setPricePerSqft] = useState<number | undefined>(property.pricing.pricePerSqft);
  const [isNegotiable, setIsNegotiable] = useState<boolean>(property.pricing.isNegotiable || false);

  // Location
  const [village, setVillage] = useState(property.location.village || '');
  const [mandal, setMandal] = useState(property.location.mandal || '');
  const [district, setDistrict] = useState(property.location.district || '');
  const [pincode, setPincode] = useState(property.location.pincode || '');
  const [landmark, setLandmark] = useState(property.location.landmark || '');

  // Land specs (if applicable)
  const [totalAcres, setTotalAcres] = useState<number | undefined>(property.land?.totalAcres);
  const [sqYards, setSqYards] = useState<number | undefined>(property.land?.sqYards);
  const [surveyNumbersStr, setSurveyNumbersStr] = useState<string>(
    property.land?.surveyNumbers?.join(', ') || ''
  );
  const [soilType, setSoilType] = useState<string>(property.land?.soilType || '');
  const [roadWidthFt, setRoadWidthFt] = useState<number | undefined>(property.land?.roadWidthFt);
  const [waterAvailable, setWaterAvailable] = useState<boolean>(property.land?.waterAvailable ?? true);
  const [electricityAvailable, setElectricityAvailable] = useState<boolean>(
    property.land?.electricityAvailable ?? true
  );

  // Flat specs (if applicable)
  const [flatSqft, setFlatSqft] = useState<number | undefined>(property.flat?.sqft);
  const [flatBedrooms, setFlatBedrooms] = useState<number | undefined>(property.flat?.bedrooms);
  const [flatFloor, setFlatFloor] = useState<number | undefined>(property.flat?.floor);
  const [flatTotalFloors, setFlatTotalFloors] = useState<number | undefined>(property.flat?.totalFloors);

  // Saving states
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isDraft = property.status === 'DRAFT';
  const isEligibleForLive =
    !isDraft &&
    (property.status === 'VERIFIED' ||
      property.verificationStatus?.canGoLive === true ||
      Boolean(property.verificationStatus?.isFullyVerified) ||
      ((property.verificationStatus?.verifiedDocuments ?? 0) >= (property.verificationStatus?.totalDocuments ?? 13) &&
        (property.verificationStatus?.totalDocuments ?? 13) > 0));

  if (!isOpen) return null;

  const handleSave = async (andPublishLive = false) => {
    if (!token) {
      setErrorMessage('Authentication required');
      return;
    }

    if (andPublishLive) {
      if (isDraft) {
        setErrorMessage('Cannot publish: Draft properties must be moved to Under Review and verified first.');
        return;
      }
      if (!isEligibleForLive) {
        setErrorMessage('Cannot publish: Mandatory verification documents must be verified first.');
        return;
      }
    }

    if (!titleEn.trim()) {
      setErrorMessage('Title (English) is required');
      return;
    }
    if (totalPrice <= 0) {
      setErrorMessage('Total Price must be greater than 0');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Prepare updates payload
      const updates: Record<string, unknown> = {
        titleEn: titleEn.trim(),
        titleTe: titleTe.trim() || undefined,
        descriptionEn: descriptionEn.trim(),
        descriptionTe: descriptionTe.trim() || undefined,
        pricing: {
          totalPrice: Number(totalPrice),
          pricePerAcre: pricePerAcre ? Number(pricePerAcre) : undefined,
          pricePerSqYard: pricePerSqYard ? Number(pricePerSqYard) : undefined,
          pricePerSqft: pricePerSqft ? Number(pricePerSqft) : undefined,
          isNegotiable,
        },
        location: {
          village: village.trim(),
          mandal: mandal.trim(),
          district: district.trim(),
          pincode: pincode.trim() || undefined,
          landmark: landmark.trim() || undefined,
        },
      };

      if (property.type === 'LAND') {
        const surveyList = surveyNumbersStr
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        updates.land = {
          totalAcres: totalAcres ? Number(totalAcres) : undefined,
          sqYards: sqYards ? Number(sqYards) : undefined,
          surveyNumbers: surveyList.length > 0 ? surveyList : undefined,
          soilType: soilType.trim() || undefined,
          roadWidthFt: roadWidthFt ? Number(roadWidthFt) : undefined,
          waterAvailable,
          electricityAvailable,
        };
      } else if (property.type === 'FLAT') {
        updates.flat = {
          sqft: flatSqft ? Number(flatSqft) : undefined,
          bedrooms: flatBedrooms ? Number(flatBedrooms) : undefined,
          floor: flatFloor ? Number(flatFloor) : undefined,
          totalFloors: flatTotalFloors ? Number(flatTotalFloors) : undefined,
        };
      }

      // 2. Dispatch update
      const res = await updatePropertyApi(token, property.id, updates);
      let updatedProperty = res.property || { ...property, ...updates };

      // 3. If "Save & Publish to Public Website", also set status to LIVE
      if (andPublishLive) {
        const statusRes = await updatePropertyStatusApi(token, property.id, 'LIVE');
        if (statusRes.property) {
          updatedProperty = { ...updatedProperty, status: 'LIVE' };
        }
        setSuccessMessage('Property details updated and successfully published LIVE to public website!');
      } else {
        setSuccessMessage('Property details updated successfully.');
      }

      onSaved(updatedProperty);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to update property details');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-property-title"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 id="edit-property-title" className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-700" />
              <span>Edit Property Listing</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                {property.id}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Refine seller details before publishing or updating the public listing.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Section: Title & Descriptions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Listing Titles & Descriptions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder="e.g. 5 Acres Agricultural Clear Title Farm Land in Shankarpally"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title (తెలుగు - Telugu)
                </label>
                <input
                  type="text"
                  value={titleTe}
                  onChange={(e) => setTitleTe(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder="ఉదా: శంకర్‌పల్లి వద్ద 5 ఎకరాల క్లియర్ టైటిల్ వ్యవసాయ భూమి"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description (English)
              </label>
              <textarea
                rows={3}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
                placeholder="Detailed property highlights, approach road, boundary conditions, and legal verification summary..."
              />
            </div>
          </div>

          {/* Section: Pricing */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-700" />
                <span>Pricing Details</span>
              </h4>
              <span className="text-xs font-mono text-emerald-800 font-bold">
                Preview: {formatINR(totalPrice)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={totalPrice || ''}
                  onChange={(e) => setTotalPrice(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder="25000000"
                />
              </div>

              {property.type === 'LAND' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Price Per Acre (₹)
                    </label>
                    <input
                      type="number"
                      value={pricePerAcre || ''}
                      onChange={(e) => setPricePerAcre(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      placeholder="5000000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Price Per Sq.Yd (₹)
                    </label>
                    <input
                      type="number"
                      value={pricePerSqYard || ''}
                      onChange={(e) => setPricePerSqYard(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      placeholder="12000"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Price Per Sq.Ft (₹)
                  </label>
                  <input
                    type="number"
                    value={pricePerSqft || ''}
                    onChange={(e) => setPricePerSqft(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="6500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isNegotiable"
                checked={isNegotiable}
                onChange={(e) => setIsNegotiable(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <label htmlFor="isNegotiable" className="text-xs text-slate-700 font-medium cursor-pointer">
                Price is open to reasonable negotiation for serious token advance
              </label>
            </div>
          </div>

          {/* Section: Location */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Location & Jurisdiction</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Village</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mandal</label>
                <input
                  type="text"
                  value={mandal}
                  onChange={(e) => setMandal(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Landmark</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder="Near ORR Exit 1"
                />
              </div>
            </div>
          </div>

          {/* Section: Land Specifics (if Land) */}
          {property.type === 'LAND' && (
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                <span>Agricultural / Commercial Land Details</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Acres</label>
                  <input
                    type="number"
                    step="0.01"
                    value={totalAcres || ''}
                    onChange={(e) => setTotalAcres(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sq. Yards</label>
                  <input
                    type="number"
                    value={sqYards || ''}
                    onChange={(e) => setSqYards(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dharani Survey Numbers (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={surveyNumbersStr}
                    onChange={(e) => setSurveyNumbersStr(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="182/1, 182/2, 183"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Type</label>
                  <input
                    type="text"
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="Red Soil / Black Cotton"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Road Width (ft)</label>
                  <input
                    type="number"
                    value={roadWidthFt || ''}
                    onChange={(e) => setRoadWidthFt(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="40"
                  />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="water"
                    checked={waterAvailable}
                    onChange={(e) => setWaterAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <label htmlFor="water" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Borewell / Water
                  </label>
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="elec"
                    checked={electricityAvailable}
                    onChange={(e) => setElectricityAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <label htmlFor="elec" className="text-xs text-slate-700 font-medium cursor-pointer">
                    3-Phase Electricity
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-slate-600" />}
              <span>Save Changes</span>
            </button>

            <button
              type="button"
              disabled={isSaving || isDraft || !isEligibleForLive}
              onClick={() => handleSave(true)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                isDraft
                  ? 'Cannot publish directly from DRAFT. Move to Under Review first.'
                  : !isEligibleForLive
                  ? 'Cannot publish: Mandatory verification documents must be verified first.'
                  : 'Save changes and publish live to public website'
              }
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
              <span>Save & Publish to Public Website</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
