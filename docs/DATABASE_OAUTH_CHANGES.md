# Database Schema Changes for Google OAuth

## Overview

Updated the `service_providers` table to support Google OAuth authentication while maintaining backward compatibility with email/password authentication.

---

## Changes Summary

### Modified Columns

| Column | Before | After | Purpose |
|--------|--------|-------|---------|
| `password` | `NOT NULL` | Nullable | Allow Google-only users without password |

### New Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `oauth_provider` | `VARCHAR(50)` | Yes | OAuth provider name ('google', 'facebook', etc.) |
| `oauth_provider_id` | `VARCHAR(255)` | Yes | Unique ID from OAuth provider |
| `last_login_at` | `TIMESTAMP` | Yes | Track last login time |

### New Constraints

```sql
CONSTRAINT password_or_oauth CHECK (
  password IS NOT NULL OR oauth_provider IS NOT NULL
)
```

Ensures every user has at least one authentication method.

### New Indexes

```sql
CREATE INDEX idx_service_providers_oauth
  ON service_providers(oauth_provider, oauth_provider_id);
```

Optimizes OAuth provider lookups.

---

## Updated Schema

```sql
CREATE TABLE service_providers (
  -- Identity
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,

  -- Business Info
  business_name VARCHAR(255),
  service_type VARCHAR(50) NOT NULL,
  phone VARCHAR(50),
  location VARCHAR(255),
  bio TEXT,
  services JSONB DEFAULT '[]'::jsonb,
  avatar_url TEXT,

  -- Authentication
  password VARCHAR(255),              -- NULL for OAuth-only users
  oauth_provider VARCHAR(50),         -- 'google', 'facebook', etc.
  oauth_provider_id VARCHAR(255),     -- Provider's unique user ID

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,

  -- Constraints
  CONSTRAINT password_or_oauth CHECK (
    password IS NOT NULL OR oauth_provider IS NOT NULL
  )
);
```

---

## User Types

### 1. Email/Password User (Traditional)

**Characteristics:**
- `password`: Bcrypt hashed password
- `oauth_provider`: `NULL`
- `oauth_provider_id`: `NULL`

**Example:**
```sql
INSERT INTO service_providers (
  email, name, slug, password, oauth_provider
) VALUES (
  'john@example.com',
  'John Smith',
  'john-smith',
  '$2b$10$...',  -- Hashed password
  NULL            -- No OAuth
);
```

**Sign In Methods:**
- ✅ Email/password
- ❌ Google OAuth (unless linked)

---

### 2. Google OAuth User (OAuth-Only)

**Characteristics:**
- `password`: `NULL`
- `oauth_provider`: `'google'`
- `oauth_provider_id`: Google user ID

**Example:**
```sql
INSERT INTO service_providers (
  email, name, slug, password, oauth_provider, oauth_provider_id
) VALUES (
  'jane@gmail.com',
  'Jane Doe',
  'jane-doe',
  NULL,              -- No password
  'google',          -- OAuth provider
  '1234567890'       -- Google ID
);
```

**Sign In Methods:**
- ❌ Email/password (no password set)
- ✅ Google OAuth

---

### 3. Dual Authentication User (Both)

**Characteristics:**
- `password`: Bcrypt hashed password
- `oauth_provider`: `'google'`
- `oauth_provider_id`: Google user ID

**Example:**
```sql
INSERT INTO service_providers (
  email, name, slug, password, oauth_provider, oauth_provider_id
) VALUES (
  'alex@example.com',
  'Alex Johnson',
  'alex-johnson',
  '$2b$10$...',     -- Has password
  'google',          -- Also has Google
  '9876543210'       -- Google ID
);
```

**Sign In Methods:**
- ✅ Email/password
- ✅ Google OAuth

**Use Case:** User signed up with email/password, then linked Google account (or vice versa)

---

## Migration Guide

### For New Installations

Use the updated schema in `docs/database_schema.sql`:

```bash
psql -U postgres -d buke < docs/database_schema.sql
```

### For Existing Databases

Run the migration script:

```bash
psql -U postgres -d buke < docs/migrations/001_add_oauth_support.sql
```

**Migration Steps:**
1. ✅ Makes `password` column nullable
2. ✅ Adds OAuth columns (`oauth_provider`, `oauth_provider_id`, `last_login_at`)
3. ✅ Adds constraint (password OR oauth required)
4. ✅ Creates index for OAuth lookups
5. ✅ Sets `oauth_provider = NULL` for existing users
6. ✅ Verifies migration with counts

### Verify Migration

```sql
-- Check column changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'service_providers'
  AND column_name IN ('password', 'oauth_provider', 'oauth_provider_id', 'last_login_at');

-- Count user types
SELECT
  COUNT(*) as total_users,
  COUNT(password) as password_users,
  COUNT(oauth_provider) as oauth_users
FROM service_providers;
```

---

## Queries

### Find Users by Authentication Type

**Email/Password Only:**
```sql
SELECT id, email, name
FROM service_providers
WHERE password IS NOT NULL
  AND oauth_provider IS NULL;
```

**Google OAuth Only:**
```sql
SELECT id, email, name, oauth_provider_id
FROM service_providers
WHERE password IS NULL
  AND oauth_provider = 'google';
```

**Dual Authentication:**
```sql
SELECT id, email, name, oauth_provider
FROM service_providers
WHERE password IS NOT NULL
  AND oauth_provider IS NOT NULL;
```

### Find User by Google ID

```sql
SELECT id, email, name, slug
FROM service_providers
WHERE oauth_provider = 'google'
  AND oauth_provider_id = $1;
```

### Find User by Email (Any Auth Method)

```sql
SELECT id, email, name, slug, password, oauth_provider
FROM service_providers
WHERE email = $1;
```

---

## Data Integrity

