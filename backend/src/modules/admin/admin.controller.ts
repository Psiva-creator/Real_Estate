import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import { db } from '../../db/database.js';
import { runMigrations } from '../../db/migrate.js';
import { runSeeds } from '../../db/seeds/seed.js';

export class AdminController {
  /**
   * Get executive dashboard stats for brokerage team
   */
  async getDashboardStats(_req: AuthRequest, res: Response) {
    try {
      const properties = await db.listAllProperties();
      const enquiries = await db.listEnquiries();
      const owners = await db.listOwners();

      const propertiesByStatus = {
        DRAFT: properties.filter((p) => p.status === 'DRAFT').length,
        UNDER_REVIEW: properties.filter((p) => p.status === 'UNDER_REVIEW').length,
        VERIFIED: properties.filter((p) => p.status === 'VERIFIED').length,
        LIVE: properties.filter((p) => p.status === 'LIVE').length,
        SOLD: properties.filter((p) => p.status === 'SOLD').length,
        OFF_MARKET: properties.filter((p) => p.status === 'OFF_MARKET').length,
      };

      const enquiriesByStatus = {
        NEW: enquiries.filter((e) => e.status === 'NEW').length,
        ASSIGNED: enquiries.filter((e) => e.status === 'ASSIGNED').length,
        CONTACTED: enquiries.filter((e) => e.status === 'CONTACTED').length,
        SITE_VISIT_SCHEDULED: enquiries.filter((e) => e.status === 'SITE_VISIT_SCHEDULED').length,
        IN_NEGOTIATION: enquiries.filter((e) => e.status === 'IN_NEGOTIATION').length,
        DEAL_CLOSED: enquiries.filter((e) => e.status === 'DEAL_CLOSED').length,
        DROPPED: enquiries.filter((e) => e.status === 'DROPPED').length,
      };

      return res.json({
        totalProperties: properties.length,
        propertiesByStatus,
        totalEnquiries: enquiries.length,
        enquiriesByStatus,
        totalSellers: owners.length,
        recentEnquiries: enquiries.slice(0, 5),
      });
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }

  /**
   * List all properties for admin back-office with unmasked seller details
   */
  async listAllProperties(req: AuthRequest, res: Response) {
    try {
      const { status } = req.query;
      let properties = await db.listAllProperties();

      if (status) {
        properties = properties.filter((p) => p.status === status);
      }

      const results = await Promise.all(
        properties.map(async (p) => {
          const owner = await db.findOwnerById(p.sellerId);
          const docs = await db.findDocumentsByPropertyId(p.id);
          const verifiedDocs = docs.filter((d) => d.status === 'VERIFIED').length;
          return {
            ...p,
            seller: owner
              ? {
                  id: owner.id,
                  name: owner.name,
                  phone: owner.phone,
                  whatsapp: owner.whatsapp,
                }
              : null,
            documentsSummary: {
              total: docs.length,
              verified: verifiedDocs,
            },
          };
        })
      );

      return res.json({ properties: results, count: results.length });
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }

  /**
   * Sync database migrations and seed full 8 properties and 104 documents
   */
  async syncSeeds(_req: AuthRequest, res: Response) {
    try {
      await runMigrations();
      await runSeeds();
      const properties = await db.listAllProperties();
      const owners = await db.listOwners();
      return res.json({
        message: 'Database schema, properties, sellers, and documents synchronized successfully',
        totalProperties: properties.length,
        totalSellers: owners.length,
      });
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }
}

export const adminController = new AdminController();
