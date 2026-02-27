# 🗓️ BuKe - Simple Booking Platform

**Multi-tenant booking platform where service providers (nail artists, barbers, dentists, etc.) create profiles and share booking links with customers.**

## 🎯 How It Works

1. **Service Provider** visits landing page → Creates account
2. Gets unique URL: `boke.app/sally-nails`
3. Shares link on Instagram/social media
4. **Customers** click link → Book services
5. **Provider** checks dashboard with PIN → Sees bookings

---

## 🏗️ Architecture

### Simple Stack (100% Serverless - FREE)

```
User Request
    ↓
Vercel Edge Network
    ↓
Next.js 14 App (Frontend + Backend)
    ├── Frontend Pages
    │   ├── Landing Page (/)
    │   ├── Provider Profile (/sally-nails)
    │   ├── Booking Page (/sally-nails/book)
    │   └── Dashboard (/dashboard/sally-nails?pin=1234)
    │
    └── API Routes (Next.js Serverless)
        ├── /api/onboard - Registration
        ├── /api/{slug}/book - Booking
        └── /api/dashboard/{slug} - Dashboard
        ↓
Supabase PostgreSQL
    └── Transaction Pooler (IPv4-compatible)
        └── 3 Tables: service_providers, customers, appointments
```

### Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (TypeScript)
- **Database**: Supabase PostgreSQL (Transaction Pooler - port 6543)
- **Hosting**: Vercel (Everything in one deployment)
- **Cost**: $0/month (free tier)

### Key Design Decisions

✅ **Single Deployment** - Frontend + Backend in one Next.js app
✅ **No Separate Python Service** - Pure TypeScript/JavaScript stack
✅ **Supabase Pooler** - Handles connection reuse (IPv4-compatible for Vercel)
✅ **JSONB Storage** - Services and availability stored as JSON (no joins)
✅ **Slug-based Multi-tenancy** - Each provider gets unique route
✅ **PIN Authentication** - Simple 4-digit PIN for dashboard access

---

## 📂 Project Structure

```
BoKe/
├── frontend/                 # Next.js 14 App
│   ├── app/
│   │   ├── page.tsx         # Landing page (registration)
│   │   ├── [slug]/
│   │   │   ├── page.tsx     # Provider profile
│   │   │   └── book/
│   │   │       └── page.tsx # Booking form
│   │   ├── dashboard/
│   │   │   └── [slug]/
│   │   │       └── page.tsx # Dashboard (PIN-protected)
│   │   └── api/             # API Routes (Backend)
│   │       ├── onboard/
│   │       │   └── route.ts # Registration endpoint
│   │       └── health/
│   │           └── route.ts # Health check
│   └── lib/
│       ├── db.ts            # PostgreSQL connection
│       ├── api.ts           # API client
│       └── types.ts         # TypeScript types
│
└── vercel.json              # Vercel deployment config
```

---

## 🗄️ Database Schema

```sql
-- 3 Simple Tables

service_providers (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE,              -- "sally-nails"
  name TEXT,                     -- "Sally"
  business_name TEXT,            -- "Sally's Nails"
  service_type TEXT,             -- "nail_artist"
  email TEXT UNIQUE,
  phone TEXT,
  pin TEXT,                      -- "1234"
  services JSONB,                -- [{"name": "Manicure", "price": 30, ...}]
  availability JSONB,            -- [{"day": 0, "start": "09:00", ...}]
  theme_config JSONB
)

customers (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT
)

appointments (
  id UUID PRIMARY KEY,
  provider_id UUID → service_providers(id),
  customer_id UUID → customers(id),
  service_id TEXT,               -- "provider-id-0"
  appointment_date DATE,
  appointment_time TIME,
  duration INT,
  price DECIMAL,
  status TEXT,                   -- "confirmed", "cancelled", "completed"
  UNIQUE(provider_id, appointment_date, appointment_time)  -- Prevent double-booking
)
```

---

## 🚀 Local Development

### Prerequisites
- Node.js 20+
- Supabase account (free tier)

### 1. Clone & Install

```bash
git clone https://github.com/HadjievK/BoKe.git
cd BoKe/frontend
npm install
```

### 2. Setup Database

1. Create Supabase project at https://supabase.com
2. Go to SQL Editor and create the database schema
3. Copy **Transaction Pooler** connection string (port 6543)

### 3. Configure Environment

Create `frontend/.env.local`:

```bash
DATABASE_URL=postgresql://postgres.xxx:password@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Run Locally

```bash
cd frontend
npm run dev
```

Visit: http://localhost:3000

---

## 🌐 Deployment (Vercel)

### One-Click Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel --prod
```

### Set Environment Variables

Go to Vercel Dashboard → Project Settings → Environment Variables:

```
DATABASE_URL = postgresql://postgres.xxx:password@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
```

### Update Root Directory

In Vercel Dashboard → Settings → General:
- **Root Directory**: `frontend`
- Click **Save**

**That's it!** ✅ Your app is live.

---

## 📋 API Endpoints

### Public (No Auth)
- `POST /api/onboard` - Register new provider
- `GET /api/health` - Health check

### Coming Soon
- `GET /api/provider/{slug}` - Get provider profile
- `GET /api/{slug}/availability?date=2024-01-15` - Get available slots
- `POST /api/{slug}/book` - Book appointment
- `GET /api/dashboard/{slug}?pin=1234` - Get dashboard data

---

## 🔒 Security

- ✅ PIN-based dashboard authentication (4-digit)
- ✅ SQL injection prevention (parameterized queries)
- ✅ Unique constraint prevents double-booking
- ✅ Customer email deduplication
- ✅ Environment variables for sensitive data

---

## 💡 Why Serverless?

**Perfect for booking platforms:**

| Traditional Server | Vercel Serverless |
|-------------------|-------------------|
| 💰 $5-20/month | 💰 $0/month (free tier) |
| 🏃 24/7 running | ⚡ Runs on-demand |
| 🔧 Manual scaling | 📈 Auto-scales |
| 🛠️ Server management | ✅ Zero maintenance |

**Traffic Pattern**: Provider creates profile (rare) → Customers book (occasional) → Dashboard checks (periodic)

**Cost Example**: 10 providers, 100 bookings/month = ~1000 API calls = **FREE**

---

## 🎨 Customization

Each provider can have:
- Custom slug (`/sally-nails`)
- Custom services (stored in JSONB)
- Custom availability schedule
- Custom theme colors (future feature)

---

## 📝 License

MIT

---

## 🙋 Support

Issues: https://github.com/HadjievK/BoKe/issues
