import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../src/app.js';
import { initTestDb } from './setup.js';

describe('Properties Module & Seller Privacy Gate', () => {
  beforeEach(async () => {
    await initTestDb();
  });

  test('QA Pre-Launch Gate #1: Public responses MUST strip seller contact and ID', async () => {
    // 1. Check list endpoint
    const listRes = await request(app).get('/api/properties');
    assert.strictEqual(listRes.status, 200);
    assert.ok(listRes.body.properties.length > 0);

    // Verify un-prefixed alias /properties works identically
    const aliasRes = await request(app).get('/properties');
    assert.strictEqual(aliasRes.status, 200);
    assert.strictEqual(aliasRes.body.properties.length, listRes.body.properties.length);

    for (const prop of listRes.body.properties) {
      assert.strictEqual(prop.sellerId, undefined, 'sellerId must be stripped from public listings');
      assert.strictEqual(prop.seller, undefined, 'seller object must be stripped from public listings');
      assert.ok(prop.brokerageContact, 'brokerage contact desk must be provided instead');
      assert.ok(prop.verificationStatus, 'verificationStatus must be provided');
    }

    // 2. Check single property detail endpoint
    const sampleId = listRes.body.properties[0].id;
    const detailRes = await request(app).get(`/api/properties/${sampleId}`);
    assert.strictEqual(detailRes.status, 200);
    const p = detailRes.body.property;

    assert.strictEqual(p.sellerId, undefined, 'sellerId must be stripped from public property detail');
    assert.strictEqual(p.seller, undefined, 'seller object must be stripped from public property detail');
    assert.strictEqual(p.aadharNumber, undefined, 'Aadhar number must never be exposed');
    assert.strictEqual(p.brokerageContact.phone, '+91-9876543210');
    assert.strictEqual(p.verificationStatus.totalDocuments, 13);
  });

  test('POST /api/properties validates required fields for Land listing', async () => {
    const invalidRes = await request(app)
      .post('/api/properties')
      .send({
        type: 'LAND',
        titleEn: 'Incomplete Land Listing',
        descriptionEn: 'Missing acres and survey number',
        location: {
          district: 'Rangareddy',
          mandal: 'Gandipet',
          village: 'Kokapet',
        },
        pricing: { totalPrice: 10000000 },
        mainImage: 'https://example.com/img.jpg',
        seller: {
          name: 'Test Seller',
          phone: '+919876599999',
        },
      });

    assert.strictEqual(invalidRes.status, 400);
    assert.ok(invalidRes.body.error.includes('acres'));
  });

  test('POST /api/properties successfully registers listing draft and calculates ORR distance', async () => {
    const res = await request(app)
      .post('/api/properties')
      .send({
        type: 'LAND',
        titleEn: '10 Acres Land in Mokila Growth Corridor',
        titleTe: 'మోకిల గ్రోత్ కారిడార్‌లో 10 ఎకరాల భూమి',
        descriptionEn: 'Clear title agricultural land suitable for gated community development.',
        location: {
          district: 'Rangareddy',
          mandal: 'Mokila',
          village: 'Mokila',
          latitude: 17.4201,
          longitude: 78.1923,
        },
        land: {
          totalAcres: 10.0,
          surveyNumbers: ['95/A', '96/1'],
          soilType: 'RED',
          developmentLevel: 'RAW',
          roadWidthFt: 40,
        },
        pricing: {
          pricePerAcre: 50000000,
          totalPrice: 500000000,
          isNegotiable: true,
        },
        mainImage: 'https://example.com/land.jpg',
        seller: {
          name: 'Ramanaidu',
          phone: '+919876588888',
        },
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.property.status, 'DRAFT');
    assert.strictEqual(res.body.property.location.tier, 'TIER_2');
    assert.ok(res.body.property.location.distanceFromOrrKm > 0);
  });

  test('GET /api/properties/search filters by type and max distance from ORR', async () => {
    // Search Land within 3km of ORR
    const res = await request(app).get('/api/properties/search?type=LAND&maxDistanceOrr=3.0');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.properties.length > 0);

    for (const prop of res.body.properties) {
      assert.strictEqual(prop.type, 'LAND');
      assert.ok(prop.location.distanceFromOrrKm <= 3.0);
    }
  });

  test('GET /api/properties/search filters Flats by minimum bedrooms', async () => {
    const res = await request(app).get('/api/properties/search?type=FLAT&minBedrooms=4');
    assert.strictEqual(res.status, 200);

    for (const prop of res.body.properties) {
      assert.strictEqual(prop.type, 'FLAT');
      assert.ok(prop.flat.bedrooms >= 4);
    }
  });
});
