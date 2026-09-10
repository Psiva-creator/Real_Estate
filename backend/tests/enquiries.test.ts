import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../src/app.js';
import { db } from '../src/db/database.js';
import { notificationService } from '../src/services/notification/whatsapp.service.js';
import { initTestDb } from './setup.js';

describe('Enquiries & Lead Pipeline Module', () => {
  let adminToken: string;

  beforeEach(async () => {
    await initTestDb();
    notificationService.clearHistory();

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'admin@telanganarealty.in',
        password: 'Admin@1234',
      });
    adminToken = loginRes.body.token;
  });

  test('QA Pre-Launch Gate #14: Submit enquiry creates lead and fires WhatsApp notification', async () => {
    const properties = await db.listAllProperties();
    const liveProperty = properties.find((p) => p.status === 'LIVE')!;

    const res = await request(app)
      .post('/api/enquiries')
      .send({
        propertyId: liveProperty.id,
        buyerName: 'Karthik Varma',
        phone: '+919888877777',
        whatsapp: '+919888877777',
        enquiryType: 'SITE_VISIT',
        notes: 'Looking to acquire 25 acres for joint venture development',
        preferredLanguage: 'en',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.enquiry.buyerName, 'Karthik Varma');
    assert.strictEqual(res.body.enquiry.enquiryType, 'SITE_VISIT');
    assert.ok(res.body.enquiry.leadScore >= 70, 'Site visit enquiry should have high lead score');

    // Verify WhatsApp alert was fired
    const history = notificationService.getNotificationHistory();
    assert.ok(history.length >= 1, 'At least one WhatsApp notification must be triggered');

    const buyerAlert = history.find((n) => n.to === '+919888877777');
    assert.ok(buyerAlert, 'Buyer acknowledgement notification must be sent');
    assert.ok(buyerAlert.renderedText.includes('Karthik Varma'));
    assert.ok(buyerAlert.renderedText.includes(liveProperty.titleEn));
  });

  test('Submit enquiry in Telugu triggers Telugu WhatsApp template', async () => {
    const properties = await db.listAllProperties();
    const liveProperty = properties.find((p) => p.status === 'LIVE')!;

    const res = await request(app)
      .post('/api/enquiries')
      .send({
        propertyId: liveProperty.id,
        buyerName: 'వెంకట్ రాజు',
        phone: '+919777766666',
        enquiryType: 'CALL',
        notes: 'ధర గురించి మాట్లాడాలి',
        preferredLanguage: 'te',
      });

    assert.strictEqual(res.status, 201);

    const history = notificationService.getNotificationHistory();
    const teAlert = history.find((n) => n.to === '+919777766666');
    assert.ok(teAlert);
    assert.strictEqual(teAlert.language, 'te');
    assert.ok(teAlert.renderedText.includes('నమస్కారం'));
  });

  test('PATCH /api/enquiries/:id/assign assigns lead to agent', async () => {
    const enquiries = await db.listEnquiries();
    const testEnquiry = enquiries[0];

    const users = await db.listUsers();
    const agent = users.find((u) => u.role === 'AGENT')!;

    const res = await request(app)
      .patch(`/api/enquiries/${testEnquiry.id}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ agentId: agent.id });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.enquiry.assignedTo, agent.id);
  });

  test('PATCH /api/enquiries/:id/schedule-visit schedules visit and fires confirmation alert', async () => {
    const enquiries = await db.listEnquiries();
    const testEnquiry = enquiries[0];

    const res = await request(app)
      .patch(`/api/enquiries/${testEnquiry.id}/schedule-visit`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        visitDateTime: 'Tomorrow at 11:00 AM IST',
        meetingPoint: 'Near Kokapet Neopolis Junction 1',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.enquiry.status, 'SITE_VISIT_SCHEDULED');

    const history = notificationService.getNotificationHistory();
    const visitAlert = history.find((n) => n.template === 'site_visit_scheduled');
    assert.ok(visitAlert);
    assert.ok(visitAlert.renderedText.includes('Tomorrow at 11:00 AM IST'));
  });
});
