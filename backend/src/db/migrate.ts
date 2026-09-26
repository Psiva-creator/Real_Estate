import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { config } from '../config/index.js';

export async function runMigrations(databaseUrl?: string) {
  const targetUrl = databaseUrl || config.databaseUrl;
  console.log('🔄 Connecting to PostgreSQL database for migration...');
  console.log(`📡 URL: ${targetUrl.replace(/:[^:@]+@/, ':****@')}`);

  const useSsl = config.dbSsl || targetUrl.includes('sslmode=require') || targetUrl.includes('ssl=true');
  const pool = new Pool({
    connectionString: targetUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  });

  const possiblePaths = [
    path.resolve(process.cwd(), 'src/db/schema/schema.sql'),
    path.resolve(process.cwd(), 'backend/src/db/schema/schema.sql'),
    typeof __dirname !== 'undefined' ? path.resolve(__dirname, 'schema/schema.sql') : '',
    typeof __dirname !== 'undefined' ? path.resolve(__dirname, '../../src/db/schema/schema.sql') : '',
  ].filter(Boolean);

  const schemaPath = possiblePaths.find((p) => fs.existsSync(p));
  if (!schemaPath) {
    throw new Error(`Schema file not found in searched locations: ${possiblePaths.join(', ')}`);
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
