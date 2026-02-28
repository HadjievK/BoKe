# JWT Authentication Implementation

## Overview

Implemented JWT (JSON Web Token) based authentication to replace password-in-URL authentication. This significantly improves security by:

1. **No passwords in URLs** - Tokens are sent via HTTP-only cookies and Authorization headers
2. **Automatic expiration** - Tokens expire after 7 days
3. **Stateless authentication** - No server-side session storage needed
4. **Better security** - HTTP-only cookies prevent XSS attacks

---

## Architecture

### Backend Changes

#### 1. New Auth Library (`lib/auth.ts`)

Centralized JWT utilities:
- `generateToken(payload)` - Create JWT tokens
- `verifyToken(token)` - Validate and decode tokens
- `extractToken(request)` - Get token from request (cookie or header)
- `authenticateRequest(request)` - Complete authentication flow

#### 2. Updated API Routes

**Authentication Endpoints:**
- `POST /api/signin` - Login with email/password, returns JWT token
- `POST /api/signout` - Clear authentication cookies
- `GET /api/auth/verify` - Check if user is authenticated

**Protected Endpoints (now use JWT):**
- `GET /api/dashboard/[slug]` - Dashboard data
- `GET /api/dashboard/[slug]/appointments` - Appointments list
- `GET /api/dashboard/[slug]/customers` - Customers list
- `PUT /api/provider/[slug]/settings` - Update settings

### Frontend Changes

#### Updated API Client (`lib/api.ts`)

New authentication functions:
```typescript
signIn(email, password) // Returns token, stores in localStorage + cookie
signOut() // Clears token from localStorage + cookie
verifyAuth() // Check authentication status
```

Updated protected endpoints:
```typescript
// Before
getDashboardData(slug, password)

// After
getDashboardData(slug) // No password needed, uses JWT
```

---

## Authentication Flow

### Sign In Flow

1. User submits email + password
2. Backend validates credentials
3. Backend generates JWT token with payload:
   ```json
   {
     "providerId": 123,
     "slug": "bobsmith",
     "email": "bob@example.com"
   }
   ```
4. Backend returns token in:
   - Response body (for localStorage)
   - HTTP-only cookie (secure)
5. Frontend stores token in localStorage
6. Frontend uses token for subsequent requests

### Protected Request Flow

1. Frontend makes API request
2. Token sent via:
   - `Authorization: Bearer <token>` header, OR
   - `auth_token` HTTP-only cookie
3. Backend extracts and verifies token
4. Backend checks if slug matches authenticated provider
5. Backend processes request or returns 401/403

### Sign Out Flow

1. User clicks sign out
2. Frontend calls `/api/signout`
3. Backend clears HTTP-only cookie
4. Frontend clears localStorage
5. User redirected to sign in

---

## Token Security

### JWT Configuration

- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 7 days
- **Secret**: Environment variable `JWT_SECRET`

### Security Features

1. **HTTP-only cookies**
   - Cannot be accessed by JavaScript (prevents XSS)
   - Automatically sent with requests

2. **Secure flag** (production only)
   - Only sent over HTTPS
   - Prevents man-in-the-middle attacks

3. **SameSite: Lax**
   - Prevents CSRF attacks
   - Cookies only sent to same-site requests

4. **Authorization header support**
   - Allows API calls from mobile apps
   - Enables cross-origin requests when needed

---

## Environment Variables

### Required

```bash
JWT_SECRET=your-super-secret-key-here
```

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

⚠️ **CRITICAL**: Change the default secret in production!

---

## Migration Guide

### Backend API Changes

**Before:**
```typescript
// Old: Password in query params
GET /api/dashboard/bobsmith?password=secret123
```

**After:**
```typescript
// New: JWT authentication
GET /api/dashboard/bobsmith
Headers: {
  Authorization: Bearer eyJhbGc...
}
```

### Frontend Code Changes

**Before:**
```typescript
// Old: Pass password on every request
const data = await getDashboardData(slug, password);
const appointments = await getAppointments(slug, password);
```

**After:**
```typescript
// New: Sign in once, use token automatically
await signIn(email, password); // Once

// Subsequent requests use token automatically
const data = await getDashboardData(slug);
const appointments = await getAppointments(slug);
```

