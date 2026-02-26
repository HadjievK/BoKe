# BuKe System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CUSTOMERS                            │
│                    (No account needed)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Visit booking link
                       │ (buke.app/barberslug)
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js 14)                      │
│                   Hosted on Vercel                           │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Landing    │  │   Barber     │  │   Booking    │      │
│  │     Page     │  │   Profile    │  │     Flow     │      │
│  │              │  │              │  │              │      │
│  │ Registration │  │  Services    │  │  Calendar    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Success    │  │  Dashboard   │                        │
│  │     Page     │  │ (PIN-locked) │                        │
│  └──────────────┘  └──────────────┘                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS/JSON
                       │ API Calls
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                          │
│                  Hosted on Railway                           │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   API Routes                          │  │
│  │  • POST /api/onboard                                 │  │
│  │  • GET  /api/barber/{slug}                          │  │
│  │  • GET  /api/{slug}/availability                    │  │
│  │  • POST /api/{slug}/book                            │  │
│  │  • GET  /api/dashboard/{slug}?pin=XXXX             │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                Business Logic Layer                   │  │
│  │  • Slug generation                                   │  │
│  │  • PIN generation                                    │  │
│  │  • Availability calculation                          │  │
│  │  • Conflict detection                                │  │
│  │  • Customer deduplication                            │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ PostgreSQL
                       │ Connection Pool
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                DATABASE (PostgreSQL)                         │
│                  Hosted on Supabase                          │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   barbers    │  │   services   │  │  customers   │      │
│  │              │  │              │  │              │      │
│  │  • slug      │  │  • name      │  │  • email     │      │
│  │  • name      │  │  • price     │  │  • phone     │      │
│  │  • email     │  │  • duration  │  │  • name      │      │
│  │  • pin       │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │appointments  │  │ availability │                        │
│  │              │  │              │                        │
│  │  • date      │  │  • day_of_   │                        │
│  │  • time      │  │    week      │                        │
│  │  • status    │  │  • hours     │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow: Customer Books Appointment

```
1. Customer visits /karloscuts
        ↓
2. Frontend fetches barber profile
   GET /api/barber/karloscuts
        ↓
3. Backend queries barbers + services tables
        ↓
4. Returns: barber info + services list
        ↓
5. Customer selects "Classic Cut" service
        ↓
6. Customer picks date: "March 1, 2026"
        ↓
7. Frontend requests available slots
   GET /api/karloscuts/availability?date=2026-03-01
        ↓
8. Backend:
   - Finds barber's availability for that day
   - Generates all possible time slots
   - Checks existing appointments
   - Marks overlapping slots as unavailable
        ↓
9. Returns: [{time: "10:00", available: true}, ...]
        ↓
10. Customer selects time: "10:00 AM"
        ↓
11. Customer fills form:
    - First Name: John
    - Last Name: Doe
    - Email: john@example.com
    - Phone: 555-1234
        ↓
12. Frontend sends booking request
    POST /api/karloscuts/book
    {
      service_id: "...",
      appointment_date: "2026-03-01",
      appointment_time: "10:00",
      customer: {email, name, phone}
    }
        ↓
13. Backend validates:
    - Service exists
    - Slot still available
    - Date not in past
        ↓
14. Backend creates/finds customer by email
        ↓
15. Backend creates appointment
    (Unique constraint prevents double booking)
        ↓
16. Returns: Booking confirmation with details
        ↓
17. Frontend shows success screen
```

## Data Flow: Barber Checks Dashboard

```
1. Barber visits /dashboard/karloscuts
        ↓
2. Frontend shows PIN entry screen
        ↓
3. Barber enters PIN: "1234"
        ↓
4. Frontend sends dashboard request
   GET /api/dashboard/karloscuts?pin=1234
        ↓
5. Backend validates PIN
        ↓
6. Backend queries:
   - Today's appointments count
   - This week's appointments count
   - Total unique customers
   - Today's appointments with details
   - Recent customers
        ↓
7. Returns: Dashboard data object
        ↓
8. Frontend displays:
   - Stats cards (4 metrics)
   - Today's appointments list
   - Recent customers list
        ↓
9. Barber sees John Doe's 10:00 AM appointment
```

