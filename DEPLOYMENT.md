# BuKe MVP Deployment Guide

## Overview

This guide covers deploying the BuKe MVP to production:
- **Database**: Supabase (free tier)
- **Backend + Frontend**: Vercel (free tier) - Monorepo deployment

Total cost: Free (Vercel free tier)

## 1. Database Setup (Supabase)

### Create Project
1. Go to https://supabase.com
2. Click "New Project"
3. Choose organization and set project name
4. Choose region closest to your users
5. Generate a secure database password
6. Wait for project to initialize (~2 minutes)

### Run Migrations
1. Go to SQL Editor
2. Click "New Query"
3. Copy contents of `backend/app/database/schema.sql`
4. Paste and click "Run"
5. Verify tables created in Table Editor

### Get Connection String
1. Go to Project Settings > Database
2. Copy "Connection string" (URI format)
3. Replace `[YOUR-PASSWORD]` with your database password
4. Save this for backend deployment

## 2. Vercel Deployment (Backend + Frontend Monorepo)

### Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- Push your code to a GitHub repository

### Environment Variables Setup

Before deploying, you need to set up these environment variables in Vercel:

**Backend Variables:**
- `DATABASE_URL`: Your Supabase connection string
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins (your Vercel domains)
  - Example: `https://yourdomain.vercel.app,https://buke-brown-ten.vercel.app`

**Frontend Variables:**
- `NEXT_PUBLIC_API_URL`: Leave empty or don't set (will use relative URLs in production)

### Deploy to Vercel

**Option A: Vercel Dashboard (Recommended)**

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect the monorepo structure
4. Configure project settings:
   - Framework Preset: Next.js
   - Root Directory: `./` (keep as root for monorepo)
   - Build Command: (use default)
   - Output Directory: (use default)

5. Add environment variables:
   - Click "Environment Variables"
   - Add `DATABASE_URL` (get from Supabase)
   - Add `ALLOWED_ORIGINS` (you'll update this after getting your Vercel URL)

6. Click "Deploy"

7. After deployment, get your Vercel URL (e.g., `https://boke-brown-ten.vercel.app`)

8. Update environment variables:
   - Go to Project Settings > Environment Variables
   - Update `ALLOWED_ORIGINS` to include your Vercel URL(s):
     ```
     https://boke-brown-ten.vercel.app,https://boke-78g2pyah7-kristiyan-hadjievs-projects.vercel.app
     ```
   - Redeploy to apply changes

**Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from root directory
vercel

# Set environment variables
vercel env add DATABASE_URL production
vercel env add ALLOWED_ORIGINS production

# Deploy to production
vercel --prod
```

### Verify Deployment

1. **Test Backend API:**
   - Visit: `https://yourdomain.vercel.app/api/health`
   - Should return: `{"status": "healthy"}`

2. **Test Frontend:**
   - Visit: `https://yourdomain.vercel.app`
   - Should load the homepage

3. **Test API Connection:**
   - Try registering a new barber
   - The frontend should successfully call the backend API

### CORS Configuration

The backend is configured to automatically allow:
- All URLs in the `ALLOWED_ORIGINS` environment variable
- All Vercel preview deployments (`*.vercel.app`)

If you get CORS errors:
1. Check that `ALLOWED_ORIGINS` includes your Vercel URL
2. Make sure the frontend is using relative URLs (no hardcoded localhost)
3. Redeploy after updating environment variables

## 3. Custom Domain (Optional)

### For Frontend & Backend (Vercel)
1. Go to Project Settings > Domains
2. Add your domain (e.g., `buke.app`)
3. Add DNS records at your domain provider:
   - Type: A, Name: @, Value: 76.76.21.21
   - Type: CNAME, Name: www, Value: cname.vercel-dns.com
4. Wait for DNS propagation (~1 hour)
5. API will be accessible at: `https://yourdomain.com/api/*`
6. Update `ALLOWED_ORIGINS` environment variable to include your custom domain

## 4. Post-Deployment Checklist

- [ ] Backend health check: `https://yourdomain.vercel.app/api/health`
- [ ] Frontend loads: `https://yourdomain.vercel.app`
- [ ] Registration works
- [ ] Can access test barber page
- [ ] Can book appointment
- [ ] Appointment shows in database
- [ ] Dashboard access works with PIN
- [ ] Mobile responsive
- [ ] API docs accessible: `https://yourdomain.vercel.app/api/docs`
- [ ] No CORS errors in browser console

## 5. Monitoring and Maintenance

### Vercel Monitoring
- View deployment logs in Vercel dashboard
- Monitor build times
- Check analytics
- View function logs for API errors

### Supabase Monitoring
- Monitor database size (500 MB free tier limit)
- Check API requests (50,000/month free)
- Monitor concurrent connections (10 max on free tier)

### Backups
1. Supabase automatic backups (7 days on free tier)
2. Manual backup command:
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

## 6. Scaling Considerations

### When to upgrade:

**Supabase Free Tier Limits:**
- 500 MB database size → Upgrade to Pro ($25/mo) for 8 GB
- 50,000 API requests/month → Pro gives 5M requests
- 10 concurrent connections → Pro gives 200

**Vercel Free Tier:**
- 100 GB bandwidth/month → Upgrade to Pro ($20/mo) for 1 TB
- 100 deployments/day → Pro gives unlimited
- Serverless function execution time: 10s max → Pro gives 60s

## 7. Security Checklist

- [ ] Environment variables not committed to git
- [ ] CORS configured correctly
- [ ] Database has strong password
- [ ] API rate limiting (add if needed)
- [ ] HTTPS enforced
- [ ] PIN stored securely (hashed in future)

## 8. Troubleshooting

### Backend won't deploy
- Check Python version compatibility with Vercel
- Verify `requirements.txt` is complete
- Check Vercel function logs for errors
- Ensure `api/index.py` exists and is configured correctly

### Frontend build fails
- Check Node version compatibility
- Verify all dependencies in `package.json`
- Check Vercel build logs
- Ensure `frontend/` directory structure is correct

### Database connection fails
- Verify DATABASE_URL format
- Check Supabase IP allowlist
- Test connection locally first

### CORS errors
- **Issue**: "Access to fetch at 'http://localhost:8000/api/...' has been blocked by CORS policy"
- **Solution 1**: Ensure `NEXT_PUBLIC_API_URL` is NOT set in production (leave empty to use relative URLs)
- **Solution 2**: Update `ALLOWED_ORIGINS` environment variable in Vercel to include all deployment URLs
- **Solution 3**: Check that the custom CORS middleware is working (see `backend/app/main.py`)
- **Solution 4**: Redeploy after updating environment variables
- **Verify**: Check browser console for exact error and origin URL
- **Debug**: Use browser DevTools Network tab to see actual request/response headers

### API calls fail with 404
- Verify API routes are accessible at `/api/*`
- Check `vercel.json` routing configuration
- Ensure `api/index.py` is present
- Check function logs in Vercel dashboard

## 9. Rollback Procedure

### Vercel
- Go to Deployments
- Find working deployment
- Click three dots > "Promote to Production"
- Both frontend and backend will rollback together

## Support

For deployment issues:
- Vercel docs: https://vercel.com/docs
- Supabase docs: https://supabase.com/docs
- Next.js deployment: https://nextjs.org/docs/deployment
