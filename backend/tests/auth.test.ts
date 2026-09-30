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

  test('POST /api/auth/login should authenticate agent with email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'suresh.reddy@telanganarealty.in',
        password: 'Admin@1234',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.role, 'AGENT');
    assert.ok(res.body.token);
  });

  test('POST /api/auth/login should authenticate seller with email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'kvrao.hyderabad@gmail.com',
        password: 'Admin@1234',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.role, 'SELLER');
    assert.strictEqual(res.body.user.name, 'K. Venkateshwara Rao');
    assert.ok(res.body.token);
  });

  test('POST /api/auth/login should authenticate seller with 10-digit phone format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: '9848011223',
        password: 'Admin@1234',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.role, 'SELLER');
    assert.ok(res.body.token);
  });

  test('POST /api/auth/login should authenticate seller with +91 phone format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: '+919848011223',
        password: 'Admin@1234',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.role, 'SELLER');
    assert.ok(res.body.token);
  });

  test('POST /api/auth/login should authenticate seller with +91 space phone format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: '+91 9848011223',
        password: 'Admin@1234',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.role, 'SELLER');
    assert.ok(res.body.token);
  });

  test('POST /api/auth/login should authenticate seller with 91 space phone format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: '91 9848011223',
        password: 'Admin@1234',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.role, 'SELLER');
    assert.ok(res.body.token);
  });

  test('POST /api/auth/login should reject invalid credentials (wrong password)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'kvrao.hyderabad@gmail.com',
        password: 'WrongPassword!',
      });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.error, 'Invalid credentials');
  });

  test('POST /api/auth/login should reject invalid credentials (nonexistent user)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'nonexistent@telanganarealty.in',
        password: 'Admin@1234',
      });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.error, 'Invalid credentials');
  });

  test('POST /api/auth/google should authenticate existing user with Gmail email', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({
        email: 'kvrao.hyderabad@gmail.com',
        name: 'K.V. Rao',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.email, 'kvrao.hyderabad@gmail.com');
    assert.strictEqual(res.body.user.role, 'SELLER');
    assert.strictEqual(res.body.isNewUser, false);
    assert.ok(res.body.token);
  });

  test('POST /api/auth/google should register new user and owner entity if not existing', async () => {
    const uniqueEmail = `new.investor.${Date.now()}@gmail.com`;
    const res = await request(app)
      .post('/api/auth/google')
      .send({
        email: uniqueEmail,
        name: 'Venkata Ramana',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.email, uniqueEmail);
    assert.strictEqual(res.body.user.role, 'SELLER');
    assert.strictEqual(res.body.isNewUser, true);
    assert.ok(res.body.token);
  });

  test('POST /api/auth/google should authenticate via Google JWT credential', async () => {
    const payload = {
      email: 'direct.google.user@gmail.com',
      name: 'Google User',
      picture: 'https://lh3.googleusercontent.com/a/default',
    };
    // Mock 3-part JWT header.payload.signature
    const mockToken = `eyJhbGciOiJSUzI1NiJ9.${Buffer.from(JSON.stringify(payload)).toString('base64')}.mock_sig`;

    const res = await request(app)
      .post('/api/auth/google')
      .send({
        credential: mockToken,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.email, 'direct.google.user@gmail.com');
    assert.ok(res.body.token);
  });

  test('POST /api/auth/google should reject request with no email or credential', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({});

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error);
  });
});
