# API Errors - Troubleshooting Guide

## 🚨 Errors Encountered

```
1. Failed to load resource: the server responded with a status of 500 ()
2. [next-auth][error][CLIENT_FETCH_ERROR] Unexpected token '<', "<!DOCTYPE "... is not valid JSON
3. /api/onboard:1 Failed to load resource: the server responded with a status of 405 ()
4. Failed to execute 'json' on 'Response': Unexpected end of JSON input
```

---

## 🔍 Root Causes Identified

### 1. Missing Environment Variables
**Problem:** NextAuth requires environment variables that were not set
- `NEXTAUTH_SECRET` - Missing
- `NEXTAUTH_URL` - Missing
- `GOOGLE_CLIENT_ID` - Missing (placeholder needed)
- `GOOGLE_CLIENT_SECRET` - Missing (placeholder needed)

**Impact:**
- NextAuth endpoints return HTML error pages instead of JSON
- Google OAuth cannot function
- 500 errors on auth-related endpoints

### 2. Dev Server Not Restarted
**Problem:** Environment variables are only loaded on server startup
**Impact:**
- New `.env.local` file not recognized
- Routes may have cached handlers
- 405 Method Not Allowed errors

### 3. NextAuth Configuration
**Problem:** Google OAuth credentials are placeholders
**Impact:**
- Google sign-in button won't work
- Will show configuration errors when clicked

---

## ✅ Solutions Implemented

### 1. Created `.env.local` File

Created `C:\Users\I535106\BoKe\.env.local` with:

```env
# Database
DATABASE_URL="postgresql://postgres.jjdlmxiddefbrlnmxpaz:BoKeDKKH123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="I1dHyZSG625aCMaM2K+zX7DJdfk29kuqQOwfvkQ/+hA="

# Google OAuth (TEMPORARY PLACEHOLDERS)
GOOGLE_CLIENT_ID="PLACEHOLDER-GET-FROM-GOOGLE-CLOUD-CONSOLE"
GOOGLE_CLIENT_SECRET="PLACEHOLDER-GET-FROM-GOOGLE-CLOUD-CONSOLE"

# JWT Secret
JWT_SECRET="I1dHyZSG625aCMaM2K+zX7DJdfk29kuqQOwfvkQ/+hA="
```

**What was fixed:**
- ✅ NextAuth now has required `NEXTAUTH_SECRET`
- ✅ NextAuth URL configured for local development
- ✅ JWT secret configured for email/password auth
- ⚠️ Google OAuth has placeholder values (will fail if used)

---

## 🔧 Required Actions

### CRITICAL: Restart Development Server

The dev server MUST be restarted to load the new environment variables:

**Steps:**
1. Stop the current dev server (Ctrl+C in terminal)
2. Start it again: `npm run dev`
3. Wait for "Ready" message
4. Refresh browser (hard refresh: Ctrl+Shift+R)

**Why this is necessary:**
- Next.js only reads `.env` files on startup
- Route handlers are cached
- Environment variables won't be available until restart

### OPTIONAL: Set Up Google OAuth

If you want Google sign-in to work, follow these steps:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Sign in with your Google account

2. **Create OAuth 2.0 Credentials**
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "BuKe Local Development"

3. **Configure Authorized Redirect URIs**
   Add these URLs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-production-domain.vercel.app/api/auth/callback/google
   ```

4. **Copy Credentials**
   - Copy the Client ID
   - Copy the Client Secret

5. **Update `.env.local`**
   Replace the placeholder values:
   ```env
   GOOGLE_CLIENT_ID="your-actual-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-actual-client-secret"
   ```

6. **Restart Dev Server Again**

---

## 🧪 Testing After Restart

### 1. Test Health Endpoint
```bash
curl http://localhost:3000/api/health
```
**Expected:** `{"status":"ok"}`

### 2. Test Email/Password Registration
Visit http://localhost:3000/ and try creating an account with email/password

**Expected Behavior:**
- Form submits successfully
- Creates account in database
- Redirects to success page

### 3. Test Email/Password Sign-In
Visit http://localhost:3000/signin and sign in

**Expected Behavior:**
- Sign in works
- Redirects to dashboard
- No 405 or 500 errors

### 4. Google OAuth (If Configured)
Click "Sign in with Google" button

**With Placeholders:**
- Will show NextAuth error page
- This is expected - requires real credentials

**With Real Credentials:**
- Opens Google sign-in popup
- After selecting account, redirects back
- Creates/links account

---

## 🐛 Debugging Tips

### Check Server Logs
Look for these in your terminal:
```
✓ Compiled successfully
✓ Ready in 2.3s
○ Local: http://localhost:3000
```

### Check Browser Console
Open DevTools (F12) → Console tab

**Good signs:**
- No red errors
- Successful API responses

**Bad signs:**
- 405 Method Not Allowed
- 500 Internal Server Error
- JSON parse errors

### Check Network Tab
Open DevTools (F12) → Network tab

Filter by "Fetch/XHR" and watch API calls:
- Should return status 200 (success)
- Should have JSON responses
- Should NOT return HTML

---

## 📝 Error Explanations

### 405 Method Not Allowed
**What it means:**
- Route exists but doesn't handle the HTTP method (POST, GET, etc.)
- Usually means route export is missing or server hasn't restarted

**How to fix:**
- Restart dev server
- Check route has `export async function POST(...)`

### 500 Internal Server Error
**What it means:**
- Server code threw an exception
- Often missing environment variables
- Database connection issues

**How to fix:**
- Check server logs in terminal
- Verify `.env.local` exists
- Restart dev server

### Unexpected token '<', "<!DOCTYPE"... is not valid JSON
**What it means:**
- Expected JSON but got HTML (error page)
- NextAuth configuration error
- Route returning wrong content type

**How to fix:**
- Add missing environment variables
- Restart dev server
- Check NEXTAUTH_SECRET is set

---

## ✅ Quick Fix Checklist

Before reporting issues, verify:

- [ ] `.env.local` file exists in project root
- [ ] `.env.local` contains all required variables
- [ ] Dev server was restarted after creating `.env.local`
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] No other process using port 3000
- [ ] Database connection string is correct
- [ ] Node modules are installed (`npm install`)

---

## 🎯 Expected State After Fix

### Working Features ✅
- Landing page loads
- Email/password registration
- Email/password sign-in
- Provider profile pages
- Booking flow
- Dashboard (after sign-in)
- Success page

### Not Working (Without Google Credentials) ⚠️
- Google sign-in button (will error)
- OAuth account linking

### Working After Google OAuth Setup ✅
- Everything above +
- Google one-click sign-in
- OAuth account linking
- Auto sign-in for returning Google users

---

## 📞 Support

If errors persist after:
1. Creating `.env.local`
2. Restarting dev server
3. Hard refreshing browser

Check:
- Terminal for server errors
- Browser console for client errors
- Database connection (try `psql` command with DATABASE_URL)

---

## 🎉 Success Indicators

After fix, you should see:
- ✅ No 405 errors in console
- ✅ No 500 errors in console
- ✅ API calls return JSON
- ✅ Registration form works
- ✅ Sign-in form works
- ✅ Dashboard accessible

---

**Status:** Environment configured, restart required
**Next Step:** Restart development server
**ETA to fix:** < 2 minutes (just restart)
