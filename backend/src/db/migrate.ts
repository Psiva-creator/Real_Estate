import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { config } from '../config/index.js';

export async function runMigrations() {
  console.log('🔄 Connecting to PostgreSQL database for migration...');
  console.log(`📡 URL: ${config.databaseUrl.replace(/:[^:@]+@/, ':****@')}`);

  const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: config.dbSsl ? { rejectUnauthorized: false } : false,
  });

  const schemaPath = path.resolve(process.cwd(), 'src/db/schema/schema.sql');
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at ${schemaPath}`);
  }

  const sql = fs.readFileSync(schemaPath, 'utf-8');

  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connection established');

    console.log('🚀 Executing schema DDL migrations (Tables, Enums, Indexes)...');
    await client.query(sql);
    console.log('✅ Schema migration completed successfully!');

    client.release();
    await pool.end();
  } catch (err) {
    console.error('❌ Migration failed:', (err as Error).message);
    await pool.end();
    throw err;
  }
}

if (process.argv[1]?.includes('migrate.ts') || process.argv[1]?.includes('migrate.js')) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
