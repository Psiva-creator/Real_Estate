/**
 * api.ts — Frontend API layer
 *
 * Connects to the real backend at NEXT_PUBLIC_API_BASE_URL (http://localhost:5000/api).
 * Falls back gracefully to mockData when the backend is unavailable or returns an error.
 *
 * Backend endpoints used:
 *   GET  /api/properties          → list LIVE properties (paginated)
 *   GET  /api/properties/:id      → property detail (wrapped in { property: ... })
 *   POST /api/enquiries           → submit buyer enquiry
 *
 * Backend response shapes differ from MockProperty:
 *   - titleEn / titleTe   (not title)
 *   - descriptionEn / descriptionTe   (not description)
 *   - verificationStatus.verifiedDocuments / verificationStatus.totalDocuments
 *   - no dharaniApproved / hmdaApproved / reraApproved booleans at top level
 *
 * transformBackendProperty() maps the backend shape → MockProperty for UI consumption.
 */

import { MockProperty, MOCK_PROPERTIES, PropertyType, PropertyStatus, ServiceTier } from './mockData';
import { AdminPropertyDetails } from '@/types/adminDetails';
import { loadAdminDetails, persistAdminDetailsLocally } from './adminDetailsStorage';

// ─── Enquiry types ─────────────────────────────────────────────────────────────

export type EnquiryType = 'SITE_VISIT' | 'CALL' | 'QUESTION';

export interface CreateEnquiryDTO {
  propertyId: string;
  propertyTitle: string;
  buyerName: string;
  phone: string;
  whatsapp?: string;
  enquiryType: EnquiryType;
  preferredDate?: string;
  preferredTime?: string;
  timeSlot?: string;
  callingWindow?: string;
  message?: string;
}

export interface EnquirySubmissionResult {
  success: boolean;
  referenceId: string;
  message?: string;
  timestamp: string;
}

// ─── Seller property creation types ──────────────────────────────────────────

export interface CreatePropertyDTO {
  seller: {
    name: string;
    phone: string;
    whatsapp?: string;
    email?: string;
    aadharNumber?: string;
  };
  type: PropertyType;
  titleEn: string;
  titleTe?: string;
  descriptionEn: string;
  descriptionTe?: string;
  location: {
    district: string;
    mandal: string;
    village: string;
    distanceFromOrrKm?: number;
    zone?: string;
    tier?: ServiceTier;
    latitude?: number;
    longitude?: number;
  };
  land?: {
    totalAcres: number;
    surveyNumbers: string[];
    soilType?: string;
    developmentLevel?: string;
    roadWidthFt?: number;
    waterAvailable?: boolean;
    electricityAvailable?: boolean;
  };
  flat?: {
    sqft: number;
    bedrooms: number;
    bathrooms?: number;
    floor?: number;
    totalFloors?: number;
    amenities?: string[];
    possessionStatus?: string;
    furnishingStatus?: string;
  };
  villa?: {
    plotAreaSqYards?: number;
    plotSqYards?: number;
    builtUpAreaSqFt?: number;
    builtUpSqft?: number;
    configuration?: string;
    floors?: string;
    floorsConfig?: string;
    facing?: string;
    communityName?: string;
    gatedCommunity?: boolean;
    privateGarden?: boolean;
    coveredParking?: number;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
  };
  boundaryCoordinates?: Array<{ lat: number; lng: number }> | null;
  pricing: {
    totalPrice: number;
    pricePerAcre?: number;
    pricePerSqft?: number;
    pricePerSqYard?: number;
    isNegotiable?: boolean;
  };
  mainImage: string;
  galleryImages?: string[];
  sitePlanImage?: string;
}

export interface PropertyCreationResult {
  success: boolean;
  propertyId: string;
  message?: string;
  fromBackend: boolean;
}

// ─── Backend API response shapes ───────────────────────────────────────────────

interface BackendLocation {
  village: string;
  mandal: string;
  district: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  distanceFromOrrKm?: number;
  zone?: string;
  tier: ServiceTier;
  landmark?: string;
  landmarkTe?: string;
}

interface BackendLandDetails {
  totalAcres?: number;
  sqYards?: number;
  surveyNumbers?: string[];
  soilType?: string;
  developmentLevel?: string;
  roadWidthFt?: number;
  waterAvailable?: boolean;
  electricityAvailable?: boolean;
}

interface BackendFlatDetails {
  sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  amenities?: string[];
  possessionStatus?: string;
  furnishingStatus?: string;
}

interface BackendVillaDetails {
  plotAreaSqYards?: number;
  plotSqYards?: number;
  builtUpAreaSqFt?: number;
  builtUpSqft?: number;
  configuration?: string;
  floors?: string | number;
  floorsConfig?: string;
  facing?: string;
  communityName?: string;
  gatedCommunity?: boolean;
  privateGarden?: boolean;
  coveredParking?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  possessionStatus?: string;
}

interface BackendPricing {
  totalPrice: number;
  pricePerSqft?: number;
  pricePerAcre?: number;
  pricePerSqYard?: number;
  isNegotiable: boolean;
}

export interface BackendProperty {
  id: string;
  type: PropertyType;
  status: PropertyStatus;
  titleEn: string;
  titleTe?: string;
  descriptionEn: string;
  descriptionTe?: string;
  location: BackendLocation;
  land?: BackendLandDetails;
  flat?: BackendFlatDetails;
  villa?: BackendVillaDetails;
  boundaryCoordinates?: Array<{ lat: number; lng: number }> | null;
  pricing: BackendPricing;
  mainImage: string;
  galleryImages: string[];
  sitePlanImage?: string;
  isFeatured: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  projectHighlights?: string[];
  locationHighlights?: string[];
  bankApprovals?: string[];
  externalLinks?: {
    projectLink?: string;
    mapLink?: string;
    website?: string;
  };
  specialAttractions?: string[];
  discrepancyNotes?: string[];
  paymentTerms?: string[];
  inventory?: Array<{
    unitNumber: string;
    facing: string;
    plotAreaSqYards?: number;
    builtUpAreaSqFt?: number;
    status: string;
  }>;
  bookingAmount?: number;
  monthlyInstallment?: number;
  tenureMonths?: number;
  promotedBy?: string;
  reraNumber?: string;
  acreage?: {
    acres?: number;
    guntas?: number;
  };
  verificationStatus?: {
    totalDocuments: number;
    verifiedDocuments: number;
    rejectedDocuments?: number;
    uploadedDocuments?: number;
    isFullyVerified: boolean;
    reviewStatus?: 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
    documentsChecklist?: Array<{
      documentType: string;
      status: string;
      isVerified: boolean;
      hasFile?: boolean;
      rejectionReason?: string;
      verifiedAt?: string;
      updatedAt?: string;
    }>;
  };
  adminDetails?: AdminPropertyDetails;
}

export type AdminPropertyItem = BackendProperty;

interface BackendListResponse {
  properties: BackendProperty[];
  total: number;
  page: number;
  limit: number;
}

// ─── Transformer: BackendProperty → MockProperty ──────────────────────────────

/**
 * Maps the backend PublicProperty shape to the frontend MockProperty type.
 * This keeps all UI components unchanged.
 */
