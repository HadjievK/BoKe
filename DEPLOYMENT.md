# BuKe MVP Deployment Guide

## Overview

This guide covers deploying the BuKe MVP to production:
- **Database**: Supabase (free tier)
- **Backend**: Railway ($5/month)
- **Frontend**: Vercel (free tier)

Total cost: ~$5/month

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

## 2. Backend Deployment (Railway)

### Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)

### Prepare Repository
1. Initialize git in backend folder:
```bash
cd backend
git init
git add .
git commit -m "Initial backend commit"
```

2. Create `Procfile` in backend folder:
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

3. Create `runtime.txt`:
```
python-3.11
```

### Deploy to Railway

**Option A: Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to new project
railway link

# Deploy
railway up

# Set environment variables
railway variables set DATABASE_URL="postgresql://..."
railway variables set ENVIRONMENT="production"
railway variables set ALLOWED_ORIGINS="https://yourdomain.vercel.app"
```

**Option B: Railway Dashboard**
1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Connect your GitHub account
4. Select your backend repository
5. Configure:
   - Root Directory: `/` (or `backend` if monorepo)
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - `DATABASE_URL`: Your Supabase connection string
   - `ENVIRONMENT`: `production`
   - `ALLOWED_ORIGINS`: Your frontend URL (will add after Vercel deploy)
7. Click "Deploy"

### Get Backend URL
- After deployment, Railway provides a URL like: `https://your-app.railway.app`
- Save this for frontend configuration
- Test at: `https://your-app.railway.app/health`

## 3. Frontend Deployment (Vercel)

### Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)

### Prepare Repository
```bash
cd frontend
git init
git add .
git commit -m "Initial frontend commit"
```

### Deploy to Vercel

**Option A: Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy: Yes
# - Project name: buke-frontend
# - Framework: Next.js
# - Root directory: ./
# - Build settings: (use defaults)

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL production

# Enter your Railway backend URL
# Example: https://your-app.railway.app

# Deploy to production
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com/new
2. Import your frontend Git repository
3. Configure:
   - Framework Preset: Next.js
   - Root Directory: `./` (or `frontend` if monorepo)
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add environment variable:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: Your Railway backend URL (e.g., `https://your-app.railway.app`)
5. Click "Deploy"

### Get Frontend URL
- Vercel provides a URL like: `https://buke-frontend.vercel.app`
- You can add custom domain in project settings

## 4. Connect Frontend and Backend

### Update Railway CORS
1. Go to Railway project settings
2. Update `ALLOWED_ORIGINS` environment variable:
```
https://buke-frontend.vercel.app,https://yourdomain.com
```
3. Redeploy backend

### Test Connection
1. Visit your Vercel URL
2. Try registering a new barber
3. Try booking an appointment
4. Check dashboard access

## 5. Custom Domain (Optional)

### For Frontend (Vercel)
1. Go to Project Settings > Domains
2. Add your domain (e.g., `buke.app`)
3. Add DNS records at your domain provider:
   - Type: A, Name: @, Value: 76.76.21.21
   - Type: CNAME, Name: www, Value: cname.vercel-dns.com
4. Wait for DNS propagation (~1 hour)

### For Backend (Railway)
1. Go to Project Settings > Domains
2. Add custom domain
3. Add CNAME record at your domain provider:
   - Type: CNAME, Name: api, Value: provided by Railway
4. Update frontend `NEXT_PUBLIC_API_URL` in Vercel

## 6. Post-Deployment Checklist

- [ ] Backend health check: `https://api.yourdomain.com/health`
- [ ] Frontend loads: `https://yourdomain.com`
- [ ] Registration works
- [ ] Can access test barber page
- [ ] Can book appointment
- [ ] Appointment shows in database
- [ ] Dashboard access works with PIN
- [ ] Mobile responsive
- [ ] API docs accessible: `https://api.yourdomain.com/docs`

## 7. Monitoring and Maintenance

### Railway Monitoring
- View logs in Railway dashboard
- Set up alerts for crashes
- Monitor database connections

### Vercel Monitoring
- View deployment logs
- Monitor build times
- Check analytics

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

## 8. Scaling Considerations

### When to upgrade:

**Supabase Free Tier Limits:**
- 500 MB database size → Upgrade to Pro ($25/mo) for 8 GB
- 50,000 API requests/month → Pro gives 5M requests
- 10 concurrent connections → Pro gives 200

**Railway Starter Limits:**
- $5/mo included → Additional usage billed per hour
- Sleep after 30 minutes inactivity → Upgrade to prevent sleep

**Vercel Free Tier:**
- 100 GB bandwidth/month → Upgrade to Pro ($20/mo) for 1 TB
- 100 deployments/day → Pro gives unlimited

## 9. Security Checklist

- [ ] Environment variables not committed to git
- [ ] CORS configured correctly
- [ ] Database has strong password
- [ ] API rate limiting (add if needed)
- [ ] HTTPS enforced
- [ ] PIN stored securely (hashed in future)

## 10. Troubleshooting

### Backend won't deploy
- Check Python version in `runtime.txt`
- Verify `requirements.txt` is complete
- Check Railway logs for errors

### Frontend build fails
- Check Node version compatibility
- Verify all dependencies in `package.json`
- Check Vercel build logs

### Database connection fails
- Verify DATABASE_URL format
- Check Supabase IP allowlist
- Test connection locally first

### CORS errors
- Check ALLOWED_ORIGINS in Railway
- Verify frontend URL is correct
- Check browser console for exact error

## 11. Rollback Procedure

### Railway
- Go to Deployments
- Click on previous successful deployment
- Click "Redeploy"

### Vercel
- Go to Deployments
- Find working deployment
- Click three dots > "Promote to Production"

## Support

For deployment issues:
- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs
- Supabase docs: https://supabase.com/docs
