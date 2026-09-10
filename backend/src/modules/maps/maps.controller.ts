import { Request, Response } from 'express';
import { mapsService } from './maps.service.js';

export class MapsController {
  async calculateOrrDistance(req: Request, res: Response) {
    const { lat, lng, location } = req.query;

    if (lat && lng) {
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: 'Invalid latitude or longitude format' });
      }

      const distanceFromOrrKm = mapsService.calculateDistanceFromOrr({
        lat: latitude,
        lng: longitude,
      });

      const tier = mapsService.determineServiceTier(distanceFromOrrKm);

      return res.json({
        latitude,
        longitude,
        distanceFromOrrKm,
        tier,
      });
    }

    if (location) {
      const found = mapsService.lookupLocation(location as string);
      if (found) {
        return res.json(found);
      }
      return res.status(404).json({ error: 'Location not found in Telangana reference directory' });
    }

    return res.status(400).json({ error: 'Provide lat & lng query parameters or location string' });
  }
}

export const mapsController = new MapsController();