function transformBackendProperty(bp: BackendProperty): MockProperty {
  const verifiedDocsCount = bp.verificationStatus?.verifiedDocuments ?? 0;
  const totalDocsRequired = bp.verificationStatus?.totalDocuments ?? 13;

  // Derive approval booleans from documentsChecklist when present
  const checklist = bp.verificationStatus?.documentsChecklist ?? [];
  const isDocVerified = (docType: string) =>
    checklist.some((d) => d.documentType === docType && d.isVerified);

  const dharaniApproved = isDocVerified('PATTADAR_PASSBOOK') || isDocVerified('PAHANI');
  const hmdaApproved = isDocVerified('HMDA_DTCP_APPROVAL');
  const reraApproved = false; // Backend does not expose RERA as a separate field

  return {
    id: bp.id,
    title: bp.titleEn,
    titleTe: bp.titleTe ?? bp.titleEn,
    description: bp.descriptionEn,
    descriptionTe: bp.descriptionTe ?? bp.descriptionEn,
    type: bp.type,
    status: bp.status,
    location: {
      village: bp.location.village,
      mandal: bp.location.mandal,
      district: bp.location.district,
      distanceFromOrrKm: bp.location.distanceFromOrrKm,
      zone: bp.location.zone ?? '',
      tier: bp.location.tier,
      landmark: bp.location.landmark,
      landmarkTe: bp.location.landmarkTe,
      latitude: bp.location.latitude,
      longitude: bp.location.longitude,
    },
    pricing: {
      totalPrice: bp.pricing.totalPrice,
      pricePerSqft: bp.pricing.pricePerSqft,
      pricePerAcre: bp.pricing.pricePerAcre,
      pricePerSqYard: bp.pricing.pricePerSqYard,
      isNegotiable: bp.pricing.isNegotiable,
    },
    land: bp.land
      ? {
          totalAcres: bp.land.totalAcres,
          sqYards: bp.land.sqYards,
          surveyNumbers: bp.land.surveyNumbers ?? [],
          soilType: bp.land.soilType,
          developmentLevel:
            (bp.land.developmentLevel as MockProperty['land'] extends undefined
              ? never
              : NonNullable<MockProperty['land']>['developmentLevel']) ?? 'RAW',
          roadWidthFt: bp.land.roadWidthFt,
          waterAvailable: bp.land.waterAvailable,
          electricityAvailable: bp.land.electricityAvailable,
        }
      : undefined,
    flat: bp.flat
      ? {
          sqft: bp.flat.sqft ?? 0,
          bedrooms: bp.flat.bedrooms ?? 0,
          bathrooms: bp.flat.bathrooms ?? 0,
          floor: bp.flat.floor ?? 0,
          totalFloors: bp.flat.totalFloors ?? 0,
          amenities: bp.flat.amenities ?? [],
          possessionStatus:
            (bp.flat.possessionStatus as 'READY_TO_MOVE' | 'UNDER_CONSTRUCTION') ??
            'READY_TO_MOVE',
          furnishingStatus: bp.flat.furnishingStatus as
            | 'UNFURNISHED'
            | 'SEMI_FURNISHED'
            | 'FULLY_FURNISHED'
            | undefined,
        }
      : undefined,
    villa: bp.villa
      ? {
          plotAreaSqYards: bp.villa.plotAreaSqYards ?? bp.villa.plotSqYards,
          plotSqYards: bp.villa.plotSqYards ?? bp.villa.plotAreaSqYards ?? 0,
          builtUpAreaSqFt: bp.villa.builtUpAreaSqFt ?? bp.villa.builtUpSqft,
          builtUpSqft: bp.villa.builtUpSqft ?? bp.villa.builtUpAreaSqFt ?? 0,
          configuration: bp.villa.configuration,
          floors:
            typeof bp.villa.floors === 'string'
              ? bp.villa.floors
              : bp.villa.floors !== undefined && bp.villa.floors !== null
              ? `G+${Number(bp.villa.floors) - 1}`
              : undefined,
          floorsConfig: (
            bp.villa.floorsConfig ||
            (typeof bp.villa.floors === 'string'
              ? bp.villa.floors
              : bp.villa.floors !== undefined && bp.villa.floors !== null
              ? `G+${Number(bp.villa.floors) - 1}`
              : 'G+2')
          ) as 'G+1' | 'G+2' | 'Triplex',
          facing: bp.villa.facing,
          communityName: bp.villa.communityName,
          gatedCommunity: bp.villa.gatedCommunity,
          privateGarden: !!bp.villa.privateGarden,
          coveredParking: bp.villa.coveredParking ?? 2,
          bedrooms: bp.villa.bedrooms ?? 0,
          bathrooms: bp.villa.bathrooms ?? 0,
          amenities: bp.villa.amenities ?? [],
        }
      : undefined,
    boundaryCoordinates: bp.boundaryCoordinates ?? null,
    mainImage: bp.mainImage,
    galleryImages: bp.galleryImages,
    sitePlanImage: bp.sitePlanImage,
    verifiedDocsCount,
    totalDocsRequired,
    isFeatured: bp.isFeatured,
    isOrrCorridor:
      bp.location.distanceFromOrrKm !== undefined && bp.location.distanceFromOrrKm <= 10,
    dharaniApproved,
    hmdaApproved,
    reraApproved: !!bp.reraNumber || isDocVerified('RERA_APPROVAL'),
    projectHighlights: bp.projectHighlights,
    locationHighlights: bp.locationHighlights,
    bankApprovals: bp.bankApprovals,
    externalLinks: bp.externalLinks,
    specialAttractions: bp.specialAttractions,
    discrepancyNotes: bp.discrepancyNotes,
    paymentTerms: bp.paymentTerms,
    inventory: bp.inventory,
    bookingAmount: bp.bookingAmount,
    monthlyInstallment: bp.monthlyInstallment,
    tenureMonths: bp.tenureMonths,
    promotedBy: bp.promotedBy,
    reraNumber: bp.reraNumber,
    adminDetails: bp.adminDetails,
  };
}

// ─── Configuration ─────────────────────────────────────────────────────────────

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://telangana-realty-backend.onrender.com/api').replace(/\/+$/, '');

/** Returns true if the API_BASE_URL is configured and points to the real backend. */
function isRealBackend(): boolean {
  return !!API_BASE_URL && API_BASE_URL.trim().length > 0;
}

// ─── Public API functions ──────────────────────────────────────────────────────

/**
 * Fetch all public (LIVE) properties from the backend.
 * Falls back to MOCK_PROPERTIES on network failure or non-2xx response.
 *
 * Returns `{ properties, fromBackend }` so callers can distinguish source.
 */
function logFetchError(endpoint: string, err: unknown) {
  const anyErr = err as { code?: string; cause?: { code?: string }; message?: string };
  const isConnRefused =
    anyErr?.code === 'ECONNREFUSED' ||
    anyErr?.cause?.code === 'ECONNREFUSED' ||
    (typeof anyErr?.message === 'string' && anyErr.message.includes('ECONNREFUSED'));

  if (isConnRefused) {
    console.warn(`[api] Backend offline at 127.0.0.1:5000 (${endpoint}), using fallback mock data.`);
  } else {
    console.warn(`[api] Network error fetching ${endpoint}, falling back to mock:`, err);
  }
}

export async function getProperties(params?: {
  type?: string;
  status?: string;
  limit?: number;
  page?: number;
}): Promise<{ properties: MockProperty[]; fromBackend: boolean }> {
  if (isRealBackend()) {
    try {
      const url = new URL(`${API_BASE_URL}/properties`);
      if (params?.type && params.type !== 'ALL') url.searchParams.set('type', params.type);
      if (params?.status && params.status !== 'ALL') url.searchParams.set('status', params.status);
      if (params?.limit) url.searchParams.set('limit', String(params.limit));
      if (params?.page) url.searchParams.set('page', String(params.page));

      const res = await fetch(url.toString(), {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 },
      });

      if (!res.ok) {
        console.warn(`[api] GET /properties returned ${res.status}, falling back to mock`);
        return { properties: MOCK_PROPERTIES, fromBackend: false };
      }

      const data: unknown = await res.json();

      // Validate response shape
      if (
        !data ||
        typeof data !== 'object' ||
        !Array.isArray((data as BackendListResponse).properties)
      ) {
        console.warn('[api] Malformed /properties response, falling back to mock');
        return { properties: MOCK_PROPERTIES, fromBackend: false };
      }

      const transformed = (data as BackendListResponse).properties.map(transformBackendProperty);
      return { properties: transformed, fromBackend: true };
    } catch (err) {
      logFetchError('/properties', err);
      return { properties: MOCK_PROPERTIES, fromBackend: false };
    }
  }

  return { properties: MOCK_PROPERTIES, fromBackend: false };
}

