import {
  PropertyType,
  PropertyStatus,
  DocumentType,
  DocumentStatus,
  ServiceTier,
  EnquiryType,
  EnquiryStatus,
  UserRole,
} from '../../constants/src/index';

export {
  PropertyType,
  PropertyStatus,
  DocumentType,
  DocumentStatus,
  ServiceTier,
  EnquiryType,
  EnquiryStatus,
  UserRole,
};

export interface LocationDetails {
  village: string;
  mandal: string;
  district: string;
  latitude?: number;
  longitude?: number;
  distanceFromOrrKm?: number;
  zone: string; // e.g. Residential, Commercial, R1, Conservation
  tier: ServiceTier;
}

export interface LandDetails {
  totalAcres: number;
  sqYards?: number;
  surveyNumbers: string[];
  soilType?: 'RED' | 'BLACK' | 'MIXED' | string;
  developmentLevel: 'RAW' | 'FENCED' | 'PARTIALLY_DEVELOPED' | 'VENTURE_READY';
  roadWidthFt?: number;
  waterAvailable?: boolean;
  electricityAvailable?: boolean;
}

export interface FlatDetails {
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  totalFloors: number;
  amenities: string[];
  possessionStatus: 'READY_TO_MOVE' | 'UNDER_CONSTRUCTION';
  furnishingStatus?: 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED';
}

export interface VillaDetails {
  plotAreaSqYards?: number;
  builtUpAreaSqFt?: number;
  configuration?: string;
  floors?: string;
  facing?: 'EAST' | 'WEST' | 'NORTH' | 'SOUTH';
  communityName?: string;
  gatedCommunity?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
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
}

export interface Property {
  id: string;
  sellerId: string;
  type: PropertyType;
  status: PropertyStatus;
  title: string;
  titleTe?: string;
  description: string;
  descriptionTe?: string;
  location: LocationDetails;
  land?: LandDetails;
  flat?: FlatDetails;
  villa?: VillaDetails;
  pricing: PricingDetails;
  documents: Record<DocumentType, DocumentStatus>;
  mainImage: string;
  galleryImages: string[];
  sitePlanImage?: string;
  isFeatured: boolean;
  viewsCount: number;
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

export interface Owner {
  id: string;
  name: string;
  phone: string;
  email?: string;
  whatsapp: string;
  aadharNumber?: string;
  propertiesCount: number;
  dealsCompleted: number;
  rating?: number;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  propertyId: string;
  buyerName: string;
  phone: string;
  whatsapp?: string;
  enquiryType: EnquiryType;
  status: EnquiryStatus;
  assignedToAgentId?: string;
  followUpDate?: string;
  leadScore: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}
