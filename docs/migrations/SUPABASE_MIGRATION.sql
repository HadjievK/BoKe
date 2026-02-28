-- ================================================
-- Google OAuth Support Migration for Supabase
-- ================================================
-- Copy and paste this entire script into Supabase SQL Editor
-- Then click "Run" to execute

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

-- Step 5: Verify migration
SELECT
  COUNT(*) as total_users,
  COUNT(password) as password_users,
  COUNT(oauth_provider) as oauth_users,
  COUNT(CASE WHEN password IS NOT NULL AND oauth_provider IS NOT NULL THEN 1 END) as dual_auth_users
FROM service_providers;

-- ✅ Migration complete!
-- Expected output shows counts of users by authentication type
