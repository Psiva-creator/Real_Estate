'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building,
  MapPin,
  DollarSign,
  FileCheck2,
  User,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Home,
  Layers,
  Sparkles,
  Phone,
  Calendar,
  Check,
} from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import { SellerFormData, INITIAL_SELLER_FORM_DATA, PropertyType } from '@/types/seller';
import DocumentChecklistUploader from './DocumentChecklistUploader';
import { formatINR } from '@/lib/formatters';
import { createProperty, CreatePropertyDTO } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface MultiStepFormProps {
  locale: Locale;
}

type StepId =
  | 'type'
  | 'basic'
  | 'location'
  | 'details'
  | 'pricing'
  | 'documents'
  | 'contact'
  | 'review';

interface StepMeta {
  id: StepId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function MultiStepForm({ locale }: MultiStepFormProps) {
  const dict = getDictionary(locale);
  const isTe = locale === 'te';
  const sfDict = dict.sellerForm;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<SellerFormData>(INITIAL_SELLER_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { user, token, isAuthenticated } = useAuth();

  // Auto-populate contact info if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        sellerName: prev.sellerName || user.name || '',
        sellerPhone: prev.sellerPhone || user.phone || '',
        sellerEmail: prev.sellerEmail || user.email || '',
      }));
    }
  }, [isAuthenticated, user]);

  const steps: StepMeta[] = [
    { id: 'type', label: sfDict.steps.type, icon: Home },
    { id: 'basic', label: sfDict.steps.basic, icon: FileCheck2 },
    { id: 'location', label: sfDict.steps.location, icon: MapPin },
    { id: 'details', label: sfDict.steps.details, icon: Layers },
    { id: 'pricing', label: sfDict.steps.pricing, icon: DollarSign },
    { id: 'documents', label: sfDict.steps.documents, icon: ShieldCheck },
    { id: 'contact', label: sfDict.steps.contact, icon: User },
    { id: 'review', label: sfDict.steps.review, icon: CheckCircle2 },
  ];

  const currentStep = steps[currentStepIndex];

  // Helper for updating form field
  const updateField = <K extends keyof SellerFormData>(field: K, value: SellerFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitError) setSubmitError(null);
    // Clear error for that field when user types
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Step Validation logic
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep.id) {
      case 'type':
        if (!formData.propertyType) {
          newErrors.propertyType = isTe ? 'దయచేసి ప్రాపర్టీ రకాన్ని ఎంచుకోండి' : 'Please select a property type';
        }
        break;

      case 'basic':
        if (!formData.title.trim()) {
          newErrors.title = isTe ? 'శీర్షిక తప్పనిసరి' : 'Listing title is required';
        } else if (formData.title.trim().length < 5) {
          newErrors.title = isTe ? 'శీర్షిక కనీసం 5 అక్షరాలు ఉండాలి' : 'Title must be at least 5 characters';
        }

        if (!formData.description.trim()) {
          newErrors.description = isTe ? 'వివరణ తప్పనిసరి' : 'Description is required';
        } else if (formData.description.trim().length < 15) {
          newErrors.description = isTe ? 'వివరణ కనీసం 15 అక్షరాలు ఉండాలి' : 'Description must be at least 15 characters';
        }
        break;

      case 'location':
        if (!formData.district.trim()) {
          newErrors.district = isTe ? 'జిల్లా తప్పనిసరి' : 'District is required';
        }
        if (!formData.mandal.trim()) {
          newErrors.mandal = isTe ? 'మండలం తప్పనిసరి' : 'Mandal is required';
        }
        if (!formData.village.trim()) {
          newErrors.village = isTe ? 'గ్రామం / ప్రాంతం తప్పనిసరి' : 'Village / Locality is required';
        }
        if (formData.distanceFromOrrKm === '' || isNaN(Number(formData.distanceFromOrrKm))) {
          newErrors.distanceFromOrrKm = isTe ? 'ORR దూరం నమోదు చేయండి' : 'Enter distance from ORR';
        }
        break;

      case 'details':
        if (formData.propertyType === 'LAND') {
          if (!formData.totalAcres.trim() && !formData.sqYards.trim()) {
            newErrors.totalAcres = isTe ? 'ఎకరాలు లేదా చదరపు గజాలు నమోదు చేయండి' : 'Enter acres or sq yards';
          }
          if (!formData.surveyNumbers.trim()) {
            newErrors.surveyNumbers = isTe ? 'సర్వే నంబర్లు తప్పనిసరి' : 'Survey number(s) required';
          }
        } else if (formData.propertyType === 'VILLA') {
          if (!formData.plotSqYards.trim() || isNaN(Number(formData.plotSqYards))) {
            newErrors.plotSqYards = isTe ? 'ప్లాట్ విస్తీర్ణం తప్పనిసరి' : 'Plot area (sq.yds) required';
          }
          if (!formData.builtUpSqft.trim() || isNaN(Number(formData.builtUpSqft))) {
            newErrors.builtUpSqft = isTe ? 'నిర్మాణ విస్తీర్ణం తప్పనిసరి' : 'Built-up sq.ft required';
          }
        } else {
          if (!formData.sqft.trim() || isNaN(Number(formData.sqft))) {
            newErrors.sqft = isTe ? 'నిర్మాణ విస్తీర్ణం తప్పనిసరి' : 'Built-up sq.ft required';
          }
        }
        break;

      case 'pricing':
        if (!formData.totalPrice.trim() || isNaN(Number(formData.totalPrice)) || Number(formData.totalPrice) <= 0) {
          newErrors.totalPrice = isTe ? 'చెల్లుబాటు అయ్యే మొత్తం ధరను నమోదు చేయండి' : 'Enter a valid asking price';
        }
        break;

      case 'documents':
        // We encourage uploading documents, but provide gentle confirmation
        break;

      case 'contact':
        if (!formData.sellerName.trim()) {
          newErrors.sellerName = isTe ? 'పేరు తప్పనిసరి' : 'Full name is required';
        }
        const phoneDigits = formData.sellerPhone.replace(/\D/g, '');
        if (!phoneDigits || phoneDigits.length < 10) {
          newErrors.sellerPhone = isTe ? '10 అంకెల ఫోన్ నంబర్ తప్పనిసరి' : 'Valid 10-digit phone number is required';
        }
        break;

      case 'review':
        if (!formData.agreedToTerms) {
          newErrors.agreedToTerms = isTe
            ? 'సమర్పించడానికి ముందు నిబంధనలను అంగీకరించాలి'
            : 'You must certify authenticity and terms to submit';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
        window.scrollTo({ top: 150, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const totalPriceNum = parseFloat(formData.totalPrice);
      const orrDistanceNum =
        formData.distanceFromOrrKm !== '' && !isNaN(Number(formData.distanceFromOrrKm))
          ? parseFloat(formData.distanceFromOrrKm)
          : undefined;

      // Land specifics mapping
      let landPayload: CreatePropertyDTO['land'] = undefined;
      if (formData.propertyType === 'LAND') {
        let acres = parseFloat(formData.totalAcres);
        if (isNaN(acres) || acres <= 0) {
          if (formData.sqYards && !isNaN(parseFloat(formData.sqYards))) {
            acres = parseFloat(formData.sqYards) / 4840;
          } else if (formData.guntas && !isNaN(parseFloat(formData.guntas))) {
            acres = parseFloat(formData.guntas) / 40;
          } else {
            acres = 1.0;
          }
        }

        const surveyArr = formData.surveyNumbers
          .split(/[,;\s]+/)
          .map((s) => s.trim())
          .filter(Boolean);

        landPayload = {
          totalAcres: acres,
          surveyNumbers: surveyArr.length > 0 ? surveyArr : ['1/A'],
          soilType: 'RED',
          developmentLevel: formData.developmentLevel || 'RAW',
          roadWidthFt: formData.roadWidthFt ? parseInt(formData.roadWidthFt, 10) : undefined,
          waterAvailable: formData.waterAvailable,
          electricityAvailable: formData.electricityAvailable,
        };
      }

      // Flat specifics mapping
      let flatPayload: CreatePropertyDTO['flat'] = undefined;
      if (formData.propertyType === 'FLAT') {
        const amenitiesArr = formData.amenities
          ? formData.amenities
              .split(/[,;]+/)
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

        flatPayload = {
          sqft: formData.sqft ? parseInt(formData.sqft, 10) : 1000,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms, 10) : 2,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms, 10) : undefined,
          floor: formData.floor ? parseInt(formData.floor, 10) : undefined,
          totalFloors: formData.totalFloors ? parseInt(formData.totalFloors, 10) : undefined,
          amenities: amenitiesArr,
          possessionStatus: formData.possessionStatus || 'READY_TO_MOVE',
          furnishingStatus: formData.furnishingStatus || 'UNFURNISHED',
        };
      }

      // Villa specifics mapping
      let villaPayload: CreatePropertyDTO['villa'] = undefined;
      if (formData.propertyType === 'VILLA') {
        villaPayload = {
          plotSqYards: parseFloat(formData.plotSqYards) || 300,
          builtUpSqft: parseFloat(formData.builtUpSqft) || 3000,
          bedrooms: parseInt(formData.bedrooms, 10) || 4,
          bathrooms: parseInt(formData.bathrooms, 10) || 4,
          floorsConfig: formData.floorsConfig || 'G+2',
          privateGarden: formData.privateGarden,
          coveredParking: parseInt(formData.coveredParking, 10) || 2,
        };
      }

      // Pricing details mapping
      const pricingPayload: CreatePropertyDTO['pricing'] = {
        totalPrice: totalPriceNum,
        pricePerAcre: formData.pricePerAcre ? parseFloat(formData.pricePerAcre) : undefined,
        pricePerSqft: formData.pricePerSqft ? parseFloat(formData.pricePerSqft) : undefined,
        pricePerSqYard: formData.pricePerSqYard ? parseFloat(formData.pricePerSqYard) : undefined,
        isNegotiable: formData.isNegotiable,
      };

      // Representative default imagery by property type
      const mainImage =
        formData.propertyType === 'LAND'
          ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
          : formData.propertyType === 'VILLA'
          ? 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
          : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';

      const payload: CreatePropertyDTO = {
        seller: {
          name: formData.sellerName.trim(),
          phone: formData.sellerPhone.trim(),
          whatsapp: formData.sellerPhone.trim(),
          email: formData.sellerEmail.trim() || undefined,
        },
        type: formData.propertyType,
        titleEn: formData.title.trim(),
        titleTe: isTe ? formData.title.trim() : undefined,
        descriptionEn: formData.description.trim(),
        descriptionTe: isTe ? formData.description.trim() : undefined,
        location: {
          district: formData.district.trim(),
          mandal: formData.mandal.trim(),
          village: formData.village.trim(),
          distanceFromOrrKm: orrDistanceNum,
          zone: formData.zone || undefined,
        },
        land: landPayload,
        flat: flatPayload,
        villa: villaPayload,
        boundaryCoordinates: formData.boundaryCoordinates,
        pricing: pricingPayload,
        mainImage,
      };

      const result = await createProperty(payload, token || undefined);

      if (result.success && result.propertyId) {
        setSubmittedRefId(result.propertyId);
        window.scrollTo({ top: 100, behavior: 'smooth' });
      } else {
        throw new Error(
          result.message ||
            sfDict.review?.submissionError ||
            'Failed to submit property listing'
        );
      }
    } catch (err: unknown) {
      console.error('[MultiStepForm] Submission error:', err);
      const msg =
        (err as Error)?.message ||
        sfDict.review?.submissionError ||
        'Failed to submit property listing. Please try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData(INITIAL_SELLER_FORM_DATA);
    setSubmittedRefId(null);
    setCurrentStepIndex(0);
    setErrors({});
    setSubmitError(null);
  };

  // Count uploaded docs
  const uploadedDocsCount = Object.values(formData.documents).filter(
    (d) => d.status === 'UPLOADED' || d.status === 'VERIFIED'
  ).length;

  // Render Submission Success Screen
  if (submittedRefId) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-10 max-w-2xl mx-auto text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-emerald-700" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {sfDict.review.successTitle}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isTe ? 'ప్రాపర్టీ లిస్టింగ్ పరిశీలనకు చేరింది' : 'Listing Queued for 13-Doc Verification'}
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {sfDict.review.successSubtitle}
          </p>
        </div>

        {/* Reference ID card */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 inline-block text-left min-w-[280px]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            {sfDict.review.successRef}
          </span>
          <span className="text-base sm:text-lg font-extrabold text-emerald-800 font-mono break-all mt-0.5 block">
            {submittedRefId}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            {uploadedDocsCount} / 13 documents submitted in packet
          </span>
        </div>

        {/* What happens next box */}
        <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100 text-left space-y-3">
          <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>{sfDict.review.nextStepsTitle}</span>
          </h4>
          <div className="space-y-2.5 text-xs text-emerald-900">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                1
              </span>
              <div>
                <span className="font-bold block">{sfDict.review.step1Title}</span>
                <span className="text-emerald-800/80">{sfDict.review.step1Desc}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                2
              </span>
              <div>
                <span className="font-bold block">{sfDict.review.step2Title}</span>
                <span className="text-emerald-800/80">{sfDict.review.step2Desc}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                3
              </span>
              <div>
                <span className="font-bold block">{sfDict.review.step3Title}</span>
                <span className="text-emerald-800/80">{sfDict.review.step3Desc}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={`/${locale}/properties`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors tap-target flex items-center justify-center gap-2"
          >
            <span>{sfDict.review.btnExplore}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={handleResetForm}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors tap-target"
          >
            {sfDict.review.btnSubmitAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg overflow-hidden">
      {/* Visual Stepper Bar */}
      <div className="bg-slate-900 text-white p-4 sm:p-6 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {sfDict.navigation.stepIndicator
                .replace('{current}', (currentStepIndex + 1).toString())
                .replace('{total}', steps.length.toString())
                .replace('{name}', currentStep.label)}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
          </span>
        </div>

        {/* Stepper Dots & Progress Track */}
        <div className="relative">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Step Pill Icons (scrollable on narrow mobile screens) */}
          <div className="flex items-center justify-between gap-1 mt-3 overflow-x-auto pb-1 no-scrollbar">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    // Allow jumping back to earlier steps or validate before jumping
                    if (idx < currentStepIndex || validateCurrentStep()) {
                      setCurrentStepIndex(idx);
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors tap-target ${
                    isCurrent
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCompleted
                      ? 'text-emerald-400 hover:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6">
        {/* Step 1: Property Type */}
        {currentStep.id === 'type' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {sfDict.typeSelection.heading}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {sfDict.typeSelection.subheading}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Land Card */}
              <button
                type="button"
                onClick={() => updateField('propertyType', 'LAND')}
                className={`p-5 rounded-2xl border-2 text-left transition-all tap-target flex flex-col justify-between space-y-4 ${
                  formData.propertyType === 'LAND'
                    ? 'border-emerald-700 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Layers className="w-6 h-6" />
                  </div>
                  {formData.propertyType === 'LAND' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {sfDict.typeSelection.landTitle}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {sfDict.typeSelection.landDesc}
                  </p>
                </div>
              </button>

              {/* Flat Card */}
              <button
                type="button"
                onClick={() => updateField('propertyType', 'FLAT')}
                className={`p-5 rounded-2xl border-2 text-left transition-all tap-target flex flex-col justify-between space-y-4 ${
                  formData.propertyType === 'FLAT'
                    ? 'border-emerald-700 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Home className="w-6 h-6" />
                  </div>
                  {formData.propertyType === 'FLAT' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {sfDict.typeSelection.flatTitle}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {sfDict.typeSelection.flatDesc}
                  </p>
                </div>
              </button>

              {/* Villa Card */}
              <button
                type="button"
                onClick={() => updateField('propertyType', 'VILLA')}
                className={`p-5 rounded-2xl border-2 text-left transition-all tap-target flex flex-col justify-between space-y-4 ${
                  formData.propertyType === 'VILLA'
                    ? 'border-emerald-700 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  {formData.propertyType === 'VILLA' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isTe ? 'గేటెడ్ లగ్జరీ విల్లా' : 'Luxury Gated Villa'}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {isTe
                      ? 'వ్యక్తిగత స్థలం, తోట మరియు క్లబ్‌హౌస్ సదుపాయాలతో కూడిన ట్రిప్లెక్స్ లేదా డ్యూప్లెక్స్ విల్లా'
                      : 'Independent duplex / triplex villa with private plot, lawn, and community amenities'}
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Basic Info */}
        {currentStep.id === 'basic' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {sfDict.basicInfo.heading}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {sfDict.basicInfo.subheading}
              </p>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {sfDict.basicInfo.titleLabel} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder={sfDict.basicInfo.titlePlaceholder}
                  className={`w-full h-12 px-3.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                    errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.title && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.title}</span>
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {sfDict.basicInfo.descLabel} *
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder={sfDict.basicInfo.descPlaceholder}
                  className={`w-full p-3.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                    errors.description ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.description && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.description}</span>
                  </p>
                )}
              </div>

              {/* Zone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {sfDict.basicInfo.zoneLabel}
                </label>
                <input
                  type="text"
                  value={formData.zone}
                  onChange={(e) => updateField('zone', e.target.value)}
                  placeholder={sfDict.basicInfo.zonePlaceholder}
                  className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {currentStep.id === 'location' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {sfDict.location.heading}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {sfDict.location.subheading}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* District */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {sfDict.location.districtLabel} *
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => updateField('district', e.target.value)}
                  placeholder={sfDict.location.districtPlaceholder}
                  className={`w-full h-12 px-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                    errors.district ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.district && (
                  <p className="text-xs text-rose-600 mt-1">{errors.district}</p>
                )}
              </div>

              {/* Mandal */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {sfDict.location.mandalLabel} *
                </label>
                <input
                  type="text"
                  value={formData.mandal}
                  onChange={(e) => updateField('mandal', e.target.value)}
                  placeholder={sfDict.location.mandalPlaceholder}
                  className={`w-full h-12 px-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                    errors.mandal ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.mandal && (
                  <p className="text-xs text-rose-600 mt-1">{errors.mandal}</p>
                )}
              </div>

              {/* Village */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {sfDict.location.villageLabel} *
                </label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => updateField('village', e.target.value)}
                  placeholder={sfDict.location.villagePlaceholder}
                  className={`w-full h-12 px-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                    errors.village ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.village && (
                  <p className="text-xs text-rose-600 mt-1">{errors.village}</p>
                )}
              </div>

              {/* ORR Distance */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {sfDict.location.orrDistanceLabel} *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.distanceFromOrrKm}
                  onChange={(e) => updateField('distanceFromOrrKm', e.target.value)}
                  placeholder={sfDict.location.orrDistancePlaceholder}
                  className={`w-full h-12 px-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono ${
                    errors.distanceFromOrrKm ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.distanceFromOrrKm && (
                  <p className="text-xs text-rose-600 mt-1">{errors.distanceFromOrrKm}</p>
                )}
              </div>

              {/* Landmark */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {sfDict.location.landmarkLabel}
                </label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => updateField('landmark', e.target.value)}
                  placeholder={sfDict.location.landmarkPlaceholder}
                  className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Details & Specs */}
        {currentStep.id === 'details' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {formData.propertyType === 'LAND'
                  ? sfDict.details.headingLand
                  : sfDict.details.headingFlat}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {sfDict.details.subheading}
              </p>
            </div>

            {/* Land Specs */}
            {formData.propertyType === 'LAND' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {sfDict.details.totalAcresLabel} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.totalAcres}
                      onChange={(e) => updateField('totalAcres', e.target.value)}
                      placeholder="e.g. 2.5"
                      className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {sfDict.details.guntasLabel}
                    </label>
                    <input
                      type="number"
                      value={formData.guntas}
                      onChange={(e) => updateField('guntas', e.target.value)}
                      placeholder="0-39"
                      className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {sfDict.details.sqYardsLabel}
                    </label>
                    <input
                      type="number"
                      value={formData.sqYards}
                      onChange={(e) => updateField('sqYards', e.target.value)}
                      placeholder="e.g. 300"
                      className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                {errors.totalAcres && (
                  <p className="text-xs text-rose-600">{errors.totalAcres}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Survey Numbers */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {sfDict.details.surveyNumbersLabel} *
                    </label>
                    <input
                      type="text"
                      value={formData.surveyNumbers}
                      onChange={(e) => updateField('surveyNumbers', e.target.value)}
                      placeholder={sfDict.details.surveyPlaceholder}
                      className={`w-full h-12 px-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono ${
                        errors.surveyNumbers ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    />
                    {errors.surveyNumbers && (
                      <p className="text-xs text-rose-600 mt-1">{errors.surveyNumbers}</p>
                    )}
                  </div>

                  {/* Road Width */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {sfDict.details.roadWidthLabel}
                    </label>
                    <input
                      type="number"
                      value={formData.roadWidthFt}
                      onChange={(e) => updateField('roadWidthFt', e.target.value)}
                      placeholder={sfDict.details.roadWidthPlaceholder}
                      className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono"
                    />
                  </div>
                </div>

                {/* Development Level */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {sfDict.details.developmentLevelLabel}
                  </label>
                  <select
                    value={formData.developmentLevel}
                    onChange={(e) => updateField('developmentLevel', e.target.value as any)}
                    className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                  >
                    <option value="RAW">{sfDict.details.devRaw}</option>
                    <option value="FENCED">{sfDict.details.devFenced}</option>
                    <option value="PARTIALLY_DEVELOPED">{sfDict.details.devPartially}</option>
                    <option value="VENTURE_READY">{sfDict.details.devVentureReady}</option>
                  </select>
                </div>

                {/* Utilities Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.waterAvailable}
                      onChange={(e) => updateField('waterAvailable', e.target.checked)}
                      className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-700"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      {sfDict.details.waterAvailable}
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.electricityAvailable}
                      onChange={(e) => updateField('electricityAvailable', e.target.checked)}
                      className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-700"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      {sfDict.details.electricityAvailable}
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Flat Specs */}
            {formData.propertyType === 'FLAT' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {sfDict.details.bedroomsLabel} *
                    </label>
                    <select
                      value={formData.bedrooms}
                      onChange={(e) => updateField('bedrooms', e.target.value)}
                      className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                    >
                      <option value="1">1 BHK</option>
                      <option value="2">2 BHK</option>
                      <option value="2.5">2.5 BHK</option>
                      <option value="3">3 BHK</option>
                      <option value="3.5">3.5 BHK</option>
                      <option value="4">4 BHK</option>
                      <option value="5">5+ BHK</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {sfDict.details.bathroomsLabel}
                    </label>
                    <select
                      value={formData.bathrooms}
                      onChange={(e) => updateField('bathrooms', e.target.value)}
                      className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {sfDict.details.sqftLabel} *
                    </label>
                    <input
                      type="number"
                      value={formData.sqft}
                      onChange={(e) => updateField('sqft', e.target.value)}
                      placeholder="e.g. 1850"
                      className={`w-full h-12 px-3.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                        errors.sqft ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    />
                    {errors.sqft && (
                      <p className="text-xs text-rose-600 mt-1">{errors.sqft}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {sfDict.details.possessionLabel}
                    </label>
                    <select
                      value={formData.possessionStatus}
                      onChange={(e) => updateField('possessionStatus', e.target.value as any)}
                      className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                    >
                      <option value="READY_TO_MOVE">{sfDict.details.readyToMove}</option>
                      <option value="UNDER_CONSTRUCTION">{sfDict.details.underConstruction}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {sfDict.details.furnishingLabel}
                    </label>
                    <select
                      value={formData.furnishingStatus}
                      onChange={(e) => updateField('furnishingStatus', e.target.value as any)}
                      className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                    >
                      <option value="UNFURNISHED">{sfDict.details.unfurnished}</option>
                      <option value="SEMI_FURNISHED">{sfDict.details.semiFurnished}</option>
                      <option value="FULLY_FURNISHED">{sfDict.details.fullyFurnished}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {sfDict.details.amenitiesLabel}
                  </label>
                  <input
                    type="text"
                    value={formData.amenities}
                    onChange={(e) => updateField('amenities', e.target.value)}
                    placeholder={sfDict.details.amenitiesPlaceholder}
                    className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Pricing */}
        {currentStep.id === 'pricing' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {sfDict.pricing.heading}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {sfDict.pricing.subheading}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {sfDict.pricing.totalPriceLabel} *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={formData.totalPrice}
                    onChange={(e) => updateField('totalPrice', e.target.value)}
                    placeholder={sfDict.pricing.totalPricePlaceholder}
                    className={`w-full h-12 pl-8 pr-4 rounded-xl border text-base font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                      errors.totalPrice ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.totalPrice && (
                  <p className="text-xs text-rose-600 mt-1">{errors.totalPrice}</p>
                )}
                {formData.totalPrice && Number(formData.totalPrice) > 0 && (
                  <p className="text-xs text-emerald-800 font-semibold mt-1">
                    Formatted: {formatINR(Number(formData.totalPrice))}
                  </p>
                )}
              </div>

              {/* Sub unit price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formData.propertyType === 'LAND' ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {sfDict.pricing.pricePerAcreLabel}
                      </label>
                      <input
                        type="number"
                        value={formData.pricePerAcre}
                        onChange={(e) => updateField('pricePerAcre', e.target.value)}
                        placeholder="e.g. 15000000"
                        className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {sfDict.pricing.pricePerSqYardLabel}
                      </label>
                      <input
                        type="number"
                        value={formData.pricePerSqYard}
                        onChange={(e) => updateField('pricePerSqYard', e.target.value)}
                        placeholder="e.g. 25000"
                        className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {sfDict.pricing.pricePerSqftLabel}
                    </label>
                    <input
                      type="number"
                      value={formData.pricePerSqft}
                      onChange={(e) => updateField('pricePerSqft', e.target.value)}
                      placeholder="e.g. 6500"
                      className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                )}
              </div>

              {/* Negotiable Checkbox */}
              <label className="flex items-center gap-2.5 p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNegotiable}
                  onChange={(e) => updateField('isNegotiable', e.target.checked)}
                  className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-700"
                />
                <span className="text-xs sm:text-sm font-medium text-slate-800">
                  {sfDict.pricing.negotiableLabel}
                </span>
              </label>

              {/* Brokerage note */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>{sfDict.pricing.brokerageNote}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: 13-Document Verification Gate */}
        {currentStep.id === 'documents' && (
          <DocumentChecklistUploader
            locale={locale}
            propertyType={formData.propertyType}
            documents={formData.documents}
            onChange={(docs) => updateField('documents', docs)}
          />
        )}

        {/* Step 7: Seller Contact */}
        {currentStep.id === 'contact' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {sfDict.contact.heading}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {sfDict.contact.subheading}
              </p>
            </div>

            <div className="space-y-4">
              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  {sfDict.contact.roleLabel} *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateField('sellerRole', 'OWNER')}
                    className={`p-3.5 rounded-xl border text-xs sm:text-sm font-semibold text-left transition-all tap-target flex items-center justify-between ${
                      formData.sellerRole === 'OWNER'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{sfDict.contact.roleOwner}</span>
                    {formData.sellerRole === 'OWNER' && <Check className="w-4 h-4 text-emerald-700" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => updateField('sellerRole', 'GPA')}
                    className={`p-3.5 rounded-xl border text-xs sm:text-sm font-semibold text-left transition-all tap-target flex items-center justify-between ${
                      formData.sellerRole === 'GPA'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{sfDict.contact.roleGpa}</span>
                    {formData.sellerRole === 'GPA' && <Check className="w-4 h-4 text-emerald-700" />}
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {sfDict.contact.fullNameLabel} *
                </label>
                <input
                  type="text"
                  value={formData.sellerName}
                  onChange={(e) => updateField('sellerName', e.target.value)}
                  placeholder={sfDict.contact.fullNamePlaceholder}
                  className={`w-full h-12 px-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                    errors.sellerName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.sellerName && (
                  <p className="text-xs text-rose-600 mt-1">{errors.sellerName}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {sfDict.contact.phoneLabel} *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={formData.sellerPhone}
                    onChange={(e) => updateField('sellerPhone', e.target.value)}
                    placeholder={sfDict.contact.phonePlaceholder}
                    className={`w-full h-12 pl-12 pr-4 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                      errors.sellerPhone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.sellerPhone && (
                  <p className="text-xs text-rose-600 mt-1">{errors.sellerPhone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {sfDict.contact.emailLabel}
                </label>
                <input
                  type="email"
                  value={formData.sellerEmail}
                  onChange={(e) => updateField('sellerEmail', e.target.value)}
                  placeholder={sfDict.contact.emailPlaceholder}
                  className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              {/* Privacy Notice */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>{sfDict.contact.privacyNotice}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 8: Review & Submit */}
        {currentStep.id === 'review' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {sfDict.review.heading}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {sfDict.review.subheading}
              </p>
            </div>

            {/* Structured Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Property overview */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  {sfDict.review.propertyOverview}
                </span>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{formData.title}</h4>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <span className="font-semibold text-slate-700">Type:</span> {formData.propertyType}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Zone:</span> {formData.zone}
                  </p>
                  <p className="line-clamp-2 italic text-slate-500">{formData.description}</p>
                </div>
              </div>

              {/* Card 2: Location */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  {sfDict.review.locationSummary}
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {formData.village}, {formData.mandal}
                </h4>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <span className="font-semibold text-slate-700">District:</span> {formData.district}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">ORR Distance:</span> {formData.distanceFromOrrKm} km
                  </p>
                  {formData.landmark && (
                    <p>
                      <span className="font-semibold text-slate-700">Landmark:</span> {formData.landmark}
                    </p>
                  )}
                </div>
              </div>

              {/* Card 3: Specs & Pricing */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  {sfDict.review.pricingSummary}
                </span>
                <div className="text-lg font-extrabold text-slate-900">
                  {formData.totalPrice ? formatINR(Number(formData.totalPrice)) : '₹0'}
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  {formData.propertyType === 'LAND' ? (
                    <p>
                      <span className="font-semibold text-slate-700">Acreage:</span> {formData.totalAcres} Acres{' '}
                      {formData.guntas ? `(${formData.guntas} Guntas)` : ''}
                    </p>
                  ) : (
                    <p>
                      <span className="font-semibold text-slate-700">Configuration:</span> {formData.bedrooms} BHK ({formData.sqft} sq.ft)
                    </p>
                  )}
                  <p>
                    <span className="font-semibold text-slate-700">Negotiable:</span>{' '}
                    {formData.isNegotiable ? 'Yes' : 'Fixed Price'}
                  </p>
                </div>
              </div>

              {/* Card 4: Documents & Contact */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  {sfDict.review.docsSummary}
                </span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>{uploadedDocsCount} of 13 Uploaded</span>
                  </span>
                </div>
                <div className="text-xs text-slate-600 pt-1 space-y-1">
                  <p>
                    <span className="font-semibold text-slate-700">Owner Name:</span> {formData.sellerName}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Contact:</span> +91 {formData.sellerPhone}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Role:</span> {formData.sellerRole}
                  </p>
                </div>
              </div>
            </div>

            {/* Certify Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={(e) => updateField('agreedToTerms', e.target.checked)}
                  className="w-5 h-5 text-emerald-800 rounded focus:ring-emerald-700 shrink-0 mt-0.5"
                />
                <span className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  {sfDict.review.certifyTerms}
                </span>
              </label>
              {errors.agreedToTerms && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.agreedToTerms}</span>
                </p>
              )}
            </div>

            {/* Backend Submission Error Banner */}
            {submitError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-xs sm:text-sm animate-in fade-in duration-150">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block">
                    {isTe ? 'సమర్పణ విఫలమైంది' : 'Submission Failed'}
                  </span>
                  <span className="text-slate-700">{submitError}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Global Error Banner if any */}
        {Object.keys(errors).length > 0 && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>{isTe ? 'కొనసాగడానికి ముందు అవసరమైన వివరాలన్నీ సరిచూసుకోండి' : 'Please check and fill in all required fields to continue.'}</span>
          </div>
        )}

        {/* Navigation Actions Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {currentStepIndex > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors tap-target"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{sfDict.navigation.back}</span>
            </button>
          ) : (
            <div />
          )}

          {currentStepIndex < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all tap-target active:scale-[0.98]"
            >
              <span>{sfDict.navigation.next}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:bg-emerald-900/60 text-white text-xs sm:text-sm font-bold shadow-lg transition-all tap-target active:scale-[0.98]"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>{isSubmitting ? sfDict.review.submitting : sfDict.review.submitButton}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
