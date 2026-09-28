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

  test('GET / returns API service discovery details', async () => {
    const res = await request(app).get('/');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'healthy');
    assert.strictEqual(res.body.documentation, '/api/docs/');
  });

  test('GET /docs redirects to /api/docs/', async () => {
    const res = await request(app).get('/docs');
    assert.strictEqual(res.status, 301);
    assert.strictEqual(res.headers.location, '/api/docs/');
  });

  test('GET /api/health returns healthy system status', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'healthy');
  });

  test('GET /health alias returns healthy system status', async () => {
    const res = await request(app).get('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'healthy');
  });
});
