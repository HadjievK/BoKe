# BuKe MVP - Quick Start Guide

## Prerequisites

Before starting, make sure you have:
- Python 3.10 or higher
- Node.js 18 or higher
- PostgreSQL database (Supabase recommended)
- Git

## Step-by-Step Setup

### 1. Clone/Navigate to Project
```bash
cd /path/to/BoKe
```

### 2. Set Up Database (Supabase)

1. Create a free account at https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy your connection string (it looks like: `postgresql://postgres:[password]@[host]:5432/postgres`)
5. Run the schema:
   - Go to SQL Editor in Supabase
   - Paste the contents of `backend/app/database/schema.sql`
   - Click "Run"

### 3. Set Up Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your Supabase connection string
# DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```

### 4. Set Up Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local
cp .env.local.example .env.local

# The default API URL (http://localhost:8000) should work
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app/main.py
```

You should see:
```
✅ Database connection pool initialized
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000
```

### 6. Test the Application

1. Open browser to http://localhost:3000
2. Fill out the registration form
3. You'll receive a slug and PIN
4. Visit your booking page at http://localhost:3000/{your-slug}
5. Try booking an appointment
6. Access dashboard at http://localhost:3000/dashboard/{your-slug}

### 7. Test with Sample Data

The schema includes sample data:
- Slug: `karloscuts`
- PIN: `1234`
- Visit: http://localhost:3000/karloscuts
- Dashboard: http://localhost:3000/dashboard/karloscuts (PIN: 1234)

## Troubleshooting

### Backend won't start
- Check that DATABASE_URL in `.env` is correct
- Make sure PostgreSQL is accessible
- Try running schema.sql again

### Frontend won't start
- Run `npm install` again
- Delete `node_modules` and `.next` folders, then `npm install`
- Check that NEXT_PUBLIC_API_URL in `.env.local` is correct

### Database connection error
- Verify your Supabase credentials
- Check if your IP is allowed in Supabase settings
- Try pinging the database host

### Port already in use
- Backend: Change PORT in backend/.env
- Frontend: Run `npm run dev -- -p 3001` to use different port

## Verification Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:8000/docs (API documentation)
- [ ] Can access http://localhost:3000 (landing page)
- [ ] Can register a new barber
- [ ] Can access barber profile page
- [ ] Can book an appointment
- [ ] Can access dashboard with PIN
- [ ] Appointments show in dashboard

## Next Steps

Once everything is working:

1. **Customize Design**: Update colors in `frontend/tailwind.config.js`
2. **Add Services**: Test with different service types
3. **Deploy**: Follow deployment instructions in main README.md
4. **Feedback**: Test with real users and iterate

## Getting Help

- Check API docs at http://localhost:8000/docs
- Review code comments
- Check browser console for errors
- Check terminal logs for backend errors

## Quick Commands Reference

```bash
# Start backend
cd backend && source venv/bin/activate && python app/main.py

# Start frontend
cd frontend && npm run dev

# Run database migrations
psql $DATABASE_URL -f backend/app/database/schema.sql

# Reset database (careful!)
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql $DATABASE_URL -f backend/app/database/schema.sql
```

Good luck! 🚀
