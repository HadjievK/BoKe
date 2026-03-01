import pool from './lib/db.js';
import fs from 'fs';

async function runMigration() {
  try {
    console.log('Running migration...');

    const sql = fs.readFileSync('./migrations/add_coordinates_to_providers.sql', 'utf8');

    await pool.query(sql);

    console.log('✅ Migration completed successfully!');
    console.log('Added latitude and longitude columns to service_providers table');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
