import { test, describe } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../src/app.js';
import { generateToken } from '../src/middleware/auth.js';
import { isOriginAllowed, getAllowedOrigins } from '../src/config/cors.js';
import { User } from '../src/types/index.js';

describe('CORS Configuration & Security Tests', () => {
  const prodOrigin = 'https://frontend-six-psi-ecroth2n1r.vercel.app';
  const previewOrigin = 'https://frontend-git-feature-ecroth2n1r.vercel.app';
  const maliciousOrigin = 'https://malicious-attacker.com';

  test('1. Allowed production frontend origin receives the correct CORS headers', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', prodOrigin);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers['access-control-allow-origin'], prodOrigin);
    assert.strictEqual(res.headers['access-control-allow-credentials'], 'true');
    assert.ok(res.headers['vary']?.toLowerCase().includes('origin'));
  });

  test('2. Local development origins are allowed', async () => {
    const devOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
    ];

    for (const devOrigin of devOrigins) {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', devOrigin);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers['access-control-allow-origin'], devOrigin);
      assert.strictEqual(res.headers['access-control-allow-credentials'], 'true');
    }
  });

  test('3. Vercel preview deployments matching pattern are allowed', async () => {
    const validPreviews = [
      'https://frontend-git-feature-ecroth2n1r.vercel.app',
      'https://frontend-pr12-ecroth2n1r.vercel.app',
      'https://frontend-ecroth2n1r.vercel.app',
    ];

    for (const preview of validPreviews) {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', preview);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers['access-control-allow-origin'], preview);
      assert.strictEqual(res.headers['access-control-allow-credentials'], 'true');
    }
  });

  test('4. An unrelated or malicious origin is rejected (no allow-origin header)', async () => {
    const rejectedOrigins = [
      maliciousOrigin,
      'https://frontend-attacker.vercel.app',
      'https://frontend-six-psi-otheruser.vercel.app',
      'https://frontend-six-psi-ecroth2n1r.vercel.app.attacker.com',
      'http://frontend-six-psi-ecroth2n1r.vercel.app',
    ];

    for (const badOrigin of rejectedOrigins) {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', badOrigin);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers['access-control-allow-origin'], undefined);
    }
  });

  test('5. OPTIONS preflight works correctly with methods, headers, and credentials', async () => {
    const res = await request(app)
      .options('/api/properties')
      .set('Origin', prodOrigin)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Authorization, Content-Type');

    assert.strictEqual(res.status, 204);
    assert.strictEqual(res.headers['access-control-allow-origin'], prodOrigin);
    assert.strictEqual(res.headers['access-control-allow-credentials'], 'true');

    const allowMethods = res.headers['access-control-allow-methods'] || '';
    assert.ok(allowMethods.includes('GET'));
    assert.ok(allowMethods.includes('POST'));
    assert.ok(allowMethods.includes('PATCH'));
    assert.ok(allowMethods.includes('DELETE'));
    assert.ok(allowMethods.includes('OPTIONS'));

    const allowHeaders = res.headers['access-control-allow-headers'] || '';
    assert.ok(allowHeaders.includes('Content-Type'));
    assert.ok(allowHeaders.includes('Authorization'));
  });

  test('6. OPTIONS preflight from malicious origin does not receive allow-origin header', async () => {
    const res = await request(app)
      .options('/api/properties')
      .set('Origin', maliciousOrigin)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Authorization, Content-Type');

    assert.strictEqual(res.status, 204);
    assert.strictEqual(res.headers['access-control-allow-origin'], undefined);
  });

  test('7. Authorization header remains allowed and functional with CORS', async () => {
    const mockUser: User = {
      id: '00000000-0000-0000-0000-000000000001',
      phone: '+919848011223',
      email: 'admin@telanganarealty.in',
      name: 'System Administrator',
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const token = generateToken(mockUser);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Origin', prodOrigin)
      .set('Authorization', `Bearer ${token}`);

    // In integration/unit environment, /api/auth/me fetches user from database
    // Even if user not in db (401), the CORS headers MUST be present because origin was valid
    assert.strictEqual(res.headers['access-control-allow-origin'], prodOrigin);
    assert.strictEqual(res.headers['access-control-allow-credentials'], 'true');
  });

  test('8. Existing API requests without Origin header still work normally', async () => {
    const resHealth = await request(app).get('/api/health');
    assert.strictEqual(resHealth.status, 200);
    assert.strictEqual(resHealth.body.status, 'healthy');
    assert.strictEqual(resHealth.headers['access-control-allow-origin'], undefined);

    const resProps = await request(app).get('/api/properties');
    assert.strictEqual(resProps.status, 200);
    assert.strictEqual(resProps.headers['access-control-allow-origin'], undefined);
  });

  test('9. isOriginAllowed helper unit validation', () => {
    assert.strictEqual(isOriginAllowed(undefined), true);
    assert.strictEqual(isOriginAllowed(prodOrigin), true);
    assert.strictEqual(isOriginAllowed(prodOrigin + '/'), true);
    assert.strictEqual(isOriginAllowed('http://localhost:3000'), true);
    assert.strictEqual(isOriginAllowed('http://localhost:5173'), true);
    assert.strictEqual(isOriginAllowed('http://127.0.0.1:3000'), true);
    assert.strictEqual(isOriginAllowed(previewOrigin), true);
    assert.strictEqual(isOriginAllowed(maliciousOrigin), false);
    assert.strictEqual(isOriginAllowed('https://frontend-attacker.vercel.app'), false);
    assert.strictEqual(isOriginAllowed('https://evil.vercel.app'), false);
    assert.strictEqual(isOriginAllowed('http://frontend-six-psi-ecroth2n1r.vercel.app'), false);

    // Verify wildcard * is NOT in allowed origins
    const allowed = getAllowedOrigins();
    assert.strictEqual(allowed.includes('*'), false);
  });
});
