# BuKe Frontend

Next.js 14 frontend for the BuKe booking platform.

## Features

- **Landing Page** - Service provider registration
- **Success Page** - Display booking link and PIN
- **Barber Profile** - Public booking page for customers
- **Booking Flow** - Multi-step appointment booking
- **Dashboard** - PIN-protected dashboard for service providers

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Google Fonts (Playfair Display + Outfit)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Design System

### Colors
- Gold: `#B8860B` (primary)
- Cream: `#F8F5F0` (background)
- Ink: `#111111` (text)
- Success: `#2D7A4F` (confirmations)

### Fonts
- Display: Playfair Display (headings)
- Body: Outfit (text)

### Components
- `ServiceCard` - Display service info
- `CalendarPicker` - Date selection
- `TimeSlotGrid` - Time slot selection
- `CustomerForm` - Customer details form

## Routes

- `/` - Landing page (registration)
- `/success?slug=X&pin=Y` - Registration success
- `/[slug]` - Barber profile page
- `/[slug]/book` - Booking flow
- `/dashboard/[slug]` - Dashboard (PIN-protected)