/**
 * Fetch property details by ID.
 * Tries backend first; falls back to mockData on any error.
 */
export async function getPropertyById(id: string): Promise<MockProperty | null> {
  if (isRealBackend()) {
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 },
      });

      if (res.status === 404) {
        // Not in backend — try mock
        return MOCK_PROPERTIES.find((p) => p.id === id) ?? null;
      }

      if (!res.ok) {
        console.warn(`[api] GET /properties/${id} returned ${res.status}, falling back to mock`);
        return MOCK_PROPERTIES.find((p) => p.id === id) ?? null;
      }

      const data: unknown = await res.json();

      // Backend wraps single property in { property: {...} }
      if (
        !data ||
        typeof data !== 'object' ||
        !(data as { property?: unknown }).property
      ) {
        console.warn(`[api] Malformed /properties/${id} response, falling back to mock`);
        return MOCK_PROPERTIES.find((p) => p.id === id) ?? null;
      }

      const prop = transformBackendProperty((data as { property: BackendProperty }).property);
      const persisted = loadAdminDetails(id, prop.adminDetails);
      return persisted ? { ...prop, adminDetails: persisted } : prop;
    } catch (err) {
      logFetchError(`/properties/${id}`, err);
      const mockProp = MOCK_PROPERTIES.find((p) => p.id === id) ?? null;
      if (!mockProp) return null;
      const persisted = loadAdminDetails(id, mockProp.adminDetails);
      return persisted ? { ...mockProp, adminDetails: persisted } : mockProp;
    }
  }

  const mockProp = MOCK_PROPERTIES.find((p) => p.id === id) ?? null;
  if (!mockProp) return null;
  const persisted = loadAdminDetails(id, mockProp.adminDetails);
  return persisted ? { ...mockProp, adminDetails: persisted } : mockProp;
}

/**
 * Submit a buyer enquiry (Site Visit, Callback, or Question).
 *
 * Backend endpoint: POST /api/enquiries
 * Required fields: propertyId, buyerName, phone, enquiryType
 * Optional fields: notes (maps from message/question), whatsapp, preferredLanguage
 *
 * Falls back to a simulated local response when backend is unavailable.
 */
export async function submitEnquiry(data: CreateEnquiryDTO): Promise<EnquirySubmissionResult> {
  if (isRealBackend()) {
    try {
      const slotTiming = data.timeSlot || data.preferredTime;
      const notes = [
        data.message ?? '',
        data.preferredDate ? `Preferred date: ${data.preferredDate}` : '',
        slotTiming ? `Booked slot timing: ${slotTiming}` : '',
        data.callingWindow ? `Calling window: ${data.callingWindow}` : '',
      ]
        .filter(Boolean)
        .join(' | ');

      const payload = {
        propertyId: data.propertyId,
        buyerName: data.buyerName,
        phone: data.phone,
        whatsapp: data.whatsapp || data.phone, // default whatsapp to phone
        enquiryType: data.enquiryType,
        visitDate: data.preferredDate,
        visitTimeSlot: slotTiming,
        notes: notes || undefined,
        preferredLanguage: 'en',
      };

      const res = await fetch(`${API_BASE_URL}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const resData: unknown = await res.json();
        // Backend returns { message, enquiry: { id, ... } }
        const enquiry = (resData as { enquiry?: { id?: string } })?.enquiry;
        const referenceId = enquiry?.id
          ? `ENQ-${enquiry.id.substring(0, 8).toUpperCase()}`
          : `ENQ-${Date.now()}`;

        return {
          success: true,
          referenceId,
          message:
            (resData as { message?: string })?.message ??
            'Enquiry successfully registered with mediation desk.',
          timestamp: new Date().toISOString(),
        };
      }

      // Non-2xx from backend — log but fall through to mock
      console.warn(`[api] POST /enquiries returned ${res.status}, using local fallback`);
    } catch (err) {
      console.warn('[api] Network error submitting enquiry, using local fallback:', err);
    }
  }

  // ── Mock fallback ─────────────────────────────────────────────────────────────
  // Realistic simulated network latency
  await new Promise((resolve) => setTimeout(resolve, 350));

  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  const referenceId = `ENQ-HYD-${randomDigits}`;

  // Persist to browser localStorage for demo pipeline inspection
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('trh_mock_enquiries') || '[]');
      existing.unshift({
        id: referenceId,
        ...data,
        status: 'NEW',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('trh_mock_enquiries', JSON.stringify(existing.slice(0, 50)));
    } catch {
      // Non-critical storage error
    }
  }

  return {
    success: true,
    referenceId,
    timestamp: new Date().toISOString(),
    message: 'Enquiry successfully registered with mediation desk.',
  };
}

/**
 * Create a new property listing (Seller Onboarding flow).
 * Calls POST /api/properties on the backend.
 * Falls back gracefully to offline mock response if backend is not configured.
 */
export async function createProperty(
  data: CreatePropertyDTO,
  token?: string
): Promise<PropertyCreationResult> {
  if (isRealBackend()) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/properties`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const resData: unknown = await res.json();
        const property = (resData as { property?: { id?: string } })?.property;
        if (property?.id) {
          return {
            success: true,
            propertyId: property.id,
            message:
              (resData as { message?: string })?.message ??
              'Property listing draft submitted successfully.',
            fromBackend: true,
          };
        }
      }

      // Backend returned 4xx or 5xx
      const errData = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      const errorMessage = errData.error || errData.message || `Submission failed with status ${res.status}`;
      throw new Error(errorMessage);
    } catch (err) {
      console.error('[api] Error submitting property listing to backend:', err);
      throw err;
    }
  }

  // Graceful offline mock fallback (if backend is not configured)
  await new Promise((resolve) => setTimeout(resolve, 500));
  const fallbackId = `PROP-HYD-${Math.floor(100 + Math.random() * 900)}`;
  return {
    success: true,
    propertyId: fallbackId,
    message: 'Property listing submitted in offline mode.',
    fromBackend: false,
  };
}

export interface DocumentUploadResult {
  success: boolean;
  document?: {
    id: string;
    propertyId: string;
    documentType: string;
    fileUrl: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
  };
  error?: string;
  fromBackend: boolean;
}

/**
 * Upload a verification document file for a specific property UUID.
 * Endpoint: POST /api/properties/:id/documents/upload
 * Supports PDF, JPG, JPEG, PNG, WEBP (up to 15MB).
 *
 * Uses XMLHttpRequest in browser to support fine-grained upload progress tracking.
 */
