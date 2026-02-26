# BuKe Architecture

**Serverless multi-tenant booking platform optimized for service providers**

---

## 🎯 Business Model

### User Flow
```
Service Provider (Nail Artist)
    ↓
Landing Page (boke.app/)
    ↓
Creates Account
    ↓
Gets Unique URL: boke.app/sally-nails + PIN: 1234
    ↓
Shares on Instagram Story
    ↓
Customers Book → Provider Sees Bookings in Dashboard
```

---

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────┐
│            User (Browser/Mobile)                 │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────┐
│         Vercel Edge Network (CDN)                │
│  • SSL/TLS Termination                          │
│  • DDoS Protection                              │
│  • Global CDN                                   │
└─────────────────┬───────────────────────────────┘
                  │
         ┌────────┴────────┐
         ↓                  ↓
┌──────────────┐   ┌──────────────────┐
│  Frontend    │   │  Backend API     │
│  (Next.js)   │   │  (FastAPI)       │
│              │   │                  │
│  Serverless  │   │  Serverless      │
│  Functions   │   │  Functions       │
└──────────────┘   └────────┬─────────┘
                            │
                            ↓
                  ┌──────────────────┐
                  │  Supabase        │
                  │  PostgreSQL      │
                  │                  │
                  │  Transaction     │
                  │  Pooler          │
                  │  (port 6543)     │
                  └──────────────────┘
```

---

## 📦 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python), Pydantic
- **Database**: Supabase PostgreSQL + Transaction Pooler
- **Hosting**: Vercel (Frontend + Backend serverless)
- **Cost**: $0/month (free tier)

---

## 🗄️ Database Schema

### 3 Simple Tables

```sql
service_providers (tenant root)
├── id UUID
├── slug TEXT UNIQUE              # "sally-nails"
├── pin TEXT                      # "1234"
├── services JSONB                # No separate table
└── availability JSONB

appointments
├── provider_id UUID → service_providers(id)
├── customer_id UUID → customers(id)
└── UNIQUE(provider_id, appointment_date, appointment_time)

customers (shared)
├── email TEXT UNIQUE
└── (deduplication by email)
```

---

## 🔄 Request Flow

### Provider Registration
```
POST /api/onboard
  → Generate slug + PIN
  → Insert to service_providers
  → Return {slug, pin, url}
```

### Customer Booking
```
GET /api/provider/{slug}
  → Show profile

GET /api/{slug}/availability?date=2024-01-15
  → Show time slots

POST /api/{slug}/book
  → Create appointment
  → UNIQUE constraint prevents double-booking
```

### Provider Dashboard
```
GET /api/dashboard/{slug}?pin=1234
  → Verify PIN
  → Return appointments + stats
```

---

## ⚡ Key Optimizations

### Serverless-Friendly
✅ No connection pool (direct connections)
✅ Supabase pooler handles reuse (IPv4-compatible)
✅ Each request opens/closes connection

### Data Model
✅ JSONB storage (no JOINs for services)
✅ Slug-based multi-tenancy (simple)
✅ PIN authentication (4-digit, simple)

---

## 💰 Cost

**Free Tier**: 100 providers, 1000 bookings/month = $0

---

## 🚀 Deployment

```bash
vercel --prod
```

Set `DATABASE_URL` in Vercel dashboard → Done! ✅
