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
  VillaDetails,
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
  villa?: VillaDetails;
  boundaryCoordinates?: Array<{ lat: number; lng: number }> | null;
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
    } else if (input.type === 'VILLA') {
      if (!input.villa || !input.villa.plotSqYards || input.villa.plotSqYards <= 0) {
        throw new Error('Plot area (plotSqYards) is required for Villa listings');
      }
      if (!input.villa.builtUpSqft || input.villa.builtUpSqft <= 0) {
        throw new Error('Built-up area (builtUpSqft) is required for Villa listings');
      }
      if (!input.villa.bedrooms || input.villa.bedrooms <= 0) {
        throw new Error('Number of bedrooms is required for Villa listings');
      }
      if (!input.villa.bathrooms || input.villa.bathrooms <= 0) {
        throw new Error('Number of bathrooms is required for Villa listings');
      }
    } else {
      throw new Error('Invalid property type. Must be LAND, FLAT, or VILLA');
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
      villa: input.type === 'VILLA' ? input.villa : undefined,
      pricing: input.pricing,
      mainImage: input.mainImage,
      galleryImages: input.galleryImages || [],
      sitePlanImage: input.sitePlanImage,
      boundaryCoordinates: input.boundaryCoordinates ?? null,
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

    // Crucial Verification Gate: Cannot transition to VERIFIED or LIVE unless all mandatory docs are VERIFIED
    if (newStatus === 'VERIFIED' || newStatus === 'LIVE') {
      const eligibility = await documentsService.validateForGoLive(id);
      if (!eligibility.canGoLive) {
        throw new Error(
          `Cannot transition listing to ${newStatus}. The following mandatory verification documents are pending or unverified: ${eligibility.missingDocs.join(
            ', '
          )}`
        );
      }
    }

    const updated = await db.updateProperty(id, { status: newStatus });
    return updated!;
  }

  /**
   * Validate partial update fields
   */
  validateUpdateInput(updates: Partial<Property>) {
    if (updates.status !== undefined) {
      throw new Error('Property status cannot be updated via generic PATCH. Use PATCH /api/properties/:id/status');
    }

    if (updates.titleEn !== undefined && (!updates.titleEn || !updates.titleEn.trim())) {
      throw new Error('English title cannot be empty');
    }

    if (updates.descriptionEn !== undefined && (!updates.descriptionEn || !updates.descriptionEn.trim())) {
      throw new Error('English description cannot be empty');
    }

    if (updates.type !== undefined && !['LAND', 'FLAT'].includes(updates.type)) {
      throw new Error('Property type must be LAND or FLAT');
    }

    if (updates.pricing) {
      if (updates.pricing.totalPrice !== undefined && (typeof updates.pricing.totalPrice !== 'number' || updates.pricing.totalPrice <= 0)) {
        throw new Error('Valid total price greater than 0 is required');
      }
      if (updates.pricing.pricePerAcre !== undefined && (typeof updates.pricing.pricePerAcre !== 'number' || updates.pricing.pricePerAcre < 0)) {
        throw new Error('pricePerAcre must be a positive number');
      }
      if (updates.pricing.pricePerSqft !== undefined && (typeof updates.pricing.pricePerSqft !== 'number' || updates.pricing.pricePerSqft < 0)) {
        throw new Error('pricePerSqft must be a positive number');
      }
    }

    if (updates.location) {
      if (updates.location.latitude !== undefined && (typeof updates.location.latitude !== 'number' || updates.location.latitude < -90 || updates.location.latitude > 90)) {
        throw new Error('Latitude must be between -90 and 90');
      }
      if (updates.location.longitude !== undefined && (typeof updates.location.longitude !== 'number' || updates.location.longitude < -180 || updates.location.longitude > 180)) {
        throw new Error('Longitude must be between -180 and 180');
      }
    }

    if (updates.land) {
      if (updates.land.totalAcres !== undefined && (typeof updates.land.totalAcres !== 'number' || updates.land.totalAcres <= 0)) {
        throw new Error('Total acres must be a positive number');
      }
    }

    if (updates.flat) {
      if (updates.flat.bedrooms !== undefined && (typeof updates.flat.bedrooms !== 'number' || updates.flat.bedrooms < 0)) {
        throw new Error('Bedrooms cannot be negative');
      }
      if (updates.flat.sqft !== undefined && (typeof updates.flat.sqft !== 'number' || updates.flat.sqft <= 0)) {
        throw new Error('Sqft must be a positive number');
      }
    }
  }

  /**
   * Update property details
   */
  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const property = await db.findPropertyById(id);
    if (!property) {
      throw new Error(`Property ${id} not found`);
    }

    this.validateUpdateInput(updates);

    // Strip protected system fields
    const { status, sellerId, id: _id, createdAt, updatedAt, viewsCount, isFeatured, ...safeUpdates } = updates as any;

    let location = safeUpdates.location;
    if (location) {
      let distanceFromOrrKm = location.distanceFromOrrKm;
      let tier = location.tier;

      if (location.latitude && location.longitude && distanceFromOrrKm === undefined) {
        distanceFromOrrKm = mapsService.calculateDistanceFromOrr({
          lat: location.latitude,
          lng: location.longitude,
        });
      } else if (distanceFromOrrKm === undefined && (location.mandal || location.village)) {
        const lookup = mapsService.lookupLocation(location.mandal || location.village);
        if (lookup) {
          distanceFromOrrKm = lookup.distanceFromOrrKm;
          tier = lookup.tier;
        }
      }

      if (distanceFromOrrKm !== undefined && !tier) {
        tier = mapsService.determineServiceTier(distanceFromOrrKm, location.mandal || property.location.mandal);
      }

      safeUpdates.location = {
        ...location,
        distanceFromOrrKm: distanceFromOrrKm ?? property.location.distanceFromOrrKm,
        tier: tier ?? property.location.tier,
      };
    }

    const updated = await db.updateProperty(id, safeUpdates);
    if (!updated) {
      throw new Error(`Property ${id} not found`);
    }
    return updated;
  }

  /**
   * Delete property
   */
  async deleteProperty(id: string): Promise<boolean> {
    const property = await db.findPropertyById(id);
    if (!property) {
      return false;
    }
    return db.deleteProperty(id);
  }

  async listAllForAdmin(): Promise<Property[]> {
    return db.listAllProperties();
  }
}

export const propertiesService = new PropertiesService();
