import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import { ownersService } from './owners.service.js';
import { db } from '../../db/database.js';

export class OwnersController {
  async getMyProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const owner = await ownersService.getOwnerByUserId(req.user.id);
      if (!owner) {
        return res.status(404).json({ error: 'Seller profile not found' });
      }

      const properties = await ownersService.getOwnerProperties(owner.id);

      return res.json({
        seller: owner,
        properties,
      });
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }

  async listAll(req: AuthRequest, res: Response) {
    try {
      const owners = await ownersService.listAllOwners();
      return res.json({ owners, count: owners.length });
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }

  async getDetail(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const owner = await ownersService.getOwnerById(id);
      if (!owner) {
        return res.status(404).json({ error: 'Seller not found' });
      }
      const properties = await ownersService.getOwnerProperties(owner.id);
      return res.json({ seller: owner, properties });
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }
}

export const ownersController = new OwnersController();