---

## Frontend Integration

### Sign In Component

```typescript
import { signIn } from '@/lib/api';

const handleSignIn = async (email: string, password: string) => {
  try {
    const response = await signIn(email, password);
    // Token automatically stored
    // Redirect to dashboard
    router.push(`/dashboard/${response.slug}`);
  } catch (error) {
    console.error('Sign in failed:', error.message);
  }
};
```

### Protected Pages

```typescript
import { verifyAuth } from '@/lib/api';
import { useEffect } from 'react';

const DashboardPage = () => {
  useEffect(() => {
    const checkAuth = async () => {
      const auth = await verifyAuth();
      if (!auth.authenticated) {
        router.push('/signin');
      }
    };
    checkAuth();
  }, []);

  // ... rest of component
};
```

### Sign Out

```typescript
import { signOut } from '@/lib/api';

const handleSignOut = async () => {
  await signOut();
  router.push('/signin');
};
```

---

## Testing

### Manual Testing

1. **Sign In**
   ```bash
   curl -X POST http://localhost:3000/api/signin \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password123"}' \
     -c cookies.txt
   ```

2. **Access Protected Route (with cookie)**
   ```bash
   curl http://localhost:3000/api/dashboard/bobsmith \
     -b cookies.txt
   ```

3. **Access Protected Route (with header)**
   ```bash
   curl http://localhost:3000/api/dashboard/bobsmith \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

4. **Verify Auth**
   ```bash
   curl http://localhost:3000/api/auth/verify \
     -b cookies.txt
   ```

5. **Sign Out**
   ```bash
   curl -X POST http://localhost:3000/api/signout \
     -b cookies.txt
   ```

---

## Security Improvements

### ✅ Fixed Issues

1. **Passwords no longer in URLs**
   - Not visible in browser history
   - Not logged by servers
   - Not visible in referrer headers

2. **Token-based authentication**
   - Automatic expiration
   - Can be revoked (future: blacklist)
   - Includes user identity

3. **HTTP-only cookies**
   - Protected from XSS attacks
   - Automatically managed by browser

### 🔒 Additional Recommendations

1. **Add refresh tokens**
   - Short-lived access tokens (15 min)
   - Long-lived refresh tokens (30 days)
   - Better security with token rotation

2. **Add token blacklist**
   - Store revoked tokens in Redis
   - Immediate sign out across devices

3. **Add rate limiting**
   - Prevent brute force attacks
   - Limit failed login attempts

4. **Add IP whitelisting** (optional)
   - For high-security providers
   - Restrict dashboard access by IP

---

## API Reference

### POST /api/signin

**Request:**
```json
{
  "email": "provider@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "slug": "bobsmith",
  "name": "Bob Smith",
  "business_name": "Bob's Barbershop",
  "email": "provider@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Sets Cookie:**
```
Set-Cookie: auth_token=eyJhbGc...; HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Path=/
```

### POST /api/signout

**Request:** None

**Response:**
```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

**Clears Cookie:**
```
Set-Cookie: auth_token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/
```

### GET /api/auth/verify

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Response (authenticated):**
```json
{
  "authenticated": true,
  "providerId": 123,
  "slug": "bobsmith",
  "email": "provider@example.com"
}
```

**Response (not authenticated):**
```json
{
  "authenticated": false
}
```
Status: 401

---

## Files Changed

### New Files
- `lib/auth.ts` - JWT utilities
- `app/api/signout/route.ts` - Sign out endpoint
- `app/api/auth/verify/route.ts` - Verify authentication
- `.env.example` - Environment variables template
- `docs/JWT_AUTHENTICATION.md` - This document

### Modified Files
- `app/api/signin/route.ts` - Returns JWT token
- `app/api/dashboard/[slug]/route.ts` - Uses JWT auth
- `app/api/dashboard/[slug]/appointments/route.ts` - Uses JWT auth
- `app/api/dashboard/[slug]/customers/route.ts` - Uses JWT auth
- `app/api/provider/[slug]/settings/route.ts` - Uses JWT auth
- `lib/api.ts` - Updated client functions

---

## Dependencies Added

```json
{
  "jsonwebtoken": "^9.0.2",
  "@types/jsonwebtoken": "^9.0.5"
}
```