### Constraint: password_or_oauth

Ensures every user has at least one valid authentication method.

**Valid:**
```sql
-- Has password
INSERT INTO service_providers (email, name, slug, password)
VALUES ('user@example.com', 'User', 'user', '$2b$10$...');

-- Has OAuth
INSERT INTO service_providers (email, name, slug, oauth_provider, oauth_provider_id)
VALUES ('user@gmail.com', 'User', 'user2', 'google', '123');

-- Has both
INSERT INTO service_providers (email, name, slug, password, oauth_provider, oauth_provider_id)
VALUES ('user@both.com', 'User', 'user3', '$2b$10$...', 'google', '456');
```

**Invalid (will fail):**
```sql
-- No authentication method
INSERT INTO service_providers (email, name, slug)
VALUES ('user@none.com', 'User', 'user4');
-- ERROR: check constraint "password_or_oauth" violated
```

---

## Application Logic Changes

### NextAuth Configuration

**User Lookup (by email):**
```typescript
// Check if user exists (any auth type)
const result = await pool.query(
  'SELECT id, slug, name, email, password, oauth_provider FROM service_providers WHERE email = $1',
  [email]
);
```

**Google Sign In (new user):**
```typescript
// Insert new Google user
await pool.query(
  `INSERT INTO service_providers (
    email, name, slug, business_name, service_type,
    oauth_provider, oauth_provider_id
  ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
  [email, name, slug, businessName, serviceType, 'google', googleId]
);
```

**Update Last Login:**
```typescript
await pool.query(
  'UPDATE service_providers SET last_login_at = NOW() WHERE id = $1',
  [userId]
);
```

---

## Security Considerations

### 1. Password Hashing

**Email/Password users:**
- Always use bcrypt with salt round 10
- Never store plain text passwords

```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

### 2. OAuth Provider IDs

**Google OAuth users:**
- Store Google's unique user ID
- Use for account linking
- Don't expose in public APIs

### 3. Email Uniqueness

**Constraint:**
- Email is UNIQUE across all auth methods
- Prevents duplicate accounts
- Same email = same account (even if different auth methods)

**Example:**
1. User signs up with `user@gmail.com` + password
2. Later, user signs in with Google using `user@gmail.com`
3. **Result:** Same account, now has both auth methods

---

## Backward Compatibility

### Existing Users

**No action required:**
- Existing users continue to work
- `password` column still has their hashed password
- `oauth_provider` is `NULL` (email/password users)

### Existing Code

**Minimal changes needed:**
- Most queries work as-is
- Add OAuth handling in NextAuth only
- Password verification unchanged

---

## Future Enhancements

### 1. Multiple OAuth Providers

Current schema supports:
- `oauth_provider = 'google'`
- `oauth_provider = 'facebook'`
- `oauth_provider = 'github'`

Just add new providers to NextAuth config.

### 2. Account Linking Table

For users with multiple OAuth providers:

```sql
CREATE TABLE user_oauth_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES service_providers(id),
  provider VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_user_id)
);
```

### 3. Profile Pictures from OAuth

```sql
ALTER TABLE service_providers
  ADD COLUMN oauth_profile_picture TEXT;
```

---

## Testing

### Test Cases

**1. Create Email/Password User:**
```sql
INSERT INTO service_providers (email, name, slug, password)
VALUES ('test@email.com', 'Test User', 'test-user', '$2b$10$...');
```

**2. Create Google OAuth User:**
```sql
INSERT INTO service_providers (email, name, slug, oauth_provider, oauth_provider_id)
VALUES ('test@gmail.com', 'Test Google', 'test-google', 'google', 'google123');
```

**3. Try Invalid User (should fail):**
```sql
INSERT INTO service_providers (email, name, slug)
VALUES ('invalid@test.com', 'Invalid', 'invalid');
-- ERROR: check constraint "password_or_oauth" violated
```

**4. Query by Auth Type:**
```sql
-- Email/password users
SELECT COUNT(*) FROM service_providers WHERE password IS NOT NULL AND oauth_provider IS NULL;

-- OAuth users
SELECT COUNT(*) FROM service_providers WHERE oauth_provider IS NOT NULL;

-- Dual-auth users
SELECT COUNT(*) FROM service_providers WHERE password IS NOT NULL AND oauth_provider IS NOT NULL;
```

---

## Rollback Plan

If you need to revert changes:

```sql
-- WARNING: This removes OAuth support and will delete OAuth-only users

-- 1. Delete OAuth-only users (no password)
DELETE FROM service_providers WHERE password IS NULL;

-- 2. Remove OAuth columns
ALTER TABLE service_providers
  DROP COLUMN oauth_provider,
  DROP COLUMN oauth_provider_id,
  DROP COLUMN last_login_at;

-- 3. Make password required again
ALTER TABLE service_providers
  ALTER COLUMN password SET NOT NULL;

-- 4. Drop constraint
ALTER TABLE service_providers
  DROP CONSTRAINT password_or_oauth;

-- 5. Drop index
DROP INDEX idx_service_providers_oauth;
```

---

## Summary

### ✅ Changes Made

- `password` column is now nullable
- Added `oauth_provider` column (e.g., 'google')
- Added `oauth_provider_id` column (provider's user ID)
- Added `last_login_at` timestamp
- Added constraint: password OR oauth required
- Added index for OAuth lookups
- Updated sample data with OAuth examples

### ✅ Backward Compatible

- Existing users unaffected
- Existing queries work
- Migration script provided
- Rollback plan available

### ✅ Supports

- Email/password authentication
- Google OAuth authentication
- Dual authentication (both methods)
- Account linking (same email)
- Future OAuth providers

---

**Migration File:** `docs/migrations/001_add_oauth_support.sql`
**Schema File:** `docs/database_schema.sql`
