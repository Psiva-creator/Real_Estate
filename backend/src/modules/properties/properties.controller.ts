import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import { propertiesService } from './properties.service.js';
import { PropertySearchParams, PropertyStatus, PropertyType, ServiceTier } from '../../types/index.js';
import { db } from '../../db/database.js';

export class PropertiesController {
  /**
   * Public search endpoint with extensive filters
   * GET /api/properties/search
   */
  async search(req: Request, res: Response) {
    try {
      const {
        type,
        tier,
        district,
        mandal,
        village,
        zone,
        minPrice,
        maxPrice,
        minAcres,
        maxAcres,
        minBedrooms,
        maxBedrooms,
        maxDistanceOrr,
        sortBy,
        page,
        limit,
      } = req.query;

      const searchParams: PropertySearchParams = {
        type: type as PropertyType,
        tier: tier as ServiceTier,
        district: district as string,
        mandal: mandal as string,
        village: village as string,
        zone: zone as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        minAcres: minAcres ? parseFloat(minAcres as string) : undefined,
        maxAcres: maxAcres ? parseFloat(maxAcres as string) : undefined,
        minBedrooms: minBedrooms ? parseInt(minBedrooms as string, 10) : undefined,
        maxBedrooms: maxBedrooms ? parseInt(maxBedrooms as string, 10) : undefined,
        maxDistanceOrr: maxDistanceOrr ? parseFloat(maxDistanceOrr as string) : undefined,
        sortBy: sortBy as PropertySearchParams['sortBy'],
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
      };

      const result = await propertiesService.searchPublicProperties(searchParams);
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }

  /**
   * Public listing index
   * GET /api/properties
   */
  async listPublic(req: Request, res: Response) {
    return this.search(req, res);
  }

  /**
   * Public property detail (Seller contact info strictly stripped)
   * GET /api/properties/:id
   */
  async getDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const property = await propertiesService.getPublicPropertyDetail(id);

      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      return res.json({ property });
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }

  /**
   * Create seller listing (Multi-step onboarding form)
   * POST /api/properties
   */
  async createListing(req: AuthRequest, res: Response) {
    try {
      let sellerId = req.body.sellerId;

      // If user is authenticated as SELLER, ensure seller profile exists
      if (req.user) {
        let owner = await db.findOwnerByUserId(req.user.id);
        if (!owner) {
          owner = await db.createOwner({
            userId: req.user.id,
            name: req.user.name,
            phone: req.user.phone,
            whatsapp: req.user.whatsapp || req.user.phone,
            email: req.user.email,
            propertiesCount: 0,
            dealsCompleted: 0,
            rating: 5.0,
          });
        }
        sellerId = owner.id;
      }

      // If no auth but seller info provided in body (public seller onboarding wizard)
      if (!sellerId && req.body.seller) {
        const { name, phone, whatsapp, email, aadharNumber } = req.body.seller;
        if (!name || !phone) {
          return res.status(400).json({ error: 'Seller name and phone are required for listing submission' });
        }

        let owner = await db.findOwnerByPhone(phone);
        if (!owner) {
          owner = await db.createOwner({
            name,
            phone,
            whatsapp: whatsapp || phone,
            email,
            aadharNumber,
            propertiesCount: 0,
            dealsCompleted: 0,
            rating: 5.0,
          });
        }
        sellerId = owner.id;
      }

      if (!sellerId) {
        return res.status(400).json({
          error: 'sellerId or seller details (name, phone) are required to create a listing',
        });
      }

      const property = await propertiesService.createProperty({
        ...req.body,
        sellerId,
      });

      return res.status(201).json({
        message: 'Property listing draft submitted successfully. Please upload the 13 verification documents.',
        property,
      });
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }

  /**
   * Transition property status (Admin or Agent)
   * PATCH /api/properties/:id/status
   */
  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'status is required' });
      }

      const updated = await propertiesService.updatePropertyStatus(id, status as PropertyStatus);

      return res.json({
        message: `Property status successfully updated to ${status}`,
        property: updated,
      });
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }

  /**
   * Internal detail for team back-office (Includes unmasked seller details)
   * GET /api/admin/properties/:id
   */
  async getInternalDetail(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const property = await propertiesService.getInternalPropertyDetail(id);

      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      const owner = await db.findOwnerById(property.sellerId);
      const documents = await db.findDocumentsByPropertyId(property.id);

      return res.json({
        property,
        seller: owner,
        documents,
      });
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }
}

export const propertiesController = new PropertiesController();
