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
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserLoginRecord {
  id: string;
  userId: string;
  identifier: string;
  role?: string;
  ipAddress?: string;
  userAgent?: string;
  status: string;
  createdAt: string;
}

export interface MediaUploadRecord {
  id: string;
  userId?: string;
  propertyId?: string;
  fileUrl: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadType: string;
  createdAt: string;
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
  sqYards?: number;
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
  plotAreaSqYards?: number;
  plotSqYards?: number;
  builtUpAreaSqFt?: number;
  builtUpSqft?: number;
  configuration?: string;
  floors?: string | number;
  facing?: 'EAST' | 'WEST' | 'NORTH' | 'SOUTH';
  communityName?: string;
  gatedCommunity?: boolean;
  bedrooms?: number;
  bathrooms?: number;
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

export interface AdminCustomSpecification {
  label: string;
  value: string;
}

export interface AdminCustomSection {
  title: string;
  content: string;
}

export interface AdminPropertyDetails {
  projectDescription?: string;
  highlights?: string[];
  amenities?: string[];
  locationAdvantages?: string[];
  nearbyLandmarks?: string[];
  additionalSpecifications?: AdminCustomSpecification[];
  specialFeatures?: string[];
  pricingNotes?: string;
  siteVisitInstructions?: string;
  additionalNotes?: string;
  internalNotes?: string;
  customSections?: AdminCustomSection[];
  updatedAt?: string;
  updatedBy?: string;
}

export type BuyerFacingAdminDetails = Omit<AdminPropertyDetails, 'internalNotes'>;

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
  adminDetails?: AdminPropertyDetails | null;
  isFeatured: boolean;
  viewsCount: number;
  documents?: Record<string, DocumentStatus>;
  // Extended project metadata & transparent auditing
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
  createdAt: string;
  updatedAt: string;
}

/**
 * Stripped public representation of a property to protect seller privacy.
 * As mandated by QA Lead Pre-Launch Security Gate #1:
 * "Direct seller contact information is completely stripped from public responses and HTML markup."
 */
export interface PublicProperty extends Omit<Property, 'sellerId' | 'adminDetails'> {
  adminDetails?: BuyerFacingAdminDetails | null;
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
