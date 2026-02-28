# 🚨 QUICK FIX - Do This Now

## The Problem
Your Vercel deployment doesn't have environment variables configured. NextAuth is failing.

## The Solution (8 minutes)

### 1. Go Here
https://vercel.com/kristiyan-hadjievs-projects/boke/settings/environment-variables

### 2. Add These 5 Variables

Click "Add" button for each:

| Name | Value | Environments |
|------|-------|--------------|
| `NEXTAUTH_SECRET` | `I1dHyZSG625aCMaM2K+zX7DJdfk29kuqQOwfvkQ/+hA=` | All 3 (Production, Preview, Development) |
| `NEXTAUTH_URL` | `https://YOUR-VERCEL-URL.vercel.app` | All 3 |
| `JWT_SECRET` | `I1dHyZSG625aCMaM2K+zX7DJdfk29kuqQOwfvkQ/+hA=` | All 3 |
| `GOOGLE_CLIENT_ID` | `PLACEHOLDER-NOT-CONFIGURED` | All 3 |
| `GOOGLE_CLIENT_SECRET` | `PLACEHOLDER-NOT-CONFIGURED` | All 3 |

**⚠️ For NEXTAUTH_URL:** Use your actual Vercel URL (copy from your deployment page)

### 3. Redeploy
- Go to "Deployments" tab
- Click "..." on latest deployment
- Click "Redeploy"
- Wait for "Ready" (2 minutes)

### 4. Test
- Clear browser cache (Ctrl+Shift+R)
- Visit your site
- Check console - no errors!
- Try registration
- Try sign-in

## That's It!

After adding these variables and redeploying, everything will work.

---

**Why:** NextAuth needs `NEXTAUTH_SECRET` to function. Without it, it returns HTML error pages instead of JSON.

**Result:** All auth features will work after this fix.

**Time:** ~8 minutes total

**Start here:** https://vercel.com/kristiyan-hadjievs-projects/boke/settings/environment-variables
