# Vercel Environment Variables Setup

## 🚨 Issue

The errors you're seeing are from your **Vercel production deployment**, not your local development server. Vercel needs the environment variables configured separately.

Error URL: `https://boke-b0d0d6vpu-kristiyan-hadjievs-projects.vercel.app/api/onboard`

---

## ✅ Quick Fix: Add Environment Variables to Vercel

### Method 1: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/kristiyan-hadjievs-projects/boke
   - Or: https://vercel.com/dashboard

2. **Navigate to Project Settings**
   - Click on your "boke" project
   - Click "Settings" tab
   - Click "Environment Variables" in the left sidebar

3. **Add Required Variables**

   Add each of these variables (click "Add" for each):

   **NEXTAUTH_SECRET**
   ```
   Name: NEXTAUTH_SECRET
   Value: I1dHyZSG625aCMaM2K+zX7DJdfk29kuqQOwfvkQ/+hA=
   Environments: Production, Preview, Development (all selected)
   ```

   **NEXTAUTH_URL**
   ```
   Name: NEXTAUTH_URL
   Value: https://boke-b0d0d6vpu-kristiyan-hadjievs-projects.vercel.app
   Environments: Production, Preview, Development (all selected)
   ```

   **JWT_SECRET**
   ```
   Name: JWT_SECRET
   Value: I1dHyZSG625aCMaM2K+zX7DJdfk29kuqQOwfvkQ/+hA=
   Environments: Production, Preview, Development (all selected)
   ```

   **GOOGLE_CLIENT_ID** (Temporary placeholder)
   ```
   Name: GOOGLE_CLIENT_ID
   Value: PLACEHOLDER-NOT-CONFIGURED
   Environments: Production, Preview, Development (all selected)
   ```

   **GOOGLE_CLIENT_SECRET** (Temporary placeholder)
   ```
   Name: GOOGLE_CLIENT_SECRET
   Value: PLACEHOLDER-NOT-CONFIGURED
   Environments: Production, Preview, Development (all selected)
   ```

   **DATABASE_URL** (Should already exist)
   ```
   Name: DATABASE_URL
   Value: postgresql://postgres.jjdlmxiddefbrlnmxpaz:BoKeDKKH123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
   Environments: Production, Preview, Development (all selected)
   ```

4. **Redeploy**
   - After adding all variables, Vercel will prompt to redeploy
   - Click "Redeploy" or go to "Deployments" tab
   - Click on the latest deployment → "..." menu → "Redeploy"

---

### Method 2: Using Vercel CLI (Alternative)

If you have Vercel CLI installed:

```bash
cd /c/Users/I535106/BoKe

# Set environment variables
vercel env add NEXTAUTH_SECRET production
# Paste: I1dHyZSG625aCMaM2K+zX7DJdfk29kuqQOwfvkQ/+hA=

vercel env add NEXTAUTH_URL production
# Paste: https://boke-b0d0d6vpu-kristiyan-hadjievs-projects.vercel.app

vercel env add JWT_SECRET production
# Paste: I1dHyZSG625aCMaM2K+zX7DJdfk29kuqQOwfvkQ/+hA=

vercel env add GOOGLE_CLIENT_ID production
# Paste: PLACEHOLDER-NOT-CONFIGURED

vercel env add GOOGLE_CLIENT_SECRET production
# Paste: PLACEHOLDER-NOT-CONFIGURED

# Redeploy
vercel --prod
```

---

## 🎯 What Will Be Fixed

After adding environment variables and redeploying:

### ✅ Will Work
- Email/password registration
- Email/password sign-in
- Provider profile pages
- Booking functionality
- Dashboard access
- All API routes

### ⚠️ Won't Work (Until Google OAuth Configured)
- "Sign in with Google" button
- Google OAuth flow
- Account linking with Google

This is expected with placeholder values!

---

## 🔧 Setting Up Google OAuth (Optional)

To make Google sign-in work on production:

### 1. Create Google OAuth Credentials

Visit: https://console.cloud.google.com/apis/credentials

1. Create Project (if needed)
2. Enable Google+ API
3. Create OAuth 2.0 Client ID
4. Application type: Web application
5. Name: BuKe Production

### 2. Add Authorized Redirect URIs

**CRITICAL:** Add your Vercel URL:

```
https://boke-b0d0d6vpu-kristiyan-hadjievs-projects.vercel.app/api/auth/callback/google
```

And if you have a custom domain:
```
https://yourdomain.com/api/auth/callback/google
```

Also add localhost for development:
```
http://localhost:3000/api/auth/callback/google
```

### 3. Copy Credentials

You'll get:
- **Client ID**: Something like `123456789-abc123.apps.googleusercontent.com`
- **Client Secret**: Something like `GOCSPX-abc123xyz`

### 4. Update Vercel Environment Variables

Go back to Vercel Dashboard → Settings → Environment Variables

**Update GOOGLE_CLIENT_ID:**
- Click "..." menu next to GOOGLE_CLIENT_ID
- Click "Edit"
- Replace `PLACEHOLDER-NOT-CONFIGURED` with your actual Client ID
- Save

