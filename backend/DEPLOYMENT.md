# Deployment Guide for BuKe

## Overview

BuKe uses a **split deployment architecture**:
- **Frontend (Next.js)** → Vercel
- **Backend (FastAPI)** → Railway, Render, or any Python hosting platform  
- **Database (PostgreSQL)** → Supabase

This separation ensures optimal performance for both frontend and backend.

---

## Why Split Deployment?

Your FastAPI backend uses:
- **Connection pooling** (`SimpleConnectionPool`) - doesn't work well in serverless
- **Stateful resources** - need persistent processes
- **Database connections** - benefit from long-running instances

**Serverless limitations on Vercel**:
- Cold starts reset connection pools
- Each request gets a new function instance
- Database connections get exhausted

---

## Deployment Options

### Option 1: Railway (Recommended - $5/month)
- Simple setup, automatic HTTPS, GitHub integration
- Configuration files already created in backend/

### Option 2: Render (Free tier available)
- Good for testing and small projects

### Option 3: DigitalOcean App Platform ($5/month)
- Predictable pricing, good performance

### Option 4: Vercel Serverless (Advanced - NOT RECOMMENDED)
- Requires major refactoring
- Remove connection pooling, add PgBouncer
- Higher latency, connection issues

**Recommendation: Use Railway** ✅

---

## Quick Start: Railway + Vercel

### 1. Deploy Backend (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
cd backend
railway login
railway init
railway up
```

Set environment variables in Railway dashboard:
- `DATABASE_URL`: Your Supabase connection string
- `ALLOWED_ORIGINS`: `*` (update after frontend deployment)

Copy your Railway URL (e.g., `https://buke-backend.railway.app`)

### 2. Deploy Frontend (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project root
vercel --prod
```

When prompted, set root directory to `frontend`.

Set environment variable in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`: Your Railway URL

### 3. Update CORS

In Railway dashboard, update `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS=https://your-app.vercel.app,https://*.vercel.app
```

---

## Cost: $5/month Total
- Vercel: $0
- Railway: $5
- Supabase: $0

---

## See Full Documentation

For detailed setup instructions, troubleshooting, and alternatives, see the full deployment guide above.
