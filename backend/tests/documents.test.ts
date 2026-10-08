import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../src/app.js';
import { db } from '../src/db/database.js';
import { initTestDb } from './setup.js';
import { ALL_13_DOCS } from '../src/middleware/security.js';

describe('Documents & 13 Verification Gates', () => {
  let adminToken: string;

  beforeEach(async () => {
    await initTestDb();
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'admin@telanganarealty.in',
        password: 'Admin@1234',
      });
    adminToken = loginRes.body.token;
  });

  test('POST /api/properties/:id/documents/upload uploads valid PDF document when authenticated', async () => {
    // Find draft property (Shadnagar)
    const allProps = await db.listAllProperties();
    const draftProp = allProps.find((p) => p.status === 'DRAFT')!;

    const dummyPdf = Buffer.from('%PDF-1.4 dummy pdf document content');

    const res = await request(app)
      .post(`/api/properties/${draftProp.id}/documents/upload`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('docType', 'SALE_DEED')
      .attach('file', dummyPdf, 'sale_deed.pdf');

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.document.documentType, 'SALE_DEED');
    assert.strictEqual(res.body.document.status, 'UPLOADED');

    // Check status transitioned to UNDER_REVIEW
    const updatedProp = await db.findPropertyById(draftProp.id);
    assert.strictEqual(updatedProp?.status, 'UNDER_REVIEW');
  });

  test('Reject unauthenticated document upload with 401', async () => {
    const allProps = await db.listAllProperties();
    const draftProp = allProps.find((p) => p.status === 'DRAFT')!;
    const dummyPdf = Buffer.from('%PDF-1.4 dummy pdf content');

    const res = await request(app)
      .post(`/api/properties/${draftProp.id}/documents/upload`)
      .field('docType', 'SALE_DEED')
      .attach('file', dummyPdf, 'sale_deed.pdf');

    assert.strictEqual(res.status, 401);
  });

  test('Reject unauthenticated upload-url generation with 401', async () => {
    const allProps = await db.listAllProperties();
    const draftProp = allProps.find((p) => p.status === 'DRAFT')!;

    const res = await request(app)
      .post(`/api/properties/${draftProp.id}/documents/upload-url`)
      .send({ docType: 'SALE_DEED', fileExtension: 'pdf' });

    assert.strictEqual(res.status, 401);
  });

  test('Reject invalid file formats (e.g. .exe or .txt)', async () => {
    const allProps = await db.listAllProperties();
    const draftProp = allProps.find((p) => p.status === 'DRAFT')!;

    const dummyTxt = Buffer.from('invalid file format');

    const res = await request(app)
      .post(`/api/properties/${draftProp.id}/documents/upload`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('docType', 'EC')
      .attach('file', dummyTxt, 'notes.txt');

    assert.strictEqual(res.status, 500); // Multer file filter throws error
  });

  test('PATCH /api/properties/:id/documents/:docType/verify allows admin to verify or reject and persists across refresh', async () => {
    const staffLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'admin',
        password: 'Admin@1234',
      });
    assert.strictEqual(staffLoginRes.status, 200);
    const staffToken = staffLoginRes.body.token;

    const allProps = await db.listAllProperties();
    const underReviewProp = allProps.find((p) => p.status === 'UNDER_REVIEW')!;

    // 1. Verify action on EC (seeded as PENDING with fileUrl)
    const verifyRes = await request(app)
      .patch(`/api/properties/${underReviewProp.id}/documents/EC/verify`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        status: 'VERIFIED',
      });

    assert.strictEqual(verifyRes.status, 200);
    assert.strictEqual(verifyRes.body.document.status, 'VERIFIED');
    assert.strictEqual(verifyRes.body.document.rejectionReason, undefined);

    // 2. Reject action on SALE_DEED with rejectionReason
    const rejectRes = await request(app)
      .patch(`/api/properties/${underReviewProp.id}/documents/SALE_DEED/verify`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        status: 'REJECTED',
        rejectionReason: 'Missing registration stamp on page 3',
      });

    assert.strictEqual(rejectRes.status, 200);
    assert.strictEqual(rejectRes.body.document.status, 'REJECTED');
    assert.strictEqual(rejectRes.body.document.rejectionReason, 'Missing registration stamp on page 3');

    // 3. Re-fetch documents & admin property detail (simulating page refresh)
    const docsReloadRes = await request(app)
      .get(`/api/properties/${underReviewProp.id}/documents`)
      .set('Authorization', `Bearer ${staffToken}`);

    assert.strictEqual(docsReloadRes.status, 200);
    const ecDoc = docsReloadRes.body.documents.find((d: { documentType: string }) => d.documentType === 'EC');
    const saleDeedDoc = docsReloadRes.body.documents.find((d: { documentType: string }) => d.documentType === 'SALE_DEED');
    assert.strictEqual(ecDoc.status, 'VERIFIED');
    assert.strictEqual(saleDeedDoc.status, 'REJECTED');
    assert.strictEqual(saleDeedDoc.rejectionReason, 'Missing registration stamp on page 3');

    const detailRes = await request(app)
      .get(`/api/admin/properties/${underReviewProp.id}`)
      .set('Authorization', `Bearer ${staffToken}`);
    assert.strictEqual(detailRes.status, 200);
    assert.strictEqual(detailRes.body.property.verificationStatus.verifiedDocuments, 1);
    assert.strictEqual(detailRes.body.property.verificationStatus.isFullyVerified, false);
  });

  test('QA Pre-Launch Gate #12: Prevent LIVE status transition if mandatory docs unverified', async () => {
    // Shamshabad property only has 2 documents, not all 12 mandatory land docs
    const allProps = await db.listAllProperties();
    const underReviewProp = allProps.find((p) => p.status === 'UNDER_REVIEW')!;

    const res = await request(app)
      .patch(`/api/properties/${underReviewProp.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'LIVE' });

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.includes('mandatory verification documents are pending'));
  });

  test('Allow LIVE status transition when all mandatory documents are verified', async () => {
    const allProps = await db.listAllProperties();
    const draftProp = allProps.find((p) => p.status === 'DRAFT')!;

    // Upload & verify all mandatory documents for this land
    for (const docType of ALL_13_DOCS) {
      await db.upsertDocument({
        propertyId: draftProp.id,
        documentType: docType,
        fileUrl: `/uploads/${draftProp.id}/${docType}.pdf`,
        status: 'VERIFIED',
      });
    }

    // Move to VERIFIED first
    await db.updateProperty(draftProp.id, { status: 'VERIFIED' });

    // Now transition to LIVE
    const res = await request(app)
      .patch(`/api/properties/${draftProp.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'LIVE' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.property.status, 'LIVE');
  });

  test('GET /api/owners/me returns seller verification status, rejection reasons, only own properties, and strips internal staff notes', async () => {
    // Login as seller 2 (M. Anitha Reddy, who owns Shamshabad UNDER_REVIEW property)
    const sellerLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'anitha.reddy@yahoo.com',
        password: 'Admin@1234',
      });
    assert.strictEqual(sellerLoginRes.status, 200);
    const sellerToken = sellerLoginRes.body.token;

    // 1. Initial seller profile check: property is UNDER_REVIEW
    const initialProfileRes = await request(app)
      .get('/api/owners/me')
      .set('Authorization', `Bearer ${sellerToken}`);
    assert.strictEqual(initialProfileRes.status, 200);
    const sellerId = initialProfileRes.body.seller.id;
    const sellerProps = initialProfileRes.body.properties;
    assert.ok(sellerProps.length > 0);
    // Seller must see status ONLY for their own properties
    assert.ok(sellerProps.every((p: any) => p.sellerId === sellerId));

    const underReviewProp = sellerProps.find((p: any) => p.status === 'UNDER_REVIEW');
    assert.ok(underReviewProp);
    assert.strictEqual(underReviewProp.verificationStatus.totalDocuments, 13);
    assert.strictEqual(underReviewProp.verificationStatus.reviewStatus, 'UNDER_REVIEW');
    assert.strictEqual(underReviewProp.discrepancyNotes, undefined);

    // 2. Admin verifies EC and rejects SALE_DEED with rejectionReason (internal admin state only)
    await request(app)
      .patch(`/api/properties/${underReviewProp.id}/documents/EC/verify`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'VERIFIED' });

    await request(app)
      .patch(`/api/properties/${underReviewProp.id}/documents/SALE_DEED/verify`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'REJECTED',
        rejectionReason: 'Illegible SRO seal on page 2',
      });

    // 3. Before publish: Seller refreshes /api/owners/me and must NOT see unpublished verification changes
    const prePublishProfileRes = await request(app)
      .get('/api/owners/me')
      .set('Authorization', `Bearer ${sellerToken}`);
    assert.strictEqual(prePublishProfileRes.status, 200);
    const prePublishProp = prePublishProfileRes.body.properties.find(
      (p: any) => p.id === underReviewProp.id
    );
    assert.strictEqual(prePublishProp.verificationStatus.verifiedDocuments, 0);
    assert.strictEqual(prePublishProp.verificationStatus.rejectedDocuments, 0);
    assert.strictEqual(prePublishProp.verificationStatus.reviewStatus, 'UNDER_REVIEW');

    // 4. Authorization check: Seller cannot publish verification updates
    const unauthorizedPublish = await request(app)
      .post(`/api/properties/${underReviewProp.id}/verification/publish`)
      .set('Authorization', `Bearer ${sellerToken}`);
    assert.strictEqual(unauthorizedPublish.status, 403);

    // 5. Admin sends verification update to seller (Publish)
    const publishRes = await request(app)
      .post(`/api/properties/${underReviewProp.id}/verification/publish`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.strictEqual(publishRes.status, 200);
    assert.ok(publishRes.body.publishedVerification);

    // 6. After publish: Seller refreshes /api/owners/me and now sees updated Verified/Rejected status and rejectionReason
    const refreshedProfileRes = await request(app)
      .get('/api/owners/me')
      .set('Authorization', `Bearer ${sellerToken}`);
    assert.strictEqual(refreshedProfileRes.status, 200);
    const refreshedProp = refreshedProfileRes.body.properties.find(
      (p: any) => p.id === underReviewProp.id
    );
    assert.strictEqual(refreshedProp.verificationStatus.verifiedDocuments, 1);
    assert.strictEqual(refreshedProp.verificationStatus.rejectedDocuments, 1);
    assert.strictEqual(refreshedProp.verificationStatus.reviewStatus, 'REJECTED');

    const checklist = refreshedProp.verificationStatus.documentsChecklist;
    const ecItem = checklist.find((d: any) => d.documentType === 'EC');
    const saleDeedItem = checklist.find((d: any) => d.documentType === 'SALE_DEED');
    assert.strictEqual(ecItem.status, 'VERIFIED');
    assert.strictEqual(ecItem.verifiedBy, undefined);
    assert.strictEqual(saleDeedItem.status, 'REJECTED');
    assert.strictEqual(saleDeedItem.rejectionReason, 'Illegible SRO seal on page 2');
    assert.strictEqual(saleDeedItem.verifiedBy, undefined);

    // 4. Seller cannot access another seller's property documents
    const allProps = await db.listAllProperties();
    const otherSellerProp = allProps.find((p) => p.sellerId !== sellerId)!;
    const forbiddenRes = await request(app)
      .get(`/api/properties/${otherSellerProp.id}/documents`)
      .set('Authorization', `Bearer ${sellerToken}`);
    assert.strictEqual(forbiddenRes.status, 403);
  });

  test('GET /api/properties/:id/documents/:docType/file blocks unauthenticated access with 401', async () => {
    const allProps = await db.listAllProperties();
    const prop = allProps[0];
    const res = await request(app).get(`/api/properties/${prop.id}/documents/SALE_DEED/file`);
    assert.strictEqual(res.status, 401);
  });

  test('GET /api/properties/:id/documents/:docType/file blocks unauthorized seller with 403', async () => {
    const sellerLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'kvrao.hyderabad@gmail.com',
        password: 'Admin@1234',
      });
    const sellerToken = sellerLoginRes.body.token;
    const sellerOwner = await db.findOwnerByUserId(sellerLoginRes.body.user.id);

    const allProps = await db.listAllProperties();
    const otherSellerProp = allProps.find((p) => p.sellerId !== sellerOwner?.id)!;

    const res = await request(app)
      .get(`/api/properties/${otherSellerProp.id}/documents/SALE_DEED/file`)
      .set('Authorization', `Bearer ${sellerToken}`);

    assert.strictEqual(res.status, 403);
  });

  test('POST /api/properties/:id/documents/upload blocks unauthorized seller from uploading to another seller property (IDOR)', async () => {
    const sellerLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'kvrao.hyderabad@gmail.com',
        password: 'Admin@1234',
      });
    const sellerToken = sellerLoginRes.body.token;
    const sellerOwner = await db.findOwnerByUserId(sellerLoginRes.body.user.id);

    const allProps = await db.listAllProperties();
    const otherSellerProp = allProps.find((p) => p.sellerId !== sellerOwner?.id)!;

    const dummyPdf = Buffer.from('%PDF-1.4 dummy pdf content');
    const res = await request(app)
      .post(`/api/properties/${otherSellerProp.id}/documents/upload`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .field('docType', 'SALE_DEED')
      .attach('file', dummyPdf, 'sale_deed.pdf');

    assert.strictEqual(res.status, 403);
  });

  test('Static uploads path does NOT serve confidential documents publicly', async () => {
    // Attempting to fetch a confidential document directly from static /uploads
    const res = await request(app).get('/uploads/033542d6-d8fe-4b0b-bd4f-87663f72d31b/SALE_DEED.pdf');
    assert.strictEqual(res.status, 404);
  });
});
