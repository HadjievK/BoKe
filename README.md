# BuKe - Modern Booking Platform

Beautiful, simple booking pages for service professionals. Barbers, dentists, trainers, and more can create their booking page in 5 minutes.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your database credentials

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Supabase)
- **Calendar**: React-Day-Picker v9
- **Deployment**: Vercel

## Features

- 🎨 Beautiful, theme-customizable provider pages
- 📅 Integrated calendar and booking flow (no page transitions)
- 🔐 Password-protected provider dashboards
- 📊 Real-time appointment management
- 📱 Fully responsive design
- ♿ Accessible components
- 🌙 Light/Dark mode support

## Project Structure

```
BoKe/
├── app/                      # Next.js 15 app directory
│   ├── [slug]/              # Dynamic provider pages
│   │   ├── page.tsx         # Provider home & booking (all-in-one)
│   │   └── book/            # Legacy separate booking page
│   ├── dashboard/           # Provider dashboards
│   ├── api/                 # API routes
│   └── page.tsx             # Landing & onboarding
├── components/              # Reusable React components
│   ├── booking/             # Booking flow components
│   └── ThemeToggle.tsx      # Theme switcher
├── lib/                     # Utilities and types
│   ├── api.ts              # API client functions
│   ├── db.ts               # Database connection
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Utility functions
└── docs/                    # Documentation
    ├── database_schema.sql  # Database structure
    └── *.md                # Technical documentation
```

## Environment Variables

Create a `.env.local` file with:

```env
# Database (Supabase PostgreSQL)
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NO_SSL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

## Database Setup

1. Create a Supabase project or PostgreSQL database
2. Run the schema in `docs/database_schema.sql`
3. Update your `.env.local` with connection strings

## Key Features Explained

### Single-Page Booking Flow
The entire booking experience happens on one page without routing:
1. Customer selects a service → calendar appears below
2. Picks a date → time slots appear
3. Picks a time → customer form appears
4. Submits → success confirmation
5. "Book Another" resets the flow

### Provider Dashboard
- Password-protected access via `/dashboard/[slug]`
- View today's appointments
- Week/month calendar views
- Customer management
- Settings (services, location, availability)

### Theme System
- Each provider can customize colors
- CSS variables for easy theming
- Persisted in database
- Real-time theme switching

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

## Deployment

Deployed on Vercel with automatic deployments on push to `main`.

**Live URL**: [https://boke-brown-ten.vercel.app](https://boke-brown-ten.vercel.app)

## Documentation

See `/docs` folder for detailed documentation:
- Database schema and setup
- Theme system guide
- Booking flow implementation
- Deployment guide

## License

Proprietary - All rights reserved
