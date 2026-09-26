import { CorsOptions } from 'cors';
import { config } from './index.js';

/**
 * Standard local development origins required by the platform.
 */
export const LOCAL_DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
];

/**
 * Deployed production frontend origin on Vercel.
 */
export const PRODUCTION_FRONTEND_URL = 'https://frontend-six-psi-ecroth2n1r.vercel.app';

/**
 * Secure regex matching only official Vercel preview deployments for the frontend project and team scope:
 * Matches:
 *  - https://frontend-six-psi-ecroth2n1r.vercel.app
 *  - https://frontend-git-feature-ecroth2n1r.vercel.app
 *  - https://frontend-preview-123-ecroth2n1r.vercel.app
 *  - https://frontend-ecroth2n1r.vercel.app
 * Rejects:
 *  - Arbitrary Vercel deployments (e.g. https://attacker.vercel.app or https://frontend-attacker.vercel.app)
 *  - Malicious subdomains (e.g. https://frontend-six-psi-ecroth2n1r.vercel.app.attacker.com)
 *  - Non-HTTPS schemes (e.g. http://frontend-six-psi-ecroth2n1r.vercel.app)
 */
export const DEFAULT_VERCEL_PREVIEW_PATTERN = /^https:\/\/frontend(-[a-z0-9-]+)?-ecroth2n1r\.vercel\.app$/i;

/**
 * Resolves the complete set of allowed CORS origins from static origins,
 * environment configuration (FRONTEND_URL, ALLOWED_ORIGINS), and Vercel preview regex.
 */
export function getAllowedOrigins(): (string | RegExp)[] {
  const origins: (string | RegExp)[] = [
    PRODUCTION_FRONTEND_URL,
    ...LOCAL_DEV_ORIGINS,
  ];

  // Include primary FRONTEND_URL if customized and distinct
  if (config.frontendUrl) {
    const cleanFrontendUrl = config.frontendUrl.replace(/\/+$/, '');
    if (!origins.includes(cleanFrontendUrl)) {
      origins.push(cleanFrontendUrl);
    }
  }

  // Include any extra comma-separated origins from ALLOWED_ORIGINS
  if (config.allowedOrigins && Array.isArray(config.allowedOrigins)) {
    for (const origin of config.allowedOrigins) {
      const cleanOrigin = origin.replace(/\/+$/, '');
      if (cleanOrigin && !origins.includes(cleanOrigin)) {
        origins.push(cleanOrigin);
      }
    }
  }

  // Include Vercel preview regex pattern
  if (config.vercelPreviewPattern) {
    try {
      const customRegex = new RegExp(config.vercelPreviewPattern, 'i');
      origins.push(customRegex);
    } catch {
      origins.push(DEFAULT_VERCEL_PREVIEW_PATTERN);
    }
  } else {
    origins.push(DEFAULT_VERCEL_PREVIEW_PATTERN);
  }

  return origins;
}

/**
 * Helper to check whether a given request origin is allowed by the CORS policy.
 * Returns true if requestOrigin is undefined (server-to-server, curl, non-browser clients).
 */
export function isOriginAllowed(requestOrigin: string | undefined): boolean {
  if (!requestOrigin) return true;
  const cleanOrigin = requestOrigin.replace(/\/+$/, '');
  const allowed = getAllowedOrigins();

  return allowed.some((target) => {
    if (typeof target === 'string') {
      return cleanOrigin === target;
    }
    if (target instanceof RegExp) {
      return target.test(cleanOrigin);
    }
    return false;
  });
}

/**
 * Generates the full Express CORS configuration options.
 */
export function getCorsOptions(): CorsOptions {
  return {
    origin: getAllowedOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}
