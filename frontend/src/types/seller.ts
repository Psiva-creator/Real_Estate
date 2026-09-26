import { DocumentKey, DocumentStatus } from '@/lib/constants';

export type PropertyType = 'LAND' | 'FLAT' | 'VILLA';

export interface DocumentUploadItem {
  key: DocumentKey;
  status: DocumentStatus | 'FAILED';
  file?: File;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  uploadProgress?: number;
  uploadedAt?: string;
  rejectionReason?: string;
  errorMessage?: string;
}

export interface SellerFormData {
  // Step 1: Type
  propertyType: PropertyType;

  // Step 2: Basic Info
  title: string;
  description: string;
  zone: string;

  // Step 3: Location
  district: string;
  mandal: string;
  village: string;
  distanceFromOrrKm: string;
  landmark: string;

  // Step 4: Details (Land, Flat, or Villa)
  totalAcres: string;
  guntas: string;
  sqYards: string;
  surveyNumbers: string;
  roadWidthFt: string;
  developmentLevel: 'RAW' | 'FENCED' | 'PARTIALLY_DEVELOPED' | 'VENTURE_READY';
  waterAvailable: boolean;
  electricityAvailable: boolean;

  bedrooms: string;
  bathrooms: string;
  sqft: string;
  floor: string;
  totalFloors: string;
  possessionStatus: 'READY_TO_MOVE' | 'UNDER_CONSTRUCTION';
  furnishingStatus: 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED';
  amenities: string;

  // Villa specific
  plotSqYards: string;
  builtUpSqft: string;
  floorsConfig: 'G+1' | 'G+2' | 'Triplex';
  privateGarden: boolean;
  coveredParking: string;

  // Boundary coordinates
  boundaryCoordinates?: Array<{ lat: number; lng: number }> | null;

  // Step 5: Pricing
  totalPrice: string;
  pricePerAcre: string;
  pricePerSqft: string;
  pricePerSqYard: string;
  isNegotiable: boolean;

  // Step 6: 13 Verification Documents
  documents: Record<string, DocumentUploadItem>;

  // Step 7: Seller Contact
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  sellerRole: 'OWNER' | 'GPA';

  // Step 8: Review & Certify
  agreedToTerms: boolean;
}

export const INITIAL_SELLER_FORM_DATA: SellerFormData = {
  propertyType: 'LAND',
  title: '',
  description: '',
  zone: 'Residential R1',
  district: '',
  mandal: '',
  village: '',
  distanceFromOrrKm: '',
  landmark: '',
  totalAcres: '',
  guntas: '',
  sqYards: '',
  surveyNumbers: '',
  roadWidthFt: '',
  developmentLevel: 'RAW',
  waterAvailable: false,
  electricityAvailable: false,
  bedrooms: '3',
  bathrooms: '3',
  sqft: '',
  floor: '1',
  totalFloors: '10',
  possessionStatus: 'READY_TO_MOVE',
  furnishingStatus: 'UNFURNISHED',
  amenities: '',
  plotSqYards: '',
  builtUpSqft: '',
  floorsConfig: 'G+2',
  privateGarden: false,
  coveredParking: '2',
  boundaryCoordinates: null,
  totalPrice: '',
  pricePerAcre: '',
  pricePerSqft: '',
  pricePerSqYard: '',
  isNegotiable: true,
  documents: {},
  sellerName: '',
  sellerPhone: '',
  sellerEmail: '',
  sellerRole: 'OWNER',
  agreedToTerms: false,
};
