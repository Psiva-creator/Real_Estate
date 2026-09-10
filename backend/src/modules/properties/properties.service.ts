import { db } from '../../db/database.js';
import { mapsService } from '../maps/maps.service.js';
import { documentsService } from '../documents/documents.service.js';
import { sanitizePropertyForPublic, ALL_13_DOCS } from '../../middleware/security.js';
import {
  Property,
  PublicProperty,
  PropertySearchParams,
  PropertyStatus,
  PropertyType,
  LocationDetails,
  LandDetails,
  FlatDetails,
  PricingDetails,
} from '../../types/index.js';

export interface CreatePropertyInput {
  sellerId: string;
  type: PropertyType;
  titleEn: string;
  titleTe?: string;
  descriptionEn: string;
  descriptionTe?: string;
  location: Omit<LocationDetails, 'tier' | 'distanceFromOrrKm'> & {
    distanceFromOrrKm?: number;
    tier?: LocationDetails['tier'];
  };
  land?: LandDetails;
  flat?: FlatDetails;
  pricing: PricingDetails;
  mainImage: string;
  galleryImages?: string[];
  sitePlanImage?: string;
  isFeatured?: boolean;
}

const VALID_STATUS_TRANSITIONS: Record<PropertyStatus, PropertyStatus[]> = {
  DRAFT: ['UNDER_REVIEW', 'OFF_MARKET'],
  UNDER_REVIEW: ['DRAFT', 'VERIFIED', 'LIVE', 'OFF_MARKET'],
  VERIFIED: ['UNDER_REVIEW', 'LIVE', 'OFF_MARKET'],
  LIVE: ['SOLD', 'OFF_MARKET', 'UNDER_REVIEW'],
  SOLD: ['OFF_MARKET', 'LIVE'],
  OFF_MARKET: ['DRAFT', 'UNDER_REVIEW', 'LIVE'],
};

export class PropertiesService {
  /**
   * Validate required fields for multi-step seller form
   */
  validateInput(input: CreatePropertyInput) {
    if (!input.titleEn || !input.descriptionEn) {
      throw new Error('English title and description are required');
    }

    if (!input.location || !input.location.district || !input.location.mandal || !input.location.village) {
      throw new Error('Complete location (district, mandal, village) is required');
    }

    if (!input.pricing || typeof input.pricing.totalPrice !== 'number' || input.pricing.totalPrice <= 0) {
      throw new Error('Valid total price is required');
    }

    if (input.type === 'LAND') {
      if (!input.land || !input.land.totalAcres || input.land.totalAcres <= 0) {
        throw new Error('Total acres is required for Land properties');
      }
      if (!input.land.surveyNumbers || input.land.surveyNumbers.length === 0) {
        throw new Error('At least one survey number is required for Land listings in Telangana');
      }
    } else if (input.type === 'FLAT') {
      if (!input.flat || !input.flat.sqft || input.flat.sqft <= 0) {
        throw new Error('Sqft area is required for Flat listings');
      }
      if (!input.flat.bedrooms || input.flat.bedrooms <= 0) {
        throw new Error('Number of bedrooms is required for Flat listings');
      }
    } else {
      throw new Error('Invalid property type. Must be LAND or FLAT');
    }

    if (!input.mainImage) {
      throw new Error('Main featured image URL is required');
    }
  }

