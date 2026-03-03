# BuKe - Modern Booking Platform

Beautiful, simple booking pages for service professionals. Barbers, dentists, trainers, and more can create their booking page in 5 minutes.

**Live URL**: [https://boke-brown-ten.vercel.app](https://boke-brown-ten.vercel.app)

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env.local

# Run database migrations
# Execute SQL files in migrations/ directory sequentially

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📚 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Key Features](#key-features-explained)
- [API Routes](#api-routes)
- [Development](#development)
- [Deployment](#deployment)
- [Documentation](#documentation)

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Framer Motion |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | Custom JWT (7-day expiration) |
| **Email** | Resend (transactional emails) |
| **Calendar** | React-Day-Picker v9 + React-Big-Calendar |
| **Deployment** | Vercel |
| **Maps** | Google Maps API |

---

## ✨ Features

### For Service Providers
- 🎨 **Customizable Booking Pages** - Theme colors, cover photos, business info
- 📅 **Appointment Management** - Real-time calendar with drag-and-drop
- 👥 **Customer Management** - View booking history and customer details
- ⚙️ **Flexible Settings** - Working hours, buffer times, service offerings
- 📊 **Dashboard Analytics** - Today's appointments, weekly stats
- 🔐 **Secure Access** - JWT authentication with 7-day sessions
- 📧 **Email Notifications** - Automatic booking confirmations via Resend

### For Customers
- 📱 **No Account Required** - Stateless booking with magic links
- ⚡ **Single-Page Flow** - Book without page transitions
- 📧 **Magic Link Access** - Manage bookings via email link (24h expiration)
- ✅ **Instant Confirmation** - Email sent immediately after booking
- 🔄 **Easy Cancellation** - Cancel via magic link, no login needed

### Technical Features
- 🌙 **Dark Mode** - System-based or manual toggle
- ♿ **Accessible** - WCAG-compliant components
- 📱 **Responsive** - Mobile-first design
- ⚡ **Fast** - Optimized builds with Next.js 15
- 🔒 **Secure** - Parameterized queries, JWT tokens, input validation

---

## 🏗 Architecture

### Authentication System

**Provider Authentication** (JWT):
- 7-day expiration tokens
- Stored in localStorage + HTTP-only cookies
- Protected routes: `/dashboard/[slug]/*`
- Implementation: `lib/auth.ts`

**Customer Access** (Stateless Magic Links):
- No passwords, no signup required
- Token-based access via email
- 24-hour expiration after appointment
- Format: `/[slug]/booking/[token]`

### Database Schema

**Core Tables**:
- `service_providers` - Provider profiles, services (JSONB), OAuth fields
- `appointments` - Bookings with inline customer data (no FK to customers)
- `booking_tokens` - Magic link tokens for customer access
- `customers` - Legacy table (for backward compatibility)

**Key Design Decisions**:
- **Inline Customer Data**: Email, name, phone stored directly on appointments (no JOIN needed)
- **JSONB Services**: Services stored as JSON array in provider record
- **Magic Link Tokens**: Cryptographically secure 64-char hex strings
- **OAuth Ready**: Schema includes `oauth_provider` and `oauth_provider_id` fields

---

## 🔧 Environment Setup

Create `.env.local` with the following:

### Required Variables

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database"
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NO_SSL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."

# JWT Authentication
JWT_SECRET="your-strong-secret-key-here"  # Must be strong in production

# Email Service (Resend)
RESEND_API_KEY="re_..."  # Get from resend.com
FROM_EMAIL="bookings@yourdomain.com"  # Must be verified domain

# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"  # Or production URL

# Google Maps (Optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."  # For location autocomplete
```

### Optional Variables

```env
# Google reCAPTCHA (Optional)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="..."
RECAPTCHA_SECRET_KEY="..."
```

**Note:** App will build successfully without `RESEND_API_KEY` - email sending will be gracefully skipped in development.

---

## 💾 Database Setup

### Option 1: Fresh Setup

1. **Create Database**
   ```bash
   # Supabase: Create new project at supabase.com
   # Or use local PostgreSQL
   ```

2. **Run Master Schema**
   ```bash
   psql -U postgres -d your_database -f database_schema.sql
   ```

3. **Update Environment**
   ```bash
   # Add connection strings to .env.local
   ```

### Option 2: Migrations

If you have an existing database, run migrations in order:

```bash
# In migrations/ directory
001_add_oauth_support.sql        # OAuth provider fields
002_add_booking_tokens.sql       # Magic link token system
003_add_cover_photo.sql          # Provider cover photos
004_add_coordinates_to_providers.sql  # Google Maps lat/lng
```

### Database Connection

The app uses `pg` Pool for direct queries (no ORM):

```typescript
import pool from '@/lib/db'

const result = await pool.query(
  'SELECT * FROM service_providers WHERE slug = $1',
  [slug]
)
```

**Critical**: Always use parameterized queries (`$1`, `$2`) to prevent SQL injection.

---

## 🎯 Key Features Explained

### Single-Page Booking Flow

The entire booking happens on `/[slug]/page.tsx` without navigation:

1. **Select Service** → Calendar appears below
2. **Pick Date** → Time slots load via API
3. **Pick Time** → Customer form slides in
4. **Submit** → Success message with magic link
5. **"Book Another"** → Reset flow

**State Management**: `bookingStep: 'select-datetime' | 'enter-details' | 'success'`

### Magic Link Booking System

**How It Works**:
1. Customer books appointment
2. System generates 64-char secure token
3. Token stored in `booking_tokens` table
4. Email sent with link: `/[slug]/booking/[token]`
5. Customer can view/cancel via link
6. Token expires 24h after appointment

**Security**:
- Cryptographically secure: `crypto.randomBytes(32).toString('hex')`
- Rate limited: Max 20 requests per token
- Time-bound: Expires automatically
- One-time actions: Cancellation invalidates token

### Provider Dashboard

**Access**: `/dashboard/[slug]`

**Features**:
- 📊 Today's appointments + weekly stats
- 📅 Calendar view (day/week/month)
- 👥 Customer list with booking history
- ⚙️ Settings:
  - Account: Location, avatar, cover photo
  - Calendar: Working hours, slot duration, buffer time
  - Services: Add/edit/remove services (JSONB storage)

### Email Notifications

**Service**: Resend (see `EMAIL_SETUP.md` for complete guide)

**Email Types**:
1. **Booking Confirmation** - Sent immediately after booking
   - Booking details
   - Provider contact info
   - Magic link for management

2. **Cancellation Confirmation** - Sent when customer cancels
   - Cancelled booking details
   - Link to rebook

**Pricing** (Resend):
- Free: 3,000 emails/month
- Pro ($20/mo): 50,000 emails/month

### Theme System

**Customization**:
- Each provider has unique theme colors
- Stored in `theme_config` JSONB column
- CSS variables for real-time updates
- Defaults: Primary `#C9993A`, Secondary `#1C1812`

**Implementation**: See `THEME_SYSTEM.md`

### Calendar Integration

**Libraries Used**:
- **Booking Page**: React-Day-Picker v9 (date selection)
- **Dashboard**: React-Big-Calendar (appointment management)

**Features**:
- Real-time availability checking
- Configurable working hours and buffer times
- Day-specific availability
- Slot duration customization

**Implementation**: See `CALENDAR_INTEGRATION.md`

---

## 🌐 API Routes

### Public Routes (No Auth)

```
GET  /api/[slug]/profile              # Provider profile + services
GET  /api/[slug]/availability         # Available time slots for date
POST /api/[slug]/book                 # Create booking
GET  /api/[slug]/booking/[token]      # View booking via magic link
PATCH /api/[slug]/booking/[token]     # Cancel booking
```

### Protected Routes (JWT Required)

```
# Authentication
POST /api/signin                      # Provider login
POST /api/signout                     # Provider logout
POST /api/onboard                     # Provider registration
GET  /api/auth/verify                 # Verify JWT token

# Dashboard
GET  /api/dashboard/[slug]            # Dashboard overview data
PATCH /api/dashboard/[slug]           # Update provider settings
GET  /api/dashboard/[slug]/appointments       # List appointments
PATCH /api/dashboard/[slug]/appointments/[id] # Update appointment
GET  /api/dashboard/[slug]/customers          # List customers
POST /api/dashboard/[slug]/upload-photo       # Upload avatar/cover
```

### API Response Format

**Success**:
```json
{
  "data": { ... },
  "message": "Success message"
}
```

**Error**:
```json
{
  "error": "Error message"
}
```

**Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## 🔐 Security

### Authentication

- **Provider Auth**: JWT tokens with 7-day expiration
- **Password Hashing**: bcrypt with 10 rounds
- **Token Storage**: localStorage + HTTP-only cookies

### Input Validation

- Email format validation
- Password minimum 8 characters
- SQL injection prevention (parameterized queries)
- XSS protection (React escaping)

### Authorization

- Slug verification: Providers can only access their own data
- Token validation: Magic links expire after 24h
- Rate limiting: Max 20 requests per booking token

---

## 💻 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Type checking
npx tsc --noEmit

# Lint code
npm run lint
```

### File Structure

```
BoKe/
├── app/
│   ├── [slug]/
│   │   ├── page.tsx              # Provider booking page (main)
│   │   ├── booking/[token]/      # Magic link booking management
│   │   └── book/                 # Legacy separate booking page
│   ├── dashboard/[slug]/         # Provider dashboard
│   ├── api/                      # API routes
│   │   ├── [slug]/               # Public booking APIs
│   │   └── dashboard/[slug]/     # Protected provider APIs
│   ├── page.tsx                  # Landing + onboarding
│   └── signin/                   # Provider login
├── components/
│   ├── booking/                  # Booking flow components
│   ├── dashboard/                # Dashboard components
│   ├── ui/                       # Reusable UI components
│   └── ThemeProvider.tsx         # Dark mode provider
├── lib/
│   ├── api.ts                    # API client functions
│   ├── auth.ts                   # JWT authentication
│   ├── db.ts                     # Database connection
│   ├── types.ts                  # TypeScript definitions
│   └── utils.ts                  # Utility functions
├── migrations/                   # Database migrations
├── database_schema.sql           # Master database schema
├── CALENDAR_INTEGRATION.md       # Calendar docs
├── EMAIL_SETUP.md                # Email service guide
├── THEME_SYSTEM.md               # Theme system docs
└── CLAUDE.md                     # AI assistant instructions
```

### Common Patterns

**Date/Time Handling**:
```typescript
import { formatDate, formatTime, formatDateISO } from '@/lib/utils'

formatDate(date)        // "Monday, January 15, 2024"
formatTime("14:30:00")  // "2:30 PM"
formatDateISO(date)     // "2024-01-15" for database
```

**Authentication Check**:
```typescript
import { authenticateProviderBySlug } from '@/lib/auth'

const authResult = authenticateProviderBySlug(request, slug)
if (authResult instanceof NextResponse) return authResult
const { auth, providerId } = authResult
```

**Database Queries**:
```typescript
const result = await pool.query(
  'SELECT * FROM appointments WHERE provider_id = $1',
  [providerId]
)
```

---

## 🚀 Deployment

### Vercel (Production)

1. **Connect Repository**
   - Push to GitHub
   - Import project in Vercel dashboard

2. **Configure Environment**
   - Add all environment variables from `.env.local`
   - Ensure `DATABASE_URL` points to production database
   - Set `JWT_SECRET` to strong random value

3. **Deploy**
   ```bash
   git push origin main
   # Automatic deployment triggered
   ```

4. **Custom Domain** (Optional)
   - Add domain in Vercel dashboard
   - Update DNS records
   - Update `NEXT_PUBLIC_BASE_URL`

### Database (Supabase)

1. Create production project at supabase.com
2. Run `database_schema.sql` in SQL Editor
3. Enable connection pooling
4. Copy connection strings to Vercel environment variables

### Email Service (Resend)

1. Sign up at resend.com
2. Verify your domain
3. Get API key
4. Add to Vercel environment variables

---

## 📖 Documentation

### Core Documentation

- **`CLAUDE.md`** - Complete codebase guide for AI assistants
- **`database_schema.sql`** - Master database schema
- **`EMAIL_SETUP.md`** - Resend email service configuration
- **`CALENDAR_INTEGRATION.md`** - Calendar implementation guide
- **`THEME_SYSTEM.md`** - Theme customization system

### Migration Files

Located in `migrations/` directory:
- `001_add_oauth_support.sql` - OAuth provider fields
- `002_add_booking_tokens.sql` - Magic link system
- `003_add_cover_photo.sql` - Provider cover photos
- `004_add_coordinates_to_providers.sql` - Google Maps integration

---

## 🐛 Troubleshooting

### Build Errors

**Module not found errors**:
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues

**Can't connect to database**:
- Verify `DATABASE_URL` in `.env.local`
- Check Supabase connection pooler is enabled
- Ensure firewall allows connections

### Email Not Sending

**No emails received**:
- Verify `RESEND_API_KEY` is valid
- Check `FROM_EMAIL` domain is verified in Resend
- Look for errors in server logs
- Check spam folder

### Authentication Issues

**Token expired errors**:
- JWT tokens expire after 7 days
- Re-login required
- Check `JWT_SECRET` is set

---

## 📊 Performance

### Optimization Techniques

- **Server Components**: Most pages use React Server Components
- **Parallel Fetching**: `Promise.all` for concurrent API calls
- **Optimistic Updates**: Update UI before database confirmation
- **Image Optimization**: Base64 encoding for small images
- **Code Splitting**: Automatic via Next.js
- **Lazy Loading**: Calendar components loaded on demand

### Monitoring

- Vercel Analytics (built-in)
- Database query performance via Supabase dashboard
- Email delivery rates via Resend dashboard

---

## 🤝 Contributing

This is a proprietary project. For internal development:

1. Create feature branch: `git checkout -b feature/name`
2. Make changes and test locally
3. Run type checking: `npx tsc --noEmit`
4. Commit with clear message
5. Push and create pull request
6. Wait for review

---

## 📝 License

Proprietary - All rights reserved

---

## 🆘 Support

For issues or questions:
- Check existing documentation in this README
- Review `CLAUDE.md` for detailed implementation notes
- Check specific feature docs (`EMAIL_SETUP.md`, etc.)
- Review GitHub issues

---

## 🎉 Acknowledgments

Built with:
- Next.js 15
- React 18
- Tailwind CSS
- Framer Motion
- React-Day-Picker
- Supabase
- Resend
- Vercel

---

**Version**: 1.0.0
**Last Updated**: March 2026
