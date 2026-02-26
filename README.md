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
├── Frontend (Next.js 14)
│   ├── Landing Page (/)
│   ├── Provider Profile (/sally-nails)
│   ├── Booking Page (/sally-nails/book)
│   └── Dashboard (/dashboard/sally-nails?pin=1234)
│
└── Backend (FastAPI Serverless)
    ├── Registration API (/api/onboard)
    ├── Booking API (/api/{slug}/book)
    └── Dashboard API (/api/dashboard/{slug})
    ↓
Supabase PostgreSQL
    └── Transaction Pooler (IPv4-compatible)
        └── 3 Tables: service_providers, customers, appointments
```

### Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python), Pydantic
- **Database**: Supabase PostgreSQL (Transaction Pooler - port 6543)
- **Hosting**: Vercel (Frontend + Backend serverless functions)
- **Cost**: $0/month (free tier)

### Key Design Decisions

✅ **No Connection Pool** - Each serverless function opens/closes DB connection
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
│   │   └── dashboard/
│   │       └── [slug]/
│   │           └── page.tsx # Dashboard (PIN-protected)
│   └── lib/
│       ├── api.ts           # API client
│       └── types.ts         # TypeScript types
│
├── backend/                  # FastAPI App
│   └── app/
│       ├── main.py          # FastAPI app + CORS
│       ├── routes/          # API endpoints
│       ├── services/        # Business logic
│       ├── models/          # Pydantic schemas
│       └── database/
│           ├── schema_v2.sql         # Database schema
│           └── connection.py         # DB connection (serverless-optimized)
│
├── api/
│   └── index.py             # Vercel serverless handler (Mangum)
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
- Python 3.12+
- Supabase account (free tier)

### 1. Clone & Install

```bash
git clone https://github.com/HadjievK/BoKe.git
cd BoKe

# Install frontend
cd frontend
npm install

# Install backend
cd ../backend
pip install -r requirements.txt
```

### 2. Setup Database

1. Create Supabase project at https://supabase.com
2. Run SQL from `backend/app/database/schema_v2.sql`
3. Copy **Transaction Pooler** connection string (port 6543)

### 3. Configure Environment

```bash
# backend/.env
DATABASE_URL=postgresql://postgres.xxx:password@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 4. Run Locally

```bash
# Terminal 1 - Backend (port 8000)
cd backend
python -m uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend (port 3001)
cd frontend
npm run dev -- -p 3001
```

Visit: http://localhost:3001

---

## 🌐 Deployment (Vercel)

### One-Click Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Set Environment Variable

Go to Vercel Dashboard → Project Settings → Environment Variables:

```
DATABASE_URL = postgresql://postgres.xxx:password@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
```

**That's it!** ✅ Your app is live.

---

## 📋 API Endpoints

### Public (No Auth)
- `POST /api/onboard` - Register new provider
- `GET /api/provider/{slug}` - Get provider profile
- `GET /api/{slug}/availability?date=2024-01-15` - Get available slots
- `POST /api/{slug}/book` - Book appointment

### Protected (PIN Required)
- `GET /api/dashboard/{slug}?pin=1234` - Get dashboard data
- `GET /api/dashboard/{slug}/appointments?pin=1234` - Get appointments
- `GET /api/dashboard/{slug}/customers?pin=1234` - Get customers

---

## 🔒 Security

- ✅ PIN-based dashboard authentication (4-digit)
- ✅ CORS restricted to allowed origins
- ✅ SQL injection prevention (parameterized queries)
- ✅ Unique constraint prevents double-booking
- ✅ Customer email deduplication

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
