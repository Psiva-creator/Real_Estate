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
  } else if (config.nodeEnv !== 'test') {
    throw new Error('Fatal: PostgreSQL connection failed. Production runtime requires a working PostgreSQL database.');
  }

  // Seed default data if store is empty
  const users = await db.listUsers();
  if (users.length === 0) {
    await runSeeds();
  }

  const server = app.listen(config.port, config.host, () => {
    const displayHost = config.host === '0.0.0.0' ? 'localhost' : config.host;
    console.log(`🚀 Server ready at http://${displayHost}:${config.port} (bound to ${config.host}:${config.port})`);
    console.log(`📡 Health check: http://${displayHost}:${config.port}/api/health`);
    console.log(`🔍 Public properties: http://${displayHost}:${config.port}/api/properties`);
  });

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}. Gracefully shutting down...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      try {
        await db.getPool().end();
      } catch {}
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Forceful shutdown after timeout');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Fatal Server Error:', err);
    process.exit(1);
  });
}

export { startServer };
