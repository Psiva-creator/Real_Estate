import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../src/app.js';
import { initTestDb } from './setup.js';

describe('Auth & RBAC Module', () => {
  beforeEach(async () => {
    await initTestDb();
  });

  test('POST /api/auth/register should register a new seller and create owner entity', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Prasad Rao',
        phone: '+919911223344',
        email: 'prasad.rao@gmail.com',
        password: 'Password123!',
        whatsapp: '+919911223344',
        role: 'SELLER',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.user.phone, '+919911223344');
    assert.strictEqual(res.body.user.role, 'SELLER');
    assert.ok(res.body.token);
  });

  test('POST /api/auth/login should authenticate with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'admin@telanganarealty.in',
        password: 'Admin@1234',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.role, 'ADMIN');
    assert.ok(res.body.token);
  });

  test('Protected routes should block unauthenticated access', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    assert.strictEqual(res.status, 401);
  });

  test('Protected routes should allow admin with valid token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'admin@telanganarealty.in',
        password: 'Admin@1234',
      });

    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.totalProperties > 0);
  });
});
