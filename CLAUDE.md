# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BuKe** is a modern booking platform for service professionals (barbers, dentists, trainers, etc.). Key characteristics:
- Next.js 15 with App Router and TypeScript
- Single-page booking flow (no page transitions during booking)
- Stateless customer bookings with magic link tokens (no passwords)
- Provider authentication with 7-day JWT
- Email notifications via Resend (transactional emails)
- PostgreSQL via Supabase with direct `pg` Pool queries (no ORM)
- Deployed on Vercel

## Development Commands

```bash
# Start development server
npm run dev

# Build for production (runs type checking and linting)
npm run build

# Production server (run build first)
npm start

# Lint only
npm run lint
```

## Database Architecture

### Connection Pattern
Database queries use `pool.query()` from `lib/db.ts`:

```typescript
import pool from '@/lib/db'

const result = await pool.query(
  'SELECT * FROM table WHERE id = $1',
  [id]
)
```

**Critical**: Always use `pool` (default export), NOT `query` (doesn't exist). Use parameterized queries (`$1`, `$2`) to prevent SQL injection.

### Schema Management
- Base schema: `docs/database_schema.sql`
- Migrations: `migrations/*.sql` (manually run against database)
- Core tables: `service_providers`, `appointments`, `booking_tokens`, `customers` (legacy)
- Inline customer data: Customer information stored directly on appointments (email, first_name, last_name, phone)
- Authentication fields:
  - Providers: `password` (bcrypt), `oauth_provider`, `oauth_provider_id`

### Key Indexes
```sql
-- Already exist, don't recreate:
idx_appointments_provider_date (provider_id, appointment_date)
idx_customers_email (email)
idx_service_providers_slug (slug)
```

## Authentication System

### Provider Authentication
- Location: `lib/auth.ts` - `generateToken()`, `authenticateRequest()`
- Token: 7-day expiration
- Storage: `localStorage` key `auth_token` + HTTP-only cookie
- Payload: `{ providerId, slug, email }`
- Protected routes: `/dashboard/[slug]/*`, `/api/dashboard/*`

### Customer Booking Access (Stateless)
- **No passwords, no signup, no authentication**
- Magic link tokens sent via email after booking
- Token format: 64-character cryptographically secure hex string
- Token expiration: 24 hours after appointment time
- Token storage: `booking_tokens` table linked to appointments
- Access: `/[slug]/booking/[token]` - view details, cancel, reschedule
- Email service: Resend (see `docs/EMAIL_SETUP.md` for configuration)

### Password Handling
- Hashing: bcrypt with 10 rounds (`bcryptjs` library)
- Validation: Minimum 8 characters (enforce on frontend AND backend)

## API Route Patterns

### Standard Response Format
```typescript
// Success
return NextResponse.json({ data, message }, { status: 200 })

// Error
return NextResponse.json({ error: 'Message' }, { status: 400/401/404/500 })
```

### Authentication Flow
```typescript
export async function POST(request: NextRequest) {
  // 1. Authenticate
  const auth = authenticateRequest(request) // or authenticateCustomer()
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Validate input
  const body = await request.json()

  // 3. Database query with parameterized values
  const result = await pool.query('SELECT ...', [auth.providerId])

  // 4. Return response
  return NextResponse.json({ data: result.rows })
}
```

### Dynamic Route Parameters
```typescript
// app/api/[slug]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  // ...
}
```

## Type System

### Centralized Types
All shared types in `lib/types.ts`. **Never duplicate inline types** - always import:

```typescript
import {
  AppointmentWithDetails,
  AppointmentStatus,
  AppointmentStatusType,
  CustomerBookingsResponse,
  Service,
  CustomerPublic
} from '@/lib/types'
```

### Status Constants
Use `AppointmentStatus` enum instead of string literals:

```typescript
// ✅ Correct
if (appointment.status === AppointmentStatus.CONFIRMED) { }

// ❌ Wrong
if (appointment.status === 'confirmed') { }
```

### Type Definition Pattern
```typescript
// Status enum
export const AppointmentStatus = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
} as const

export type AppointmentStatusType = typeof AppointmentStatus[keyof typeof AppointmentStatus]
```

## Frontend Architecture

### Booking Flow (Single-Page)
The entire booking happens on `/[slug]/page.tsx` without navigation:

1. **Service Selection** → Calendar appears
2. **Date Selection** → Time slots load (via `getAvailability()`)
3. **Time Selection** → Customer form slides in
4. **Form Submit** → Inline success confirmation
5. **"Book Another"** → Resets to step 1

State managed via `bookingStep: 'select-datetime' | 'enter-details' | 'success'`

### Component Organization
- `components/booking/` - Booking flow components (CalendarPicker, TimeSlotGrid, CustomerForm)
- `components/ui/` - Shadcn-style reusable components (Button, etc.)
- Page-level components should be client components (`'use client'`)

### Data Fetching Pattern
```typescript
// lib/api.ts - centralized API client
export async function getProviderProfile(slug: string) {
  const response = await fetch(`/api/${slug}`)
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

// In component
const [data, setData] = useState(null)
useEffect(() => {
  getProviderProfile(slug).then(setData)
}, [slug])
```

### Authentication State Management
Customer auth uses localStorage directly (no context/hooks yet):

```typescript
// Store token after login
localStorage.setItem('customer_token', data.token)

// Use in API calls
fetch('/api/[slug]/my-bookings', {
  headers: { 'Authorization': `Bearer ${token}` }
})

// Clear on logout
localStorage.removeItem('customer_token')
```

## Styling Patterns

### Tailwind Configuration
- Dark mode: `class` strategy (toggle via `ThemeToggle.tsx`)
- Custom colors defined in `tailwind.config.ts`
- Font: 'DM Sans' as primary, with system fallbacks

### Color Patterns
```typescript
// Status colors
const getStatusColor = (status: AppointmentStatusType) => {
  switch (status) {
    case AppointmentStatus.CONFIRMED: return 'bg-purple-100 text-purple-800'
    case AppointmentStatus.CANCELLED: return 'bg-gray-100 text-gray-800'
    case AppointmentStatus.COMPLETED: return 'bg-green-100 text-green-800'
  }
}
```

## Common Patterns

### Date/Time Handling
Use utilities from `lib/utils.ts`:

```typescript
import { formatDate, formatTime, formatDateISO } from '@/lib/utils'

formatDate(date)        // "Monday, January 15, 2024"
formatTime("14:30:00")  // "2:30 PM"
formatDateISO(date)     // "2024-01-15" for database
```

### Email Validation
```typescript
import { validateEmail } from '@/lib/utils'

if (!validateEmail(email)) {
  return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
}
```

### Navigation
Always use Next.js `<Link>` for internal navigation (not `<a>` tags):

```typescript
import Link from 'next/link'

<Link href={`/${slug}/my-bookings`}>My Bookings</Link>
```

## Performance Guidelines

### API Optimization
- **Don't verify auth separately** if the main endpoint already authenticates
- **Update state locally** after mutations instead of refetching
- **Avoid N+1 queries** - use JOINs to fetch related data in one query

### Database Queries
```typescript
// ✅ Good - query with inline customer fields
const result = await pool.query(`
  SELECT
    a.*,
    a.customer_email,
    a.customer_first_name,
    a.customer_last_name,
    a.customer_phone
  FROM appointments a
  WHERE a.provider_id = $1
`, [providerId])

// ✅ Good - backward compatible with LEFT JOIN for old appointments
const result = await pool.query(`
  SELECT
    a.*,
    COALESCE(a.customer_email, c.email) as customer_email,
    COALESCE(a.customer_first_name, c.first_name) as customer_first_name,
    COALESCE(a.customer_last_name, c.last_name) as customer_last_name,
    COALESCE(a.customer_phone, c.phone) as customer_phone
  FROM appointments a
  LEFT JOIN customers c ON a.customer_id = c.id
  WHERE a.provider_id = $1
`, [providerId])

// ❌ Bad - N+1 pattern
const appointments = await pool.query('SELECT * FROM appointments WHERE provider_id = $1', [providerId])
for (const apt of appointments.rows) {
  const customer = await pool.query('SELECT * FROM customers WHERE id = $1', [apt.customer_id])
}
```

### Frontend Optimization
- Memoize expensive calculations with `useMemo`
- Wrap callbacks in `useCallback` when passed to child components
- Avoid inline object/function creation in render

## Security Requirements

### Input Validation
Always validate on both frontend (UX) and backend (security):
- Email format
- Password length (minimum 8 characters)
- Required fields presence
- SQL injection prevention via parameterized queries

### Authorization Checks
```typescript
// Always verify ownership
const appointment = await pool.query(
  'SELECT * FROM appointments WHERE id = $1 AND customer_id = $2',
  [appointmentId, customerAuth.customerId]
)

if (appointment.rows.length === 0) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
```

### Environment Variables
Required in `.env.local`:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for signing provider tokens (must be strong in production)
- `RESEND_API_KEY` - Resend API key for sending emails (see `docs/EMAIL_SETUP.md`)
- `FROM_EMAIL` - Email address for sending booking confirmations (must be from verified domain)
- `NEXT_PUBLIC_BASE_URL` - Base URL for magic links (e.g., `http://localhost:3000` or `https://yourdomain.com`)

**Note:** App will build successfully without `RESEND_API_KEY` - email sending will be gracefully skipped.

## Testing Strategy

No automated tests currently. Manual testing checklist:

### Provider Flow
1. Sign up at `/` (onboarding)
2. Dashboard at `/dashboard/[slug]` (view appointments, settings)
3. Public booking page at `/[slug]` (customer-facing)

### Customer Booking Flow
1. Book appointment at `/[slug]`
2. Receive confirmation email with magic link
3. Access booking via email link: `/[slug]/booking/[token]`
4. View details, cancel, or reschedule from booking page
5. No signup, no passwords, no authentication required

## Common Pitfalls

1. **Using `query` instead of `pool.query()`** - Will cause "not exported" error
2. **Inline type definitions** - Always import from `lib/types.ts`
3. **String status literals** - Use `AppointmentStatus.CONFIRMED` constants
4. **Using `<a>` tags** - Use Next.js `<Link>` component
5. **Duplicate API calls** - Update state locally after mutations
6. **Missing error handling** - Always handle fetch/query errors

## Deployment

- Platform: Vercel
- Auto-deploy: Pushes to `main` branch
- Environment variables set in Vercel dashboard
- Database: Supabase PostgreSQL (connection pooling enabled)

## Project-Specific Notes

- **No service_id normalization**: Services stored as JSONB in provider record, referenced by string ID in appointments
- **Slug-based routing**: All provider pages use slug (e.g., `/john-smith-barber`)
- **Theme customization**: Each provider can set custom colors (stored in `theme_config` JSONB)
- **Working hours**: Configurable per provider with day-specific availability
