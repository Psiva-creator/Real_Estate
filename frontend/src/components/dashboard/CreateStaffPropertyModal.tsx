'use client';

import React, { useState, useMemo } from 'react';
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
  Compass,
  FileCheck2,
  ShieldCheck,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createProperty, CreatePropertyDTO, ServiceTier } from '@/lib/api';
import { formatINR } from '@/lib/formatters';

interface CreateStaffPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newPropertyId: string) => void;
}

// Preset Telangana Prime Growth Hubs for 1-Click Geospatial Autofill
const TELANGANA_HUBS = [
  { name: 'Mokila (Shankarpally)', district: 'Rangareddy', mandal: 'Shankarpally', village: 'Mokila', lat: 17.412, lng: 78.188, orrKm: 18.5, tier: 'TIER_2' as ServiceTier },
  { name: 'Kokapet (Neopolis)', district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet', lat: 17.3986, lng: 78.3245, orrKm: 0.9, tier: 'TIER_2' as ServiceTier },
  { name: 'Shadnagar (RRR Influence)', district: 'Rangareddy', mandal: 'Shadnagar', village: 'Kothur', lat: 17.155, lng: 78.228, orrKm: 23.4, tier: 'TIER_3' as ServiceTier },
  { name: 'Chevella (Agro-Estate)', district: 'Rangareddy', mandal: 'Chevella', village: 'Kandawada', lat: 17.308, lng: 78.134, orrKm: 28.0, tier: 'TIER_3' as ServiceTier },
  { name: 'Maheshwaram (Pharma City)', district: 'Rangareddy', mandal: 'Maheshwaram', village: 'Mamidipally', lat: 17.135, lng: 78.432, orrKm: 14.2, tier: 'TIER_2' as ServiceTier },
  { name: 'Yadagirigutta (Temple Corridor)', district: 'Yadadri-Bhuvanagiri', mandal: 'Yadagirigutta', village: 'Raigir', lat: 17.585, lng: 78.945, orrKm: 46.0, tier: 'TIER_3' as ServiceTier },
];

const PRESET_IMAGES = [
  { label: 'Golden Farmland Sunset', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Green Agro-Estate Venture', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Commercial Road Frontage', url: 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Prime Gated Layout Plot', url: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1200&q=80' },
];

export default function CreateStaffPropertyModal({
  isOpen,
  onClose,
  onCreated,
}: CreateStaffPropertyModalProps) {
  const { user, token } = useAuth();

  // Mandate Sourcing Attribution
  const [mandateType, setMandateType] = useState<'IN_HOUSE' | 'EXTERNAL_OWNER'>('IN_HOUSE');
  const [landownerName, setLandownerName] = useState('');
  const [landownerPhone, setLandownerPhone] = useState('');
  const [landownerEmail, setLandownerEmail] = useState('');
  const [landownerAadhaar, setLandownerAadhaar] = useState('');

  // Property Classification & Initial Workflow State
  const [propertyType, setPropertyType] = useState<'LAND' | 'VILLA' | 'FLAT'>('LAND');
  const [initialStatus, setInitialStatus] = useState<'UNDER_REVIEW' | 'DRAFT'>('UNDER_REVIEW');

  // Basic Information
  const [titleEn, setTitleEn] = useState('');
  const [titleTe, setTitleTe] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionTe, setDescriptionTe] = useState('');

  // Location & Geospatial
  const [district, setDistrict] = useState('Rangareddy');
  const [mandal, setMandal] = useState('Shadnagar');
  const [village, setVillage] = useState('Kothur');
  const [latitude, setLatitude] = useState<number>(17.155);
  const [longitude, setLongitude] = useState<number>(78.228);
  const [distanceFromOrrKm, setDistanceFromOrrKm] = useState<number>(23.4);
  const [tier, setTier] = useState<ServiceTier>('TIER_3');

  // Land Specifications
  const [totalAcres, setTotalAcres] = useState<number>(5.0);
  const [surveyNumbers, setSurveyNumbers] = useState('142/A, 142/B');
  const [roadWidthFt, setRoadWidthFt] = useState<number>(60);
  const [soilType, setSoilType] = useState('RED');
  const [developmentLevel, setDevelopmentLevel] = useState('VENTURE_READY');
  const [waterAvailable, setWaterAvailable] = useState(true);
  const [electricityAvailable, setElectricityAvailable] = useState(true);

  // Pricing & Commercials
  const [pricePerAcre, setPricePerAcre] = useState<number>(40000000); // 4 Cr/Acre
  const [totalPrice, setTotalPrice] = useState<number>(200000000); // 20 Cr
  const [isNegotiable, setIsNegotiable] = useState(true);

  // Imagery
  const [mainImage, setMainImage] = useState(PRESET_IMAGES[0].url);

  // In-flight state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successPropertyId, setSuccessPropertyId] = useState<string | null>(null);

  // Handle Hub Preset Select
  const handleSelectHub = (hub: typeof TELANGANA_HUBS[0]) => {
    setDistrict(hub.district);
    setMandal(hub.mandal);
    setVillage(hub.village);
    setLatitude(hub.lat);
    setLongitude(hub.lng);
    setDistanceFromOrrKm(hub.orrKm);
    setTier(hub.tier);
  };

  // Auto calculate total price when acres or pricePerAcre changes
  const handleAcresChange = (acres: number) => {
    setTotalAcres(acres);
    if (pricePerAcre && acres > 0) {
      setTotalPrice(Math.round(acres * pricePerAcre));
    }
  };

  const handlePricePerAcreChange = (ppa: number) => {
    setPricePerAcre(ppa);
    if (totalAcres && totalAcres > 0) {
      setTotalPrice(Math.round(totalAcres * ppa));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!titleEn.trim()) {
      setErrorMessage('Property title (English) is required.');
      return;
    }
    if (!descriptionEn.trim()) {
      setErrorMessage('Property description (English) is required.');
      return;
    }
    if (totalPrice <= 0) {
      setErrorMessage('Total price must be greater than zero.');
      return;
    }
    if (mandateType === 'EXTERNAL_OWNER' && (!landownerName.trim() || !landownerPhone.trim())) {
      setErrorMessage('External landowner name and mobile phone are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const surveyArr = surveyNumbers
        .split(/[,;\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: CreatePropertyDTO = {
        type: propertyType,
        status: initialStatus,
        titleEn: titleEn.trim(),
        titleTe: titleTe.trim() || undefined,
        descriptionEn: descriptionEn.trim(),
        descriptionTe: descriptionTe.trim() || undefined,
        location: {
          district: district.trim(),
          mandal: mandal.trim(),
          village: village.trim(),
          latitude,
          longitude,
          distanceFromOrrKm,
          tier,
        },
        pricing: {
          totalPrice,
          pricePerAcre: propertyType === 'LAND' ? pricePerAcre : undefined,
          isNegotiable,
        },
        land:
          propertyType === 'LAND'
            ? {
                totalAcres,
                surveyNumbers: surveyArr.length > 0 ? surveyArr : ['1/A'],
                soilType,
                roadWidthFt,
                developmentLevel,
                waterAvailable,
                electricityAvailable,
              }
            : undefined,
        mainImage,
        galleryImages: [mainImage],
      };

      // If external landowner mandate, supply seller object
      if (mandateType === 'EXTERNAL_OWNER') {
        payload.seller = {
          name: landownerName.trim(),
          phone: landownerPhone.trim(),
          whatsapp: landownerPhone.trim(),
          email: landownerEmail.trim() || undefined,
          aadharNumber: landownerAadhaar.trim() || undefined,
        };
      }

      const result = await createProperty(payload, token || undefined);
      if (!result.success || !result.propertyId) {
        throw new Error(result.message || 'Failed to onboard property listing');
      }

      setSuccessPropertyId(result.propertyId);
      setTimeout(() => {
        onCreated(result.propertyId);
      }, 1500);
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to create property');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDE6DA] border border-[#C79A6B] flex items-center justify-center text-[#3A241C] shadow-xs">
              <Building2 className="w-5 h-5 text-[#8B624C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Onboard New Land / Property Mandate
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDE6DA] text-[#3A241C] border border-[#C79A6B] uppercase">
                  Staff Direct Intake
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Directly register proprietary brokerage lands or exclusive client mandates into the platform pipeline.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation Screen */}
        {successPropertyId ? (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 font-serif">
                Land Listing Successfully Onboarded!
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                System Reference ID: <span className="font-bold text-emerald-800">{successPropertyId}</span>
              </p>
              <p className="text-sm text-slate-600 max-w-md mx-auto pt-2">
                The land is saved under <span className="font-bold text-amber-700">{initialStatus}</span>. You can now audit its 13 statutory documents and publish it live on the main website!
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ── 1. Mandate Sourcing Attribution ──────────────────────────────────── */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  Mandate Ownership & Attribution
                </label>
                <span className="text-[11px] text-slate-500 font-medium">Logged in: {user?.name} ({user?.role})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMandateType('IN_HOUSE')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    mandateType === 'IN_HOUSE'
                      ? 'border-[#C79A6B] bg-[#FAF8F5] ring-2 ring-[#C79A6B]/20 text-[#3A241C]'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>Direct Company / In-House Land</span>
                    {mandateType === 'IN_HOUSE' && <CheckCircle2 className="w-4 h-4 text-[#8B624C]" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Brokerage owns or directly controls the asset. Attributed to staff profile.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMandateType('EXTERNAL_OWNER')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    mandateType === 'EXTERNAL_OWNER'
                      ? 'border-[#C79A6B] bg-[#FAF8F5] ring-2 ring-[#C79A6B]/20 text-[#3A241C]'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>Exclusive Landowner Mandate</span>
                    {mandateType === 'EXTERNAL_OWNER' && <CheckCircle2 className="w-4 h-4 text-[#8B624C]" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Sourced from a private farmer/owner. Contact details shielded from public.
                  </p>
                </button>
              </div>

              {mandateType === 'EXTERNAL_OWNER' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Landowner Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={landownerName}
                      onChange={(e) => setLandownerName(e.target.value)}
                      placeholder="e.g. Sri K. Malla Reddy"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Landowner Phone <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="tel"
                      value={landownerPhone}
                      onChange={(e) => setLandownerPhone(e.target.value)}
                      placeholder="+91 98480 11223"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Aadhaar / SRO Ref (Confidential)
                    </label>
                    <input
                      type="text"
                      value={landownerAadhaar}
                      onChange={(e) => setLandownerAadhaar(e.target.value)}
                      placeholder="e.g. 8923 4567 8901"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── 2. Classification & Initial Status ───────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Asset Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['LAND', 'VILLA', 'FLAT'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPropertyType(type)}
                      className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                        propertyType === type
                          ? 'border-[#C79A6B] bg-[#EDE6DA] text-[#3A241C]'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {type === 'LAND' ? '🌾 Land / Plot' : type === 'VILLA' ? '🏡 Villa' : '🏢 Apartment'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Initial Workflow Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInitialStatus('UNDER_REVIEW')}
                    className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                      initialStatus === 'UNDER_REVIEW'
                        ? 'border-amber-400 bg-amber-50 text-amber-800'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    🔍 Under Review (Recommended)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInitialStatus('DRAFT')}
                    className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                      initialStatus === 'DRAFT'
                        ? 'border-slate-400 bg-slate-100 text-slate-800'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    📝 Draft
                  </button>
                </div>
              </div>
            </div>

            {/* ── 3. Basic Details ─────────────────────────────────────────────────── */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Listing Title (English) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. 10 Acres Venture-Ready Commercial Land on Shadnagar Highway"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Listing Title (Telugu - Optional)
                </label>
                <input
                  type="text"
                  value={titleTe}
                  onChange={(e) => setTitleTe(e.target.value)}
                  placeholder="e.g. షాద్‌నగర్ హైవే వద్ద 10 ఎకరాల కమర్షియల్ భూమి"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-telugu"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Property Description (English) <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="Describe location advantages, road frontage, fencing, soil fertility, nearby development..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* ── 4. Location & Geospatial Engine ──────────────────────────────────── */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-700" />
                  Geospatial Location & ORR Corridor Tiering
                </label>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {tier} ({distanceFromOrrKm} km from ORR)
                </span>
              </div>

              {/* 1-Click Growth Hub Presets */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  1-Click Telangana Growth Hub Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {TELANGANA_HUBS.map((hub) => (
                    <button
                      key={hub.name}
                      type="button"
                      onClick={() => handleSelectHub(hub)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        mandal === hub.mandal && village === hub.village
                          ? 'bg-[#EDE6DA] border-[#C79A6B] text-[#3A241C] font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {hub.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mandal</label>
                  <input
                    type="text"
                    value={mandal}
                    onChange={(e) => setMandal(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Village / Locality</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">ORR Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={distanceFromOrrKm}
                    onChange={(e) => setDistanceFromOrrKm(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Corridor Tier</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as ServiceTier)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 font-bold bg-white"
                  >
                    <option value="TIER_1">TIER 1 (&lt; 10 km)</option>
                    <option value="TIER_2">TIER 2 (10 - 25 km)</option>
                    <option value="TIER_3">TIER 3 (&gt; 25 km / RRR)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── 5. Land Specifics ─────────────────────────────────────────────────── */}
            {propertyType === 'LAND' && (
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  Land Agronomy & Venture Specifications
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Total Extent (Acres) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={totalAcres}
                      onChange={(e) => handleAcresChange(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Survey Numbers
                    </label>
                    <input
                      type="text"
                      value={surveyNumbers}
                      onChange={(e) => setSurveyNumbers(e.target.value)}
                      placeholder="e.g. 142/A, 142/AA"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Approach Road Width (ft)
                    </label>
                    <input
                      type="number"
                      value={roadWidthFt}
                      onChange={(e) => setRoadWidthFt(parseInt(e.target.value, 10) || 40)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Soil Type</label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                    >
                      <option value="RED">Red Loam Soil</option>
                      <option value="BLACK">Black Cotton Soil</option>
                      <option value="MIXED">Mixed / Murrum</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Development State</label>
                    <select
                      value={developmentLevel}
                      onChange={(e) => setDevelopmentLevel(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                    >
                      <option value="VENTURE_READY">Venture Ready (Fenced)</option>
                      <option value="FARM_DEVELOPED">Managed Agro-Farm</option>
                      <option value="RAW">Raw Agriculture Land</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="water-toggle"
                      checked={waterAvailable}
                      onChange={(e) => setWaterAvailable(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="water-toggle" className="text-xs font-medium text-slate-700">
                      Borewell / Water
                    </label>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="elec-toggle"
                      checked={electricityAvailable}
                      onChange={(e) => setElectricityAvailable(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="elec-toggle" className="text-xs font-medium text-slate-700">
                      33KV / Electricity
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ── 6. Pricing & Commercials ─────────────────────────────────────────── */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-emerald-700" />
                  Commercial Valuation
                </label>
                <span className="text-xs font-extrabold text-[#8B624C] font-serif">
                  {formatINR(totalPrice)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Price Per Acre (₹)
                  </label>
                  <input
                    type="number"
                    step="100000"
                    value={pricePerAcre}
                    onChange={(e) => handlePricePerAcreChange(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 40000000"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {formatINR(pricePerAcre)} / Acre
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Total Acquisition Price (₹) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="500000"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 200000000"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 font-mono font-bold text-slate-900"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-slate-500">{formatINR(totalPrice)} total</span>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isNegotiable}
                        onChange={(e) => setIsNegotiable(e.target.checked)}
                        className="w-3.5 h-3.5 text-emerald-600 rounded"
                      />
                      Price Negotiable
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 7. Visual Imagery Selection ───────────────────────────────────────── */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Primary Showcase Imagery (1-Click Presets or Custom URL)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_IMAGES.map((img) => (
                  <button
                    key={img.label}
                    type="button"
                    onClick={() => setMainImage(img.url)}
                    className={`group relative rounded-lg overflow-hidden border-2 transition-all h-20 ${
                      mainImage === img.url ? 'border-[#C79A6B] ring-2 ring-[#C79A6B]/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-slate-900/70 text-[9px] text-white p-0.5 truncate text-center font-medium">
                      {img.label}
                    </span>
                  </button>
                ))}
              </div>
              <input
                type="url"
                value={mainImage}
                onChange={(e) => setMainImage(e.target.value)}
                placeholder="Or paste custom image URL..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono text-slate-600"
              />
            </div>

            {/* ── Footer Action Buttons ────────────────────────────────────────────── */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Registering Mandate…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create & Onboard Land Listing
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
