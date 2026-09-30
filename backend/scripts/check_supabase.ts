import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('Connecting to database...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@') : 'UNDEFINED');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const client = await pool.connect();
    console.log('\n=========================================');
    console.log('[SUCCESS] CONNECTED TO SUPABASE DATABASE!');
    console.log('=========================================\n');

    // 1. List all public tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log('--- ALL TABLES IN SUPABASE ---');
    console.log(tables.join(', '));
    console.log('------------------------------\n');

    // 2. Check media_uploads table
    if (tables.includes('media_uploads')) {
      const countRes = await client.query('SELECT COUNT(*) FROM media_uploads;');
      console.log(`[media_uploads] Total Records: ${countRes.rows[0].count}`);
      const rows = await client.query('SELECT * FROM media_uploads ORDER BY created_at DESC LIMIT 10;');
      if (rows.rows.length > 0) {
        console.log('Recent records in media_uploads:');
        console.log(JSON.stringify(rows.rows, null, 2));
      } else {
        console.log('No records found in media_uploads table (0 rows).');
      }
    } else {
      console.log('[!] media_uploads table does NOT exist in this database.');
    }
    console.log('\n------------------------------\n');

    // 3. Check property_documents table
    if (tables.includes('property_documents')) {
      const countRes = await client.query('SELECT COUNT(*) FROM property_documents;');
      console.log(`[property_documents] Total Records: ${countRes.rows[0].count}`);
      
      const uploadedDocs = await client.query("SELECT * FROM property_documents WHERE file_url IS NOT NULL AND file_url != '' ORDER BY created_at DESC;");
      console.log(`[property_documents] Documents with uploaded file URLs: ${uploadedDocs.rows.length}`);
      if (uploadedDocs.rows.length > 0) {
        console.log(JSON.stringify(uploadedDocs.rows, null, 2));
      } else {
        console.log('Notice: All 169 document placeholders currently have empty file_url (""). None uploaded yet.');
      }
    } else {
      console.log('[!] property_documents table does NOT exist in this database.');
    }
    console.log('\n------------------------------\n');

    // 4. Check properties table columns and contents
    if (tables.includes('properties')) {
      const countRes = await client.query('SELECT COUNT(*) FROM properties;');
      console.log(`[properties] Total Properties: ${countRes.rows[0].count}`);
      
      const propCols = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'properties' 
        ORDER BY ordinal_position;
      `);
      console.log('Columns in properties table:');
      console.log(propCols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
      
      const sampleProps = await client.query(`
        SELECT id, title_en, type, main_image, gallery_images, site_plan_image 
        FROM properties 
        WHERE main_image IS NOT NULL OR array_length(gallery_images, 1) > 0
        LIMIT 5;
      `);
      console.log(`\nProperties with images (${sampleProps.rows.length}):`);
      console.log(JSON.stringify(sampleProps.rows, null, 2));
    }

    // 5. Test Live Write & Read in Supabase
    console.log('\n------------------------------');
    console.log('--- TESTING LIVE WRITE & READ TO SUPABASE ---');
    const testProbe = await client.query(`
      INSERT INTO media_uploads (file_url, original_name, mime_type, size_bytes, upload_type)
      VALUES ('/uploads/images/test_supabase_probe.png', 'test_supabase_probe.png', 'image/png', 2048, 'IMAGE')
      RETURNING id, file_url, original_name, created_at;
    `);
    const testId = testProbe.rows[0].id;
    console.log('[WRITE SUCCESS] Inserted test record into Supabase media_uploads. ID:', testId);

    const verifyRead = await client.query('SELECT * FROM media_uploads WHERE id = $1', [testId]);
    console.log('[READ SUCCESS] Successfully retrieved inserted record back from Supabase:', verifyRead.rows[0].original_name);

    await client.query('DELETE FROM media_uploads WHERE id = $1', [testId]);
    console.log('[CLEANUP SUCCESS] Deleted temporary test record.');
    console.log('------------------------------\n');

    client.release();
    await pool.end();
    console.log('\nSupabase test finished successfully.');
  } catch (err) {
    console.error('[ERROR] Supabase Database test failed:', err);
    process.exit(1);
  }
}

main();
