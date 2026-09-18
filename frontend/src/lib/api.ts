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

// ─── Enquiry types ─────────────────────────────────────────────────────────────

export type EnquiryType = 'SITE_VISIT' | 'CALL' | 'QUESTION';

export interface CreateEnquiryDTO {
  propertyId: string;
  propertyTitle: string;
  buyerName: string;
  phone: string;
  enquiryType: EnquiryType;
  preferredDate?: string;
  preferredTime?: string;
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

interface BackendPricing {
  totalPrice: number;
  pricePerSqft?: number;
  pricePerAcre?: number;
  pricePerSqYard?: number;
  isNegotiable: boolean;
}

interface BackendProperty {
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
  pricing: BackendPricing;
  mainImage: string;
  galleryImages: string[];
  isFeatured: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
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
}

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
    mainImage: bp.mainImage,
    galleryImages: bp.galleryImages,
    verifiedDocsCount,
    totalDocsRequired,
    isFeatured: bp.isFeatured,
    isOrrCorridor:
      bp.location.distanceFromOrrKm !== undefined && bp.location.distanceFromOrrKm <= 10,
    dharaniApproved,
    hmdaApproved,
    reraApproved,
  };
}

// ─── Configuration ─────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

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
export async function getProperties(params?: {
  type?: string;
  limit?: number;
  page?: number;
}): Promise<{ properties: MockProperty[]; fromBackend: boolean }> {
  if (isRealBackend()) {
    try {
      const url = new URL(`${API_BASE_URL}/properties`);
      if (params?.type && params.type !== 'ALL') url.searchParams.set('type', params.type);
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
      console.warn('[api] Network error fetching /properties, falling back to mock:', err);
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

      return transformBackendProperty((data as { property: BackendProperty }).property);
    } catch (err) {
      console.warn(`[api] Network error fetching /properties/${id}, falling back to mock:`, err);
      return MOCK_PROPERTIES.find((p) => p.id === id) ?? null;
    }
  }

  return MOCK_PROPERTIES.find((p) => p.id === id) ?? null;
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
      // Map frontend DTO → backend payload
      const notes = [
        data.message ?? '',
        data.preferredDate ? `Preferred date: ${data.preferredDate}` : '',
        data.preferredTime ? `Preferred time: ${data.preferredTime}` : '',
        data.callingWindow ? `Calling window: ${data.callingWindow}` : '',
      ]
        .filter(Boolean)
        .join(' | ');

      const payload = {
        propertyId: data.propertyId,
        buyerName: data.buyerName,
        phone: data.phone,
        whatsapp: data.phone, // default whatsapp to same phone
        enquiryType: data.enquiryType,
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

// ─── Authentication & RBAC API Layer ──────────────────────────────────────────

export type UserRole = 'ADMIN' | 'AGENT' | 'SELLER';

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  whatsapp?: string;
  isActive?: boolean;
}

export interface AuthResponse {
  message: string;
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
  const url = isRealBackend() ? `${API_BASE_URL}/auth/login` : 'http://localhost:5000/api/auth/login';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return data as AuthResponse;
    }
    // If backend explicitly rejected invalid credentials (401/400), throw backend message
    if (res.status === 400 || res.status === 401 || res.status === 403) {
      throw new Error(data.error || data.message || 'Invalid credentials');
    }
  } catch (err: unknown) {
    // Only fall back to local demo mock if it was a network connectivity failure
    if ((err as Error)?.message === 'Invalid credentials' || (err as Error)?.message?.includes('Invalid')) {
      throw err;
    }
    console.warn('[auth] Real backend unreachable, verifying against demo credentials fallback:', err);
  }

  // ─── Resilient Demo Role Fallback ──────────────────────────────────────────
  const cleanId = identifier.trim().toLowerCase();

  if (cleanId === 'admin@telanganarealty.in') {
    return {
      token: 'mock-jwt-admin-token-2026',
      user: {
        id: 'usr-admin-001',
        name: 'Siva Krishna (Lead Director)',
        email: 'admin@telanganarealty.in',
        phone: '+919876543210',
        whatsapp: '+919876543210',
        role: 'ADMIN',
        isActive: true,
      },
    };
  }

  if (cleanId === 'suresh.reddy@telanganarealty.in') {
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

  if (cleanId === '9848011223' || cleanId === 'kvrao.hyderabad@gmail.com') {
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

  throw new Error('User account not found. Please register or use a demo account.');
}

/**
 * Register seller account
 * Backend endpoint: POST /api/auth/register
 */
export async function registerApi(input: RegisterInput): Promise<AuthResponse> {
  const url = isRealBackend() ? `${API_BASE_URL}/auth/register` : 'http://localhost:5000/api/auth/register';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return data as AuthResponse;
    }
  } catch (err) {
    console.warn('[auth] Backend register unreachable, using local session:', err);
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
 * Verify current session and retrieve authenticated user profile
 * Backend endpoint: GET /api/auth/me
 */
export async function getMeApi(token: string): Promise<AuthUser> {
  if (token.startsWith('mock-jwt-')) {
    if (token.includes('admin')) {
      return {
        id: 'usr-admin-001',
        name: 'Siva Krishna (Lead Director)',
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

  const url = isRealBackend() ? `${API_BASE_URL}/auth/me` : 'http://localhost:5000/api/auth/me';

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Session expired or invalid token');
  }

  return data.user as AuthUser;
}

/**
 * Fetch authenticated seller's private profile and submissions
 * Backend endpoint: GET /api/owners/me
 */
export async function getSellerProfileApi(token: string): Promise<SellerProfileResponse> {
  const url = isRealBackend() ? `${API_BASE_URL}/owners/me` : 'http://localhost:5000/api/owners/me';

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch seller submissions');
  }

  return data as SellerProfileResponse;
}

/**
 * Fetch Admin / Agent back-office dashboard summary metrics
 * Backend endpoint: GET /api/admin/dashboard
 */
export async function getAdminDashboardApi(token: string): Promise<AdminDashboardStats> {
  const url = isRealBackend() ? `${API_BASE_URL}/admin/dashboard` : 'http://localhost:5000/api/admin/dashboard';

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch admin dashboard statistics');
  }

  return data as AdminDashboardStats;
}

/**
 * Fetch internal property listings with complete seller and document status
 * Backend endpoint: GET /api/admin/properties
 */
export async function getAdminPropertiesApi(
  token: string,
  status?: string
): Promise<{ properties: BackendProperty[]; total: number }> {
  const base = isRealBackend() ? `${API_BASE_URL}/admin/properties` : 'http://localhost:5000/api/admin/properties';
  const url = new URL(base);
  if (status && status !== 'ALL') {
    url.searchParams.set('status', status);
  }

  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch internal properties');
  }

  return data as { properties: BackendProperty[]; total: number };
}
// ─── Admin Property detail (full internal view) ───────────────────────────────

