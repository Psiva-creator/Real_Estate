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

  test('POST /api/properties validates required fields for Villa listing', async () => {
    const invalidRes = await request(app)
      .post('/api/properties')
      .send({
        type: 'VILLA',
        titleEn: 'Incomplete Villa Listing',
        descriptionEn: 'Missing built up area and plot area',
        location: {
          district: 'Rangareddy',
          mandal: 'Gandipet',
          village: 'Kokapet',
        },
        pricing: { totalPrice: 50000000 },
        mainImage: 'https://example.com/villa.jpg',
        seller: {
          name: 'Villa Owner',
          phone: '+919876511111',
        },
      });

    assert.strictEqual(invalidRes.status, 400);
    assert.ok(invalidRes.body.error.includes('Built-up area or plot area is required for Villa listings'));
  });

  test('POST /api/properties successfully registers VILLA listing with VillaDetails', async () => {
    const res = await request(app)
      .post('/api/properties')
      .send({
        type: 'VILLA',
        titleEn: 'Luxury 4BHK Villa in Gated Community Kokapet',
        descriptionEn: 'Ultra luxury villa with private garden and clubhouse access.',
        location: {
          district: 'Rangareddy',
          mandal: 'Gandipet',
          village: 'Kokapet',
          latitude: 17.3912,
          longitude: 78.3301,
        },
        villa: {
          plotAreaSqYards: 350,
          builtUpAreaSqFt: 4200,
          configuration: '4 BHK',
          floors: 'G+2',
          facing: 'EAST',
          communityName: 'Kokapet Greens',
          gatedCommunity: true,
          bedrooms: 4,
          bathrooms: 5,
          amenities: ['Clubhouse', 'Swimming Pool', 'Gym'],
        },
        pricing: {
          totalPrice: 65000000,
          isNegotiable: true,
        },
        mainImage: 'https://example.com/villa_main.jpg',
        seller: {
          name: 'Villa Seller',
          phone: '+919876522222',
        },
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.property.type, 'VILLA');
    assert.strictEqual(res.body.property.status, 'DRAFT');
    assert.strictEqual(res.body.property.villa.plotAreaSqYards, 350);
    assert.strictEqual(res.body.property.villa.builtUpAreaSqFt, 4200);
    assert.strictEqual(res.body.property.villa.configuration, '4 BHK');
    assert.strictEqual(res.body.property.villa.facing, 'EAST');
    assert.strictEqual(res.body.property.villa.communityName, 'Kokapet Greens');
    assert.strictEqual(res.body.property.villa.gatedCommunity, true);
    assert.strictEqual(res.body.property.villa.bedrooms, 4);
    assert.strictEqual(res.body.property.villa.bathrooms, 5);
  });

  test('POST /api/properties creates VILLA listing with boundary coordinates and persists them', async () => {
    const testCoordinates = [
      { lat: 17.4201, lng: 78.1923 },
      { lat: 17.4205, lng: 78.1929 },
      { lat: 17.4198, lng: 78.1932 },
    ];

    const res = await request(app)
      .post('/api/properties')
      .send({
        type: 'VILLA',
        titleEn: '4 BHK Triplex Luxury Villa with Private Garden',
        descriptionEn: 'Ultra luxury villa in gated community with swimming pool and clubhouse.',
        location: {
          district: 'Rangareddy',
          mandal: 'Shankarpally',
          village: 'Mokila',
          latitude: 17.4201,
          longitude: 78.1923,
        },
        villa: {
          plotSqYards: 350,
          builtUpSqft: 4200,
          bedrooms: 4,
          bathrooms: 5,
          floors: 3,
          amenities: ['Clubhouse', 'Private Garden', 'Swimming Pool'],
          possessionStatus: 'READY_TO_MOVE',
        },
        boundaryCoordinates: testCoordinates,
        pricing: {
          totalPrice: 48500000,
          isNegotiable: true,
        },
        mainImage: 'https://example.com/villa.jpg',
        seller: {
          name: 'Dr. K. Sitarama Raju',
          phone: '+919876543333',
        },
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.property.type, 'VILLA');
    assert.strictEqual(res.body.property.villa.builtUpSqft, 4200);
    assert.deepStrictEqual(res.body.property.boundaryCoordinates, testCoordinates);

    // Verify public property endpoint preserves boundaryCoordinates
    const publicRes = await request(app).get(`/api/properties/${res.body.property.id}`);
    assert.strictEqual(publicRes.status, 200);
    assert.strictEqual(publicRes.body.property.type, 'VILLA');
    assert.deepStrictEqual(publicRes.body.property.boundaryCoordinates, testCoordinates);
  });

  test('POST /api/properties supports LandDetails with sqYards', async () => {
    const res = await request(app)
      .post('/api/properties')
      .send({
        type: 'LAND',
        titleEn: 'Commercial Land with sqYards defined',
        descriptionEn: 'Prime land near Financial District',
        location: {
          district: 'Rangareddy',
          mandal: 'Serilingampally',
          village: 'Gachibowli',
        },
        land: {
          totalAcres: 2.5,
          sqYards: 12100,
          surveyNumbers: ['45/1'],
          soilType: 'RED',
          developmentLevel: 'RAW',
        },
        pricing: {
          totalPrice: 120000000,
        },
        mainImage: 'https://example.com/land_sqyards.jpg',
        seller: {
          name: 'Land Owner',
          phone: '+919876533333',
        },
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.property.land.sqYards, 12100);
  });

  test('Public search supports status=SOLD and defaults to LIVE, blocking private workflow states', async () => {
    // 1. Create a SOLD villa and a DRAFT property directly in DB
    const { db } = await import('../src/db/database.js');
    await db.createProperty({
      sellerId: 'test-seller',
      type: 'VILLA',
      status: 'SOLD',
      titleEn: 'Sold Prime Villa in Jubilee Hills',
      descriptionEn: 'Recently sold luxury villa.',
      location: {
        district: 'Hyderabad',
        mandal: 'Shaikpet',
        village: 'Jubilee Hills',
        tier: 'TIER_1',
      },
      villa: {
        plotAreaSqYards: 500,
        builtUpAreaSqFt: 6000,
        bedrooms: 5,
      },
      pricing: { totalPrice: 150000000, isNegotiable: false },
      mainImage: 'https://example.com/sold_villa.jpg',
      galleryImages: [],
      isFeatured: false,
    });

    // 2. Default search must return LIVE properties only
    const defaultRes = await request(app).get('/api/properties/search');
    assert.strictEqual(defaultRes.status, 200);
    for (const p of defaultRes.body.properties) {
      assert.strictEqual(p.status, 'LIVE');
    }

    // 3. Search with status=SOLD must return SOLD properties
    const soldRes = await request(app).get('/api/properties/search?status=SOLD');
    assert.strictEqual(soldRes.status, 200);
    assert.ok(soldRes.body.properties.length > 0);
    for (const p of soldRes.body.properties) {
      assert.strictEqual(p.status, 'SOLD');
    }

    // 4. Search with status=DRAFT must safely fall back to LIVE (never expose DRAFT to public)
    const draftRes = await request(app).get('/api/properties/search?status=DRAFT');
    assert.strictEqual(draftRes.status, 200);
    for (const p of draftRes.body.properties) {
      assert.strictEqual(p.status, 'LIVE');
      assert.notStrictEqual(p.status, 'DRAFT');
    }
  });

  test('POST /api/admin/sync-seeds requires ADMIN role and synchronizes dataset', async () => {
    // 1. Unauthenticated request should fail
    const unauthRes = await request(app).post('/api/admin/sync-seeds');
    assert.strictEqual(unauthRes.status, 401);

    // 2. Admin login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@telanganarealty.in', password: 'Admin@1234' });
    assert.strictEqual(loginRes.status, 200);
    const token = loginRes.body.token;

    // 3. Admin sync execution
    const syncRes = await request(app)
      .post('/api/admin/sync-seeds')
      .set('Authorization', `Bearer ${token}`);
    assert.strictEqual(syncRes.status, 200);
    assert.ok(syncRes.body.totalProperties >= 8);
    assert.ok(syncRes.body.totalSellers >= 5);
  });
});
