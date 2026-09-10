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

  test('POST /api/properties/:id/documents/upload uploads valid PDF document', async () => {
    // Find draft property (Shadnagar)
    const allProps = await db.listAllProperties();
    const draftProp = allProps.find((p) => p.status === 'DRAFT')!;

    const dummyPdf = Buffer.from('%PDF-1.4 dummy pdf document content');

    const res = await request(app)
      .post(`/api/properties/${draftProp.id}/documents/upload`)
      .field('docType', 'SALE_DEED')
      .attach('file', dummyPdf, 'sale_deed.pdf');

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.document.documentType, 'SALE_DEED');
    assert.strictEqual(res.body.document.status, 'UPLOADED');

    // Check status transitioned to UNDER_REVIEW
    const updatedProp = await db.findPropertyById(draftProp.id);
    assert.strictEqual(updatedProp?.status, 'UNDER_REVIEW');
  });

  test('Reject invalid file formats (e.g. .exe or .txt)', async () => {
    const allProps = await db.listAllProperties();
    const draftProp = allProps.find((p) => p.status === 'DRAFT')!;

    const dummyTxt = Buffer.from('invalid file format');

    const res = await request(app)
      .post(`/api/properties/${draftProp.id}/documents/upload`)
      .field('docType', 'EC')
      .attach('file', dummyTxt, 'notes.txt');

    assert.strictEqual(res.status, 500); // Multer file filter throws error
  });

  test('PATCH /api/properties/:id/documents/:docType/verify allows admin to verify or reject', async () => {
    // Shamshabad property has SALE_DEED uploaded
    const allProps = await db.listAllProperties();
    const underReviewProp = allProps.find((p) => p.status === 'UNDER_REVIEW')!;

    const res = await request(app)
      .patch(`/api/properties/${underReviewProp.id}/documents/EC/verify`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'VERIFIED',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.document.status, 'VERIFIED');
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
});