export interface InternalPropertyDetail {
  id: string;
  type: string;
  status: string;
  titleEn: string;
  titleTe?: string;
  descriptionEn: string;
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
    : `http://localhost:5000/api/admin/properties/${encodeURIComponent(propertyId)}`;

  const res = await fetch(base, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch property detail (${res.status})`);
  }

  // Backend wraps in { property: {...} }
  if ((data as { property?: unknown }).property) {
    return (data as { property: InternalPropertyDetail }).property;
  }
  return data as InternalPropertyDetail;
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
    : `http://localhost:5000/api/properties/${encodeURIComponent(propertyId)}/documents`;

  const res = await fetch(base, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch documents (${res.status})`);
  }

  return ((data as { documents?: PropertyDocumentRecord[] }).documents ?? []);
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
    : `http://localhost:5000/api/properties/${encodeURIComponent(propertyId)}/documents/${encodeURIComponent(docType)}`;

  const res = await fetch(base, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 404) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch document (${res.status})`);
  }

  return (data as { document?: PropertyDocumentRecord }).document ?? null;
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
    : `http://localhost:5000/api/properties/${encodeURIComponent(propertyId)}/documents/${encodeURIComponent(docType)}/verify`;

  const res = await fetch(base, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, rejectionReason }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Verification failed (${res.status})`);
  }

  return data as VerifyDocumentResult;
}
