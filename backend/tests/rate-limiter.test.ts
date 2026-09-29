import { test, describe } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import express from 'express';
import { createRateLimiter } from '../src/middleware/rate-limiter.js';

describe('Rate Limiter Middleware', () => {
  test('allows requests within limit and sets RateLimit headers', async () => {
    const app = express();
    const limiter = createRateLimiter({
      windowMs: 5000,
      maxRequests: 3,
      skipInTests: false, // Explicitly test rate limiting logic
    });

    app.use(limiter);
    app.get('/test', (_req, res) => res.json({ ok: true }));

    const res1 = await request(app).get('/test');
    assert.strictEqual(res1.status, 200);
    assert.strictEqual(res1.headers['ratelimit-limit'], '3');
    assert.strictEqual(res1.headers['ratelimit-remaining'], '2');

    const res2 = await request(app).get('/test');
    assert.strictEqual(res2.status, 200);
    assert.strictEqual(res2.headers['ratelimit-remaining'], '1');

    const res3 = await request(app).get('/test');
    assert.strictEqual(res3.status, 200);
    assert.strictEqual(res3.headers['ratelimit-remaining'], '0');
  });

  test('blocks requests exceeding limit with 429 and Retry-After header', async () => {
    const app = express();
    const limiter = createRateLimiter({
      windowMs: 5000,
      maxRequests: 2,
      skipInTests: false,
    });

    app.use(limiter);
    app.get('/test', (_req, res) => res.json({ ok: true }));

    await request(app).get('/test');
    await request(app).get('/test');

    const resBlocked = await request(app).get('/test');
    assert.strictEqual(resBlocked.status, 429);
    assert.strictEqual(resBlocked.body.error, 'Too Many Requests');
    assert.ok(resBlocked.headers['retry-after']);
  });
});
