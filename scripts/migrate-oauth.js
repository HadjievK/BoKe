/**
 * Database Migration Script
 * Adds Google OAuth support to service_providers table
 */

import pool from './lib/db.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting database migration...\n');

    // Start transaction
    await client.query('BEGIN');

    console.log('Step 1: Making password column nullable...');
    await client.query('ALTER TABLE service_providers ALTER COLUMN password DROP NOT NULL');
    console.log('✅ Password column is now nullable\n');

    console.log('Step 2: Adding OAuth columns...');
    await client.query(`
      ALTER TABLE service_providers
        ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50),
        ADD COLUMN IF NOT EXISTS oauth_provider_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP
    `);
    console.log('✅ OAuth columns added\n');

    console.log('Step 3: Adding constraint (password OR oauth required)...');
    await client.query(`
      ALTER TABLE service_providers
        ADD CONSTRAINT password_or_oauth CHECK (
          password IS NOT NULL OR oauth_provider IS NOT NULL
        )
    `);
    console.log('✅ Constraint added\n');

    console.log('Step 4: Creating index for OAuth lookups...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_service_providers_oauth
        ON service_providers(oauth_provider, oauth_provider_id)
    `);
    console.log('✅ Index created\n');

    console.log('Step 5: Setting oauth_provider to NULL for existing users...');
    const updateResult = await client.query(`
      UPDATE service_providers
      SET oauth_provider = NULL, oauth_provider_id = NULL
      WHERE password IS NOT NULL AND oauth_provider IS NULL
    `);
    console.log(`✅ Updated ${updateResult.rowCount} existing users\n`);

    console.log('Step 6: Verifying migration...');
    const verifyResult = await client.query(`
      SELECT
        COUNT(*) as total_users,
        COUNT(password) as password_users,
        COUNT(oauth_provider) as oauth_users,
        COUNT(CASE WHEN password IS NOT NULL AND oauth_provider IS NOT NULL THEN 1 END) as dual_auth_users
      FROM service_providers
    `);

    const stats = verifyResult.rows[0];
    console.log('📊 Migration Statistics:');
    console.log(`   Total users: ${stats.total_users}`);
    console.log(`   Email/password users: ${stats.password_users}`);
    console.log(`   OAuth users: ${stats.oauth_users}`);
    console.log(`   Dual-auth users: ${stats.dual_auth_users}\n`);

    // Commit transaction
    await client.query('COMMIT');

    console.log('✅ Migration completed successfully!\n');

    // Test queries
    console.log('Step 7: Testing queries...\n');

    console.log('Email/password users:');
    const emailUsers = await client.query(`
      SELECT id, email, name
      FROM service_providers
      WHERE password IS NOT NULL AND oauth_provider IS NULL
      LIMIT 3
    `);
    console.log(`   Found ${emailUsers.rowCount} users`);
    if (emailUsers.rows.length > 0) {
      emailUsers.rows.forEach(u => console.log(`   - ${u.email}`));
    }
    console.log();

    console.log('Google OAuth users:');
    const oauthUsers = await client.query(`
      SELECT id, email, name, oauth_provider
      FROM service_providers
      WHERE oauth_provider = 'google'
      LIMIT 3
    `);
    console.log(`   Found ${oauthUsers.rowCount} users`);
    if (oauthUsers.rows.length > 0) {
      oauthUsers.rows.forEach(u => console.log(`   - ${u.email} (${u.oauth_provider})`));
    }
    console.log();

    console.log('🎉 Migration complete! Your database is ready for Google OAuth.');

  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    console.error('\n⚠️  Changes have been rolled back. Database is unchanged.');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
runMigration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
