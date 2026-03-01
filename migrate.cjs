const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.jjdlmxiddefbrlnmxpaz:BoKeDKKH123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres',
});

async function runMigration() {
  try {
    console.log('Running migration...');

    const sql = fs.readFileSync('./migrations/add_coordinates_to_providers.sql', 'utf8');

    await pool.query(sql);

    console.log('✅ Migration completed successfully!');
    console.log('Added latitude and longitude columns to service_providers table');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