## Multi-Tenancy Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Single Database                           │
│                                                               │
│  Tenant 1: karloscuts                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ barber: Karlos | slug: karloscuts | pin: 1234      │   │
│  │ services: Classic Cut, Fade                          │   │
│  │ appointments: John Doe @ 10:00                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Tenant 2: sallynails                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ barber: Sally | slug: sallynails | pin: 5678       │   │
│  │ services: Manicure, Pedicure                         │   │
│  │ appointments: Jane Smith @ 14:00                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  All queries filtered by barber_id for data isolation        │
└─────────────────────────────────────────────────────────────┘
```

## Availability Calculation Algorithm

```python
def get_available_slots(barber_id, date, service_duration):
    # 1. Get day of week (0=Mon, 6=Sun)
    day_of_week = date.weekday()

    # 2. Get barber's hours for this day
    availability = db.query(
        "SELECT start_time, end_time, slot_duration
         FROM availability
         WHERE barber_id = ? AND day_of_week = ?"
    )

    # If no availability, return empty
    if not availability:
        return []

    # 3. Generate all possible slots
    slots = []
    current_time = start_time
    while current_time + service_duration <= end_time:
        slots.append({
            'time': current_time,
            'available': True
        })
        current_time += slot_duration

    # 4. Get existing appointments for this date
    appointments = db.query(
        "SELECT appointment_time, duration
         FROM appointments
         WHERE barber_id = ? AND appointment_date = ?"
    )

    # 5. Mark slots as unavailable if they overlap
    for slot in slots:
        for appointment in appointments:
            if times_overlap(slot.time, service_duration,
                           appointment.time, appointment.duration):
                slot['available'] = False

    # 6. Filter out past slots if today
    if date == today:
        slots = [s for s in slots if s.time > current_time]

    return slots
```

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                     Public Endpoints                         │
│                   (No authentication)                         │
│                                                               │
│  • GET  /api/barber/{slug}           ← Anyone can view       │
│  • GET  /api/{slug}/services         ← Public profile        │
│  • GET  /api/{slug}/availability     ← See available times   │
│  • POST /api/{slug}/book             ← Book appointment      │
│  • POST /api/onboard                 ← Register barber       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Protected Endpoints                         │
│                (PIN authentication)                          │
│                                                               │
│  • GET /api/dashboard/{slug}?pin=1234  ← Verify PIN          │
│  • GET /api/dashboard/{slug}/appointments?pin=1234           │
│  • GET /api/dashboard/{slug}/customers?pin=1234              │
│                                                               │
│  Note: PIN stored in database (plain text for MVP)           │
│  Future: Hash with bcrypt                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Security Measures                         │
│                                                               │
│  ✅ SQL Injection:  Parameterized queries                   │
│  ✅ XSS:            React auto-escapes                       │
│  ✅ CSRF:           Not applicable (no cookies)              │
│  ✅ CORS:           Configured origins                       │
│  ✅ Input:          Pydantic validation                      │
│  ✅ Race:           Unique index on slots                    │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema Visual

```
┌─────────────────────┐
│      barbers        │ ← Main tenant table
├─────────────────────┤
│ id (PK)            │
│ slug (UNIQUE)      │ ← URL identifier
│ name               │
│ business_name      │
│ email (UNIQUE)     │
│ phone              │
│ pin                │ ← Dashboard access
│ theme_config       │ ← Future: custom colors
│ created_at         │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│     services        │ ← What barber offers
├─────────────────────┤
│ id (PK)            │
│ barber_id (FK)     │
│ name               │
│ duration           │ ← Minutes
│ price              │ ← Decimal
│ icon               │ ← Emoji
│ is_active          │
└─────────────────────┘

┌─────────────────────┐
│    availability     │ ← Weekly schedule
├─────────────────────┤
│ id (PK)            │
│ barber_id (FK)     │
│ day_of_week        │ ← 0-6 (Mon-Sun)
│ start_time         │ ← 09:00
│ end_time           │ ← 17:00
│ slot_duration      │ ← 30 min default
└─────────────────────┘