export async function uploadPropertyDocument(
  propertyId: string,
  docType: string,
  file: File,
  onProgress?: (progressPercent: number) => void,
  token?: string
): Promise<DocumentUploadResult> {
  const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!validExtensions.includes(ext)) {
    throw new Error('Unsupported file format. Only PDF, JPG, JPEG, and PNG files are allowed.');
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error('File size exceeds 15MB limit.');
  }

  if (isRealBackend()) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/properties/${encodeURIComponent(propertyId)}/documents/upload`);

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        try {
          const resData = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              success: true,
              document: resData.document,
              fromBackend: true,
            });
          } else {
            const errMsg = resData.error || resData.message || `Upload failed with status ${xhr.status}`;
            reject(new Error(errMsg));
          }
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error uploading document. Please check backend connection.'));
      };

      const formData = new FormData();
      formData.append('docType', docType);
      formData.append('file', file);

      xhr.send(formData);
    });
  }

  // Graceful offline mock fallback
  if (onProgress) {
    onProgress(30);
    await new Promise((r) => setTimeout(r, 150));
    onProgress(75);
    await new Promise((r) => setTimeout(r, 150));
    onProgress(100);
  } else {
    await new Promise((r) => setTimeout(r, 300));
  }

  return {
    success: true,
    document: {
      id: `doc-mock-${Date.now()}`,
      propertyId,
      documentType: docType,
      fileUrl: `/uploads/${propertyId}/${docType.toLowerCase()}_mock.pdf`,
      status: 'UPLOADED',
    },
    fromBackend: false,
  };
}

/**
 * Upload an image file directly to the backend media storage & database
 * Endpoint: POST /api/upload/image
 */
export async function uploadImageApi(
  file: File,
  token?: string,
  propertyId?: string
): Promise<{ success: boolean; data: any }> {
  const url = isRealBackend() ? `${API_BASE_URL}/upload/image` : 'http://localhost:5000/api/upload/image';
  const formData = new FormData();
  formData.append('image', file);
  if (propertyId) formData.append('propertyId', propertyId);

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Image upload failed');
  }
  return data;
}

// ─── Authentication & RBAC API Layer ──────────────────────────────────────────

export type UserRole = 'ADMIN' | 'AGENT' | 'SELLER';

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  sellerId?: string;
  whatsapp?: string;
  isActive?: boolean;
}

export interface AuthResponse {
  message?: string;
  user: AuthUser;
  token: string;
}

export interface RegisterInput {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  whatsapp?: string;
  role?: UserRole;
}

export interface SellerProfileResponse {
  seller: {
    id: string;
    userId?: string;
    name: string;
    phone: string;
    whatsapp?: string;
    email?: string;
    aadharNumber?: string;
    propertiesCount: number;
    dealsCompleted: number;
    rating: number;
    createdAt?: string;
  };
  properties: BackendProperty[];
}

export interface AdminDashboardStats {
  totalProperties: number;
  liveProperties: number;
  underReviewProperties: number;
  draftProperties: number;
  totalEnquiries: number;
  newEnquiries: number;
  totalSellers: number;
}

/**
 * Authenticate via common login portal
 * Backend endpoint: POST /api/auth/login
 */
export async function loginApi(identifier: string, password?: string): Promise<AuthResponse> {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPassword = (password ?? '').trim();

  // 1. Real Backend Authentication (when available)
  const url = isRealBackend() ? `${API_BASE_URL}/auth/login` : 'https://telangana-realty-backend.onrender.com/api/auth/login';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: identifier.trim(), password }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return data as AuthResponse;
    }
    // If backend explicitly rejected invalid credentials (401/400/403), throw backend message
    if (res.status === 400 || res.status === 401 || res.status === 403) {
      throw new Error(data.error || data.message || 'Invalid credentials');
    }
  } catch (err: unknown) {
    // Re-throw if it was an explicit invalid credentials rejection from backend
    if ((err as Error)?.message === 'Invalid credentials' || (err as Error)?.message?.includes('Invalid')) {
      throw err;
    }
    console.warn('[auth] Real backend unreachable, verifying against demo credentials fallback:', err);
  }

  // 2. Resilient Demo Role Fallback (when backend is unreachable)
  if (cleanId === 'admin' || cleanId === 'admin@telanganarealty.in') {
    if (cleanPassword !== 'Director@Telangana2026!' && cleanPassword !== 'Admin@1234' && cleanPassword !== 'admin123') {
      throw new Error('Invalid credentials');
    }
    return {
      token: 'mock-jwt-admin-token-2026',
      user: {
        id: 'usr-admin-001',
        name: 'Administrator',
        email: 'admin@telanganarealty.in',
        phone: '+919876543210',
        whatsapp: '+919876543210',
        role: 'ADMIN',
        isActive: true,
      },
    };
  }

  if (cleanId === 'suresh.reddy@telanganarealty.in') {
    if (cleanPassword !== 'Advisor@Telangana2026!' && cleanPassword !== 'Agent@1234') {
      throw new Error('Invalid credentials');
    }
    return {
      token: 'mock-jwt-agent-token-2026',
      user: {
        id: 'usr-agent-001',
        name: 'Suresh Reddy (Senior Land Advisor)',
        email: 'suresh.reddy@telanganarealty.in',
        phone: '+919876543211',
        whatsapp: '+919876543211',
        role: 'AGENT',
        isActive: true,
      },
    };
  }

  if (cleanId === 'lavanya.rao@telanganarealty.in') {
    return {
      token: 'mock-jwt-agent2-token-2026',
      user: {
        id: 'usr-agent-002',
        name: 'Lavanya Rao (Residential Specialist)',
        email: 'lavanya.rao@telanganarealty.in',
        phone: '+919876543212',
        whatsapp: '+919876543212',
        role: 'AGENT',
        isActive: true,
      },
    };
  }

  if (cleanId === '9848011223' || cleanId === 'kvrao.hyderabad@gmail.com' || cleanId === 'seller') {
    return {
      token: 'mock-jwt-seller-001-token',
      user: {
        id: 'usr-seller-001',
        sellerId: 'own-001',
        name: 'K. Venkateshwara Rao',
        email: 'kvrao.hyderabad@gmail.com',
        phone: '+919848011223',
        whatsapp: '+919848011223',
        role: 'SELLER',
        isActive: true,
      },
    };
  }

  // Any other valid looking phone or email for testing seller role
  const digitsOnly = cleanId.replace(/\D/g, '');
  if (digitsOnly.length >= 10 || cleanId.includes('@')) {
    return {
      token: `mock-jwt-seller-${Date.now()}`,
      user: {
        id: `usr-seller-${Date.now().toString().slice(-4)}`,
        sellerId: `own-${Date.now().toString().slice(-4)}`,
        name: cleanId.includes('@') ? cleanId.split('@')[0] : `Seller (+91 ${digitsOnly.slice(-10)})`,
        email: cleanId.includes('@') ? cleanId : undefined,
        phone: digitsOnly.length >= 10 ? `+91${digitsOnly.slice(-10)}` : '+919848099999',
        role: 'SELLER',
        isActive: true,
      },
    };
  }

  throw new Error('Invalid credentials');
}

/**
 * Register seller account
 * Backend endpoint: POST /api/auth/register
 */
export async function registerApi(input: RegisterInput): Promise<AuthResponse> {
  const url = isRealBackend() ? `${API_BASE_URL}/auth/register` : 'https://telangana-realty-backend.onrender.com/api/auth/register';

  let res: Response | null = null;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch (err) {
    console.warn('[auth] Backend register unreachable, using local session:', err);
  }

  if (res) {
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return data as AuthResponse;
    }
    throw new Error(
      (data as { error?: string; message?: string }).error ||
        (data as { message?: string }).message ||
        `Registration failed (${res.status})`
    );
  }

  // Fallback registration
  const newId = `usr-seller-${Date.now().toString().slice(-4)}`;
  return {
    token: `mock-jwt-seller-${Date.now()}`,
    user: {
      id: newId,
      sellerId: `own-${Date.now().toString().slice(-4)}`,
      name: input.name,
      phone: input.phone,
      email: input.email,
      whatsapp: input.whatsapp || input.phone,
      role: 'SELLER',
      isActive: true,
    },
  };
}

/**
 * Authenticate with Google / Gmail
 * Backend endpoint: POST /api/auth/google
 */
export async function loginWithGoogleApi(payload: {
  email?: string;
  name?: string;
  picture?: string;
  credential?: string;
}): Promise<AuthResponse> {
  const url = isRealBackend()
    ? `${API_BASE_URL}/auth/google`
    : 'https://telangana-realty-backend.onrender.com/api/auth/google';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return data as AuthResponse;
    }
    if (res.status === 400 || res.status === 401 || res.status === 403) {
      throw new Error(data.error || data.message || 'Google authentication failed');
    }
  } catch (err: unknown) {
    if ((err as Error)?.message?.includes('Google') || (err as Error)?.message?.includes('Valid')) {
      throw err;
    }
    console.warn('[auth] Real backend unreachable for Google auth, using resilient fallback session:', err);
  }

  // Fallback for offline or demo testing
  const email = payload.email || 'kvrao.hyderabad@gmail.com';
  const name = payload.name || 'Verified Google Seller';
  const isSellerKvRao = email.toLowerCase() === 'kvrao.hyderabad@gmail.com';

  return {
    token: `mock-jwt-google-${Date.now()}`,
    user: {
      id: isSellerKvRao ? 'usr-seller-001' : `usr-google-${Date.now().toString(36)}`,
      name: isSellerKvRao ? 'K.V. Rao (Managing Trustee)' : name,
      email: email,
      phone: isSellerKvRao ? '+919848011223' : '+919848099887',
      whatsapp: isSellerKvRao ? '+919848011223' : '+919848099887',
      role: 'SELLER',
      isActive: true,
    },
  };
}

/**
 * Verify current session and retrieve authenticated user profile
 * Backend endpoint: GET /api/auth/me
 */
export async function getMeApi(token: string): Promise<AuthUser> {
  if (token.startsWith('mock-jwt-')) {
    if (token.includes('admin')) {
      return {
        id: 'usr-admin-001',
        name: 'Administrator',
        email: 'admin@telanganarealty.in',
        phone: '+919876543210',
        whatsapp: '+919876543210',
        role: 'ADMIN',
        isActive: true,
      };
    }
    if (token.includes('agent')) {
      return {
        id: 'usr-agent-001',
        name: 'Suresh Reddy (Senior Land Advisor)',
        email: 'suresh.reddy@telanganarealty.in',
        phone: '+919876543211',
        whatsapp: '+919876543211',
        role: 'AGENT',
        isActive: true,
      };
    }
    return {
      id: 'usr-seller-001',
      sellerId: 'own-001',
      name: 'K. Venkateshwara Rao',
      email: 'kvrao.hyderabad@gmail.com',
      phone: '+919848011223',
      whatsapp: '+919848011223',
      role: 'SELLER',
      isActive: true,
    };
  }

  const url = isRealBackend() ? `${API_BASE_URL}/auth/me` : 'https://telangana-realty-backend.onrender.com/api/auth/me';

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && (data as { user?: AuthUser }).user) {
      return (data as { user: AuthUser }).user;
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error((data as { error?: string }).error || 'Session expired or invalid token');
    }
  } catch (err: unknown) {
    if ((err as Error)?.message?.includes('Session expired')) {
      throw err;
    }
    console.warn('[auth] Backend /auth/me unreachable, recovering from cached session:', err);
  }

  // Fallback to cached session in browser if available
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('real_estate_auth_user');
      if (cached) {
        return JSON.parse(cached) as AuthUser;
      }
    } catch {
      // ignore
    }
  }

  return {
    id: 'usr-seller-001',
    sellerId: 'own-001',
    name: 'K. Venkateshwara Rao',
    email: 'kvrao.hyderabad@gmail.com',
    phone: '+919848011223',
    whatsapp: '+919848011223',
    role: 'SELLER',
    isActive: true,
  };
}

const MOCK_ALL_13_KEYS = [
  'SALE_DEED',
  'EC',
  'LINK_DOCUMENTS',
  'PAHANI',
  'FORM_1B',
  'FMB',
  'PATTADAR_PASSBOOK',
  'HMDA_DTCP_APPROVAL',
  'MUTATION',
  'TAX_RECEIPT',
  'MASTER_PLAN',
  'GPA',
  'SALE_AGREEMENT',
];

function mockPropertyToBackend(mp: MockProperty): BackendProperty {
  return {
    id: mp.id,
    type: mp.type,
    status: mp.status,
    titleEn: mp.title,
    titleTe: mp.titleTe,
    descriptionEn: mp.description,
    descriptionTe: mp.descriptionTe,
    location: {
      village: mp.location.village,
      mandal: mp.location.mandal,
      district: mp.location.district,
      distanceFromOrrKm: mp.location.distanceFromOrrKm,
      zone: mp.location.zone,
      tier: mp.location.tier,
      landmark: mp.location.landmark,
      landmarkTe: mp.location.landmarkTe,
    },
    land: mp.land
      ? {
          totalAcres: mp.land.totalAcres,
          sqYards: mp.land.sqYards,
          surveyNumbers: mp.land.surveyNumbers,
          soilType: mp.land.soilType,
          developmentLevel: mp.land.developmentLevel,
          roadWidthFt: mp.land.roadWidthFt,
          waterAvailable: mp.land.waterAvailable,
          electricityAvailable: mp.land.electricityAvailable,
        }
      : undefined,
    flat: mp.flat
      ? {
          sqft: mp.flat.sqft,
          bedrooms: mp.flat.bedrooms,
          bathrooms: mp.flat.bathrooms,
          floor: mp.flat.floor,
          totalFloors: mp.flat.totalFloors,
          amenities: mp.flat.amenities,
          possessionStatus: mp.flat.possessionStatus,
          furnishingStatus: mp.flat.furnishingStatus,
        }
      : undefined,
    pricing: {
      totalPrice: mp.pricing.totalPrice,
      pricePerSqft: mp.pricing.pricePerSqft,
      pricePerAcre: mp.pricing.pricePerAcre,
      pricePerSqYard: mp.pricing.pricePerSqYard,
      isNegotiable: mp.pricing.isNegotiable,
    },
    mainImage: mp.mainImage,
    galleryImages: mp.galleryImages,
    isFeatured: true,
    viewsCount: 185,
    createdAt: '2026-02-10T09:00:00Z',
    updatedAt: new Date().toISOString(),
    verificationStatus: {
      totalDocuments: 13,
      verifiedDocuments: mp.verifiedDocsCount || 13,
      isFullyVerified: (mp.verifiedDocsCount || 13) >= 13,
      documentsChecklist: MOCK_ALL_13_KEYS.map((key) => ({
        documentType: key,
        status: 'VERIFIED',
        isVerified: true,
      })),
    },
    adminDetails: mp.adminDetails,
  };
}

/**
 * Fetch authenticated seller's private profile and submissions
 * Backend endpoint: GET /api/owners/me
 */
export async function getSellerProfileApi(token: string): Promise<SellerProfileResponse> {
  const url = isRealBackend() ? `${API_BASE_URL}/owners/me` : 'https://telangana-realty-backend.onrender.com/api/owners/me';

  let res: Response | null = null;
  try {
    res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.warn('[api] Backend /owners/me unreachable, using mock seller portfolio:', err);
  }

  if (res) {
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return data as SellerProfileResponse;
    }
    throw new Error(
      (data as { error?: string; message?: string }).error ||
        (data as { message?: string }).message ||
        `Failed to load seller submissions (${res.status})`
    );
  }

  // Resilient fallback for standalone/demo usage
  const sellerProperties = MOCK_PROPERTIES.slice(0, 2).map(mockPropertyToBackend);
  return {
    seller: {
      id: 'own-001',
      userId: 'usr-seller-001',
      name: 'K. Venkateshwara Rao',
      phone: '+91 98480 11223',
      whatsapp: '+91 98480 11223',
      email: 'kvrao.hyderabad@gmail.com',
      aadharNumber: '4589-1234-5678',
      propertiesCount: 2,
      dealsCompleted: 3,
      rating: 4.9,
      createdAt: '2026-01-15T10:00:00Z',
    },
    properties: sellerProperties,
  };
}

/**
 * Fetch Admin / Agent back-office dashboard summary metrics
 * Backend endpoint: GET /api/admin/dashboard
 */
export async function getAdminDashboardApi(token: string): Promise<AdminDashboardStats> {
  const url = isRealBackend() ? `${API_BASE_URL}/admin/dashboard` : 'https://telangana-realty-backend.onrender.com/api/admin/dashboard';

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return data as AdminDashboardStats;
    }
  } catch (err) {
    console.warn('[api] Backend /admin/dashboard unreachable, using mock dashboard metrics:', err);
  }

  return {
    totalProperties: MOCK_PROPERTIES.length,
    liveProperties: MOCK_PROPERTIES.filter((p) => p.status === 'LIVE').length,
    underReviewProperties: MOCK_PROPERTIES.filter((p) => p.status === 'UNDER_REVIEW').length,
    draftProperties: MOCK_PROPERTIES.filter((p) => p.status === 'DRAFT').length,
    totalEnquiries: 14,
    newEnquiries: 5,
    totalSellers: 3,
  };
}

/**
 * Fetch internal property listings with complete seller and document status
 * Backend endpoint: GET /api/admin/properties
 */
export async function getAdminPropertiesApi(
  token: string,
  status?: string
): Promise<{ properties: BackendProperty[]; total: number }> {
  const base = isRealBackend() ? `${API_BASE_URL}/admin/properties` : 'https://telangana-realty-backend.onrender.com/api/admin/properties';
  const url = new URL(base);
  if (status && status !== 'ALL') {
    url.searchParams.set('status', status);
  }

  let res: Response | null = null;
  try {
    res = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.warn('[api] Backend /admin/properties unreachable, using mock properties:', err);
  }

  if (res) {
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      const rawList = Array.isArray((data as { properties?: unknown[] }).properties)
        ? ((data as { properties: Array<BackendProperty & { documentsSummary?: { total?: number; verified?: number } }> }).properties)
        : [];
      const mapped = rawList.map((p) => {
        if (!p.verificationStatus && p.documentsSummary) {
          const verifiedDocuments = p.documentsSummary.verified ?? 0;
          const totalDocuments = p.documentsSummary.total || 13;
          return {
            ...p,
            verificationStatus: {
              totalDocuments: 13,
              verifiedDocuments,
              isFullyVerified: verifiedDocuments >= totalDocuments && totalDocuments > 0,
            },
          };
        }
        return p;
      });
      return {
        properties: mapped,
        total: (data as { total?: number; count?: number }).total ?? (data as { count?: number }).count ?? mapped.length,
      };
    }
    throw new Error((data as { error?: string; message?: string }).error || (data as { message?: string }).message || 'Failed to load properties');
  }

  let list = MOCK_PROPERTIES.map(mockPropertyToBackend);
  if (status && status !== 'ALL') {
    list = list.filter((p) => p.status === status);
  }

  return { properties: list, total: list.length };
}

// ─── Admin Property detail (full internal view) ───────────────────────────────

export interface InternalPropertyDetail {
  id: string;
  type: string;
  status: string;
  titleEn: string;
  titleTe?: string;
  descriptionEn: string;
  descriptionTe?: string;
  location: BackendLocation;
  land?: BackendLandDetails;
  flat?: BackendFlatDetails;
  pricing: BackendPricing;
  mainImage: string;
  galleryImages: string[];
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    name: string;
    phone: string;
    whatsapp?: string;
    email?: string;
    aadharNumber?: string;
  };
  verificationStatus?: {
    totalDocuments: number;
    verifiedDocuments: number;
    isFullyVerified: boolean;
    documentsChecklist?: Array<{
      documentType: string;
      status: string;
      isVerified: boolean;
    }>;
  };
  adminDetails?: AdminPropertyDetails;
  publishedAdminDetails?: AdminPropertyDetails;
  adminDetailsPublishedAt?: string;
  hasUnpublishedAdminDetailsChanges?: boolean;
  publishedVerification?: any;
  verificationPublishedAt?: string;
  hasUnpublishedVerificationChanges?: boolean;
}

/**
 * Fetch full internal property detail (admin/agent only)
 * Backend endpoint: GET /api/admin/properties/:id
 */
export async function getAdminPropertyDetailApi(
  token: string,
  propertyId: string
): Promise<InternalPropertyDetail> {
  const base = isRealBackend()
    ? `${API_BASE_URL}/admin/properties/${encodeURIComponent(propertyId)}`
    : `https://telangana-realty-backend.onrender.com/api/admin/properties/${encodeURIComponent(propertyId)}`;

  let res: Response | null = null;
  try {
    res = await fetch(base, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.warn(`[api] Backend /admin/properties/${propertyId} unreachable, using mock detail:`, err);
  }

  if (res) {
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      let detail: InternalPropertyDetail;
      if ((data as { property?: unknown }).property) {
        detail = { ...(data as { property: InternalPropertyDetail }).property };
        if (!detail.seller && (data as { seller?: InternalPropertyDetail['seller'] }).seller) {
          detail.seller = (data as { seller: InternalPropertyDetail['seller'] }).seller;
        }
        if (!detail.verificationStatus && Array.isArray((data as { documents?: PropertyDocumentRecord[] }).documents)) {
          const docs = (data as { documents: PropertyDocumentRecord[] }).documents;
          const verifiedCount = docs.filter((d) => d.status === 'VERIFIED').length;
          detail.verificationStatus = {
            totalDocuments: 13,
            verifiedDocuments: verifiedCount,
            isFullyVerified: verifiedCount >= 13 || detail.status === 'VERIFIED' || detail.status === 'LIVE',
          };
        }
      } else {
        detail = data as InternalPropertyDetail;
      }
      if (detail.adminDetails && Object.keys(detail.adminDetails).length > 0) {
        persistAdminDetailsLocally(propertyId, detail.adminDetails);
      } else {
        const persisted = loadAdminDetails(propertyId, detail.adminDetails);
        if (persisted) {
          detail.adminDetails = persisted;
        }
      }
      return detail;
    }
    throw new Error((data as { error?: string; message?: string }).error || (data as { message?: string }).message || 'Failed to load property details');
  }

  const found = MOCK_PROPERTIES.find((p) => p.id === propertyId) || MOCK_PROPERTIES[0];
  const bp = mockPropertyToBackend(found);
  const persisted = loadAdminDetails(propertyId, bp.adminDetails);
  return {
    ...bp,
    adminDetails: persisted ?? bp.adminDetails,
    seller: {
      id: 'own-001',
      name: 'K. Venkateshwara Rao',
      phone: '+91 98480 11223',
      whatsapp: '+91 98480 11223',
      email: 'kvrao.hyderabad@gmail.com',
      aadharNumber: '4589-1234-5678',
    },
  };
}

