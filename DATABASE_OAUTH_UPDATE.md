# Database Schema Update - Google OAuth Support

## ✅ Changes Complete

Updated database schema and application code to support Google OAuth authentication.

---

## 📁 Files Changed

### Database Schema
1. **`docs/database_schema.sql`** - Updated schema
   - Made `password` column nullable
   - Added `oauth_provider` VARCHAR(50)
   - Added `oauth_provider_id` VARCHAR(255)
   - Added `last_login_at` TIMESTAMP
   - Added constraint: password OR oauth required
   - Added index for OAuth lookups
   - Updated sample data

2. **`docs/migrations/001_add_oauth_support.sql`** - Migration script
   - Alter existing tables
   - Add new columns
   - Add constraints and indexes
   - Verification queries
   - Rollback plan

3. **`docs/DATABASE_OAUTH_CHANGES.md`** - Complete documentation
   - Schema changes explained
   - User types (email/password, OAuth, dual)
   - Migration guide
   - Query examples
   - Security considerations

### Application Code
4. **`app/api/auth/[...nextauth]/route.ts`** - Updated NextAuth
   - Store OAuth provider info on sign in
   - Link Google account to existing email/password accounts
   - Track last login timestamp
   - Update database on each sign in

5. **`app/api/onboard/route.ts`** - Updated onboarding
   - Support Google OAuth users (no password)
   - Store `oauth_provider` and `oauth_provider_id`
   - Optional password for Google users

---

## 🗃️ Schema Changes

### Modified: service_providers Table

```sql
ALTER TABLE service_providers
  -- Make password nullable
  ALTER COLUMN password DROP NOT NULL;

-- Add OAuth columns
ALTER TABLE service_providers
  ADD COLUMN oauth_provider VARCHAR(50),
  ADD COLUMN oauth_provider_id VARCHAR(255),
  ADD COLUMN last_login_at TIMESTAMP;

-- Add constraint
ALTER TABLE service_providers
  ADD CONSTRAINT password_or_oauth CHECK (
    password IS NOT NULL OR oauth_provider IS NOT NULL
  );

-- Add index
CREATE INDEX idx_service_providers_oauth
  ON service_providers(oauth_provider, oauth_provider_id);
```

---

## 👥 User Types Supported

### 1. Email/Password User
```sql
{
  email: 'john@example.com',
  password: '$2b$10$...',  -- Hashed
  oauth_provider: NULL,
  oauth_provider_id: NULL
}
```
**Sign in methods:** Email/password only

### 2. Google OAuth User
```sql
{
  email: 'jane@gmail.com',
  password: NULL,
  oauth_provider: 'google',
  oauth_provider_id: '1234567890'
}
```
**Sign in methods:** Google OAuth only

### 3. Dual Authentication User
```sql
{
  email: 'alex@example.com',
  password: '$2b$10$...',  -- Hashed
  oauth_provider: 'google',
  oauth_provider_id: '9876543210'
}
```
**Sign in methods:** Email/password OR Google OAuth

---

## 🔄 Account Linking Logic

### Scenario: User signs in with Google (existing email/password account)

```typescript
// 1. Check if email exists
const user = await findUserByEmail('john@example.com');

// 2. If exists but no OAuth info
if (user && !user.oauth_provider) {
  // Link Google account
  await updateUser(user.id, {
    oauth_provider: 'google',
    oauth_provider_id: googleId,
    last_login_at: NOW()
  });
  // Result: User can now sign in with BOTH methods
}
```

**Benefits:**
- No duplicate accounts
- Seamless account linking
- User can use either method

---

## 📝 Application Logic Updates

### NextAuth Sign In Callback

```typescript
if (account?.provider === "google") {
  const user = await findUserByEmail(email);

  if (!user) {
    // New user → Redirect to onboarding
    return '/onboard?google=true&email=...&name=...';
  }

  if (!user.oauth_provider) {
    // Link Google to existing email/password account
    await updateOAuthInfo(user.id, 'google', googleId);
  }

  // Update last login
  await updateLastLogin(user.id);
}
```

### Onboarding

```typescript
POST /api/onboard
{
  // Standard fields
  email, name, business_name, service_type, ...

  // Optional (for Google users)
  google_id: "1234567890",  // If present, no password required
  password: null             // NULL for Google-only users
}

// Stored as:
{
  password: NULL,
  oauth_provider: 'google',
  oauth_provider_id: '1234567890'
}
```

