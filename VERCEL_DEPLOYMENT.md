# Vercel Deployment Guide

## Current Status
- ✅ Project linked to Vercel: `boke`
- ✅ Latest code pushed to GitHub
- ✅ Database configured in environment variables
- ⏳ Waiting for deployment limit reset

## Latest Features Pending Deployment
- ✅ React-Day-Picker calendar integration
- ✅ Theme system with cream-dark color variant
- ✅ Full booking flow with availability API
- ✅ Dashboard with real-time sync
- ✅ Mobile responsive design

## Deployment Instructions

### Option 1: Manual Deploy via CLI (Recommended)
```bash
# Deploy to production
npx vercel --prod

# Or deploy to preview (for testing)
npx vercel
```

### Option 2: Deploy via Vercel Dashboard
1. Go to: https://vercel.com/kristiyan-hadjievs-projects/boke
2. Click "Deployments" tab
3. Click "Deploy" → "Deploy from branch" → Select `main`

### Option 3: Wait for Auto-Deploy
If GitHub integration is properly configured, pushing to `main` branch will trigger automatic deployment.

## Environment Variables

Required environment variables in Vercel:

```bash
DATABASE_URL=postgresql://postgres.xxx:password@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
```

To update environment variables:
1. Go to: https://vercel.com/kristiyan-hadjievs-projects/boke/settings/environment-variables
2. Add or update variables
3. Redeploy for changes to take effect

## Troubleshooting

### Deployment Limit Exceeded
**Error**: "Rate limit exceeded"
**Solution**: Free tier allows 100 deployments/day. Wait for reset or upgrade to Pro.

### Auto-Deploy Not Working
**Possible causes**:
1. GitHub integration disabled
2. Branch not configured for auto-deploy
3. Repository access revoked

**Solution**:
1. Check: https://vercel.com/kristiyan-hadjievs-projects/boke/settings/git
2. Ensure GitHub repo is connected
3. Verify `main` branch is set for production deploys

### Build Errors
**Check build logs**:
1. Go to deployment in Vercel dashboard
2. Click "View Build Logs"
3. Look for TypeScript errors or missing dependencies

Common fixes:
- Run `npm run build` locally first
- Ensure all dependencies are in `package.json`
- Check environment variables are set

### Database Connection Issues
**Error**: "Connection refused" or timeout
**Solutions**:
1. Use Transaction Pooler (port 6543, not 5432)
2. Verify DATABASE_URL includes pooler subdomain
3. Check Supabase project is active
4. Ensure Vercel IP is not blocked

## Post-Deployment Testing

After successful deployment, test:
- [ ] Landing page loads
- [ ] Provider profile loads (e.g., `/test-provider`)
- [ ] Booking page loads (e.g., `/test-provider/book`)
- [ ] Calendar displays correctly
- [ ] Theme toggle works
- [ ] Time slots load after date selection
- [ ] Booking submission works
- [ ] Dashboard loads with PIN
- [ ] Appointments display in dashboard