  /**
   * Submit new property listing (Seller Onboarding flow)
   */
  async createProperty(input: CreatePropertyInput): Promise<Property> {
    this.validateInput(input);

    // Compute or verify ORR distance & HMDA tier
    let distanceFromOrrKm = input.location.distanceFromOrrKm;
    let tier = input.location.tier;

    if (input.location.latitude && input.location.longitude && distanceFromOrrKm === undefined) {
      distanceFromOrrKm = mapsService.calculateDistanceFromOrr({
        lat: input.location.latitude,
        lng: input.location.longitude,
      });
    } else if (distanceFromOrrKm === undefined) {
      const lookup = mapsService.lookupLocation(input.location.mandal || input.location.village);
      if (lookup) {
        distanceFromOrrKm = lookup.distanceFromOrrKm;
        tier = lookup.tier;
      } else {
        distanceFromOrrKm = 10.0; // default fallback
      }
    }

    if (!tier) {
      tier = mapsService.determineServiceTier(distanceFromOrrKm || 10, input.location.mandal);
    }

    const property = await db.createProperty({
      sellerId: input.sellerId,
      type: input.type,
      status: 'DRAFT',
      titleEn: input.titleEn,
      titleTe: input.titleTe,
      descriptionEn: input.descriptionEn,
      descriptionTe: input.descriptionTe,
      location: {
        ...input.location,
        distanceFromOrrKm,
        tier,
      },
      land: input.type === 'LAND' ? input.land : undefined,
      flat: input.type === 'FLAT' ? input.flat : undefined,
      pricing: input.pricing,
      mainImage: input.mainImage,
      galleryImages: input.galleryImages || [],
      sitePlanImage: input.sitePlanImage,
      isFeatured: !!input.isFeatured,
    });

    // Initialize all 13 verification document slots as PENDING
    for (const docType of ALL_13_DOCS) {
      await db.upsertDocument({
        propertyId: property.id,
        documentType: docType,
        fileUrl: '',
        status: 'PENDING',
      });
    }

    return property;
  }

  /**
   * Public property detail with seller details stripped
   */
  async getPublicPropertyDetail(id: string): Promise<PublicProperty | null> {
    const property = await db.findPropertyById(id);
    if (!property) return null;

    // Increment view count
    await db.incrementPropertyViews(id);

    return sanitizePropertyForPublic(property);
  }

  /**
   * Internal property detail for admin / broker
   */
  async getInternalPropertyDetail(id: string): Promise<Property | null> {
    return db.findPropertyById(id);
  }

  /**
   * Search & filter public listings (Seller info stripped)
   */
  async searchPublicProperties(params: PropertySearchParams): Promise<{
    properties: PublicProperty[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Only search LIVE properties for public
    const { properties, total } = await db.searchProperties({
      ...params,
      status: 'LIVE',
    });

    const sanitizedList = await Promise.all(properties.map(sanitizePropertyForPublic));

    return {
      properties: sanitizedList,
      total,
      page: params.page || 1,
      limit: params.limit || 10,
    };
  }

  /**
   * Update property status following state machine rules
   */
  async updatePropertyStatus(id: string, newStatus: PropertyStatus): Promise<Property> {
    const property = await db.findPropertyById(id);
    if (!property) {
      throw new Error(`Property ${id} not found`);
    }

    const allowed = VALID_STATUS_TRANSITIONS[property.status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: Cannot change status from ${property.status} to ${newStatus}. Allowed next states: ${allowed?.join(', ')}`
      );
    }

    // Crucial Verification Gate: Cannot transition to LIVE unless all mandatory docs are VERIFIED
    if (newStatus === 'LIVE') {
      const eligibility = await documentsService.validateForGoLive(id);
      if (!eligibility.canGoLive) {
        throw new Error(
          `Cannot transition listing to LIVE. The following mandatory verification documents are pending or unverified: ${eligibility.missingDocs.join(
            ', '
          )}`
        );
      }
    }

    const updated = await db.updateProperty(id, { status: newStatus });
    return updated!;
  }

  /**
   * Update property details
   */
  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const property = await db.findPropertyById(id);
    if (!property) {
      throw new Error(`Property ${id} not found`);
    }

    // Do not allow direct status update through this method
    const { status, sellerId, id: _id, ...safeUpdates } = updates;
    const updated = await db.updateProperty(id, safeUpdates);
    return updated!;
  }

  async listAllForAdmin(): Promise<Property[]> {
    return db.listAllProperties();
  }
}

export const propertiesService = new PropertiesService();
