# Google OAuth Setup Guide

## Overview

This guide will walk you through setting up Google OAuth authentication for your BuKe application.

---

## Prerequisites

- Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** dropdown at the top
3. Click **"NEW PROJECT"**
4. Enter project name: `BuKe` or your preferred name
5. Click **"CREATE"**
6. Wait for project creation to complete

---

## Step 2: Enable Google+ API

1. In your project, go to **"APIs & Services"** > **"Library"**
2. Search for **"Google+ API"**
3. Click on it
4. Click **"ENABLE"**

---

## Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Select **"External"** (unless you have a Google Workspace)
3. Click **"CREATE"**

### App Information:
- **App name**: `BuKe` (or your app name)
- **User support email**: Your email
- **App logo**: (Optional) Upload your logo

### App Domain:
- **Application home page**: `https://yourdomain.com`
- **Application privacy policy link**: `https://yourdomain.com/privacy`
- **Application terms of service link**: `https://yourdomain.com/terms`

### Developer Contact Information:
- **Email addresses**: Your email

4. Click **"SAVE AND CONTINUE"**

### Scopes:
5. Click **"ADD OR REMOVE SCOPES"**
6. Select these scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
7. Click **"UPDATE"**
8. Click **"SAVE AND CONTINUE"**

### Test Users (for development):
9. Click **"ADD USERS"**
10. Add your test email addresses
11. Click **"SAVE AND CONTINUE"**

12. Review and click **"BACK TO DASHBOARD"**

---

## Step 4: Create OAuth Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**

### Application Type:
3. Select **"Web application"**

### Name:
4. Enter name: `BuKe Web Client`

### Authorized JavaScript Origins:
5. Add these URLs:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

### Authorized Redirect URIs:
6. Add these URLs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`

7. Click **"CREATE"**

### Save Credentials:
8. Copy the **Client ID** and **Client Secret**
9. Keep these safe - you'll need them in the next step

---

## Step 5: Configure Environment Variables

Create or update your `.env.local` file:

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here

# NextAuth Configuration
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000  # Change to production URL in production

# Other existing variables
JWT_SECRET=your-existing-jwt-secret
DATABASE_URL=your-database-url
```

### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

---

## Step 6: Restart Development Server

```bash
npm run dev
```

---

## Step 7: Test Google Login

1. Go to `http://localhost:3000/signin`
2. Click **"Sign in with Google"**
3. You should see Google's consent screen
4. Sign in with your Google account
5. Grant permissions
6. You'll be redirected back to your app

### First-time Google Users:
- If the email doesn't exist in database → Redirects to onboarding
- If the email exists → Signs in and redirects to dashboard

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Cause**: The redirect URI in your request doesn't match Google Console

**Fix**:
1. Go to Google Cloud Console > Credentials
2. Edit your OAuth client
3. Add the exact redirect URI: `http://localhost:3000/api/auth/callback/google`

### Error: "Access blocked: This app's request is invalid"
**Cause**: OAuth consent screen not configured properly

**Fix**:
1. Go to OAuth consent screen
2. Complete all required fields
3. Add test users if in testing mode
4. Save changes

### Error: "Invalid client secret"
**Cause**: Wrong credentials in .env.local

**Fix**:
1. Double-check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
2. Make sure there are no extra spaces
3. Restart dev server after changes

### Error: "NEXTAUTH_SECRET is not set"
**Cause**: Missing NEXTAUTH_SECRET in environment

**Fix**:
```bash
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.local
npm run dev
```

---

## Production Deployment

### Update Environment Variables:

1. **Vercel/Netlify/etc.**:
   - Add all environment variables in your hosting dashboard
   - Set `NEXTAUTH_URL` to your production domain

2. **Update Google OAuth**:
   - Go to Google Cloud Console > Credentials
   - Edit your OAuth client
   - Add production redirect URI: `https://yourdomain.com/api/auth/callback/google`
   - Add production JavaScript origin: `https://yourdomain.com`

3. **Publish OAuth App**:
   - Go to OAuth consent screen
   - Click "PUBLISH APP"
   - This allows any Google user to sign in (not just test users)

---

## Security Best Practices

1. **Never commit credentials**:
   - `.env.local` is in `.gitignore`
   - Never commit GOOGLE_CLIENT_SECRET

2. **Use different credentials for production**:
   - Create separate OAuth clients for dev and prod
   - Use different secrets for each environment

3. **Regularly rotate secrets**:
   - Rotate NEXTAUTH_SECRET periodically
   - Update GOOGLE_CLIENT_SECRET if compromised

4. **Monitor OAuth usage**:
   - Check Google Cloud Console for suspicious activity
   - Review API usage regularly

---

## Features Implemented

✅ **Google OAuth Sign In**
- One-click sign in with Google
- Automatic account creation or login

✅ **Email/Password Sign In**
- Traditional authentication still works
- Users can choose their preferred method

✅ **Smart Routing**
- Existing users → Dashboard
- New Google users → Onboarding flow
- Preserves Google account info for onboarding

✅ **Secure Session Management**
- JWT-based sessions
- 7-day session expiration
- HTTP-only cookies

---

## User Flows

### New Google User:
1. Click "Sign in with Google"
2. Google consent screen
3. Redirected to onboarding: `/onboard?google=true&email=...&name=...`
4. Complete business information
5. Account created with Google email
6. Redirected to dashboard

### Existing Google User:
1. Click "Sign in with Google"
2. Google consent screen
3. Email matched in database
4. Automatically signed in
5. Redirected to dashboard

### Email/Password User:
1. Enter email and password
2. Click "Sign in"
3. Credentials validated
4. JWT token issued
5. Redirected to dashboard

---

## API Endpoints

### NextAuth Endpoints (automatically created):
- `GET/POST /api/auth/signin` - Sign in page
- `GET/POST /api/auth/callback/google` - Google OAuth callback
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signout` - Sign out

---

## Database Schema

Google users are stored in the same `service_providers` table:

```sql
-- Email from Google account
email VARCHAR(255) UNIQUE NOT NULL

-- Password is NULL for Google-only users
password VARCHAR(255) -- Can be NULL

-- Other fields same as before
slug, name, business_name, etc.
```

---

## Testing Checklist

- [ ] Google sign in works in development
- [ ] Email/password sign in still works
- [ ] New Google user redirected to onboarding
- [ ] Existing Google user signed in automatically
- [ ] Session persists across page refreshes
- [ ] Sign out works correctly
- [ ] Production redirect URIs configured
- [ ] OAuth consent screen published

---

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Google Cloud Console error logs
3. Check browser console for errors
4. Verify all environment variables are set correctly
