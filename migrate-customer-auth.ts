import { query } from './lib/db';
import fs from 'fs';

async function runMigration() {
  try {
    console.log('Running customer authentication migration...');

    const sql = fs.readFileSync('./migrations/002_add_customer_auth.sql', 'utf8');

    await query(sql, []);

    console.log('✅ Migration completed successfully!');
    console.log('Added password, email_verified, updated_at, last_login_at columns to customers table');
    console.log('Added index on customers.email');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
