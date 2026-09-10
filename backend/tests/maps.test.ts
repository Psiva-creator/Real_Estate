import { test, describe } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../src/app.js';
import { mapsService } from '../src/modules/maps/maps.service.js';

describe('Maps & ORR Distance Matrix Module', () => {
  test('Calculate ORR distance for Kokapet coordinates', () => {
    // Kokapet: (17.3986, 78.3245)
    const dist = mapsService.calculateDistanceFromOrr({ lat: 17.3986, lng: 78.3245 });
    // Should be close to Kokapet ORR node (within ~2-3 km)
    assert.ok(dist <= 3.0, `Expected distance <= 3km, got ${dist}`);
  });

  test('Calculate ORR distance for Shadnagar coordinates (Tier 3)', () => {
    // Shadnagar: (17.0673, 78.2098)
    const dist = mapsService.calculateDistanceFromOrr({ lat: 17.0673, lng: 78.2098 });
    assert.ok(dist > 20.0, `Expected distance > 20km from ORR, got ${dist}`);
    const tier = mapsService.determineServiceTier(dist, 'Shadnagar');
    assert.strictEqual(tier, 'TIER_3');
  });

  test('GET /api/maps/distance returns calculated distance and tier', async () => {
    const res = await request(app).get('/api/maps/distance?lat=17.3789&lng=78.3612'); // Narsingi
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.tier, 'TIER_2');
    assert.ok(res.body.distanceFromOrrKm <= 3.0);
  });

  test('GET /api/maps/distance with location string returns lookup', async () => {
    const res = await request(app).get('/api/maps/distance?location=Kukatpally');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.tier, 'TIER_1');
  });
});
