import { test, describe } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../src/app.js';

describe('API Documentation & Swagger UI', () => {
  test('GET /api/docs.json returns valid OpenAPI 3.0 specification', async () => {
    const res = await request(app).get('/api/docs.json');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.openapi, '3.0.3');
    assert.ok(res.body.paths['/api/properties']);
    assert.ok(res.body.paths['/api/enquiries']);
    assert.ok(res.body.paths['/api/maps/distance']);
  });

  test('GET /api/docs/ returns Swagger UI HTML', async () => {
    const res = await request(app).get('/api/docs/');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('Swagger UI') || res.text.includes('swagger-ui'));
  });

  test('GET /api/health returns healthy system status', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'healthy');
  });
});