┌─────────────────────┐
│     customers       │ ← No login needed
├─────────────────────┤
│ id (PK)            │
│ email              │
│ first_name         │
│ last_name          │
│ phone              │
│ created_at         │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│   appointments      │ ← Booked slots
├─────────────────────┤
│ id (PK)            │
│ barber_id (FK)     │ ─┐
│ customer_id (FK)   │  │ ← Unique constraint
│ service_id (FK)    │  │   on (barber_id,
│ appointment_date   │ ─┤   date, time)
│ appointment_time   │ ─┘   prevents double
│ duration           │      booking
│ price              │
│ customer_notes     │
│ status             │ ← confirmed/cancelled
│ created_at         │
└─────────────────────┘
```

## Component Hierarchy

```
Frontend Structure:

App (Next.js)
│
├── / (Landing Page)
│   └── RegistrationForm
│       ├── ServiceTypeSelector
│       ├── BasicInfoInputs
│       └── ServiceInputs (dynamic array)
│
├── /success (Success Page)
│   ├── PublicUrlDisplay
│   ├── PinDisplay
│   └── NextStepsGuide
│
├── /[slug] (Barber Profile)
│   ├── HeroSection
│   ├── BioSection
│   └── ServicesGrid
│       └── ServiceCard (reusable)
│
├── /[slug]/book (Booking Flow)
│   ├── ProgressSteps
│   ├── ServiceSelection
│   │   └── ServiceCard (reusable)
│   ├── DateTimeSelection
│   │   ├── CalendarPicker
│   │   └── TimeSlotGrid
│   ├── CustomerDetailsForm
│   │   └── CustomerForm
│   └── ConfirmationScreen
│
└── /dashboard/[slug] (Dashboard)
    ├── PinEntryScreen
    └── DashboardView
        ├── StatsCards (4)
        ├── AppointmentsList
        │   └── AppointmentCard
        └── RecentCustomersList
            └── CustomerCard
```

## API Response Examples

### GET /api/barber/karloscuts
```json
{
  "id": "uuid",
  "slug": "karloscuts",
  "name": "Karlos Johnson",
  "business_name": "King's Cuts",
  "email": "karlos@kingscuts.com",
  "phone": "+1-555-0123",
  "location": "123 Main St, Brooklyn, NY",
  "bio": "Master barber with 10+ years...",
  "services": [
    {
      "id": "uuid",
      "name": "Classic Cut",
      "duration": 30,
      "price": 35.00,
      "icon": "✂️"
    }
  ]
}
```

### GET /api/karloscuts/availability?date=2026-03-01
```json
{
  "date": "2026-03-01",
  "slots": [
    {"time": "09:00", "available": true},
    {"time": "09:30", "available": true},
    {"time": "10:00", "available": false},
    {"time": "10:30", "available": true}
  ]
}
```

### POST /api/karloscuts/book
```json
{
  "appointment": {
    "id": "uuid",
    "appointment_date": "2026-03-01",
    "appointment_time": "10:00:00",
    "duration": 30,
    "price": 35.00,
    "customer": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "555-1234"
    },
    "service": {
      "name": "Classic Cut",
      "price": 35.00
    }
  },
  "message": "Booking confirmed successfully!"
}
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         INTERNET                             │
└──────────────────┬──────────────────┬───────────────────────┘
                   │                  │
         ┌─────────▼────────┐ ┌──────▼──────────┐
         │   Vercel CDN     │ │  Railway CDN     │
         │  (Frontend)      │ │  (Backend)       │
         │                  │ │                  │
         │  buke.app        │ │  api.buke.app    │
         │  ↓               │ │  ↓               │
         │  Next.js SSR     │ │  FastAPI         │
         │  Edge Functions  │ │  Python 3.11     │
         └──────────────────┘ └──────┬───────────┘
                                     │
                         ┌───────────▼──────────┐
                         │  Supabase Cloud      │
                         │  (Database)          │
                         │                      │
                         │  PostgreSQL 15       │
                         │  Auto backups        │
                         │  Connection pooling  │
                         └──────────────────────┘

Cost:
- Vercel:   $0/month (free tier)
- Railway:  $5/month (starter)
- Supabase: $0/month (free tier)
────────────────────────────
Total:      $5/month
```

---

**This architecture supports:**
- ✅ Multi-tenancy (unlimited barbers)
- ✅ Concurrent bookings (race condition safe)
- ✅ Sub-second response times
- ✅ Mobile + desktop
- ✅ Horizontal scaling ready
