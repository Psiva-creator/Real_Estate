import { test, describe, before, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../src/app.js';
import { db } from '../src/db/database.js';
import { initPostgresTestDb, teardownPostgresTestDb } from './integration.setup.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../src/config/index.js';
import { ALL_13_DOCS } from '../src/middleware/security.js';

describe('PostgreSQL Integration Test Suite (real_estate_brokerage_test)', () => {
  before(async () => {
    await initPostgresTestDb();
  });

  beforeEach(async () => {
    // Reset test database to empty clean state before each test
    await db.cleanTestTables();
  });

  after(async () => {
    await teardownPostgresTestDb();
  });

  // =========================================================================
  // 1. DATABASE SAFETY & ISOLATION
  // =========================================================================
  describe('1. Database Safety & Isolation', () => {
    test('Connected database MUST be real_estate_brokerage_test', async () => {
      const pool = db.getPool();
      const res = await pool.query('SELECT current_database();');
      assert.strictEqual(res.rows[0].current_database, 'real_estate_brokerage_test');
    });

    test('cleanTestTables MUST refuse execution against any non-test database', async () => {
      const dummyDb = {
        ensurePool: () => ({
          query: async (sql: string) => {
            if (sql.includes('current_database')) {
              return { rows: [{ current_database: 'real_estate_brokerage' }] };
            }
            return { rows: [] };
          },
        }),
      };

      let threw = false;
      try {
        const pool = dummyDb.ensurePool();
        const res = await pool.query('SELECT current_database();');
        if (!res.rows[0].current_database.endsWith('_test')) {
          throw new Error(`SAFETY GUARD PREVENTED EXECUTION: Refusing to clean non-test database "${res.rows[0].current_database}"`);
        }
      } catch (err) {
        threw = true;
        assert.ok((err as Error).message.includes('SAFETY GUARD'));
      }
      assert.strictEqual(threw, true);
    });
  });

  // =========================================================================
  // 2. USERS REPOSITORY (PostgreSQL)
  // =========================================================================
  describe('2. Users Repository (PostgreSQL)', () => {
    test('createUser and find by id, email, and phone in PostgreSQL', async () => {
      const passwordHash = await bcrypt.hash('Secret123!', 10);
      const user = await db.createUser({
        name: 'Kavitha Reddy',
        email: 'kavitha.reddy@example.com',
        phone: '+919876543210',
        whatsapp: '+919876543210',
        role: 'SELLER',
        passwordHash,
        isActive: true,
      });

      assert.ok(user.id);
      assert.strictEqual(user.name, 'Kavitha Reddy');
      assert.strictEqual(user.email, 'kavitha.reddy@example.com');
      assert.strictEqual(user.phone, '+919876543210');
      assert.strictEqual(user.role, 'SELLER');
      assert.strictEqual(user.passwordHash, passwordHash);

      // Verify direct PostgreSQL row query
      const pool = db.getPool();
      const directRow = await pool.query('SELECT * FROM users WHERE id = $1', [user.id]);
      assert.strictEqual(directRow.rows.length, 1);
      assert.strictEqual(directRow.rows[0].email, 'kavitha.reddy@example.com');

      // Find by ID
      const foundById = await db.getUserById(user.id);
      assert.strictEqual(foundById?.id, user.id);

      // Find by Email
      const foundByEmail = await db.getUserByEmail('kavitha.reddy@example.com');
      assert.strictEqual(foundByEmail?.id, user.id);

      // Find by Phone
      const foundByPhone = await db.getUserByPhone('+919876543210');
      assert.strictEqual(foundByPhone?.id, user.id);
    });

    test('PostgreSQL UNIQUE constraint: duplicate phone must throw 23505', async () => {
      await db.createUser({
        name: 'User One',
        phone: '+919111111111',
        role: 'AGENT',
        isActive: true,
      });

      let errCode = '';
      try {
        await db.createUser({
          name: 'User Two',
          phone: '+919111111111',
          role: 'AGENT',
          isActive: true,
        });
      } catch (err: any) {
        errCode = err.code;
      }
      assert.strictEqual(errCode, '23505', 'Expected unique_violation error code 23505');
    });

    test('PostgreSQL UNIQUE constraint: duplicate email must throw 23505', async () => {
      await db.createUser({
        name: 'User One',
        email: 'duplicate@example.com',
        phone: '+919222222221',
        role: 'AGENT',
        isActive: true,
      });

      let errCode = '';
      try {
        await db.createUser({
          name: 'User Two',
          email: 'duplicate@example.com',
          phone: '+919222222222',
          role: 'AGENT',
          isActive: true,
        });
      } catch (err: any) {
        errCode = err.code;
      }
      assert.strictEqual(errCode, '23505', 'Expected unique_violation error code 23505');
    });
  });

  // =========================================================================
  // 3. OWNERS REPOSITORY (PostgreSQL)
  // =========================================================================
  describe('3. Owners Repository (PostgreSQL)', () => {
    test('createOwner linked to User, update owner and verify in PostgreSQL', async () => {
      const user = await db.createUser({
        name: 'Suresh Landlord',
        phone: '+919333333333',
        role: 'SELLER',
        isActive: true,
      });

      const owner = await db.createOwner({
        userId: user.id,
        name: 'Suresh Landlord',
        phone: '+919333333333',
        email: 'suresh@land.com',
        aadharNumber: '123456789012',
        propertiesCount: 0,
        dealsCompleted: 0,
        rating: 5.0,
      });

      assert.ok(owner.id);
      assert.strictEqual(owner.userId, user.id);
      assert.strictEqual(owner.propertiesCount, 0);

      // Find by ID
      const found = await db.getOwnerById(owner.id);
      assert.strictEqual(found?.id, owner.id);
      assert.strictEqual(found?.userId, user.id);

      // Find by User ID
      const foundByUser = await db.getOwnerByUserId(user.id);
      assert.strictEqual(foundByUser?.id, owner.id);

      // Update Owner
      const updated = await db.updateOwner(owner.id, {
        dealsCompleted: 3,
        rating: 4.8,
      });
      assert.strictEqual(updated.dealsCompleted, 3);
      assert.strictEqual(updated.rating, 4.8);

      // Verify in PostgreSQL directly
      const pool = db.getPool();
      const res = await pool.query('SELECT deals_completed, rating FROM owners WHERE id = $1', [owner.id]);
      assert.strictEqual(parseInt(res.rows[0].deals_completed, 10), 3);
      assert.strictEqual(parseFloat(res.rows[0].rating), 4.8);
    });

    test('PostgreSQL FOREIGN KEY constraint: owner referencing invalid user_id must throw 23503', async () => {
      const fakeUserId = '00000000-0000-0000-0000-000000000000';
      let errCode = '';
      try {
        await db.createOwner({
          userId: fakeUserId,
          name: 'Invalid Owner',
          phone: '+919444444444',
          propertiesCount: 0,
          dealsCompleted: 0,
          rating: 5.0,
        });
      } catch (err: any) {
        errCode = err.code;
      }
      assert.strictEqual(errCode, '23503', 'Expected foreign_key_violation error code 23503');
    });
  });

  // =========================================================================
  // 4. PROPERTIES REPOSITORY (PostgreSQL)
  // =========================================================================
  describe('4. Properties Repository (PostgreSQL)', () => {
    test('create LAND and FLAT properties, query by id, and update status', async () => {
      const user = await db.createUser({
        name: 'Rao Bahadur',
        phone: '+919555555555',
        role: 'SELLER',
        isActive: true,
      });

      const owner = await db.createOwner({
        userId: user.id,
        name: 'Rao Bahadur',
        phone: '+919555555555',
        propertiesCount: 0,
        dealsCompleted: 0,
        rating: 5.0,
      });

      // 1. Create LAND property
      const landProp = await db.createProperty({
        sellerId: owner.id,
        type: 'LAND',
        status: 'DRAFT',
        titleEn: '10 Acres Commercial Hub Kokapet',
        descriptionEn: 'Prime land near Outer Ring Road Kokapet interchange',
        location: {
          village: 'Kokapet',
          mandal: 'Gandipet',
          district: 'Ranga Reddy',
          latitude: 17.385,
          longitude: 78.32,
          distanceFromOrrKm: 2.5,
          zone: 'Commercial',
          tier: 'TIER_1',
        },
        land: {
          totalAcres: 10.0,
          surveyNumbers: ['101/A', '101/B'],
          soilType: 'Red Soil',
          developmentLevel: 'Clear Title',
          roadWidthFt: 100,
          waterAvailable: true,
          electricityAvailable: true,
        },
        pricing: {
          totalPrice: 500000000,
          pricePerAcre: 50000000,
          isNegotiable: true,
        },
        mainImage: 'https://example.com/kokapet.jpg',
        galleryImages: ['https://example.com/k1.jpg'],
        isFeatured: true,
      });

      assert.ok(landProp.id);
      assert.strictEqual(landProp.type, 'LAND');
      assert.strictEqual(landProp.location.village, 'Kokapet');
      assert.strictEqual(landProp.land?.totalAcres, 10.0);
      assert.deepStrictEqual(landProp.land?.surveyNumbers, ['101/A', '101/B']);

      // 2. Create FLAT property
      const flatProp = await db.createProperty({
        sellerId: owner.id,
        type: 'FLAT',
        status: 'LIVE',
        titleEn: '3BHK Luxury High-Rise Gachibowli',
        descriptionEn: 'Facing ORR with premium amenities',
        location: {
          village: 'Gachibowli',
          mandal: 'Serilingampally',
          district: 'Ranga Reddy',
          distanceFromOrrKm: 1.0,
          tier: 'TIER_1',
        },
        flat: {
          sqft: 2200,
          bedrooms: 3,
          bathrooms: 3,
          floor: 14,
          totalFloors: 30,
          amenities: ['Clubhouse', 'Swimming Pool', 'Gym'],
          possessionStatus: 'Ready to move',
        },
        pricing: {
          totalPrice: 22000000,
          pricePerSqft: 10000,
          isNegotiable: false,
        },
        mainImage: 'https://example.com/flat.jpg',
        galleryImages: [],
        isFeatured: false,
      });

      assert.ok(flatProp.id);
      assert.strictEqual(flatProp.type, 'FLAT');
      assert.strictEqual(flatProp.flat?.bedrooms, 3);
      assert.deepStrictEqual(flatProp.flat?.amenities, ['Clubhouse', 'Swimming Pool', 'Gym']);

      // 3. Update Status
      const updatedStatus = await db.updatePropertyStatus(landProp.id, 'UNDER_REVIEW');
      assert.strictEqual(updatedStatus.status, 'UNDER_REVIEW');

      // Verify in PostgreSQL directly
      const pool = db.getPool();
      const direct = await pool.query('SELECT status, survey_numbers FROM properties WHERE id = $1', [landProp.id]);
      assert.strictEqual(direct.rows[0].status, 'UNDER_REVIEW');
      assert.deepStrictEqual(direct.rows[0].survey_numbers, ['101/A', '101/B']);
    });

    test('searchProperties filters in PostgreSQL by type, mandal, ORR distance, price, bedrooms', async () => {
      const user = await db.createUser({
        name: 'Land Seller',
        phone: '+919666666666',
        role: 'SELLER',
        isActive: true,
      });
      const owner = await db.createOwner({
        userId: user.id,
        name: 'Land Seller',
        phone: '+919666666666',
        propertiesCount: 0,
        dealsCompleted: 0,
        rating: 5.0,
      });

      // Kokapet Land (LIVE, 2.5km from ORR, 25Cr)
      await db.createProperty({
        sellerId: owner.id,
        type: 'LAND',
        status: 'LIVE',
        titleEn: 'Kokapet Land Listing',
        descriptionEn: 'Commercial land',
        location: {
          village: 'Kokapet',
          mandal: 'Gandipet',
          district: 'Ranga Reddy',
          distanceFromOrrKm: 2.5,
          tier: 'TIER_1',
        },
        land: { totalAcres: 5.0 },
        pricing: { totalPrice: 250000000, isNegotiable: true },
        mainImage: 'https://example.com/k.jpg',
        galleryImages: [],
        isFeatured: false,
      });

      // Shadnagar Land (LIVE, 28km from ORR, 2Cr)
      await db.createProperty({
        sellerId: owner.id,
        type: 'LAND',
        status: 'LIVE',
        titleEn: 'Shadnagar Agricultural Land',
        descriptionEn: 'Farmland',
        location: {
          village: 'Farooqnagar',
          mandal: 'Shadnagar',
          district: 'Ranga Reddy',
          distanceFromOrrKm: 28.0,
          tier: 'TIER_3',
        },
        land: { totalAcres: 20.0 },
        pricing: { totalPrice: 20000000, isNegotiable: false },
        mainImage: 'https://example.com/s.jpg',
        galleryImages: [],
        isFeatured: false,
      });

      // 4BHK Flat (LIVE, 1.5km from ORR, 3Cr)
      await db.createProperty({
        sellerId: owner.id,
        type: 'FLAT',
        status: 'LIVE',
        titleEn: '4BHK Gated Villa Flat',
        descriptionEn: 'Luxury flat',
        location: {
          village: 'Nanakramguda',
          mandal: 'Serilingampally',
          district: 'Ranga Reddy',
          distanceFromOrrKm: 1.5,
          tier: 'TIER_1',
        },
        flat: { bedrooms: 4, sqft: 3500 },
        pricing: { totalPrice: 30000000, isNegotiable: true },
        mainImage: 'https://example.com/f.jpg',
        galleryImages: [],
        isFeatured: false,
      });

      // 1. Filter by type=LAND
      const landSearch = await db.searchProperties({ type: 'LAND' });
      assert.strictEqual(landSearch.properties.length, 2);
      assert.ok(landSearch.properties.every((p) => p.type === 'LAND'));

      // 2. Filter by mandal='Gandipet'
      const kokapetSearch = await db.searchProperties({ mandal: 'Gandipet' });
      assert.strictEqual(kokapetSearch.properties.length, 1);
      assert.strictEqual(kokapetSearch.properties[0].titleEn, 'Kokapet Land Listing');

      // 3. Filter by maxDistanceOrr=5 (should exclude Shadnagar 28km)
      const nearOrrSearch = await db.searchProperties({ maxDistanceOrr: 5 });
      assert.strictEqual(nearOrrSearch.properties.length, 2);
      assert.ok(nearOrrSearch.properties.every((p) => (p.location.distanceFromOrrKm || 0) <= 5));

      // 4. Filter by price range (maxPrice = 25,000,000)
      const budgetSearch = await db.searchProperties({ maxPrice: 25000000 });
      assert.strictEqual(budgetSearch.properties.length, 1);
      assert.strictEqual(budgetSearch.properties[0].titleEn, 'Shadnagar Agricultural Land');

      // 5. Filter by minBedrooms = 4
      const flatSearch = await db.searchProperties({ minBedrooms: 4 });
      assert.strictEqual(flatSearch.properties.length, 1);
      assert.strictEqual(flatSearch.properties[0].flat?.bedrooms, 4);
    });

    test('PostgreSQL FOREIGN KEY constraint: property referencing non-existent seller_id must throw 23503', async () => {
      const fakeOwnerId = '00000000-0000-0000-0000-000000000000';
      let errCode = '';
      try {
        await db.createProperty({
          sellerId: fakeOwnerId,
          type: 'LAND',
          status: 'DRAFT',
          titleEn: 'Orphan Land',
          descriptionEn: 'No owner',
          location: { village: 'V', mandal: 'M', district: 'D', tier: 'TIER_1' },
          pricing: { totalPrice: 1000000, isNegotiable: false },
          mainImage: 'img.jpg',
          galleryImages: [],
          isFeatured: false,
        });
      } catch (err: any) {
        errCode = err.code;
      }
      assert.strictEqual(errCode, '23503', 'Expected foreign_key_violation error code 23503');
    });
  });

  // =========================================================================
  // 5. ATOMIC TRANSACTIONS & ROLLBACK (PostgreSQL)
  // =========================================================================
  describe('5. Atomic Transactions & Rollback (PostgreSQL)', () => {
    test('Transaction commits: creating property atomically increments owner properties_count', async () => {
      const user = await db.createUser({
        name: 'Transaction User',
        phone: '+919777777771',
        role: 'SELLER',
        isActive: true,
      });

      const owner = await db.createOwner({
        userId: user.id,
        name: 'Transaction User',
        phone: '+919777777771',
        propertiesCount: 0,
        dealsCompleted: 0,
        rating: 5.0,
      });

      assert.strictEqual(owner.propertiesCount, 0);

      // Create property - inside database.ts this runs BEGIN ... INSERT ... UPDATE owners SET properties_count = properties_count + 1 ... COMMIT
      await db.createProperty({
        sellerId: owner.id,
        type: 'LAND',
        status: 'DRAFT',
        titleEn: 'Transaction Land 1',
        descriptionEn: 'Atomic test',
        location: { village: 'V', mandal: 'M', district: 'D', tier: 'TIER_1' },
        pricing: { totalPrice: 1000000, isNegotiable: true },
        mainImage: 'img.jpg',
        galleryImages: [],
        isFeatured: false,
      });

      // Verify owner count incremented in PostgreSQL
      const updatedOwner = await db.getOwnerById(owner.id);
      assert.strictEqual(updatedOwner?.propertiesCount, 1);

      // Create a 2nd property
      await db.createProperty({
        sellerId: owner.id,
        type: 'FLAT',
        status: 'DRAFT',
        titleEn: 'Transaction Flat 2',
        descriptionEn: 'Atomic test 2',
        location: { village: 'V', mandal: 'M', district: 'D', tier: 'TIER_1' },
        pricing: { totalPrice: 2000000, isNegotiable: false },
        mainImage: 'img2.jpg',
        galleryImages: [],
        isFeatured: false,
      });

      const updatedOwner2 = await db.getOwnerById(owner.id);
      assert.strictEqual(updatedOwner2?.propertiesCount, 2);
    });

    test('Transaction rollback on error: aborted transaction rolls back all mutations cleanly', async () => {
      const user = await db.createUser({
        name: 'Rollback User',
        phone: '+919777777772',
        role: 'SELLER',
        isActive: true,
      });

      const owner = await db.createOwner({
        userId: user.id,
        name: 'Rollback User',
        phone: '+919777777772',
        propertiesCount: 5,
        dealsCompleted: 0,
        rating: 5.0,
      });

      const pool = db.getPool();
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Increment count in transaction
        await client.query('UPDATE owners SET properties_count = properties_count + 1 WHERE id = $1', [owner.id]);

        // Attempt an invalid insertion that violates check / type constraint
        await client.query(`
          INSERT INTO properties (id, seller_id, type, status, title_en, description_en, village, mandal, district, tier, total_price)
          VALUES ('00000000-0000-0000-0000-000000000001', $1, 'INVALID_TYPE', 'DRAFT', 'Fail', 'Fail', 'V', 'M', 'D', 'TIER_1', 1000)
        `, [owner.id]);

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
      } finally {
        client.release();
      }

      // Verify that owner properties_count was ROLLED BACK and remains 5
      const ownerCheck = await db.getOwnerById(owner.id);
      assert.strictEqual(ownerCheck?.propertiesCount, 5, 'Owner count should have rolled back to 5');

      // Verify invalid property was NOT created
      const propCheck = await pool.query("SELECT * FROM properties WHERE id = '00000000-0000-0000-0000-000000000001'");
      assert.strictEqual(propCheck.rows.length, 0, 'No property row should exist after rollback');
    });
  });

  // =========================================================================
  // 6. PROPERTY DOCUMENTS REPOSITORY (PostgreSQL)
  // =========================================================================
  describe('6. Property Documents Repository (PostgreSQL)', () => {
    test('upsertPropertyDocument, updateDocumentStatus, and enforce document unique constraint', async () => {
      const user = await db.createUser({
        name: 'Docs User',
        phone: '+919888888881',
        role: 'SELLER',
        isActive: true,
      });
      const owner = await db.createOwner({
        userId: user.id,
        name: 'Docs User',
        phone: '+919888888881',
        propertiesCount: 0,
        dealsCompleted: 0,
        rating: 5.0,
      });
      const property = await db.createProperty({
        sellerId: owner.id,
        type: 'LAND',
        status: 'UNDER_REVIEW',
        titleEn: 'Land with Documents',
        descriptionEn: 'Documentation test',
        location: { village: 'V', mandal: 'M', district: 'D', tier: 'TIER_1' },
        pricing: { totalPrice: 10000000, isNegotiable: true },
        mainImage: 'main.jpg',
        galleryImages: [],
        isFeatured: false,
      });

      // 1. Upsert SALE_DEED
      const doc1 = await db.upsertPropertyDocument({
        propertyId: property.id,
        documentType: 'SALE_DEED',
        fileUrl: 'https://storage.telanganarealty.in/docs/sale_deed_v1.pdf',
        status: 'UPLOADED',
      });

      assert.ok(doc1.id);
      assert.strictEqual(doc1.documentType, 'SALE_DEED');
      assert.strictEqual(doc1.status, 'UPLOADED');

      // 2. Upsert same documentType again: should UPDATE existing document row (ON CONFLICT)
      const doc1Updated = await db.upsertPropertyDocument({
        propertyId: property.id,
        documentType: 'SALE_DEED',
        fileUrl: 'https://storage.telanganarealty.in/docs/sale_deed_v2.pdf',
        status: 'UPLOADED',
      });

      // File URL updated, no duplicate row
      assert.strictEqual(doc1Updated.fileUrl, 'https://storage.telanganarealty.in/docs/sale_deed_v2.pdf');
      const docs = await db.getDocumentsByPropertyId(property.id);
      assert.strictEqual(docs.length, 1, 'Should only have 1 SALE_DEED row, not duplicates');

      // 3. Update document status to VERIFIED
      const verifiedDoc = await db.updateDocumentStatus(
        property.id,
        'SALE_DEED',
        'VERIFIED',
        user.id
      );

      assert.strictEqual(verifiedDoc.status, 'VERIFIED');
      assert.strictEqual(verifiedDoc.verifiedBy, user.id);
      assert.ok(verifiedDoc.verifiedAt);

      // Verify in PostgreSQL directly
      const pool = db.getPool();
      const direct = await pool.query(
        'SELECT status, verified_by FROM property_documents WHERE property_id = $1 AND document_type = $2',
        [property.id, 'SALE_DEED']
      );
      assert.strictEqual(direct.rows[0].status, 'VERIFIED');
      assert.strictEqual(direct.rows[0].verified_by, user.id);
    });

    test('PostgreSQL FOREIGN KEY constraint: document with invalid property_id must throw 23503', async () => {
      const fakePropertyId = '00000000-0000-0000-0000-000000000000';
      let errCode = '';
      try {
        await db.upsertPropertyDocument({
          propertyId: fakePropertyId,
          documentType: 'PATTADAR_PASSBOOK',
          fileUrl: 'https://storage.telanganarealty.in/passbook.pdf',
          status: 'UPLOADED',
        });
      } catch (err: any) {
        errCode = err.code;
      }
      assert.strictEqual(errCode, '23503', 'Expected foreign_key_violation error code 23503');
    });
  });

  // =========================================================================
  // 7. ENQUIRIES REPOSITORY (PostgreSQL)
  // =========================================================================
  describe('7. Enquiries Repository (PostgreSQL)', () => {
    test('createEnquiry, assign to agent, list with filters, and update status', async () => {
      const agentUser = await db.createUser({
        name: 'Agent Vikram',
        phone: '+919999999991',
        role: 'AGENT',
        isActive: true,
      });

      const sellerUser = await db.createUser({
        name: 'Seller Ramesh',
        phone: '+919999999992',
        role: 'SELLER',
        isActive: true,
      });

      const owner = await db.createOwner({
        userId: sellerUser.id,
        name: 'Seller Ramesh',
        phone: '+919999999992',
        propertiesCount: 0,
        dealsCompleted: 0,
        rating: 5.0,
      });

      const property = await db.createProperty({
        sellerId: owner.id,
        type: 'LAND',
        status: 'LIVE',
        titleEn: 'Land for Enquiry',
        descriptionEn: 'Lead pipeline test',
        location: { village: 'Kokapet', mandal: 'Gandipet', district: 'Ranga Reddy', tier: 'TIER_1' },
        pricing: { totalPrice: 50000000, isNegotiable: false },
        mainImage: 'img.jpg',
        galleryImages: [],
        isFeatured: false,
      });

      // 1. Create Enquiry
      const enquiry = await db.createEnquiry({
        propertyId: property.id,
        buyerName: 'Buyer Ananya',
        phone: '+919888877777',
        whatsapp: '+919888877777',
        enquiryType: 'SITE_VISIT',
        status: 'NEW',
        leadScore: 85,
        notes: 'Looking for 5 acres in Kokapet',
      });

      assert.ok(enquiry.id);
      assert.strictEqual(enquiry.buyerName, 'Buyer Ananya');
      assert.strictEqual(enquiry.status, 'NEW');
      assert.strictEqual(enquiry.leadScore, 85);

      // 2. Assign Enquiry to Agent
      const assigned = await db.assignEnquiry(enquiry.id, agentUser.id);
      assert.strictEqual(assigned.assignedTo, agentUser.id);
      assert.strictEqual(assigned.status, 'ASSIGNED');

      // 3. Update Enquiry Status
      const scheduled = await db.updateEnquiryStatus(enquiry.id, 'SITE_VISIT_SCHEDULED', '2026-10-01T10:00:00Z');
      assert.strictEqual(scheduled.status, 'SITE_VISIT_SCHEDULED');

      // 4. List Enquiries with filters
      const listByStatus = await db.listEnquiries({ status: 'SITE_VISIT_SCHEDULED' });
      assert.strictEqual(listByStatus.length, 1);
      assert.strictEqual(listByStatus[0].id, enquiry.id);

      const listByAgent = await db.listEnquiries({ assignedTo: agentUser.id });
      assert.strictEqual(listByAgent.length, 1);
      assert.strictEqual(listByAgent[0].assignedTo, agentUser.id);

      // 5. Direct PostgreSQL Row Verification
      const pool = db.getPool();
      const direct = await pool.query('SELECT status, assigned_to, lead_score FROM enquiries WHERE id = $1', [enquiry.id]);
      assert.strictEqual(direct.rows[0].status, 'SITE_VISIT_SCHEDULED');
      assert.strictEqual(direct.rows[0].assigned_to, agentUser.id);
      assert.strictEqual(parseInt(direct.rows[0].lead_score, 10), 85);
    });

    test('PostgreSQL FOREIGN KEY constraint: enquiry with invalid property_id must throw 23503', async () => {
      const fakePropertyId = '00000000-0000-0000-0000-000000000000';
      let errCode = '';
      try {
        await db.createEnquiry({
          propertyId: fakePropertyId,
          buyerName: 'Orphan Buyer',
          phone: '+919888866666',
          enquiryType: 'CALL',
          status: 'NEW',
          leadScore: 50,
        });
      } catch (err: any) {
        errCode = err.code;
      }
      assert.strictEqual(errCode, '23503', 'Expected foreign_key_violation error code 23503');
    });
  });

  // =========================================================================
  // 8. API END-TO-END PERSISTENCE (Supertest -> Express -> PostgreSQL)
  // =========================================================================
  describe('8. API End-to-End Persistence (Supertest -> Express -> PostgreSQL)', () => {
    test('POST /api/auth/register and POST /api/auth/login against PostgreSQL', async () => {
      // 1. Register seller via API
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Praveen Rao',
          phone: '+919988112233',
          email: 'praveen.rao@gmail.com',
          password: 'SecurePassword123!',
          whatsapp: '+919988112233',
          role: 'SELLER',
        });

      assert.strictEqual(registerRes.status, 201);
      assert.ok(registerRes.body.token);
      assert.strictEqual(registerRes.body.user.phone, '+919988112233');

      // Verify row exists directly in PostgreSQL
      const pool = db.getPool();
      const userRow = await pool.query('SELECT name, email, role, is_active FROM users WHERE phone = $1', ['+919988112233']);
      assert.strictEqual(userRow.rows.length, 1);
      assert.strictEqual(userRow.rows[0].name, 'Praveen Rao');

      const ownerRow = await pool.query('SELECT name, phone FROM owners WHERE phone = $1', ['+919988112233']);
      assert.strictEqual(ownerRow.rows.length, 1);

      // 2. Login with registered credentials against PostgreSQL
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'praveen.rao@gmail.com',
          password: 'SecurePassword123!',
        });

      assert.strictEqual(loginRes.status, 200);
      assert.ok(loginRes.body.token);
      assert.strictEqual(loginRes.body.user.name, 'Praveen Rao');
    });

    test('POST /api/properties creates listing in PostgreSQL and GET /api/properties/:id retrieves it', async () => {
      // Register seller
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Listing Seller',
          phone: '+919988445566',
          email: 'seller.listing@telangana.in',
          password: 'SellerPassword123!',
          role: 'SELLER',
        });

      const token = regRes.body.token;

      // Create property via API
      const createRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'LAND',
          titleEn: 'Neopolis Kokapet IT SEZ Land 20 Acres',
          descriptionEn: 'Premium high-rise IT corridor plot',
          location: {
            district: 'Rangareddy',
            mandal: 'Gandipet',
            village: 'Kokapet',
            latitude: 17.385,
            longitude: 78.32,
          },
          land: {
            totalAcres: 20.0,
            surveyNumbers: ['101/A', '102/B'],
            soilType: 'RED',
            developmentLevel: 'RAW',
            roadWidthFt: 100,
          },
          pricing: {
            pricePerAcre: 50000000,
            totalPrice: 1000000000,
            isNegotiable: true,
          },
          mainImage: 'https://example.com/kokapet.jpg',
        });

      assert.strictEqual(createRes.status, 201);
      const propertyId = createRes.body.property.id;
      assert.ok(propertyId);

      // Retrieve via GET /api/properties/:id
      const getRes = await request(app).get(`/api/properties/${propertyId}`);
      assert.strictEqual(getRes.status, 200);
      assert.strictEqual(getRes.body.property.titleEn, 'Neopolis Kokapet IT SEZ Land 20 Acres');
      // Public response strips seller contact for privacy gate
      assert.strictEqual(getRes.body.property.sellerId, undefined);

      // Verify row in PostgreSQL directly
      const pool = db.getPool();
      const propRow = await pool.query('SELECT title_en, total_acres, status FROM properties WHERE id = $1', [propertyId]);
      assert.strictEqual(propRow.rows.length, 1);
      assert.strictEqual(propRow.rows[0].title_en, 'Neopolis Kokapet IT SEZ Land 20 Acres');
      assert.strictEqual(propRow.rows[0].status, 'DRAFT');
    });

    test('POST /api/enquiries creates lead in PostgreSQL and verifies lead score', async () => {
      // Create seller and property
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Lead Prop Seller',
          phone: '+919988778899',
          password: 'Password123!',
          role: 'SELLER',
        });

      const propRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${regRes.body.token}`)
        .send({
          type: 'LAND',
          titleEn: 'Lead Property Land',
          descriptionEn: 'For buyer enquiry testing',
          location: {
            district: 'Rangareddy',
            mandal: 'Gandipet',
            village: 'Narsingi',
            latitude: 17.38,
            longitude: 78.35,
          },
          land: {
            totalAcres: 5.0,
            surveyNumbers: ['88/A'],
          },
          pricing: {
            pricePerAcre: 40000000,
            totalPrice: 200000000,
            isNegotiable: true,
          },
          mainImage: 'https://example.com/lead.jpg',
        });

      const propertyId = propRes.body.property.id;

      // Submit enquiry via public API
      const enquiryRes = await request(app)
        .post('/api/enquiries')
        .send({
          propertyId,
          buyerName: 'Bhavani Shankar',
          phone: '+919123456780',
          whatsapp: '+919123456780',
          enquiryType: 'SITE_VISIT',
          language: 'en',
          notes: 'Interested in early site visit',
        });

      assert.strictEqual(enquiryRes.status, 201);
      assert.ok(enquiryRes.body.enquiry?.id);
      const enquiryId = enquiryRes.body.enquiry.id;

      // Verify row in PostgreSQL
      const pool = db.getPool();
      const direct = await pool.query('SELECT buyer_name, enquiry_type, lead_score FROM enquiries WHERE id = $1', [enquiryId]);
      assert.strictEqual(direct.rows.length, 1);
      assert.strictEqual(direct.rows[0].buyer_name, 'Bhavani Shankar');
      assert.strictEqual(direct.rows[0].enquiry_type, 'SITE_VISIT');
      assert.strictEqual(parseInt(direct.rows[0].lead_score, 10), 100);
    });
  });

  // =========================================================================
  // 9. PROPERTY CRUD: CREATE & READ
  // =========================================================================
  describe('9. Property CRUD: CREATE & READ', () => {
    test('POST /api/properties authorized create persists in PostgreSQL and increments owner count', async () => {
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Create Seller',
          phone: '+919900112201',
          password: 'Password123!',
          role: 'SELLER',
        });
      const token = sellerRes.body.token;

      const createRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'LAND',
          titleEn: '50 Acres Pharma City Plot',
          descriptionEn: 'Prime industrial/residential zoning plot near Pharma City',
          location: {
            district: 'Rangareddy',
            mandal: 'Yacharam',
            village: 'Mucherla',
            latitude: 17.085,
            longitude: 78.52,
          },
          land: {
            totalAcres: 50.0,
            surveyNumbers: ['201/A', '201/B'],
            soilType: 'RED',
            developmentLevel: 'CLEAR_TITLE',
            roadWidthFt: 80,
          },
          pricing: {
            pricePerAcre: 15000000,
            totalPrice: 750000000,
            isNegotiable: true,
          },
          mainImage: 'https://example.com/pharma.jpg',
        });

      assert.strictEqual(createRes.status, 201);
      const propertyId = createRes.body.property.id;
      assert.ok(propertyId);
      assert.strictEqual(createRes.body.property.status, 'DRAFT');

      // Direct PostgreSQL verification
      const pool = db.getPool();
      const direct = await pool.query('SELECT title_en, total_acres, total_price FROM properties WHERE id = $1', [propertyId]);
      assert.strictEqual(direct.rows.length, 1);
      assert.strictEqual(direct.rows[0].title_en, '50 Acres Pharma City Plot');
      assert.strictEqual(parseFloat(direct.rows[0].total_acres), 50.0);
      assert.strictEqual(parseFloat(direct.rows[0].total_price), 750000000);

      // Verify owner count in PostgreSQL
      const ownerDirect = await pool.query('SELECT properties_count FROM owners WHERE user_id = $1', [sellerRes.body.user.id]);
      assert.strictEqual(parseInt(ownerDirect.rows[0].properties_count, 10), 1);
    });

    test('POST /api/properties invalid input returns 400 Bad Request', async () => {
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Invalid Create Seller',
          phone: '+919900112202',
          password: 'Password123!',
          role: 'SELLER',
        });
      const token = sellerRes.body.token;

      // Missing location and negative price
      const invalidRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'LAND',
          titleEn: 'Incomplete Listing',
          descriptionEn: 'Missing mandatory fields',
          pricing: { totalPrice: -5000 },
          mainImage: 'https://example.com/img.jpg',
        });

      assert.strictEqual(invalidRes.status, 400);
      assert.ok(invalidRes.body.error);
    });

    test('GET /api/properties/:id returns 200 and strips seller info for public privacy', async () => {
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Privacy Seller',
          phone: '+919900112203',
          password: 'Password123!',
          role: 'SELLER',
        });
      const token = sellerRes.body.token;

      const createRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'LAND',
          titleEn: 'Private Seller Land',
          descriptionEn: 'Public detail privacy check',
          location: {
            district: 'Rangareddy',
            mandal: 'Gandipet',
            village: 'Kokapet',
          },
          land: { totalAcres: 5.0, surveyNumbers: ['101/A'] },
          pricing: { totalPrice: 100000000, isNegotiable: false },
          mainImage: 'https://example.com/priv.jpg',
        });

      const propertyId = createRes.body.property.id;

      const getRes = await request(app).get(`/api/properties/${propertyId}`);
      assert.strictEqual(getRes.status, 200);
      assert.strictEqual(getRes.body.property.titleEn, 'Private Seller Land');
      // Privacy check: seller contact details must NOT be returned in public representation
      assert.strictEqual(getRes.body.property.sellerId, undefined);
      assert.strictEqual(getRes.body.property.seller, undefined);
      assert.strictEqual(getRes.body.property.aadharNumber, undefined);
      assert.ok(getRes.body.property.brokerageContact);
    });

    test('GET /api/properties/:id with nonexistent ID returns 404 Not Found', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app).get(`/api/properties/${fakeId}`);
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.error, 'Property not found');
    });
  });

  // =========================================================================
  // 10. PROPERTY CRUD: UPDATE (PATCH /api/properties/:id)
  // =========================================================================
  describe('10. Property CRUD: UPDATE (PATCH /api/properties/:id)', () => {
    test('PATCH /api/properties/:id authorized update by owner persists in PostgreSQL', async () => {
      // 1. Register Seller
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Update Seller',
          phone: '+919900112211',
          password: 'Password123!',
          role: 'SELLER',
        });
      const token = sellerRes.body.token;

      // 2. Create listing
      const createRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'LAND',
          titleEn: 'Original Title Kokapet 10 Acres',
          descriptionEn: 'Original description',
          location: {
            district: 'Rangareddy',
            mandal: 'Gandipet',
            village: 'Kokapet',
          },
          land: { totalAcres: 10.0, surveyNumbers: ['101/A', '102/B'], roadWidthFt: 40 },
          pricing: { totalPrice: 300000000, pricePerAcre: 30000000, isNegotiable: false },
          mainImage: 'https://example.com/orig.jpg',
        });
      const propertyId = createRes.body.property.id;

      // 3. Update property via PATCH
      const patchRes = await request(app)
        .patch(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          titleEn: 'Updated Title Kokapet Commercial 10 Acres',
          descriptionEn: 'Updated description with new road width',
          pricing: {
            totalPrice: 350000000,
            pricePerAcre: 35000000,
            isNegotiable: true,
          },
          land: {
            totalAcres: 10.0,
            roadWidthFt: 80,
          },
        });

      assert.strictEqual(patchRes.status, 200);
      assert.strictEqual(patchRes.body.message, 'Property updated successfully');
      assert.strictEqual(patchRes.body.property.titleEn, 'Updated Title Kokapet Commercial 10 Acres');
      assert.strictEqual(patchRes.body.property.pricing.totalPrice, 350000000);
      assert.strictEqual(patchRes.body.property.pricing.isNegotiable, true);

      // 4. Verify PostgreSQL persistence directly
      const pool = db.getPool();
      const direct = await pool.query(
        'SELECT title_en, total_price, price_per_acre, is_negotiable, road_width_ft FROM properties WHERE id = $1',
        [propertyId]
      );
      assert.strictEqual(direct.rows.length, 1);
      assert.strictEqual(direct.rows[0].title_en, 'Updated Title Kokapet Commercial 10 Acres');
      assert.strictEqual(parseFloat(direct.rows[0].total_price), 350000000);
      assert.strictEqual(parseFloat(direct.rows[0].price_per_acre), 35000000);
      assert.strictEqual(direct.rows[0].is_negotiable, true);
      assert.strictEqual(parseInt(direct.rows[0].road_width_ft, 10), 80);
    });

    test('PATCH /api/properties/:id authorized update by ADMIN succeeds', async () => {
      // 1. Register Seller and create listing
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Seller Under Admin',
          phone: '+919900112212',
          password: 'Password123!',
          role: 'SELLER',
        });
      const createRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${sellerRes.body.token}`)
        .send({
          type: 'LAND',
          titleEn: 'Land to be edited by Admin',
          descriptionEn: 'Admin will modify this',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 5.0, surveyNumbers: ['101/A'] },
          pricing: { totalPrice: 100000000, isNegotiable: false },
          mainImage: 'https://example.com/admin_edit.jpg',
        });
      const propertyId = createRes.body.property.id;

      // 2. Register ADMIN user
      const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
      const adminUser = await db.createUser({
        name: 'Chief Admin',
        email: 'chief.admin@telanganarealty.in',
        phone: '+919900112213',
        role: 'ADMIN',
        passwordHash: adminPasswordHash,
        isActive: true,
      });

      const adminLoginRes = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'chief.admin@telanganarealty.in',
          password: 'AdminPass123!',
        });
      const adminToken = adminLoginRes.body.token;

      // 3. Admin updates seller's listing
      const patchRes = await request(app)
        .patch(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          titleEn: 'Title Approved and Refined by Admin',
        });

      assert.strictEqual(patchRes.status, 200);
      assert.strictEqual(patchRes.body.property.titleEn, 'Title Approved and Refined by Admin');

      // Verify in PostgreSQL
      const pool = db.getPool();
      const direct = await pool.query('SELECT title_en FROM properties WHERE id = $1', [propertyId]);
      assert.strictEqual(direct.rows[0].title_en, 'Title Approved and Refined by Admin');
    });

    test('PATCH /api/properties/:id unauthenticated returns 401 Unauthorized', async () => {
      const res = await request(app)
        .patch('/api/properties/00000000-0000-0000-0000-000000000000')
        .send({ titleEn: 'No Auth' });

      assert.strictEqual(res.status, 401);
    });

    test('PATCH /api/properties/:id by another seller returns 403 Forbidden', async () => {
      // Seller A creates listing
      const sellerARes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Seller Alpha',
          phone: '+919900112214',
          password: 'Password123!',
          role: 'SELLER',
        });
      const createRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${sellerARes.body.token}`)
        .send({
          type: 'LAND',
          titleEn: 'Seller Alpha Land',
          descriptionEn: 'Belongs to Alpha',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 5.0, surveyNumbers: ['101/A'] },
          pricing: { totalPrice: 50000000, isNegotiable: false },
          mainImage: 'https://example.com/alpha.jpg',
        });
      const propertyId = createRes.body.property.id;

      // Seller B registers
      const sellerBRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Seller Beta',
          phone: '+919900112215',
          password: 'Password123!',
          role: 'SELLER',
        });

      // Seller B attempts to modify Seller A's listing
      const patchRes = await request(app)
        .patch(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${sellerBRes.body.token}`)
        .send({
          titleEn: 'Hijacked by Beta',
        });

      assert.strictEqual(patchRes.status, 403);
      assert.ok(patchRes.body.error.includes('Forbidden'));
    });

    test('PATCH /api/properties/:id attempting to modify status returns 400 (State Machine Protection)', async () => {
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Status Bypass Tester',
          phone: '+919900112216',
          password: 'Password123!',
          role: 'SELLER',
        });
      const token = sellerRes.body.token;

      const createRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'LAND',
          titleEn: 'Status Bypass Land',
          descriptionEn: 'Testing bypass',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 2.0, surveyNumbers: ['101/A'] },
          pricing: { totalPrice: 20000000, isNegotiable: false },
          mainImage: 'https://example.com/bypass.jpg',
        });
      const propertyId = createRes.body.property.id;

      // Attempt to change status via generic PATCH
      const patchRes = await request(app)
        .patch(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'LIVE',
        });

      assert.strictEqual(patchRes.status, 400);
      assert.ok(patchRes.body.error.includes('status cannot be updated via generic PATCH'));
    });

    test('PATCH /api/properties/:id with invalid field values returns 400 Bad Request', async () => {
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Field Validator',
          phone: '+919900112217',
          password: 'Password123!',
          role: 'SELLER',
        });
      const token = sellerRes.body.token;

      const createRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'LAND',
          titleEn: 'Validation Target',
          descriptionEn: 'Validating values',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 2.0, surveyNumbers: ['101/A'] },
          pricing: { totalPrice: 20000000, isNegotiable: false },
          mainImage: 'https://example.com/valid.jpg',
        });
      const propertyId = createRes.body.property.id;

      // 1. Negative total price
      const negPriceRes = await request(app)
        .patch(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ pricing: { totalPrice: -1000 } });
      assert.strictEqual(negPriceRes.status, 400);

      // 2. Invalid latitude
      const invLatRes = await request(app)
        .patch(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ location: { latitude: 150.0 } });
      assert.strictEqual(invLatRes.status, 400);

      // 3. Empty title
      const emptyTitleRes = await request(app)
        .patch(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ titleEn: '   ' });
      assert.strictEqual(emptyTitleRes.status, 400);
    });

    test('PATCH /api/properties/:id with nonexistent ID returns 404 Not Found', async () => {
      const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
      await db.createUser({
        name: 'Admin For 404',
        email: 'admin404@telangana.in',
        phone: '+919900112218',
        role: 'ADMIN',
        passwordHash: adminPasswordHash,
        isActive: true,
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: 'admin404@telangana.in', password: 'AdminPass123!' });

      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .patch(`/api/properties/${fakeId}`)
        .set('Authorization', `Bearer ${loginRes.body.token}`)
        .send({ titleEn: 'Nonexistent' });

      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.error, 'Property not found');
    });
  });

  // =========================================================================
  // 11. PROPERTY CRUD: DELETE (DELETE /api/properties/:id)
  // =========================================================================
  describe('11. Property CRUD: DELETE (DELETE /api/properties/:id)', () => {
    test('DELETE /api/properties/:id authorized delete by owner cascades and decrements owner count', async () => {
      // 1. Register Seller A
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Delete Seller',
          phone: '+919900112221',
          password: 'Password123!',
          role: 'SELLER',
        });
      const token = sellerRes.body.token;

      // 2. Create Property 1
      const createRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'LAND',
          titleEn: 'Land To Be Deleted',
          descriptionEn: 'Cascade test',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 10.0, surveyNumbers: ['101/A'] },
          pricing: { totalPrice: 100000000, isNegotiable: false },
          mainImage: 'https://example.com/del.jpg',
        });
      const propertyId = createRes.body.property.id;

      // Create an enquiry linked to Property 1
      await db.createEnquiry({
        propertyId,
        buyerName: 'Cascade Buyer',
        phone: '+919876500001',
        enquiryType: 'CALL',
        status: 'NEW',
        leadScore: 50,
      });

      // 3. Create unrelated Property 2 for another seller
      const otherSellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Other Seller',
          phone: '+919900112222',
          password: 'Password123!',
          role: 'SELLER',
        });
      const prop2Res = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${otherSellerRes.body.token}`)
        .send({
          type: 'LAND',
          titleEn: 'Unrelated Land Should Remain Intact',
          descriptionEn: 'Must not be deleted',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Narsingi' },
          land: { totalAcres: 3.0, surveyNumbers: ['102/B'] },
          pricing: { totalPrice: 30000000, isNegotiable: false },
          mainImage: 'https://example.com/keep.jpg',
        });
      const prop2Id = prop2Res.body.property.id;

      // 4. Delete Property 1 via API
      const delRes = await request(app)
        .delete(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${token}`);

      assert.strictEqual(delRes.status, 200);
      assert.strictEqual(delRes.body.message, 'Property deleted successfully');
      assert.strictEqual(delRes.body.propertyId, propertyId);

      // 5. Direct PostgreSQL Verifications
      const pool = db.getPool();

      // Confirm Property 1 is deleted
      const propCheck = await pool.query('SELECT * FROM properties WHERE id = $1', [propertyId]);
      assert.strictEqual(propCheck.rows.length, 0);

      // Confirm child property_documents were cascaded
      const docCheck = await pool.query('SELECT * FROM property_documents WHERE property_id = $1', [propertyId]);
      assert.strictEqual(docCheck.rows.length, 0);

      // Confirm child enquiries were cascaded
      const enqCheck = await pool.query('SELECT * FROM enquiries WHERE property_id = $1', [propertyId]);
      assert.strictEqual(enqCheck.rows.length, 0);

      // Confirm Seller A's properties_count was decremented to 0
      const ownerCheck = await pool.query('SELECT properties_count FROM owners WHERE user_id = $1', [sellerRes.body.user.id]);
      assert.strictEqual(parseInt(ownerCheck.rows[0].properties_count, 10), 0);

      // Confirm Unrelated Property 2 remains completely intact!
      const prop2Check = await pool.query('SELECT id, title_en FROM properties WHERE id = $1', [prop2Id]);
      assert.strictEqual(prop2Check.rows.length, 1);
      assert.strictEqual(prop2Check.rows[0].title_en, 'Unrelated Land Should Remain Intact');
    });

    test('DELETE /api/properties/:id authorized delete by ADMIN succeeds', async () => {
      // Seller creates listing
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Admin Delete Target Seller',
          phone: '+919900112223',
          password: 'Password123!',
          role: 'SELLER',
        });
      const createRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${sellerRes.body.token}`)
        .send({
          type: 'LAND',
          titleEn: 'Land to be deleted by Admin',
          descriptionEn: 'Admin delete test',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 5.0, surveyNumbers: ['101/A'] },
          pricing: { totalPrice: 50000000, isNegotiable: false },
          mainImage: 'https://example.com/adm_del.jpg',
        });
      const propertyId = createRes.body.property.id;

      // Register ADMIN
      const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
      await db.createUser({
        name: 'Delete Admin',
        email: 'delete.admin@telanganarealty.in',
        phone: '+919900112224',
        role: 'ADMIN',
        passwordHash: adminPasswordHash,
        isActive: true,
      });

      const adminLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: 'delete.admin@telanganarealty.in', password: 'AdminPass123!' });

      const delRes = await request(app)
        .delete(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${adminLoginRes.body.token}`);

      assert.strictEqual(delRes.status, 200);

      // Direct PostgreSQL verification
      const pool = db.getPool();
      const check = await pool.query('SELECT * FROM properties WHERE id = $1', [propertyId]);
      assert.strictEqual(check.rows.length, 0);
    });

    test('DELETE /api/properties/:id unauthenticated returns 401 Unauthorized', async () => {
      const res = await request(app).delete('/api/properties/00000000-0000-0000-0000-000000000000');
      assert.strictEqual(res.status, 401);
    });

    test('DELETE /api/properties/:id by another seller returns 403 Forbidden', async () => {
      // Seller A creates listing
      const sellerARes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Delete Victim Seller',
          phone: '+919900112225',
          password: 'Password123!',
          role: 'SELLER',
        });
      const createRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${sellerARes.body.token}`)
        .send({
          type: 'LAND',
          titleEn: 'Protected Property',
          descriptionEn: 'Cannot be deleted by other seller',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 5.0, surveyNumbers: ['101/A'] },
          pricing: { totalPrice: 50000000, isNegotiable: false },
          mainImage: 'https://example.com/victim.jpg',
        });
      const propertyId = createRes.body.property.id;

      // Seller B attempts delete
      const sellerBRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Rogue Seller',
          phone: '+919900112226',
          password: 'Password123!',
          role: 'SELLER',
        });

      const delRes = await request(app)
        .delete(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${sellerBRes.body.token}`);

      assert.strictEqual(delRes.status, 403);
      assert.ok(delRes.body.error.includes('Forbidden'));

      // Confirm property was NOT deleted in PostgreSQL
      const pool = db.getPool();
      const check = await pool.query('SELECT id FROM properties WHERE id = $1', [propertyId]);
      assert.strictEqual(check.rows.length, 1);
    });

    test('DELETE /api/properties/:id with nonexistent ID returns 404 Not Found', async () => {
      const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
      await db.createUser({
        name: 'Admin Nonexistent Del',
        email: 'admin_del404@telangana.in',
        phone: '+919900112227',
        role: 'ADMIN',
        passwordHash: adminPasswordHash,
        isActive: true,
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: 'admin_del404@telangana.in', password: 'AdminPass123!' });

      const fakeId = '00000000-0000-0000-0000-000000000000';
      const delRes = await request(app)
        .delete(`/api/properties/${fakeId}`)
        .set('Authorization', `Bearer ${loginRes.body.token}`);

      assert.strictEqual(delRes.status, 404);
      assert.strictEqual(delRes.body.error, 'Property not found');
    });
  });

  // =========================================================================
  // 12. PROPERTY STATUS TRANSITIONS & VERIFICATION GATES
  // =========================================================================
  describe('12. Property Status Transitions & Verification Gates', () => {
    test('PATCH /api/properties/:id/status allows valid transition from DRAFT to UNDER_REVIEW by ADMIN', async () => {
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Status Seller',
          phone: '+919900112231',
          password: 'Password123!',
          role: 'SELLER',
        });
      const createRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${sellerRes.body.token}`)
        .send({
          type: 'LAND',
          titleEn: 'Status Transition Land',
          descriptionEn: 'Valid transition check',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 5.0, surveyNumbers: ['101/A'] },
          pricing: { totalPrice: 50000000, isNegotiable: false },
          mainImage: 'https://example.com/trans.jpg',
        });
      const propertyId = createRes.body.property.id;

      // Admin Login
      const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
      await db.createUser({
        name: 'Status Admin',
        email: 'status.admin@telangana.in',
        phone: '+919900112232',
        role: 'ADMIN',
        passwordHash: adminPasswordHash,
        isActive: true,
      });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: 'status.admin@telangana.in', password: 'AdminPass123!' });

      const statusRes = await request(app)
        .patch(`/api/properties/${propertyId}/status`)
        .set('Authorization', `Bearer ${loginRes.body.token}`)
        .send({ status: 'UNDER_REVIEW' });

      assert.strictEqual(statusRes.status, 200);
      assert.strictEqual(statusRes.body.property.status, 'UNDER_REVIEW');

      // Direct PostgreSQL verification
      const pool = db.getPool();
      const direct = await pool.query('SELECT status FROM properties WHERE id = $1', [propertyId]);
      assert.strictEqual(direct.rows[0].status, 'UNDER_REVIEW');
    });

    test('PATCH /api/properties/:id/status blocks invalid transition (DRAFT -> LIVE without verified docs)', async () => {
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Gate Seller',
          phone: '+919900112233',
          password: 'Password123!',
          role: 'SELLER',
        });
      const createRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${sellerRes.body.token}`)
        .send({
          type: 'LAND',
          titleEn: 'Gate Test Land',
          descriptionEn: 'Testing gate',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 5.0, surveyNumbers: ['101/A'] },
          pricing: { totalPrice: 50000000, isNegotiable: false },
          mainImage: 'https://example.com/gate.jpg',
        });
      const propertyId = createRes.body.property.id;

      // Admin Login
      const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
      await db.createUser({
        name: 'Gate Admin',
        email: 'gate.admin@telangana.in',
        phone: '+919900112234',
        role: 'ADMIN',
        passwordHash: adminPasswordHash,
        isActive: true,
      });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: 'gate.admin@telangana.in', password: 'AdminPass123!' });

      // Attempt invalid transition: DRAFT cannot jump directly to LIVE
      const statusRes = await request(app)
        .patch(`/api/properties/${propertyId}/status`)
        .set('Authorization', `Bearer ${loginRes.body.token}`)
        .send({ status: 'LIVE' });

      assert.strictEqual(statusRes.status, 400);
      assert.ok(statusRes.body.error.includes('Invalid status transition'));
    });

    test('PATCH /api/properties/:id/status by SELLER returns 403 Forbidden', async () => {
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Role Check Seller',
          phone: '+919900112235',
          password: 'Password123!',
          role: 'SELLER',
        });
      const token = sellerRes.body.token;

      const statusRes = await request(app)
        .patch('/api/properties/00000000-0000-0000-0000-000000000000/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'LIVE' });

      assert.strictEqual(statusRes.status, 403);
    });
  });

  // =========================================================================
  // 13. 13 MANDATORY DOCUMENT TYPES & POSTGRESQL PERSISTENCE
  // =========================================================================
  describe('13. 13 Mandatory Document Types & PostgreSQL Persistence', () => {
    test('All 13 document types can be uploaded, stored, and queried in PostgreSQL', async () => {
      // 1. Register Seller & Create Land Property
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Doc Master Seller',
          phone: '+919911223344',
          password: 'Password123!',
          role: 'SELLER',
        });
      const sellerToken = sellerRes.body.token;

      const propRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'LAND',
          titleEn: '13-Gate Document Land',
          descriptionEn: 'Testing all 13 document types',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 10.0, surveyNumbers: ['200/A'] },
          pricing: { totalPrice: 100000000, isNegotiable: false },
          mainImage: 'https://example.com/land13.jpg',
        });
      assert.strictEqual(propRes.status, 201);
      const propertyId = propRes.body.property.id;

      // 2. Upload all 13 document types
      for (const docType of ALL_13_DOCS) {
        const uploadRes = await request(app)
          .post(`/api/properties/${propertyId}/documents/upload`)
          .set('Authorization', `Bearer ${sellerToken}`)
          .field('docType', docType)
          .attach('file', Buffer.from(`%PDF-1.4 Mock verification content for ${docType}`), `${docType.toLowerCase()}.pdf`);

        assert.strictEqual(uploadRes.status, 201, `Failed uploading ${docType}: ${JSON.stringify(uploadRes.body)}`);
        assert.strictEqual(uploadRes.body.document.documentType, docType);
        assert.strictEqual(uploadRes.body.document.status, 'UPLOADED');
      }

      // 3. Directly query PostgreSQL: confirm 13 rows exist with exact schema values
      const pool = db.getPool();
      const pgDocs = await pool.query(
        'SELECT id, property_id, document_type, status, file_url, created_at, updated_at FROM property_documents WHERE property_id = $1 ORDER BY created_at ASC',
        [propertyId]
      );
      assert.strictEqual(pgDocs.rows.length, 13, 'PostgreSQL must contain exactly 13 document rows');
      const persistedTypes = pgDocs.rows.map((r: any) => r.document_type);
      for (const docType of ALL_13_DOCS) {
        assert.ok(persistedTypes.includes(docType), `Expected ${docType} persisted in PostgreSQL`);
      }

      // 4. GET /api/properties/:id/documents returns all 13 documents
      const listRes = await request(app)
        .get(`/api/properties/${propertyId}/documents`)
        .set('Authorization', `Bearer ${sellerToken}`);
      assert.strictEqual(listRes.status, 200);
      assert.strictEqual(listRes.body.documents.length, 13);

      // 5. GET /api/properties/:id/documents/:docType returns individual document
      const singleRes = await request(app)
        .get(`/api/properties/${propertyId}/documents/SALE_DEED`)
        .set('Authorization', `Bearer ${sellerToken}`);
      assert.strictEqual(singleRes.status, 200);
      assert.strictEqual(singleRes.body.document.documentType, 'SALE_DEED');
      assert.strictEqual(singleRes.body.document.status, 'UPLOADED');

      // 6. Non-existent document type returns 404
      const notFoundRes = await request(app)
        .get(`/api/properties/${propertyId}/documents/UNKNOWN_TYPE`)
        .set('Authorization', `Bearer ${sellerToken}`);
      assert.strictEqual(notFoundRes.status, 404);
    });
  });

  // =========================================================================
  // 14. DOCUMENT STATUS LIFECYCLE & VERIFICATION STATE MACHINE
  // =========================================================================
  describe('14. Document Status Lifecycle & Verification State Machine', () => {
    test('Admin verification, rejection with reason, and seller re-upload lifecycle in PostgreSQL', async () => {
      // 1. Setup Seller, Property, and Admin
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Lifecycle Seller',
          phone: '+919911223345',
          password: 'Password123!',
          role: 'SELLER',
        });
      const sellerToken = sellerRes.body.token;

      const propRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'LAND',
          titleEn: 'State Machine Land',
          descriptionEn: 'Testing status transitions',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 3.0, surveyNumbers: ['300/B'] },
          pricing: { totalPrice: 30000000, isNegotiable: false },
          mainImage: 'https://example.com/sm.jpg',
        });
      const propertyId = propRes.body.property.id;

      const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
      const adminUser = await db.createUser({
        name: 'Legal Admin Reviewer',
        email: 'legal.admin@telangana.in',
        phone: '+919911223346',
        role: 'ADMIN',
        passwordHash: adminPasswordHash,
        isActive: true,
      });
      const adminLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: 'legal.admin@telangana.in', password: 'AdminPass123!' });
      const adminToken = adminLoginRes.body.token;

      // 2. Upload PAHANI
      await request(app)
        .post(`/api/properties/${propertyId}/documents/upload`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .field('docType', 'PAHANI')
        .attach('file', Buffer.from('%PDF-1.4 Pahani copy'), 'pahani.pdf');

      // 3. Admin VERIFIES PAHANI
      const verifyRes = await request(app)
        .patch(`/api/properties/${propertyId}/documents/PAHANI/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'VERIFIED' });
      assert.strictEqual(verifyRes.status, 200);
      assert.strictEqual(verifyRes.body.document.status, 'VERIFIED');

      // Check PostgreSQL persistence directly
      const pool = db.getPool();
      const pgPahani = await pool.query(
        'SELECT status, verified_by, verified_at, rejection_reason FROM property_documents WHERE property_id = $1 AND document_type = $2',
        [propertyId, 'PAHANI']
      );
      assert.strictEqual(pgPahani.rows[0].status, 'VERIFIED');
      assert.strictEqual(pgPahani.rows[0].verified_by, adminUser.id);
      assert.ok(pgPahani.rows[0].verified_at);
      assert.strictEqual(pgPahani.rows[0].rejection_reason, null);

      // 4. Upload EC and Admin REJECTS it with reason
      await request(app)
        .post(`/api/properties/${propertyId}/documents/upload`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .field('docType', 'EC')
        .attach('file', Buffer.from('%PDF-1.4 10-year EC copy'), 'ec.pdf');

      const rejectRes = await request(app)
        .patch(`/api/properties/${propertyId}/documents/EC/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'REJECTED', rejectionReason: 'EC must cover full 30-year search period' });
      assert.strictEqual(rejectRes.status, 200);
      assert.strictEqual(rejectRes.body.document.status, 'REJECTED');

      // Check PostgreSQL persistence
      const pgEc = await pool.query(
        'SELECT status, rejection_reason FROM property_documents WHERE property_id = $1 AND document_type = $2',
        [propertyId, 'EC']
      );
      assert.strictEqual(pgEc.rows[0].status, 'REJECTED');
      assert.strictEqual(pgEc.rows[0].rejection_reason, 'EC must cover full 30-year search period');

      // 5. Admin rejecting without rejectionReason returns 400 Bad Request
      const rejectEmptyReasonRes = await request(app)
        .patch(`/api/properties/${propertyId}/documents/EC/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'REJECTED', rejectionReason: '   ' });
      assert.strictEqual(rejectEmptyReasonRes.status, 400);

      // 6. Seller RE-UPLOADS rejected EC: status becomes UPLOADED and rejection_reason is cleared
      const reuploadRes = await request(app)
        .post(`/api/properties/${propertyId}/documents/upload`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .field('docType', 'EC')
        .attach('file', Buffer.from('%PDF-1.4 Corrected 30-year EC copy'), 'ec_corrected.pdf');
      assert.strictEqual(reuploadRes.status, 201);
      assert.strictEqual(reuploadRes.body.document.status, 'UPLOADED');

      const pgEcReuploaded = await pool.query(
        'SELECT status, rejection_reason FROM property_documents WHERE property_id = $1 AND document_type = $2',
        [propertyId, 'EC']
      );
      assert.strictEqual(pgEcReuploaded.rows[0].status, 'UPLOADED');
      assert.strictEqual(pgEcReuploaded.rows[0].rejection_reason, null);

      // 7. Re-uploading an already VERIFIED document (PAHANI) is rejected
      const reuploadVerifiedRes = await request(app)
        .post(`/api/properties/${propertyId}/documents/upload`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .field('docType', 'PAHANI')
        .attach('file', Buffer.from('%PDF-1.4 another pahani'), 'pahani_dup.pdf');
      assert.strictEqual(reuploadVerifiedRes.status, 400);
      assert.ok(reuploadVerifiedRes.body.error.includes('already VERIFIED'));

      // 8. Attempting to verify a document not yet uploaded returns 400
      const verifyMissingRes = await request(app)
        .patch(`/api/properties/${propertyId}/documents/MUTATION/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'VERIFIED' });
      assert.strictEqual(verifyMissingRes.status, 400);
      assert.ok(
        verifyMissingRes.body.error.includes('must be UPLOADED first') ||
        verifyMissingRes.body.error.includes('has not been uploaded yet')
      );
    });
  });

  // =========================================================================
  // 15. DOCUMENT RBAC & IDOR PRIVACY ISOLATION
  // =========================================================================
  describe('15. Document RBAC & IDOR Privacy Isolation', () => {
    test('Strict RBAC and cross-seller IDOR protection on document operations', async () => {
      // 1. Seller A registers and creates Property A
      const sellerARes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Seller Alice',
          phone: '+919911223351',
          password: 'Password123!',
          role: 'SELLER',
        });
      const sellerAToken = sellerARes.body.token;

      const propARes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${sellerAToken}`)
        .send({
          type: 'LAND',
          titleEn: 'Alice Private Property',
          descriptionEn: 'Confidential documents',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 2.0, surveyNumbers: ['500/1'] },
          pricing: { totalPrice: 20000000, isNegotiable: false },
          mainImage: 'https://example.com/alice.jpg',
        });
      const propAId = propARes.body.property.id;

      // Alice uploads SALE_DEED
      await request(app)
        .post(`/api/properties/${propAId}/documents/upload`)
        .set('Authorization', `Bearer ${sellerAToken}`)
        .field('docType', 'SALE_DEED')
        .attach('file', Buffer.from('%PDF-1.4 Alice Title Deed'), 'sale_deed.pdf');

      // 2. Seller B registers
      const sellerBRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Seller Bob',
          phone: '+919911223352',
          password: 'Password123!',
          role: 'SELLER',
        });
      const sellerBToken = sellerBRes.body.token;

      // 3. Unauthenticated request to verify/reject returns 401
      const unauthVerify = await request(app)
        .patch(`/api/properties/${propAId}/documents/SALE_DEED/verify`)
        .send({ status: 'VERIFIED' });
      assert.strictEqual(unauthVerify.status, 401);

      // 4. Unauthenticated request to list documents returns 401
      const unauthList = await request(app)
        .get(`/api/properties/${propAId}/documents`);
      assert.strictEqual(unauthList.status, 401);

      // 5. Seller A cannot verify their own document (403 Forbidden)
      const sellerAVerify = await request(app)
        .patch(`/api/properties/${propAId}/documents/SALE_DEED/verify`)
        .set('Authorization', `Bearer ${sellerAToken}`)
        .send({ status: 'VERIFIED' });
      assert.strictEqual(sellerAVerify.status, 403);

      // 6. Seller B cannot verify Seller A's document (403 Forbidden)
      const sellerBVerify = await request(app)
        .patch(`/api/properties/${propAId}/documents/SALE_DEED/verify`)
        .set('Authorization', `Bearer ${sellerBToken}`)
        .send({ status: 'VERIFIED' });
      assert.strictEqual(sellerBVerify.status, 403);

      // 7. Seller B cannot list Seller A's private documents (IDOR Protection -> 403)
      const sellerBList = await request(app)
        .get(`/api/properties/${propAId}/documents`)
        .set('Authorization', `Bearer ${sellerBToken}`);
      assert.strictEqual(sellerBList.status, 403);

      // 8. Seller B cannot view Seller A's single document (IDOR Protection -> 403)
      const sellerBGetDoc = await request(app)
        .get(`/api/properties/${propAId}/documents/SALE_DEED`)
        .set('Authorization', `Bearer ${sellerBToken}`);
      assert.strictEqual(sellerBGetDoc.status, 403);

      // 9. Seller B cannot upload a document to Seller A's property (IDOR Protection -> 403)
      const sellerBUpload = await request(app)
        .post(`/api/properties/${propAId}/documents/upload`)
        .set('Authorization', `Bearer ${sellerBToken}`)
        .field('docType', 'EC')
        .attach('file', Buffer.from('%PDF-1.4 malicious upload'), 'malicious.pdf');
      assert.strictEqual(sellerBUpload.status, 403);

      // 10. Admin can access Seller A's documents (200 OK)
      const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
      await db.createUser({
        name: 'Supervisor Admin',
        email: 'supervisor@telangana.in',
        phone: '+919911223353',
        role: 'ADMIN',
        passwordHash: adminPasswordHash,
        isActive: true,
      });
      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ identifier: 'supervisor@telangana.in', password: 'AdminPass123!' });
      const adminToken = adminLogin.body.token;

      const adminList = await request(app)
        .get(`/api/properties/${propAId}/documents`)
        .set('Authorization', `Bearer ${adminToken}`);
      assert.strictEqual(adminList.status, 200);
      assert.strictEqual(adminList.body.documents.length, 13);
      const uploadedDoc = adminList.body.documents.find((d: any) => d.documentType === 'SALE_DEED');
      assert.strictEqual(uploadedDoc.status, 'UPLOADED');
    });
  });

  // =========================================================================
  // 16. 13-DOCUMENT VERIFICATION GATE & PROPERTY STATUS PROGRESSION
  // =========================================================================
  describe('16. 13-Document Verification Gate & Property Status Progression', () => {
    test('Cannot transition to VERIFIED or LIVE without all mandatory verification documents', async () => {
      // 1. Seller creates Land Property (starts in DRAFT)
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Gatekeeper Seller',
          phone: '+919911223361',
          password: 'Password123!',
          role: 'SELLER',
        });
      const sellerToken = sellerRes.body.token;

      const propRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'LAND',
          titleEn: 'Gate Protected Land Listing',
          descriptionEn: 'Must pass 13 document gates',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 4.0, surveyNumbers: ['600/A'] },
          pricing: { totalPrice: 40000000, isNegotiable: false },
          mainImage: 'https://example.com/gate_land.jpg',
        });
      const propertyId = propRes.body.property.id;

      // Admin Login
      const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
      await db.createUser({
        name: 'Gate Legal Officer',
        email: 'gate.officer@telangana.in',
        phone: '+919911223362',
        role: 'ADMIN',
        passwordHash: adminPasswordHash,
        isActive: true,
      });
      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ identifier: 'gate.officer@telangana.in', password: 'AdminPass123!' });
      const adminToken = adminLogin.body.token;

      // Move DRAFT -> UNDER_REVIEW (allowed)
      const toReviewRes = await request(app)
        .patch(`/api/properties/${propertyId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'UNDER_REVIEW' });
      assert.strictEqual(toReviewRes.status, 200);

      // Attempt 1: Transition to VERIFIED with 0 documents verified -> 400 Bad Request
      const failVerifiedRes = await request(app)
        .patch(`/api/properties/${propertyId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'VERIFIED' });
      assert.strictEqual(failVerifiedRes.status, 400);
      assert.ok(failVerifiedRes.body.error.includes('mandatory verification documents are pending'));

      // Attempt 2: Transition to LIVE with 0 documents verified -> 400 Bad Request
      const failLiveRes = await request(app)
        .patch(`/api/properties/${propertyId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'LIVE' });
      assert.strictEqual(failLiveRes.status, 400);
      assert.ok(failLiveRes.body.error.includes('mandatory verification documents are pending'));

      // Attempt 3: Bypass document gate via generic PATCH /api/properties/:id -> 400 Bad Request
      const bypassRes = await request(app)
        .patch(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'LIVE' });
      assert.strictEqual(bypassRes.status, 400);
      assert.ok(bypassRes.body.error.includes('status cannot be updated via generic PATCH'));

      // 2. Upload and verify 11 of 12 mandatory documents (leaving SALE_AGREEMENT unverified)
      const landMandatoryDocs = [
        'SALE_DEED',
        'EC',
        'LINK_DOCUMENTS',
        'PAHANI',
        'FORM_1B',
        'FMB',
        'PATTADAR_PASSBOOK',
        'HMDA_DTCP_APPROVAL',
        'MUTATION',
        'TAX_RECEIPT',
        'MASTER_PLAN',
      ];

      for (const docType of landMandatoryDocs) {
        await db.upsertPropertyDocument({
          propertyId,
          documentType: docType as any,
          fileUrl: `https://storage.telangana.in/docs/${docType.toLowerCase()}.pdf`,
          status: 'VERIFIED',
          verifiedBy: adminLogin.body.user.id,
          verifiedAt: new Date().toISOString(),
        });
      }

      // Check Go-Live Eligibility API reports missing SALE_AGREEMENT
      const eligRes = await request(app)
        .get(`/api/properties/${propertyId}/documents/go-live-check`)
        .set('Authorization', `Bearer ${sellerToken}`);
      assert.strictEqual(eligRes.status, 200);
      assert.strictEqual(eligRes.body.canGoLive, false);
      assert.ok(eligRes.body.missingDocs.includes('SALE_AGREEMENT'));

      // Attempt 4: Transition to LIVE with 11/12 verified -> still blocked (400)
      const partialLiveRes = await request(app)
        .patch(`/api/properties/${propertyId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'LIVE' });
      assert.strictEqual(partialLiveRes.status, 400);
      assert.ok(partialLiveRes.body.error.includes('SALE_AGREEMENT'));

      // 3. Now verify the 12th mandatory document: SALE_AGREEMENT
      await db.upsertPropertyDocument({
        propertyId,
        documentType: 'SALE_AGREEMENT',
        fileUrl: 'https://storage.telangana.in/docs/sale_agreement.pdf',
        status: 'VERIFIED',
        verifiedBy: adminLogin.body.user.id,
        verifiedAt: new Date().toISOString(),
      });

      // Check Go-Live Eligibility API confirms all satisfied
      const eligSuccessRes = await request(app)
        .get(`/api/properties/${propertyId}/documents/go-live-check`)
        .set('Authorization', `Bearer ${sellerToken}`);
      assert.strictEqual(eligSuccessRes.status, 200);
      assert.strictEqual(eligSuccessRes.body.canGoLive, true);
      assert.strictEqual(eligSuccessRes.body.missingDocs.length, 0);

      // 4. Transition to VERIFIED and LIVE now succeeds!
      const verifySuccessRes = await request(app)
        .patch(`/api/properties/${propertyId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'VERIFIED' });
      assert.strictEqual(verifySuccessRes.status, 200);
      assert.strictEqual(verifySuccessRes.body.property.status, 'VERIFIED');

      const liveSuccessRes = await request(app)
        .patch(`/api/properties/${propertyId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'LIVE' });
      assert.strictEqual(liveSuccessRes.status, 200);
      assert.strictEqual(liveSuccessRes.body.property.status, 'LIVE');

      // 5. Public Privacy Check: GET /api/properties/:id strips private URLs and seller ID
      const publicRes = await request(app).get(`/api/properties/${propertyId}`);
      assert.strictEqual(publicRes.status, 200);
      assert.strictEqual(publicRes.body.property.sellerId, undefined, 'sellerId MUST be stripped');
      assert.ok(publicRes.body.property.verificationStatus, 'verificationStatus must be present');
      assert.strictEqual(publicRes.body.property.verificationStatus.isFullyVerified, true);
      // Ensure private storage file URLs are NOT leaked in public response
      assert.strictEqual(publicRes.body.property.documents, undefined);
    });
  });

  // =========================================================================
  // 17. DATABASE CONSTRAINTS & FOREIGN KEY CASCADE
  // =========================================================================
  describe('17. Database Constraints & Foreign Key Cascade', () => {
    test('Foreign key constraint violations and cascading deletions on property_documents', async () => {
      const pool = db.getPool();

      // 1. Inserting document referencing non-existent property_id violates FK constraint (23503)
      await assert.rejects(
        async () => {
          await pool.query(
            'INSERT INTO property_documents (property_id, document_type, file_url, status) VALUES ($1, $2, $3, $4)',
            ['00000000-0000-0000-0000-000000000000', 'SALE_DEED', 'test.pdf', 'PENDING']
          );
        },
        (err: any) => {
          assert.strictEqual(err.code, '23503');
          return true;
        }
      );

      // 2. Inserting invalid doc_type enum value violates check/enum constraint (22P02)
      await assert.rejects(
        async () => {
          await pool.query(
            'INSERT INTO property_documents (property_id, document_type, file_url, status) VALUES ($1, $2, $3, $4)',
            ['00000000-0000-0000-0000-000000000000', 'INVALID_DOC_TYPE', 'test.pdf', 'PENDING']
          );
        },
        (err: any) => {
          assert.strictEqual(err.code, '22P02');
          return true;
        }
      );

      // 3. Deleting property cascades to all documents in PostgreSQL
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Cascade Seller',
          phone: '+919911223371',
          password: 'Password123!',
          role: 'SELLER',
        });
      const propRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${sellerRes.body.token}`)
        .send({
          type: 'LAND',
          titleEn: 'Cascade Property',
          descriptionEn: 'Will be deleted',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 1.0, surveyNumbers: ['700/A'] },
          pricing: { totalPrice: 10000000, isNegotiable: false },
          mainImage: 'https://example.com/cascade.jpg',
        });
      const propId = propRes.body.property.id;

      // Add 2 documents
      await db.upsertPropertyDocument({
        propertyId: propId,
        documentType: 'SALE_DEED',
        fileUrl: 's3://bucket/sale_deed.pdf',
        status: 'UPLOADED',
      });
      await db.upsertPropertyDocument({
        propertyId: propId,
        documentType: 'EC',
        fileUrl: 's3://bucket/ec.pdf',
        status: 'UPLOADED',
      });

      const docsBefore = await pool.query('SELECT count(*) FROM property_documents WHERE property_id = $1', [propId]);
      assert.strictEqual(parseInt(docsBefore.rows[0].count, 10), 13);

      // Delete the property via API
      const delRes = await request(app)
        .delete(`/api/properties/${propId}`)
        .set('Authorization', `Bearer ${sellerRes.body.token}`);
      assert.strictEqual(delRes.status, 200);

      const docsAfter = await pool.query('SELECT count(*) FROM property_documents WHERE property_id = $1', [propId]);
      assert.strictEqual(parseInt(docsAfter.rows[0].count, 10), 0);
    });
  });

  // =========================================================================
  // 18. STRICT SECURITY & VULNERABILITY AUDIT SUITE
  // =========================================================================
  describe('18. Strict Security & Vulnerability Audit Suite', () => {
    test('Authentication Security: Reject missing password, wrong password, nonexistent user, malformed JWT, expired JWT, and forged signature', async () => {
      // 1. Create a user with password
      const passwordHash = await bcrypt.hash('SecretPass123!', 10);
      const user = await db.createUser({
        name: 'Auth Target User',
        phone: '+919988776601',
        email: 'target@telangana.in',
        passwordHash,
        role: 'SELLER',
        isActive: true,
      });

      // A. Missing password must be rejected (Authentication Bypass attempt)
      const missingPassRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: 'target@telangana.in' });
      assert.strictEqual(missingPassRes.status, 401);
      assert.ok(missingPassRes.body.error.includes('Password is required') || missingPassRes.body.error.includes('Invalid credentials'));

      // B. Wrong password must be rejected
      const wrongPassRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: 'target@telangana.in', password: 'WrongPassword999!' });
      assert.strictEqual(wrongPassRes.status, 401);

      // C. Nonexistent user must be rejected
      const nonExistentRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: 'does.not.exist@telangana.in', password: 'Password123!' });
      assert.strictEqual(nonExistentRes.status, 401);

      // D. Missing Authorization header on protected route returns 401
      const noAuthRes = await request(app).get('/api/admin/dashboard');
      assert.strictEqual(noAuthRes.status, 401);

      // E. Malformed JWT token returns 401
      const malformedRes = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', 'Bearer not.a.valid.jwt.token');
      assert.strictEqual(malformedRes.status, 401);

      // F. Expired JWT token returns 401
      const expiredToken = jwt.sign(
        { id: user.id, role: 'SELLER' },
        config.jwtSecret,
        { expiresIn: '-10s' } // Expired 10 seconds ago
      );
      const expiredRes = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${expiredToken}`);
      assert.strictEqual(expiredRes.status, 401);
      assert.ok(expiredRes.body.error.includes('Invalid or expired token'));

      // G. Forged JWT signed with attacker secret returns 401
      const forgedToken = jwt.sign(
        { id: user.id, role: 'ADMIN' },
        'attacker-unauthorized-secret-key-12345',
        { expiresIn: '1h' }
      );
      const forgedRes = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${forgedToken}`);
      assert.strictEqual(forgedRes.status, 401);
    });

    test('Privilege Escalation: Reject public self-registration with ADMIN or AGENT role', async () => {
      // 1. Attempt self-registering as ADMIN
      const adminRegRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hacker Admin',
          phone: '+919988776602',
          email: 'hacker.admin@telangana.in',
          password: 'Password123!',
          role: 'ADMIN',
        });
      assert.strictEqual(adminRegRes.status, 400);
      assert.ok(adminRegRes.body.error.includes('Cannot self-register as ADMIN'));

      // 2. Attempt self-registering as AGENT
      const agentRegRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hacker Agent',
          phone: '+919988776603',
          email: 'hacker.agent@telangana.in',
          password: 'Password123!',
          role: 'AGENT',
        });
      assert.strictEqual(agentRegRes.status, 400);
      assert.ok(agentRegRes.body.error.includes('Cannot self-register as ADMIN or AGENT'));
    });

    test('RBAC: Unauthorized users blocked from back-office admin and owner operations', async () => {
      // Register legitimate seller
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Standard Seller',
          phone: '+919988776604',
          password: 'Password123!',
          role: 'SELLER',
        });
      const sellerToken = sellerRes.body.token;

      // 1. Seller cannot access admin dashboard
      const dashRes = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${sellerToken}`);
      assert.strictEqual(dashRes.status, 403);

      // 2. Seller cannot access admin properties list
      const adminPropsRes = await request(app)
        .get('/api/admin/properties')
        .set('Authorization', `Bearer ${sellerToken}`);
      assert.strictEqual(adminPropsRes.status, 403);

      // 3. Seller cannot access owners list
      const ownersListRes = await request(app)
        .get('/api/owners')
        .set('Authorization', `Bearer ${sellerToken}`);
      assert.strictEqual(ownersListRes.status, 403);
    });

    test('Mass Assignment: Protected fields (status, sellerId, id, viewsCount) cannot be modified via generic PATCH', async () => {
      // 1. Seller creates property
      const sellerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Mass Assignment Seller',
          phone: '+919988776605',
          password: 'Password123!',
          role: 'SELLER',
        });
      const sellerToken = sellerRes.body.token;

      const propRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'LAND',
          titleEn: 'Original Title',
          descriptionEn: 'Original description',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 2.0, surveyNumbers: ['800/A'] },
          pricing: { totalPrice: 20000000, isNegotiable: false },
          mainImage: 'https://example.com/original.jpg',
        });
      const propertyId = propRes.body.property.id;
      const originalSellerId = propRes.body.property.sellerId;

      // 2. Attempt mass assignment: modify status directly via generic PATCH -> 400
      const statusHackRes = await request(app)
        .patch(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ status: 'LIVE' });
      assert.strictEqual(statusHackRes.status, 400);
      assert.ok(statusHackRes.body.error.includes('status cannot be updated via generic PATCH'));

      // 3. Attempt mass assignment: modify sellerId, id, viewsCount
      const updateRes = await request(app)
        .patch(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          titleEn: 'Updated Legitimate Title',
          sellerId: '00000000-0000-0000-0000-000000000000',
          id: '00000000-0000-0000-0000-000000000001',
          viewsCount: 999999,
        });
      assert.strictEqual(updateRes.status, 200);

      // Verify in PostgreSQL directly: protected fields were NOT modified
      const pool = db.getPool();
      const direct = await pool.query('SELECT id, seller_id, title_en, status, views_count FROM properties WHERE id = $1', [propertyId]);
      assert.strictEqual(direct.rows[0].title_en, 'Updated Legitimate Title');
      assert.strictEqual(direct.rows[0].seller_id, originalSellerId);
      assert.strictEqual(direct.rows[0].id, propertyId);
      assert.strictEqual(direct.rows[0].status, 'DRAFT');
      assert.strictEqual(direct.rows[0].views_count, 0);
    });

    test('SQL Injection: Malicious SQL injection payloads in search filters are safely neutralized', async () => {
      // 1. Injected OR clause in mandal filter
      const sqlInjectionRes1 = await request(app)
        .get("/api/properties/search?mandal=' OR '1'='1");
      assert.strictEqual(sqlInjectionRes1.status, 200);
      // Because no mandal is literally named "' OR '1'='1", 0 matches are returned
      assert.strictEqual(sqlInjectionRes1.body.properties.length, 0);

      // 2. Injected DROP TABLE in village filter
      const sqlInjectionRes2 = await request(app)
        .get("/api/properties/search?village='; DROP TABLE users; --");
      assert.strictEqual(sqlInjectionRes2.status, 200);
      assert.strictEqual(sqlInjectionRes2.body.properties.length, 0);

      // Confirm users table still exists and is untouched
      const pool = db.getPool();
      const checkTable = await pool.query('SELECT count(*) FROM users');
      assert.ok(parseInt(checkTable.rows[0].count, 10) >= 0);

      // 3. Injected UNION SELECT in sortBy parameter
      const sqlInjectionRes3 = await request(app)
        .get('/api/properties/search?sortBy=UNION SELECT id, name FROM users--');
      assert.strictEqual(sqlInjectionRes3.status, 200);
    });

    test('IDOR & Anonymous Spoofing: Anonymous listing creation cannot supply raw sellerId without credentials', async () => {
      // Attempt to submit a listing anonymously with an arbitrary sellerId
      const spoofRes = await request(app)
        .post('/api/properties')
        .send({
          type: 'LAND',
          titleEn: 'Spoofed Property',
          descriptionEn: 'Attempting to spoof sellerId',
          sellerId: '00000000-0000-0000-0000-000000000000',
          location: { district: 'Rangareddy', mandal: 'Gandipet', village: 'Kokapet' },
          land: { totalAcres: 1.0, surveyNumbers: ['900/A'] },
          pricing: { totalPrice: 10000000, isNegotiable: false },
          mainImage: 'https://example.com/spoof.jpg',
        });
      assert.strictEqual(spoofRes.status, 400);
      assert.ok(spoofRes.body.error.includes('Authentication or seller contact details'));
    });

    test('HTTP Security: Server fingerprinting header X-Powered-By is suppressed', async () => {
      const res = await request(app).get('/api/properties');
      assert.strictEqual(res.headers['x-powered-by'], undefined, 'X-Powered-By header MUST be removed');
    });
  });
});