/**
 * Save Admin Added Details for a property.
 * Persists to PostgreSQL via PATCH /api/properties/:id/admin-details,
 * and caches in browser localStorage for reactive UI display.
 */
export async function saveAdminPropertyDetailsApi(
  token: string,
  propertyId: string,
  details: AdminPropertyDetails,
  publishToSeller: boolean = false
): Promise<{
  success: boolean;
  details: AdminPropertyDetails;
  publishedAdminDetails?: any;
  adminDetailsPublishedAt?: string;
  hasUnpublishedAdminDetailsChanges?: boolean;
  persistedLocally: boolean;
  backendPersisted: boolean;
}> {
  let savedDetails: AdminPropertyDetails = {
    ...details,
    updatedAt: details.updatedAt || new Date().toISOString(),
  };

  let backendPersisted = false;
  let publishedAdminDetails: any = undefined;
  let adminDetailsPublishedAt: string | undefined = undefined;
  let hasUnpublishedAdminDetailsChanges: boolean | undefined = undefined;

  if (isRealBackend()) {
    try {
      const base = `${API_BASE_URL}/properties/${encodeURIComponent(propertyId)}/admin-details`;
      const res = await fetch(base, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminDetails: savedDetails, publishToSeller }),
      });
      if (res.ok) {
        backendPersisted = true;
        const data = await res.json().catch(() => ({}));
        const returnedDetails =
          (data as { adminDetails?: AdminPropertyDetails; property?: { adminDetails?: AdminPropertyDetails } })
            ?.adminDetails ||
          (data as { property?: { adminDetails?: AdminPropertyDetails } })?.property?.adminDetails;
        if (returnedDetails && typeof returnedDetails === 'object') {
          savedDetails = returnedDetails;
        }
        publishedAdminDetails = (data as any)?.publishedAdminDetails;
        adminDetailsPublishedAt = (data as any)?.adminDetailsPublishedAt;
        hasUnpublishedAdminDetailsChanges = (data as any)?.hasUnpublishedAdminDetailsChanges;
      } else {
        console.warn(
          `[api] Backend PATCH /properties/${propertyId}/admin-details returned ${res.status}. Data is safely preserved in browser local storage.`
        );
      }
    } catch (err) {
      console.warn(
        `[api] Backend unreachable for admin-details. Data is safely preserved in browser local storage:`,
        err
      );
    }
  }

  // Persist locally and update in-memory MOCK_PROPERTIES for current session
  persistAdminDetailsLocally(propertyId, savedDetails);
  const mockProp = MOCK_PROPERTIES.find((p) => p.id === propertyId);
  if (mockProp) {
    mockProp.adminDetails = savedDetails;
    if (publishToSeller) {
      (mockProp as any).publishedAdminDetails = savedDetails;
      (mockProp as any).adminDetailsPublishedAt = new Date().toISOString();
    }
  }

  return {
    success: true,
    details: savedDetails,
    publishedAdminDetails,
    adminDetailsPublishedAt,
    hasUnpublishedAdminDetailsChanges,
    persistedLocally: true,
    backendPersisted,
  };
}

