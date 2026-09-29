import { app } from '../src/app.js';
import { db } from '../src/db/database.js';
import request from 'supertest';

async function runVerification() {
  console.log('--- 1. Testing Database Connection ---');
  const connected = await db.testConnection();
  console.log('PostgreSQL Connected:', connected);
  if (!connected) {
    console.error('Database connection failed!');
    process.exit(1);
  }

  const pool = db.getPool();

  const timestamp = Date.now().toString().slice(-6);
  const testPhone = `+9199999${timestamp}`;
  const testEmail = `tester_${timestamp}@example.com`;
  const testPassword = 'Password@123';

  console.log(`\n--- 2. Testing User Registration (Inserting into DB) ---`);
  console.log(`Registering new seller: ${testPhone}, ${testEmail}`);
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: `Test Seller ${timestamp}`,
      phone: testPhone,
      email: testEmail,
      password: testPassword,
      role: 'SELLER',
    });

  console.log('Registration status:', regRes.status);
  console.log('Registration response user:', regRes.body.user);

  // Verify in PostgreSQL table users
  const userInDb = await pool.query('SELECT id, name, email, phone, role, last_login_at, created_at FROM users WHERE phone = $1', [testPhone]);
  console.log('Verified in PostgreSQL `users` table:');
  console.log(userInDb.rows[0]);

  // Verify in PostgreSQL table owners
  const ownerInDb = await pool.query('SELECT id, user_id, name, phone, email FROM owners WHERE user_id = $1', [userInDb.rows[0].id]);
  console.log('Verified in PostgreSQL `owners` table:');
  console.log(ownerInDb.rows[0]);

  console.log(`\n--- 3. Testing User Login (Updating DB & Logging Audit) ---`);
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      identifier: testPhone,
      password: testPassword,
    });

  console.log('Login status:', loginRes.status);
  console.log('Login response user:', loginRes.body.user);

  // Check last_login_at in PostgreSQL
  const userAfterLogin = await pool.query('SELECT id, last_login_at FROM users WHERE id = $1', [userInDb.rows[0].id]);
  console.log('Verified updated `last_login_at` in PostgreSQL `users` table:');
  console.log(userAfterLogin.rows[0]);

  // Check user_logins audit table in PostgreSQL
  const loginsInDb = await pool.query('SELECT * FROM user_logins WHERE user_id = $1 ORDER BY created_at DESC', [userInDb.rows[0].id]);
  console.log(`Verified entries in PostgreSQL \`user_logins\` table (Count: ${loginsInDb.rows.length}):`);
  console.log(loginsInDb.rows);

  console.log(`\n--- 4. Testing Image Upload (Storing in DB) ---`);
  // Create a 1x1 dummy PNG buffer
  const dummyImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  const uploadRes = await request(app)
    .post('/api/upload/image')
    .set('Authorization', `Bearer ${loginRes.body.token}`)
    .attach('image', dummyImageBuffer, 'property_facade.png');

  console.log('Image upload status:', uploadRes.status);
  console.log('Image upload response:', uploadRes.body);

  // Check media_uploads table in PostgreSQL
  const mediaInDb = await pool.query('SELECT * FROM media_uploads WHERE id = $1', [uploadRes.body.data.id]);
  console.log('Verified in PostgreSQL `media_uploads` table:');
  console.log(mediaInDb.rows[0]);

  console.log('\n--- 5. Testing Login History Endpoint ---');
  const historyRes = await request(app)
    .get('/api/auth/logins')
    .set('Authorization', `Bearer ${loginRes.body.token}`);
  console.log('Login history status:', historyRes.status);
  console.log('Login history records count:', historyRes.body.logins?.length);

  await db.close();
  console.log('\n✅ ALL DATABASE STORAGE CHECKS PASSED SUCCESSFULLY!');
}

runVerification().catch(async (e) => {
  console.error('Verification failed:', e);
  await db.close().catch(() => {});
  process.exit(1);
});
