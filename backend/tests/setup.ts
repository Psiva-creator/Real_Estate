import { db } from '../src/db/database.js';
import { runSeeds } from '../src/db/seeds/seed.js';

export async function initTestDb() {
  db.clear();
  await runSeeds();
}
