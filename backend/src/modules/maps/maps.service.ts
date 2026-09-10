import { ServiceTier } from '../../types/index.js';

interface LatLng {
  lat: number;
  lng: number;
}

// Key junction nodes outlining Hyderabad's 158km Outer Ring Road (ORR)
const ORR_NODES: LatLng[] = [
  { lat: 17.2403, lng: 78.4294 }, // Shamshabad (Airport)
  { lat: 17.2289, lng: 78.5447 }, // Bongloor / Adibatla
  { lat: 17.3204, lng: 78.6473 }, // Pedda Amberpet
  { lat: 17.4563, lng: 78.6835 }, // Ghatkesar
  { lat: 17.5912, lng: 78.5831 }, // Shamirpet
  { lat: 17.6163, lng: 78.4907 }, // Medchal / Kandlakoya
  { lat: 17.5312, lng: 78.2612 }, // Patancheru
  { lat: 17.4764, lng: 78.257 },  // Kollur / Tellapur
  { lat: 17.4042, lng: 78.3308 }, // Kokapet
  { lat: 17.385, lng: 78.3582 },  // Narsingi
  { lat: 17.3195, lng: 78.3972 }, // Rajendranagar
];

// Reference coordinates for major Telangana mandals and regions
const KNOWN_LOCATIONS: Record<string, { lat: number; lng: number; tier: ServiceTier }> = {
  // Tier 1: Hyderabad Core & Metropolitan
  kukatpally: { lat: 17.4849, lng: 78.4138, tier: 'TIER_1' },
  serilingampalli: { lat: 17.4834, lng: 78.3158, tier: 'TIER_1' },
  gachibowli: { lat: 17.4401, lng: 78.3489, tier: 'TIER_1' },
  qutbullapur: { lat: 17.5098, lng: 78.4687, tier: 'TIER_1' },
  secunderabad: { lat: 17.4399, lng: 78.4983, tier: 'TIER_1' },
  madhapur: { lat: 17.4483, lng: 78.3915, tier: 'TIER_1' },
  jubilee_hills: { lat: 17.4319, lng: 78.4073, tier: 'TIER_1' },
  banjara_hills: { lat: 17.4156, lng: 78.4356, tier: 'TIER_1' },

  // Tier 2: ORR Growth Corridor (5-10km band)
  kokapet: { lat: 17.3986, lng: 78.3245, tier: 'TIER_2' },
  narsingi: { lat: 17.3789, lng: 78.3612, tier: 'TIER_2' },
  kollur: { lat: 17.4728, lng: 78.2491, tier: 'TIER_2' },
  mokila: { lat: 17.4201, lng: 78.1923, tier: 'TIER_2' },
  shamshabad: { lat: 17.2524, lng: 78.4312, tier: 'TIER_2' },
  adibatla: { lat: 17.2341, lng: 78.5398, tier: 'TIER_2' },
  ghatkesar: { lat: 17.4512, lng: 78.6811, tier: 'TIER_2' },
  medchal: { lat: 17.6298, lng: 78.4814, tier: 'TIER_2' },
  patancheru: { lat: 17.5289, lng: 78.2678, tier: 'TIER_2' },
  shankarpally: { lat: 17.4523, lng: 78.1256, tier: 'TIER_2' },

  // Tier 3: Regional Centers & Mandals
  shadnagar: { lat: 17.0673, lng: 78.2098, tier: 'TIER_3' },
  warangal: { lat: 17.9689, lng: 79.5941, tier: 'TIER_3' },
  karimnagar: { lat: 18.4386, lng: 79.1288, tier: 'TIER_3' },
  nizamabad: { lat: 18.6725, lng: 78.0941, tier: 'TIER_3' },
  yadagirigutta: { lat: 17.5898, lng: 78.9487, tier: 'TIER_3' },
};

export class MapsService {
  /**
   * Haversine formula to compute distance between two coordinates in kilometers.
   */
  calculateHaversineDistance(coord1: LatLng, coord2: LatLng): number {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(coord2.lat - coord1.lat);
    const dLon = toRad(coord2.lng - coord1.lng);
    const lat1 = toRad(coord1.lat);
    const lat2 = toRad(coord2.lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  }

  /**
   * Compute shortest distance from any point on Hyderabad Outer Ring Road (ORR)
   */
  calculateDistanceFromOrr(point: LatLng): number {
    let minDistance = Infinity;

    for (const node of ORR_NODES) {
      const dist = this.calculateHaversineDistance(point, node);
      if (dist < minDistance) {
        minDistance = dist;
      }
    }

    return Number(minDistance.toFixed(2));
  }

  /**
   * Geocode or lookup known Telangana mandal / village
   */
  lookupLocation(query: string): { lat: number; lng: number; tier: ServiceTier; distanceFromOrrKm: number } | null {
    const normalized = query.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    for (const [key, loc] of Object.entries(KNOWN_LOCATIONS)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        const orrDist = this.calculateDistanceFromOrr({ lat: loc.lat, lng: loc.lng });
        return {
          lat: loc.lat,
          lng: loc.lng,
          tier: loc.tier,
          distanceFromOrrKm: orrDist,
        };
      }
    }
    return null;
  }

  /**
   * Determine HMDA Service Tier based on location and distance from ORR
   */
  determineServiceTier(distanceFromOrrKm: number, mandalOrDistrict?: string): ServiceTier {
    if (mandalOrDistrict) {
      const found = this.lookupLocation(mandalOrDistrict);
      if (found) return found.tier;
    }

    if (distanceFromOrrKm <= 2.0) {
      return 'TIER_2';
    } else if (distanceFromOrrKm <= 15.0) {
      return 'TIER_2';
    } else {
      return 'TIER_3';
    }
  }
}

export const mapsService = new MapsService();