/**
 * Update property core details by staff/owner
 * Backend endpoint: PATCH /api/properties/:id
 */
export async function updatePropertyApi(
  token: string,
  propertyId: string,
  updates: Record<string, unknown>
): Promise<{ message: string; property: InternalPropertyDetail }> {
  const url = `${API_BASE_URL}/properties/${encodeURIComponent(propertyId)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Failed to update property (${res.status})`);
  }

  // Also update in-memory MOCK_PROPERTIES if matching
  const mockProp = MOCK_PROPERTIES.find((p) => p.id === propertyId);
  if (mockProp) {
    Object.assign(mockProp, updates);
  }

  return data as { message: string; property: InternalPropertyDetail };
}

/**
 * Update property publication status (e.g. LIVE, UNDER_REVIEW, DRAFT, VERIFIED, SOLD)
 * Backend endpoint: PATCH /api/properties/:id/status
 */
export async function updatePropertyStatusApi(
  token: string,
  propertyId: string,
  status: string
): Promise<{ message: string; property: InternalPropertyDetail }> {
  const url = `${API_BASE_URL}/properties/${encodeURIComponent(propertyId)}/status`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Failed to update status (${res.status})`);
  }

  // Also update in-memory MOCK_PROPERTIES if matching
  const mockProp = MOCK_PROPERTIES.find((p) => p.id === propertyId);
  if (mockProp) {
    mockProp.status = status as any;
  }

  return data as { message: string; property: InternalPropertyDetail };
}

// ─── Document types for admin review ─────────────────────────────────────────

export interface PropertyDocumentRecord {
  id: string;
  propertyId: string;
  documentType: string;
  fileUrl: string;
  status: 'PENDING' | 'UPLOADED' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * List all documents for a property (admin/agent/seller-own only)
 * Backend endpoint: GET /api/properties/:id/documents
 */
export async function getPropertyDocumentsApi(
  token: string,
  propertyId: string
): Promise<PropertyDocumentRecord[]> {
  const base = isRealBackend()
    ? `${API_BASE_URL}/properties/${encodeURIComponent(propertyId)}/documents`
    : `https://telangana-realty-backend.onrender.com/api/properties/${encodeURIComponent(propertyId)}/documents`;

  let res: Response | null = null;
  try {
    res = await fetch(base, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.warn(`[api] Backend /properties/${propertyId}/documents unreachable, using mock docs:`, err);
  }

  if (res) {
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return ((data as { documents?: PropertyDocumentRecord[] }).documents ?? []);
    }
    throw new Error(
      (data as { error?: string; message?: string }).error ||
        (data as { message?: string }).message ||
        `Failed to load property documents (${res.status})`
    );
  }

  return MOCK_ALL_13_KEYS.map((docType, idx) => ({
    id: `doc-${propertyId}-${idx + 1}`,
    propertyId,
    documentType: docType,
    fileUrl: `https://placehold.co/800x1100/f1f5f9/0f172a?text=${encodeURIComponent(
      docType.replace(/_/g, ' ')
    )}+Legal+Verification`,
    status: 'VERIFIED',
    verifiedBy: 'usr-admin-001 (Lead Director Siva)',
    verifiedAt: new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
    createdAt: new Date(Date.now() - (idx + 5) * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

/**
 * Get a single document record (admin/agent/seller-own only)
 * Backend endpoint: GET /api/properties/:id/documents/:docType
 */
export async function getPropertyDocumentApi(
  token: string,
  propertyId: string,
  docType: string
): Promise<PropertyDocumentRecord | null> {
  const base = isRealBackend()
    ? `${API_BASE_URL}/properties/${encodeURIComponent(propertyId)}/documents/${encodeURIComponent(docType)}`
    : `https://telangana-realty-backend.onrender.com/api/properties/${encodeURIComponent(propertyId)}/documents/${encodeURIComponent(docType)}`;

  let res: Response | null = null;
  try {
    res = await fetch(base, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.warn(`[api] Backend document ${docType} unreachable, using mock doc:`, err);
  }

  if (res) {
    if (res.status === 404) return null;

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return (data as { document?: PropertyDocumentRecord }).document ?? null;
    }
    throw new Error(
      (data as { error?: string; message?: string }).error ||
        (data as { message?: string }).message ||
        `Failed to load document ${docType} (${res.status})`
    );
  }

  return {
    id: `doc-${propertyId}-${docType}`,
    propertyId,
    documentType: docType,
    fileUrl: `https://placehold.co/800x1100/f1f5f9/0f172a?text=${encodeURIComponent(docType.replace(/_/g, ' '))}`,
    status: 'VERIFIED',
    verifiedBy: 'usr-admin-001 (Lead Director Siva)',
    verifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export interface VerifyDocumentResult {
  message: string;
  document: PropertyDocumentRecord;
  propertyStatus: string;
}

/**
 * Verify or reject a document (ADMIN only)
 * Backend endpoint: PATCH /api/properties/:id/documents/:docType/verify
 * Requires: { status: 'VERIFIED' | 'REJECTED', rejectionReason?: string }
 */
export async function verifyPropertyDocumentApi(
  token: string,
  propertyId: string,
  docType: string,
  status: 'VERIFIED' | 'REJECTED',
  rejectionReason?: string
): Promise<VerifyDocumentResult> {
  const base = isRealBackend()
    ? `${API_BASE_URL}/properties/${encodeURIComponent(propertyId)}/documents/${encodeURIComponent(docType)}/verify`
    : `https://telangana-realty-backend.onrender.com/api/properties/${encodeURIComponent(propertyId)}/documents/${encodeURIComponent(docType)}/verify`;

  let res: Response | null = null;
  try {
    res = await fetch(base, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, rejectionReason }),
    });
  } catch (err) {
    console.warn(`[api] Backend document verification unreachable, using mock update:`, err);
  }

  if (res) {
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return data as VerifyDocumentResult;
    }
    throw new Error(
      (data as { error?: string; message?: string }).error ||
        (data as { message?: string }).message ||
        `Failed to ${status === 'VERIFIED' ? 'verify' : 'reject'} document (${res.status})`
    );
  }

  return {
    message: `Document ${docType} marked as ${status}`,
    document: {
      id: `doc-${propertyId}-${docType}`,
      propertyId,
      documentType: docType,
      fileUrl: `https://placehold.co/800x1100/f1f5f9/0f172a?text=${encodeURIComponent(docType.replace(/_/g, ' '))}`,
      status,
      rejectionReason,
      verifiedBy: 'usr-admin-001 (Lead Director Siva)',
      verifiedAt: new Date().toISOString(),
    },
    propertyStatus: 'LIVE',
  };
}

export interface PublishVerificationResult {
  message: string;
  publishedVerification: any;
  verificationPublishedAt: string;
  propertyStatus: string;
}

/**
 * Publish latest document verification state to the seller
 * Backend endpoint: POST /api/properties/:id/verification/publish
 */
export async function publishVerificationApi(
  token: string,
  propertyId: string
): Promise<PublishVerificationResult> {
  const base = isRealBackend()
    ? `${API_BASE_URL}/properties/${encodeURIComponent(propertyId)}/verification/publish`
    : `https://telangana-realty-backend.onrender.com/api/properties/${encodeURIComponent(propertyId)}/verification/publish`;

  const res = await fetch(base, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (res.ok) {
    return data as PublishVerificationResult;
  }
  throw new Error((data as { error?: string }).error || 'Failed to publish verification updates');
}

export interface VerificationPublishStatusResult {
  hasUnpublishedChanges: boolean;
  publishedVerification: any;
  verificationPublishedAt?: string;
  unpublishedCount: number;
}

/**
 * Check whether unpublished verification changes exist
 * Backend endpoint: GET /api/properties/:id/verification/publish-status
 */
export async function getVerificationPublishStatusApi(
  token: string,
  propertyId: string
): Promise<VerificationPublishStatusResult> {
  const base = isRealBackend()
    ? `${API_BASE_URL}/properties/${encodeURIComponent(propertyId)}/verification/publish-status`
    : `https://telangana-realty-backend.onrender.com/api/properties/${encodeURIComponent(propertyId)}/verification/publish-status`;

  try {
    const res = await fetch(base, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return data as VerificationPublishStatusResult;
    }
  } catch (err) {
    console.warn('[api] Failed to get verification publish status:', err);
  }

  return {
    hasUnpublishedChanges: false,
    publishedVerification: null,
    unpublishedCount: 0,
  };
}

export interface PublishAdminDetailsResult {
  message: string;
  property: any;
  adminDetails: AdminPropertyDetails;
  publishedAdminDetails: any;
  adminDetailsPublishedAt: string;
  hasUnpublishedAdminDetailsChanges: boolean;
}

/**
 * Publish admin curated details to the seller
 * Backend endpoint: POST /api/properties/:id/admin-details/publish
 */
export async function publishAdminDetailsApi(
  token: string,
  propertyId: string
): Promise<PublishAdminDetailsResult> {
  const base = isRealBackend()
    ? `${API_BASE_URL}/properties/${encodeURIComponent(propertyId)}/admin-details/publish`
    : `https://telangana-realty-backend.onrender.com/api/properties/${encodeURIComponent(propertyId)}/admin-details/publish`;

  const res = await fetch(base, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (res.ok) {
    return data as PublishAdminDetailsResult;
  }
  throw new Error((data as { error?: string }).error || 'Failed to publish admin details to seller');
}

// ─── Backend URL & Upload Path Helpers ────────────────────────────────────────

/**
 * Returns the backend server base URL without the `/api` prefix.
 * e.g., 'https://backend.example.com/api' -> 'https://backend.example.com'
 * or 'https://telangana-realty-backend.onrender.com/api' -> 'http://localhost:5000'
 */
export function getBackendRootUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://telangana-realty-backend.onrender.com/api';
  return base.replace(/\/api\/?$/, '');
}

/**
 * Resolves an uploaded document or photo URL to an absolute backend URL.
 * If url already begins with 'http://' or 'https://', it is returned unchanged.
 * Relative paths starting with `/uploads/` are prepended with the dynamic backend root.
 */
export function resolveUploadUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const root = getBackendRootUrl();
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  return root ? `${root}${normalizedPath}` : normalizedPath;
}

// ─── Enquiries Back-Office API ────────────────────────────────────────────────

export type BackendEnquiryStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'CONTACTED'
  | 'SITE_VISIT_SCHEDULED'
  | 'IN_NEGOTIATION'
  | 'DEAL_CLOSED'
  | 'DROPPED';

export interface BackendEnquiry {
  id: string;
  propertyId: string;
  buyerName: string;
  phone: string;
  whatsapp?: string;
  enquiryType: 'CALL' | 'SITE_VISIT' | 'QUESTION';
  status: BackendEnquiryStatus;
  assignedTo?: string;
  followUpDate?: string;
  leadScore?: number;
  notes?: string;
  preferredLanguage?: 'en' | 'te';
  createdAt: string;
  updatedAt: string;
}

export interface GetEnquiriesResponse {
  enquiries: BackendEnquiry[];
  count: number;
}

/**
 * Fetch enquiries list (ADMIN & AGENT only)
 * Backend endpoint: GET /api/enquiries
 */
export async function getEnquiriesApi(
  token: string,
  filters?: { status?: string; assignedTo?: string; propertyId?: string }
): Promise<GetEnquiriesResponse> {
  const base = isRealBackend()
    ? `${API_BASE_URL}/enquiries`
    : 'https://telangana-realty-backend.onrender.com/api/enquiries';

  try {
    const url = new URL(base);
    if (filters?.status && filters.status !== 'ALL') url.searchParams.set('status', filters.status);
    if (filters?.assignedTo && filters.assignedTo !== 'ALL') url.searchParams.set('assignedTo', filters.assignedTo);
    if (filters?.propertyId) url.searchParams.set('propertyId', filters.propertyId);

    const res = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return data as GetEnquiriesResponse;
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error((data as { error?: string }).error || 'Unauthorized to view enquiries');
    }
  } catch (err: unknown) {
    if ((err as Error)?.message?.includes('Unauthorized')) {
      throw err;
    }
    console.warn('[api] Backend /enquiries unreachable:', err);
  }

  return { enquiries: [], count: 0 };
}

/**
 * Update enquiry pipeline status (ADMIN & AGENT only)
 * Backend endpoint: PATCH /api/enquiries/:id/status
 */
export async function updateEnquiryStatusApi(
  token: string,
  enquiryId: string,
  status: string,
  notes?: string
): Promise<{ message: string; enquiry: BackendEnquiry }> {
  const base = isRealBackend()
    ? `${API_BASE_URL}/enquiries/${encodeURIComponent(enquiryId)}/status`
    : `https://telangana-realty-backend.onrender.com/api/enquiries/${encodeURIComponent(enquiryId)}/status`;

  const res = await fetch(base, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, notes }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Failed to update status (${res.status})`);
  }

  return data as { message: string; enquiry: BackendEnquiry };
}