---

## 🔐 Security Features

### 1. Data Integrity
✅ Constraint ensures every user has at least one auth method
✅ Email uniqueness prevents duplicate accounts
✅ Password hashing (bcrypt) for email/password users

### 2. OAuth Security
✅ Store provider's user ID (for account linking)
✅ Don't store OAuth access tokens (not needed)
✅ Google handles password security

### 3. Backward Compatibility
✅ Existing users continue to work
✅ No data migration needed
✅ Existing queries work as-is

---

## 📋 Migration Steps

### For New Installations
Use the updated schema:
```bash
psql -U postgres -d buke < docs/database_schema.sql
```

### For Existing Databases
Run the migration:
```bash
psql -U postgres -d buke < docs/migrations/001_add_oauth_support.sql
```

### Verify Migration
```sql
SELECT
  COUNT(*) as total,
  COUNT(password) as password_users,
  COUNT(oauth_provider) as oauth_users
FROM service_providers;
```

---

## 🧪 Testing

### Manual Tests

**1. Create Email/Password User:**
```bash
curl -X POST /api/onboard \
  -d '{"email":"test@email.com","password":"pass123",...}'
```

**2. Sign In with Email/Password:**
```bash
curl -X POST /api/signin \
  -d '{"email":"test@email.com","password":"pass123"}'
```

**3. Sign In with Google (New User):**
1. Click "Sign in with Google"
2. Google consent screen
3. Redirected to onboarding
4. Complete profile
5. Account created with `oauth_provider='google'`

**4. Sign In with Google (Existing User):**
1. User exists with `test@gmail.com`
2. Click "Sign in with Google"
3. Google returns same email
4. If no OAuth info → Link Google account
5. User signed in

### Database Queries

**Check user auth types:**
```sql
SELECT
  email,
  CASE
    WHEN password IS NOT NULL AND oauth_provider IS NULL THEN 'Email/Password'
    WHEN password IS NULL AND oauth_provider IS NOT NULL THEN 'OAuth Only'
    WHEN password IS NOT NULL AND oauth_provider IS NOT NULL THEN 'Dual Auth'
  END as auth_type
FROM service_providers;
```

---

## 📚 Documentation

### Complete Guides:
- **`docs/DATABASE_OAUTH_CHANGES.md`** - Detailed schema changes
- **`docs/migrations/001_add_oauth_support.sql`** - Migration script
- **`docs/database_schema.sql`** - Updated schema

### Related Docs:
- **`docs/GOOGLE_OAUTH_LOGIC.md`** - OAuth flow
- **`docs/GOOGLE_OAUTH_SETUP.md`** - Google Cloud setup
- **`GOOGLE_OAUTH_COMPLETE.md`** - Implementation summary

---

## ✨ Benefits

### For Users:
✅ Multiple sign-in options
✅ No duplicate accounts (same email = same account)
✅ Seamless account linking
✅ Can use Google OR email/password

### For Development:
✅ Backward compatible
✅ No breaking changes
✅ Easy migration
✅ Extensible (add more OAuth providers)

---

## 🚀 Next Steps

### To Enable in Production:

1. **Run Migration:**
   ```bash
   psql -U postgres -d buke_production < docs/migrations/001_add_oauth_support.sql
   ```

2. **Verify:**
   ```sql
   \d service_providers  -- Check columns
   SELECT * FROM service_providers LIMIT 1;  -- Test query
   ```

3. **Deploy Application:**
   - Updated NextAuth config
   - Updated onboarding route
   - Google OAuth credentials configured

4. **Test:**
   - Email/password sign in (should work)
   - Google OAuth sign in (new user)
   - Google OAuth sign in (existing user)
   - Account linking

---

## 📊 Summary

### Database Changes:
- ✅ `password` column now nullable
- ✅ Added `oauth_provider` column
- ✅ Added `oauth_provider_id` column
- ✅ Added `last_login_at` tracking
- ✅ Added constraint for auth integrity
- ✅ Added index for performance

### Application Changes:
- ✅ NextAuth stores OAuth info
- ✅ Automatic account linking
- ✅ Onboarding supports OAuth
- ✅ Last login tracking

### Status:
- **Code**: ✅ Complete
- **TypeScript**: ✅ Compiles successfully
- **Migration**: ✅ Ready to run
- **Documentation**: ✅ Comprehensive
- **Testing**: ⏳ Requires database migration

---

**Ready to migrate database and test!**
