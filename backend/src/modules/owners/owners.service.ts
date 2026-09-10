import { db } from '../../db/database.js';
import { Owner, Property } from '../../types/index.js';

export class OwnersService {
  async getOwnerById(id: string): Promise<Owner | null> {
    return db.findOwnerById(id);
  }

  async getOwnerByUserId(userId: string): Promise<Owner | null> {
    return db.findOwnerByUserId(userId);
  }

  async getOwnerProperties(ownerId: string): Promise<Property[]> {
    const all = await db.listAllProperties();
    return all.filter((p) => p.sellerId === ownerId);
  }

  async listAllOwners(): Promise<Owner[]> {
    return db.listOwners();
  }
}

export const ownersService = new OwnersService();
