-- Migration Script: Add Google OAuth Support
-- Run this to update existing database for Google OAuth authentication
-- Date: 2024-02-28

-- Step 1: Make password column nullable
ALTER TABLE service_providers
  ALTER COLUMN password DROP NOT NULL;

-- Step 2: Add OAuth provider columns
ALTER TABLE service_providers
  ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50),
  ADD COLUMN IF NOT EXISTS oauth_provider_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Step 3: Add check constraint (password OR oauth required)
ALTER TABLE service_providers
  ADD CONSTRAINT password_or_oauth CHECK (
    password IS NOT NULL OR oauth_provider IS NOT NULL
  );

-- Step 4: Create index for OAuth lookups
CREATE INDEX IF NOT EXISTS idx_service_providers_oauth
  ON service_providers(oauth_provider, oauth_provider_id);

-- Step 5: Update existing users (set oauth_provider to NULL for email/password users)
UPDATE service_providers
SET oauth_provider = NULL, oauth_provider_id = NULL
WHERE password IS NOT NULL AND oauth_provider IS NULL;

-- Step 6: Verify migration
SELECT
  COUNT(*) as total_users,
  COUNT(password) as password_users,
  COUNT(oauth_provider) as oauth_users,
  COUNT(CASE WHEN password IS NOT NULL AND oauth_provider IS NOT NULL THEN 1 END) as dual_auth_users
FROM service_providers;

-- Expected output:
-- total_users: All users
-- password_users: Users with password set
-- oauth_users: Users with OAuth provider set
-- dual_auth_users: Users with both (can sign in either way)

-- Step 7: Test queries

-- Find all Google OAuth users
SELECT id, email, name, oauth_provider, oauth_provider_id
FROM service_providers
WHERE oauth_provider = 'google';

-- Find all email/password users
SELECT id, email, name
FROM service_providers
WHERE password IS NOT NULL AND oauth_provider IS NULL;

-- Find dual-auth users (both password and OAuth)
SELECT id, email, name, oauth_provider
FROM service_providers
WHERE password IS NOT NULL AND oauth_provider IS NOT NULL;

-- Rollback (if needed) --
/*
-- WARNING: This will remove OAuth support
-- Uncomment only if you need to rollback

-- Remove OAuth columns
ALTER TABLE service_providers
  DROP COLUMN IF EXISTS oauth_provider,
  DROP COLUMN IF EXISTS oauth_provider_id,
  DROP COLUMN IF EXISTS last_login_at;

-- Make password required again
ALTER TABLE service_providers
  ALTER COLUMN password SET NOT NULL;

-- Remove constraint
ALTER TABLE service_providers
  DROP CONSTRAINT IF EXISTS password_or_oauth;

-- Remove index
DROP INDEX IF EXISTS idx_service_providers_oauth;
*/
