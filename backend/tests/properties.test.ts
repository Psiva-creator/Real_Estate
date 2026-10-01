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
    assert.strictEqual(res.body.property.status, 'UNDER_REVIEW');
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
    assert.strictEqual(res.body.property.status, 'UNDER_REVIEW');
    assert.strictEqual(res.body.property.villa.plotAreaSqYards, 350);
    assert.strictEqual(res.body.property.villa.builtUpAreaSqFt, 4200);
    assert.strictEqual(res.body.property.villa.configuration, '4 BHK');
    assert.strictEqual(res.body.property.villa.floors, 'G+2');
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

  test('Staff-edited AdminPropertyDetails persist in PostgreSQL and are visible to original seller via GET /api/owners/me without internalNotes', async () => {
    // 1. Register Seller A (original seller) and Seller B (another seller)
    const sellerAReg = await request(app).post('/api/auth/register').send({
      name: 'Original Seller A',
      email: 'seller.a.details@example.com',
      phone: '+919700011101',
      password: 'Password@123',
      role: 'SELLER',
    });
    assert.strictEqual(sellerAReg.status, 201);
    const sellerAToken = sellerAReg.body.token;

    const sellerBReg = await request(app).post('/api/auth/register').send({
      name: 'Other Seller B',
      email: 'seller.b.details@example.com',
      phone: '+919700011102',
      password: 'Password@123',
      role: 'SELLER',
    });
    assert.strictEqual(sellerBReg.status, 201);
    const sellerBToken = sellerBReg.body.token;

    // 2. Seller A submits a property
    const createRes = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${sellerAToken}`)
      .send({
        type: 'VILLA',
        titleEn: 'Seller A Original Villa Submission',
        descriptionEn: 'Original seller description for gated villa.',
        location: {
          district: 'Rangareddy',
          mandal: 'Gandipet',
          village: 'Kokapet',
        },
        villa: {
          plotAreaSqYards: 400,
          builtUpAreaSqFt: 4800,
          configuration: '4 BHK',
          floors: 'G+2',
          bedrooms: 4,
          bathrooms: 5,
        },
        pricing: {
          totalPrice: 72000000,
          isNegotiable: true,
        },
        mainImage: 'https://example.com/seller-a-villa.jpg',
      });
    assert.strictEqual(createRes.status, 201);
    const propertyId = createRes.body.property.id;

    // 3. Verify Seller cannot call PATCH /api/properties/:id/admin-details
    const forbiddenRes = await request(app)
      .patch(`/api/properties/${propertyId}/admin-details`)
      .set('Authorization', `Bearer ${sellerAToken}`)
      .send({
        adminDetails: { projectDescription: 'Unauthorized seller edit' },
      });
    assert.strictEqual(forbiddenRes.status, 403);

    // 4. Staff (ADMIN) logs in and updates AdminPropertyDetails (including confidential internalNotes)
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@telanganarealty.in', password: 'Admin@1234' });
    assert.strictEqual(adminLogin.status, 200);
    const adminToken = adminLogin.body.token;

    const staffCuratedPayload = {
      projectDescription: 'Staff-curated luxury triplex villa overview near ORR Exit 1.',
      highlights: ['HMDA Approved Layout', '100% Vastu Compliant East Facing'],
      amenities: ['Clubhouse', 'Heated Infinity Pool', '24x7 Armed Security'],
      locationAdvantages: ['2 mins from Neopolis Kokapet SEZ', '5 mins from Financial District'],
      nearbyLandmarks: ['ORR Exit 1', 'Rockwell International School'],
      additionalSpecifications: [
        { label: 'Flooring', value: 'Italian Marble' },
        { label: 'Elevator', value: 'Schindler 6-Passenger Home Lift' },
      ],
      specialFeatures: ['Private Terrace Deck', 'Solar Roof Integration'],
      pricingNotes: 'All-inclusive of club membership and corpus fund.',
      siteVisitInstructions: 'Prior 24-hour notice required with Deal Desk.',
      additionalNotes: 'Clear title verified across 30-year EC.',
      internalNotes: 'CONFIDENTIAL STAFF ONLY: Seller willing to close at 6.8 Cr for immediate full payment.',
      customSections: [
        { title: 'Water & Power Backup', content: 'Manjeera water connection + 100% DG backup.' },
      ],
    };

    const patchRes = await request(app)
      .patch(`/api/properties/${propertyId}/admin-details`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ adminDetails: staffCuratedPayload });

    assert.strictEqual(patchRes.status, 200);
    assert.strictEqual(
      patchRes.body.adminDetails.projectDescription,
      staffCuratedPayload.projectDescription
    );
    assert.strictEqual(
      patchRes.body.adminDetails.internalNotes,
      staffCuratedPayload.internalNotes
    );

    // 5. Verify staff internal detail endpoint returns full adminDetails (including internalNotes) from PostgreSQL
    const adminDetailRes = await request(app)
      .get(`/api/admin/properties/${propertyId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.strictEqual(adminDetailRes.status, 200);
    assert.strictEqual(
      adminDetailRes.body.property.adminDetails.internalNotes,
      staffCuratedPayload.internalNotes
    );

    // 6. Before publish: Seller A refreshes Seller Portal (GET /api/owners/me) and must NOT see unpublished draft adminDetails
    const prePublishSellerRes = await request(app)
      .get('/api/owners/me')
      .set('Authorization', `Bearer ${sellerAToken}`);
    assert.strictEqual(prePublishSellerRes.status, 200);
    const prePublishProp = prePublishSellerRes.body.properties.find((p: any) => p.id === propertyId);
    assert.ok(prePublishProp);
    assert.strictEqual(prePublishProp.adminDetails, undefined, 'Seller must NOT see unpublished draft adminDetails');

    // 7. Authorization check: Seller cannot publish admin details
    const unauthorizedPublishRes = await request(app)
      .post(`/api/properties/${propertyId}/admin-details/publish`)
      .set('Authorization', `Bearer ${sellerAToken}`);
    assert.strictEqual(unauthorizedPublishRes.status, 403);

    // 8. Admin publishes admin details to seller
    const publishRes = await request(app)
      .post(`/api/properties/${propertyId}/admin-details/publish`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.strictEqual(publishRes.status, 200);

    // 9. After publish: Seller A refreshes Seller Portal (GET /api/owners/me) and sees all 11 curated fields, but NEVER internalNotes
    const sellerAMeRes = await request(app)
      .get('/api/owners/me')
      .set('Authorization', `Bearer ${sellerAToken}`);
    assert.strictEqual(sellerAMeRes.status, 200);
    const sellerAProp = sellerAMeRes.body.properties.find((p: any) => p.id === propertyId);
    assert.ok(sellerAProp, 'Original seller must see their submitted property');

    // Original seller-submitted details remain intact and separate
    assert.strictEqual(sellerAProp.titleEn, 'Seller A Original Villa Submission');
    assert.strictEqual(sellerAProp.descriptionEn, 'Original seller description for gated villa.');

    // Staff-updated details are present
    assert.ok(sellerAProp.adminDetails, 'Seller must receive published adminDetails');
    assert.strictEqual(
      sellerAProp.adminDetails.projectDescription,
      staffCuratedPayload.projectDescription
    );
    assert.deepStrictEqual(sellerAProp.adminDetails.highlights, staffCuratedPayload.highlights);
    assert.deepStrictEqual(sellerAProp.adminDetails.amenities, staffCuratedPayload.amenities);
    assert.deepStrictEqual(
      sellerAProp.adminDetails.locationAdvantages,
      staffCuratedPayload.locationAdvantages
    );
    assert.deepStrictEqual(
      sellerAProp.adminDetails.nearbyLandmarks,
      staffCuratedPayload.nearbyLandmarks
    );
    assert.deepStrictEqual(
      sellerAProp.adminDetails.additionalSpecifications,
      staffCuratedPayload.additionalSpecifications
    );
    assert.deepStrictEqual(
      sellerAProp.adminDetails.specialFeatures,
      staffCuratedPayload.specialFeatures
    );
    assert.strictEqual(sellerAProp.adminDetails.pricingNotes, staffCuratedPayload.pricingNotes);
    assert.strictEqual(
      sellerAProp.adminDetails.siteVisitInstructions,
      staffCuratedPayload.siteVisitInstructions
    );
    assert.strictEqual(
      sellerAProp.adminDetails.additionalNotes,
      staffCuratedPayload.additionalNotes
    );
    assert.deepStrictEqual(
      sellerAProp.adminDetails.customSections,
      staffCuratedPayload.customSections
    );

    // Security check: internalNotes and discrepancyNotes MUST NEVER be exposed to seller
    assert.strictEqual(
      sellerAProp.adminDetails.internalNotes,
      undefined,
      'internalNotes must NEVER be exposed to seller'
    );
    assert.strictEqual(
      sellerAProp.discrepancyNotes,
      undefined,
      'discrepancyNotes must NEVER be exposed to seller'
    );

    // 7. Seller B fetches GET /api/owners/me and must NOT see Seller A's property or details
    const sellerBMeRes = await request(app)
      .get('/api/owners/me')
      .set('Authorization', `Bearer ${sellerBToken}`);
    assert.strictEqual(sellerBMeRes.status, 200);
    const leakedProp = sellerBMeRes.body.properties.find((p: any) => p.id === propertyId);
    assert.strictEqual(leakedProp, undefined, 'Another seller must never see Seller A property');
  });

  describe('Property Status Transitions & Publishing State Machine', () => {
    test('Seller submission enters UNDER_REVIEW, whereas DRAFT is reserved for explicit draft creation', async () => {
      const { db } = await import('../src/db/database.js');
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Workflow Seller 1',
          phone: '+919988112233',
          password: 'Password123!',
          role: 'SELLER',
        });
      const sellerToken = sellerRes.body.token;

      // 1. Seller submission (without explicit status) enters UNDER_REVIEW
      const submitRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'LAND',
          titleEn: 'Submitted Land for Review',
          descriptionEn: 'Completed submission ready for team review',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 3.5, surveyNumbers: ['220/1'] },
          pricing: { totalPrice: 35000000 },
          mainImage: 'https://example.com/land1.jpg',
        });
      assert.strictEqual(submitRes.status, 201);
      assert.strictEqual(submitRes.body.property.status, 'UNDER_REVIEW');

      // 2. Explicit draft creation enters DRAFT
      const draftRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'LAND',
          status: 'DRAFT',
          titleEn: 'Internal Incomplete Draft',
          descriptionEn: 'Work in progress listing draft',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 1.0, surveyNumbers: ['220/2'] },
          pricing: { totalPrice: 10000000 },
          mainImage: 'https://example.com/draft.jpg',
        });
      assert.strictEqual(draftRes.status, 201);
      assert.strictEqual(draftRes.body.property.status, 'DRAFT');
    });

    test('DRAFT property cannot be published directly to LIVE (State Machine Gate)', async () => {
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Draft Gate Seller',
          phone: '+919988112234',
          password: 'Password123!',
          role: 'SELLER',
        });
      const sellerToken = sellerRes.body.token;

      const createRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'LAND',
          status: 'DRAFT',
          titleEn: 'Unpublished Draft Listing',
          descriptionEn: 'Should not jump from DRAFT to LIVE',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 2.0, surveyNumbers: ['301/A'] },
          pricing: { totalPrice: 20000000 },
          mainImage: 'https://example.com/gate_draft.jpg',
        });
      const propertyId = createRes.body.property.id;

      // Admin login
      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@telanganarealty.in', password: 'Admin@1234' });
      const adminToken = adminLogin.body.token;

      // Attempt DRAFT -> LIVE directly
      const patchRes = await request(app)
        .patch(`/api/properties/${propertyId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'LIVE' });

      assert.strictEqual(patchRes.status, 400);
      assert.ok(
        patchRes.body.error.includes(
          'Invalid status transition: Cannot change status from DRAFT to LIVE. Allowed next states: UNDER_REVIEW, OFF_MARKET'
        )
      );

      // Verify property is still DRAFT
      const detailRes = await request(app)
        .get(`/api/admin/properties/${propertyId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      assert.strictEqual(detailRes.body.property.status, 'DRAFT');
    });

    test('DRAFT property can be transitioned to UNDER_REVIEW by ADMIN', async () => {
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Move Review Seller',
          phone: '+919988112235',
          password: 'Password123!',
          role: 'SELLER',
        });
      const sellerToken = sellerRes.body.token;

      const createRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'LAND',
          status: 'DRAFT',
          titleEn: 'Draft Moving To Review',
          descriptionEn: 'Testing DRAFT -> UNDER_REVIEW transition',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 2.0, surveyNumbers: ['302/B'] },
          pricing: { totalPrice: 25000000 },
          mainImage: 'https://example.com/draft2.jpg',
        });
      const propertyId = createRes.body.property.id;

      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@telanganarealty.in', password: 'Admin@1234' });
      const adminToken = adminLogin.body.token;

      // Move DRAFT -> UNDER_REVIEW
      const patchRes = await request(app)
        .patch(`/api/properties/${propertyId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'UNDER_REVIEW' });

      assert.strictEqual(patchRes.status, 200);
      assert.strictEqual(patchRes.body.property.status, 'UNDER_REVIEW');
    });

    test('UNDER_REVIEW listing cannot be published to LIVE when mandatory verification documents are pending', async () => {
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Review Unverified Seller',
          phone: '+919988112236',
          password: 'Password123!',
          role: 'SELLER',
        });
      const sellerToken = sellerRes.body.token;

      const createRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'LAND',
          titleEn: 'Unverified Review Property',
          descriptionEn: 'UNDER_REVIEW but docs are pending',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 3.0, surveyNumbers: ['401/C'] },
          pricing: { totalPrice: 30000000 },
          mainImage: 'https://example.com/under_review.jpg',
        });
      const propertyId = createRes.body.property.id;
      assert.strictEqual(createRes.body.property.status, 'UNDER_REVIEW');

      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@telanganarealty.in', password: 'Admin@1234' });
      const adminToken = adminLogin.body.token;

      // Attempt to publish to LIVE while mandatory docs are pending
      const publishRes = await request(app)
        .patch(`/api/properties/${propertyId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'LIVE' });

      assert.strictEqual(publishRes.status, 400);
      assert.ok(publishRes.body.error.includes('mandatory verification documents are pending or unverified'));
    });

    test('UNDER_REVIEW listing can transition to LIVE when eligible and all mandatory documents are VERIFIED', async () => {
      const { db } = await import('../src/db/database.js');
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Fully Verified Seller',
          phone: '+919988112237',
          password: 'Password123!',
          role: 'SELLER',
        });
      const sellerToken = sellerRes.body.token;

      const createRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'FLAT',
          titleEn: 'Fully Verified Flat Listing',
          descriptionEn: 'All mandatory docs verified',
          location: { district: 'Hyderabad', mandal: 'Shaikpet', village: 'Jubilee Hills' },
          flat: { sqft: 2200, bedrooms: 3, floor: 5, totalFloors: 10, possessionStatus: 'READY_TO_MOVE' },
          pricing: { totalPrice: 22000000 },
          mainImage: 'https://example.com/flat.jpg',
        });
      const propertyId = createRes.body.property.id;
      assert.strictEqual(createRes.body.property.status, 'UNDER_REVIEW');

      // Verify all mandatory documents for FLAT
      const flatMandatory = ['SALE_DEED', 'EC', 'LINK_DOCUMENTS', 'HMDA_DTCP_APPROVAL', 'TAX_RECEIPT', 'SALE_AGREEMENT'];
      for (const docType of flatMandatory) {
        await db.upsertDocument({
          propertyId,
          documentType: docType as any,
          fileUrl: `https://storage.telanganarealty.in/${docType}.pdf`,
          status: 'VERIFIED',
          verifiedBy: 'admin-001',
          verifiedAt: new Date().toISOString(),
        });
      }

      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@telanganarealty.in', password: 'Admin@1234' });
      const adminToken = adminLogin.body.token;

      // Now publish to LIVE
      const publishRes = await request(app)
        .patch(`/api/properties/${propertyId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'LIVE' });

      assert.strictEqual(publishRes.status, 200);
      assert.strictEqual(publishRes.body.property.status, 'LIVE');
    });

    test('Backend rejects invalid status transitions (e.g. DRAFT -> SOLD)', async () => {
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Invalid Transition Seller',
          phone: '+919988112238',
          password: 'Password123!',
          role: 'SELLER',
        });
      const sellerToken = sellerRes.body.token;

      const createRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'LAND',
          status: 'DRAFT',
          titleEn: 'Draft for Invalid Transition',
          descriptionEn: 'Testing illegal jump',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 1.0, surveyNumbers: ['500/A'] },
          pricing: { totalPrice: 10000000 },
          mainImage: 'https://example.com/invalid.jpg',
        });
      const propertyId = createRes.body.property.id;

      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@telanganarealty.in', password: 'Admin@1234' });
      const adminToken = adminLogin.body.token;

      // Attempt illegal transition: DRAFT -> SOLD
      const invalidRes = await request(app)
        .patch(`/api/properties/${propertyId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'SOLD' });

      assert.strictEqual(invalidRes.status, 400);
      assert.ok(invalidRes.body.error.includes('Invalid status transition'));
    });
  });
});