**Update GOOGLE_CLIENT_SECRET:**
- Click "..." menu next to GOOGLE_CLIENT_SECRET
- Click "Edit"
- Replace `PLACEHOLDER-NOT-CONFIGURED` with your actual Client Secret
- Save

### 5. Redeploy Again

After updating, redeploy your application.

---

## 🧪 Testing After Setup

### 1. Visit Your Vercel URL
```
https://boke-b0d0d6vpu-kristiyan-hadjievs-projects.vercel.app
```

### 2. Try Registration
- Click "Get started free" or "Create your page"
- Fill in the form with email/password
- Submit

**Expected:** Should work without 405 errors

### 3. Try Sign-In
- Go to `/signin`
- Enter email and password
- Click "Sign in"

**Expected:** Should work and redirect to dashboard

### 4. Try Google Sign-In (If Configured)
- Click "Sign in with Google"
- Select Google account

**With Placeholders:** Will show NextAuth configuration error
**With Real Credentials:** Will work perfectly

---

## 🎯 Quick Checklist

Before redeploying:

- [ ] Added NEXTAUTH_SECRET to Vercel
- [ ] Added NEXTAUTH_URL to Vercel (with your Vercel domain)
- [ ] Added JWT_SECRET to Vercel
- [ ] Added GOOGLE_CLIENT_ID to Vercel (placeholder OK for now)
- [ ] Added GOOGLE_CLIENT_SECRET to Vercel (placeholder OK for now)
- [ ] Verified DATABASE_URL exists
- [ ] Redeployed application

After redeployment:

- [ ] Visit production URL
- [ ] Check browser console (should see no 405 errors)
- [ ] Try registration form
- [ ] Try sign-in form
- [ ] Confirm API calls return JSON

---

## 🔍 Verifying Environment Variables

### In Vercel Dashboard

1. Go to Settings → Environment Variables
2. You should see all 6 variables listed:
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
   - JWT_SECRET
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET

### In Deployment Logs

After redeploying:
1. Go to Deployments tab
2. Click on latest deployment
3. Click "Logs" or "Runtime Logs"
4. Look for environment variable loading messages

---

## ⚠️ Important Notes

### NEXTAUTH_URL Must Match Your Domain

**Correct:**
```
NEXTAUTH_URL=https://boke-b0d0d6vpu-kristiyan-hadjievs-projects.vercel.app
```

**Wrong:**
```
NEXTAUTH_URL=http://localhost:3000  ← Don't use localhost for production!
```

### Secrets Should Be Different for Production

For better security, use different secrets for production:

```bash
# Generate new secret for production
openssl rand -base64 32
```

Then use this new value for production-only environment variables.

### Redeploy is Required

⚠️ **CRITICAL:** After adding/changing environment variables, you **MUST** redeploy for changes to take effect!

Changes don't apply to existing deployments automatically.

---

## 🎉 Success Indicators

After proper setup, you should see:

✅ **In Vercel Dashboard:**
- 6 environment variables configured
- Latest deployment status: "Ready"
- No build errors

✅ **In Your App:**
- No 405 or 500 errors in browser console
- Registration form works
- Sign-in form works
- API endpoints return JSON
- Dashboard accessible after sign-in

✅ **In Network Tab:**
- POST to `/api/onboard` returns 200 (not 405)
- POST to `/api/signin` returns 200 (not 405)
- `/api/auth/session` returns valid JSON

---

## 📞 Troubleshooting

### Still Getting 405 Errors After Adding Variables

1. **Did you redeploy?**
   - Environment variables only apply to new deployments
   - Go to Deployments → Click latest → Redeploy

2. **Is NEXTAUTH_URL correct?**
   - Should match your Vercel deployment URL exactly
   - Include `https://`
   - No trailing slash

3. **Try hard refresh**
   - Ctrl+Shift+R in browser
   - Clear browser cache
   - Try incognito mode

### Google Sign-In Not Working

- This is expected with placeholder credentials
- Follow "Setting Up Google OAuth" section above
- Must have real Client ID and Secret from Google Cloud Console

### Database Errors

- Verify DATABASE_URL is correct
- Test connection: `psql postgresql://...` (from DATABASE_URL)
- Check Supabase dashboard for connection issues

---

## 🚀 Quick Action Plan

**Right Now (5 minutes):**
1. Go to Vercel Dashboard
2. Add all 6 environment variables
3. Redeploy
4. Test registration form

**Later (Optional, 15 minutes):**
1. Set up Google Cloud OAuth credentials
2. Update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel
3. Redeploy again
4. Test Google sign-in

---

**Status:** Environment variables need to be added to Vercel
**Priority:** HIGH (app is broken in production)
**ETA to fix:** 5 minutes + redeploy time (~2 minutes)
**Current state:** Production app returning 405 errors
**After fix:** Full functionality restored

---

## 📍 Direct Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Your Project**: https://vercel.com/kristiyan-hadjievs-projects/boke
- **Environment Variables**: https://vercel.com/kristiyan-hadjievs-projects/boke/settings/environment-variables
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials

---

**Next Step:** Go to Vercel Dashboard → Settings → Environment Variables → Add the 6 variables → Redeploy
