# BuKe - Simple Booking Platform MVP

A multi-tenant booking platform for service providers (barbers, dentists, nail artists, etc.) with registration and calendar functionality.

## Project Structure

```
BoKe/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── database/     # Database schema and connection
│   │   ├── models/       # Pydantic models
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   └── main.py       # FastAPI app
│   └── requirements.txt
│
└── frontend/             # Next.js 14 frontend
    ├── app/              # App router pages
    ├── components/       # React components
    ├── lib/              # Utilities and API client
    └── package.json
```

## Features

### MVP Scope
- ✅ Service provider registration with unique booking link
- ✅ Public booking page for customers
- ✅ Calendar and time slot availability
- ✅ Appointment booking (no customer accounts required)
- ✅ Barber dashboard (PIN-protected)
- ✅ Multi-service support
- ✅ Responsive design

### Explicitly NOT in MVP
- ❌ Email/SMS notifications
- ❌ Payment processing
- ❌ Customer accounts
- ❌ Rescheduling/cancellation
- ❌ Reviews
- ❌ Multiple staff per business

## Tech Stack

**Backend:**
- FastAPI (Python)
- PostgreSQL (Supabase)
- psycopg2 for database

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React hooks

**Hosting:**
- Backend: Railway ($5/mo)
- Frontend: Vercel (free)
- Database: Supabase (free tier)

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL database (Supabase recommended)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment and install dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:
```
DATABASE_URL=postgresql://user:password@host:5432/database
ENVIRONMENT=development
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000
```

5. Run database migrations:
```bash
psql $DATABASE_URL -f app/database/schema.sql
```

6. Start the server:
```bash
python app/main.py
```

API will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

4. Update `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

5. Start the development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Usage Flow

### 1. Provider Registration
1. Visit `http://localhost:3000`
2. Fill out registration form with:
   - Service type (barber, dentist, etc.)
   - Name and business name
   - Email and phone
   - Location and bio
   - Services (name, duration, price)
3. Submit to receive:
   - Unique slug (e.g., `karloscuts`)
   - 4-digit PIN for dashboard
   - Public booking URL

### 2. Customer Booking
1. Visit `http://localhost:3000/{slug}` (e.g., `/karloscuts`)
2. View barber profile and services
3. Click "Book" on a service
4. Select date from calendar
5. Choose available time slot
6. Enter contact details (no account needed)
7. Confirm booking

### 3. Barber Dashboard
1. Visit `http://localhost:3000/dashboard/{slug}`
2. Enter 4-digit PIN
3. View:
   - Today's appointments
   - Weekly stats
   - Total customers
   - Recent customers

## API Endpoints

### Public Endpoints
```
GET  /api/barber/{slug}               - Get barber profile with services
GET  /api/{slug}/services             - Get all services
GET  /api/{slug}/availability?date=   - Get available time slots
POST /api/{slug}/book                 - Create appointment
```

### Dashboard Endpoints (PIN-protected)
```
GET /api/dashboard/{slug}?pin=        - Get dashboard data
GET /api/dashboard/{slug}/appointments?pin= - Get appointments
GET /api/dashboard/{slug}/customers?pin=    - Get customers
```

### Onboarding
```
POST /api/onboard                     - Register new barber
```

## Database Schema

### Tables
- `barbers` - Service providers (tenants)
- `services` - Services offered by each barber
- `customers` - Customer contact info
- `appointments` - Booked appointments
- `availability` - Weekly recurring availability schedule

### Key Features
- Multi-tenancy via `barber_id`
- Unique constraint on appointment slots (prevents double booking)
- Cascade deletes for data integrity
- Indexes for performance

## Testing

### Backend Testing
Use the sample data included in `schema.sql`:
- Slug: `karloscuts`
- PIN: `1234`
- Services: Classic Cut, Fade, Beard Trim

### Manual Testing Checklist
- [ ] Register new barber
- [ ] View barber profile page
- [ ] Book an appointment
- [ ] Try booking same slot twice (should fail)
- [ ] Access dashboard with PIN
- [ ] View appointments in dashboard
- [ ] Try wrong PIN (should fail)

## Deployment

### Backend (Railway)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables in Railway dashboard
DATABASE_URL=postgresql://...
ENVIRONMENT=production
```

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variable in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
```

## Future Enhancements (Post-MVP)

**Phase 2:**
- Email confirmations
- SMS reminders
- Customer rescheduling
- Block time off
- Custom domains

**Phase 3:**
- Payment processing
- Review system
- Customer accounts
- Analytics
- Mobile app

## License

MIT

## Support

For issues and questions, open an issue on GitHub.
