import { app } from './app.js';
import { config } from './config/index.js';
import { db } from './db/database.js';
import { runSeeds } from './db/seeds/seed.js';

async function startServer() {
  console.log(`Starting Telangana Real-Estate Platform Backend on port ${config.port}...`);

  // Test Postgres connection
  const pgConnected = await db.testConnection();
  if (pgConnected) {
    console.log('✅ PostgreSQL database connected successfully');
  } else {
    console.log('ℹ️  Running with in-memory database store (development/test mode)');
  }

  // Seed default data if store is empty
  const users = await db.listUsers();
  if (users.length === 0) {
    await runSeeds();
  }

  const server = app.listen(config.port, () => {
    console.log(`🚀 Server ready at http://localhost:${config.port}`);
    console.log(`📡 Health check: http://localhost:${config.port}/api/health`);
    console.log(`🔍 Public properties: http://localhost:${config.port}/api/properties`);
  });

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Fatal Server Error:', err);
    process.exit(1);
  });
}

export { startServer };
