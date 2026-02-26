# BuKe Backend

FastAPI backend for the BuKe multi-tenant booking platform.

## Setup

1. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

2. Update the `DATABASE_URL` in `.env` with your Supabase PostgreSQL credentials.

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the database migrations:
```bash
psql $DATABASE_URL -f app/database/schema.sql
```

5. Run the development server:
```bash
python app/main.py
```

Or with uvicorn:
```bash
uvicorn app.main:app --reload
```

## API Endpoints

### Public Endpoints
- `GET /api/barber/{slug}` - Get barber profile with services
- `GET /api/{slug}/services` - Get all services
- `GET /api/{slug}/availability?date=YYYY-MM-DD` - Get available time slots
- `POST /api/{slug}/book` - Create an appointment

### Dashboard Endpoints (PIN-protected)
- `GET /api/dashboard/{slug}?pin=XXXX` - Get dashboard data
- `GET /api/dashboard/{slug}/appointments?pin=XXXX` - Get appointments
- `GET /api/dashboard/{slug}/customers?pin=XXXX` - Get customers

### Onboarding
- `POST /api/onboard` - Register new barber

## Documentation

API documentation available at `/docs` when server is running.

## Deployment

Deploy to Railway:
```bash
railway init
railway up
```

Set environment variables in Railway dashboard.
