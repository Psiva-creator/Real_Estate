import { Request, Response, NextFunction } from 'express';
import { db } from '../db/database.js';

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  skipInTests?: boolean;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

/**
 * Creates an in-memory sliding rate limiter middleware with IP tracking and cleanup.
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    skipInTests = true,
  } = options;

  const clients = new Map<string, ClientRecord>();

  // Cleanup expired entries periodically to prevent memory leaks
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of clients.entries()) {
      if (now > record.resetTime) {
        clients.delete(ip);
      }
    }
  }, Math.max(windowMs, 60000));

  // unref so the interval doesn't hold the Node.js event loop open in test suites
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting in unit test memory mode to avoid breaking automated test suites
    if (skipInTests && (db.isTestMemoryMode || process.env.NODE_ENV === 'test')) {
      return next();
    }

    // Determine client IP safely (handling reverse proxies like Render / Cloudflare / Vercel)
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const now = Date.now();
    let record = clients.get(ip);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      clients.set(ip, record);
    } else {
      record.count++;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    // Standard RFC RateLimit headers
    res.setHeader('RateLimit-Limit', maxRequests);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetSeconds);

    if (record.count > maxRequests) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        error: 'Too Many Requests',
        message,
        retryAfterSeconds: resetSeconds,
      });
    }

    next();
  };
}

// 1. Strict Limiter for Login (10 requests per 15 minutes) - Anti-Brute-Force
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many authentication attempts from this IP. Please wait 15 minutes before trying again.',
});

// 2. Strict Limiter for Enquiries / Site Visits (5 submissions per 10 minutes) - Anti-Spam / WhatsApp Cost Protection
export const enquiryRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 5,
  message: 'Enquiry rate limit reached. Please wait a few minutes before submitting another site visit or call request.',
});

// 3. Seller Listing Form Limiter (20 listings per hour) - Anti-Spam
export const listingRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 20,
  message: 'Listing submission limit reached. Please wait before registering more properties.',
});

// 4. Global API Safeguard (250 requests per minute) - DDoS Shield
export const globalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 250,
  message: 'API rate limit exceeded. Please throttle your requests.',
});
