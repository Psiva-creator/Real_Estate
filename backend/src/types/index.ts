export type PropertyType = 'LAND' | 'FLAT' | 'VILLA';
export type PropertyStatus = 'DRAFT' | 'UNDER_REVIEW' | 'VERIFIED' | 'LIVE' | 'SOLD' | 'OFF_MARKET';

export type DocumentType =
  | 'SALE_DEED'
  | 'EC'
  | 'LINK_DOCUMENTS'
  | 'PAHANI'
  | 'FORM_1B'
  | 'FMB'
  | 'PATTADAR_PASSBOOK'
  | 'HMDA_DTCP_APPROVAL'
  | 'MUTATION'
  | 'TAX_RECEIPT'
  | 'MASTER_PLAN'
  | 'GPA'
  | 'SALE_AGREEMENT';

export type DocumentStatus = 'PENDING' | 'UPLOADED' | 'VERIFIED' | 'REJECTED';

export type ServiceTier = 'TIER_1' | 'TIER_2' | 'TIER_3';

export type EnquiryType = 'CALL' | 'SITE_VISIT' | 'QUESTION';

export type EnquiryStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'CONTACTED'
  | 'SITE_VISIT_SCHEDULED'
  | 'IN_NEGOTIATION'
  | 'DEAL_CLOSED'
  | 'DROPPED';

export type UserRole = 'ADMIN' | 'AGENT' | 'SELLER';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  whatsapp?: string;
  passwordHash?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Owner {
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
  createdAt: string;
  updatedAt: string;
}

export interface LocationDetails {
  village: string;
  mandal: string;
  district: string;
  latitude?: number;
  longitude?: number;
  distanceFromOrrKm?: number;
  zone?: string;
  tier: ServiceTier;
}

export interface LandDetails {
  totalAcres?: number;
  surveyNumbers?: string[];
  soilType?: string;
  developmentLevel?: string;
  roadWidthFt?: number;
  waterAvailable?: boolean;
  electricityAvailable?: boolean;
}

export interface FlatDetails {
  sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  amenities?: string[];
  possessionStatus?: string;
}

export interface VillaDetails {
  plotSqYards?: number;
  builtUpSqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  amenities?: string[];
  possessionStatus?: string;
}

export interface PricingDetails {
  pricePerAcre?: number;
  pricePerSqft?: number;
  totalPrice: number;
  outrate?: number;
  halfDevelopmentValue?: number;
  isNegotiable: boolean;
}

export interface PropertyDocument {
  id: string;
  propertyId: string;
  documentType: DocumentType;
  fileUrl: string;
  status: DocumentStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  sellerId: string;
  type: PropertyType;
  status: PropertyStatus;
  titleEn: string;
  titleTe?: string;
  descriptionEn: string;
  descriptionTe?: string;
  location: LocationDetails;
  land?: LandDetails;
  flat?: FlatDetails;
  villa?: VillaDetails;
  pricing: PricingDetails;
  mainImage: string;
  galleryImages: string[];
  sitePlanImage?: string;
  boundaryCoordinates?: Array<{ lat: number; lng: number }> | null;
  isFeatured: boolean;
  viewsCount: number;
  documents?: Record<string, DocumentStatus>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Stripped public representation of a property to protect seller privacy.
 * As mandated by QA Lead Pre-Launch Security Gate #1:
 * "Direct seller contact information is completely stripped from public responses and HTML markup."
 */
export interface PublicProperty extends Omit<Property, 'sellerId'> {
  brokerageContact: {
    name: string;
    phone: string;
    whatsapp: string;
    office: string;
  };
  verificationStatus: {
    totalDocuments: number;
    verifiedDocuments: number;
    isFullyVerified: boolean;
    documentsChecklist: Array<{
      documentType: DocumentType;
      status: DocumentStatus;
      isVerified: boolean;
    }>;
  };
}

export interface Enquiry {
  id: string;
  propertyId: string;
  buyerName: string;
  phone: string;
  whatsapp?: string;
  enquiryType: EnquiryType;
  status: EnquiryStatus;
  assignedTo?: string;
  followUpDate?: string;
  leadScore: number;
  notes?: string;
  preferredLanguage?: 'en' | 'te';
  createdAt: string;
  updatedAt: string;
}

export interface PropertySearchParams {
  type?: PropertyType;
  tier?: ServiceTier;
  district?: string;
  mandal?: string;
  village?: string;
  zone?: string;
  minPrice?: number;
  maxPrice?: number;
  minAcres?: number;
  maxAcres?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  maxDistanceOrr?: number;
  status?: PropertyStatus;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'orr_distance' | 'views';
  page?: number;
  limit?: number;
}
