import dotenv from 'dotenv';
import { db } from '../src/db/database.js';
import { config } from '../src/config/index.js';

dotenv.config();

export function getTestDatabaseUrl(): string {
  if (process.env.TEST_DATABASE_URL) {
    return process.env.TEST_DATABASE_URL;
  }
  const mainUrl = config.databaseUrl || process.env.DATABASE_URL || '';
  if (!mainUrl) {
    throw new Error('DATABASE_URL is required to construct test database URL');
  }
  // Safely replace real_estate_brokerage with real_estate_brokerage_test
  const testUrl = mainUrl.replace(/\/real_estate_brokerage(?:\?|$)/, '/real_estate_brokerage_test');
  if (!testUrl.includes('real_estate_brokerage_test')) {
    throw new Error(`CRITICAL SAFETY ERROR: Test database URL must contain "real_estate_brokerage_test". Got: ${testUrl.replace(/:[^:@]+@/, ':****@')}`);
  }
  return testUrl;
}

export async function initPostgresTestDb() {
  const testUrl = getTestDatabaseUrl();
  await db.setConnectionString(testUrl);
  db.disableTestMemoryMode();

  const pool = db.getPool();
  const res = await pool.query('SELECT current_database();');
  const currentDb = res.rows[0].current_database;
  if (currentDb !== 'real_estate_brokerage_test') {
    throw new Error(`CRITICAL SAFETY ERROR: Refusing to run integration tests against "${currentDb}". Expected "real_estate_brokerage_test"!`);
  }

  await db.cleanTestTables();
}

export async function teardownPostgresTestDb() {
  await db.close();
}
