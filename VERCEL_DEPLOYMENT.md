# Vercel Deployment Guide

## Current Status
- ✅ Project linked to Vercel: `boke`
- ✅ Latest code pushed to GitHub
- ✅ Database configured in environment variables
- ❌ Hit daily deployment limit (100 deployments/day on free tier)
- ❌ Auto-deployment from GitHub not triggering

## Latest Production Deployment
The most recent successful deployment was **1 hour ago**.

**Production URL**: https://boke-r83fie39e-kristiyan-hadjievs-projects.vercel.app

## Issue: Auto-Deploy Not Triggering

### Possible Causes:
1. **GitHub Integration Disabled** - Check Vercel dashboard
2. **Branch Protection** - Only certain branches auto-deploy
3. **Deployment Hooks** - May need to be reconfigured

### Solution 1: Re-enable GitHub Integration

1. Go to: https://vercel.com/kristiyan-hadjievs-projects/boke/settings/git
2. Check "Git Integration" section
3. Ensure GitHub repository is connected
4. Verify auto-deploy is enabled for `main` branch

### Solution 2: Trigger Manual Deploy via Vercel Dashboard

1. Go to: https://vercel.com/kristiyan-hadjievs-projects/boke
2. Click "Deployments" tab
3. Click "Redeploy" on latest deployment
4. Or click "Deploy" → "Deploy from branch" → Select `main`

### Solution 3: Create Deploy Hook

1. Go to: https://vercel.com/kristiyan-hadjievs-projects/boke/settings/git
2. Scroll to "Deploy Hooks"
3. Create new hook named "GitHub Auto Deploy"
4. Copy the webhook URL
5. Add to GitHub repo:
   - Go to: https://github.com/HadjievK/BoKe/settings/hooks
   - Add webhook with the URL from Vercel
   - Content type: `application/json`
   - Trigger on: `push` events

### Solution 4: Wait for Deployment Limit Reset

The free tier allows 100 deployments per day. Your limit will reset in approximately **6 hours**.

After reset, you can deploy with:
```bash
npx vercel --prod
```

## Current Deployment

The application is currently live at the latest production URL. However, it may not have the most recent changes (booking API routes).

### To View Current Live Version:
1. Visit: https://boke-r83fie39e-kristiyan-hadjievs-projects.vercel.app
2. Test the booking flow
3. Create a provider account
4. Try booking an appointment

### What's Deployed:
Based on the 1-hour-old deployment, it likely includes:
- ✅ New landing page design
- ✅ Updated design system
- ❓ Booking API routes (may or may not be included)
- ❓ Availability API (may or may not be included)

## Recommended Action

Since you've hit the daily limit, I recommend:

1. **Check the Vercel dashboard** to ensure auto-deploy is enabled
2. **Wait 6 hours** for the limit to reset, then run:
   ```bash
   npx vercel --prod
   ```
3. **Upgrade to Pro plan** ($20/month) for unlimited deployments

## Alternative: Deploy Preview

You can deploy to a preview URL (doesn't count towards production limit):
```bash
npx vercel
```

This creates a preview deployment you can test immediately.

## Vercel Dashboard Links

- Project: https://vercel.com/kristiyan-hadjievs-projects/boke
- Settings: https://vercel.com/kristiyan-hadjievs-projects/boke/settings
- Deployments: https://vercel.com/kristiyan-hadjievs-projects/boke/deployments
- Git Integration: https://vercel.com/kristiyan-hadjievs-projects/boke/settings/git
