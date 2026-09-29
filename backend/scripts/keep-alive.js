/**
 * Telangana Realty Hub - Backend Warm-up / Keep-Alive Script
 *
 * Prevents Render/PaaS cold-start latency by polling the health check endpoint.
 * Run standalone: node scripts/keep-alive.js
 */

const TARGET_URL = process.env.PING_URL || 'https://telangana-realty-backend.onrender.com/api/health';
const INTERVAL_MS = parseInt(process.env.PING_INTERVAL_MS || '600000', 10); // 10 minutes

async function pingBackend() {
  const timestamp = new Date().toISOString();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    const start = Date.now();
    const res = await fetch(TARGET_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    const duration = Date.now() - start;

    if (res.ok) {
      console.log(`[Keep-Alive ${timestamp}] ✅ Healthy (HTTP ${res.status} in ${duration}ms)`);
    } else {
      console.warn(`[Keep-Alive ${timestamp}] ⚠️ Status HTTP ${res.status} in ${duration}ms`);
    }
  } catch (err) {
    console.error(`[Keep-Alive ${timestamp}] ❌ Ping failed: ${err.message}`);
  }
}

console.log(`🚀 Keep-alive monitor started for: ${TARGET_URL} (every ${INTERVAL_MS / 1000}s)`);
pingBackend();
setInterval(pingBackend, INTERVAL_MS);
