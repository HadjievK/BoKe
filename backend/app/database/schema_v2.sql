-- BuKe MVP Database Schema - Simplified Single Table Design

-- Service Providers (combines barber info + services as JSONB)
CREATE TABLE service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  pin TEXT NOT NULL,

  -- Services stored as JSONB array
  services JSONB DEFAULT '[]'::JSONB,
  -- Example: [{"name": "Classic Cut", "duration": 30, "price": 35.00, "description": "...", "icon": "✂️", "is_active": true}]

  -- Availability stored as JSONB
  availability JSONB DEFAULT '[]'::JSONB,
  -- Example: [{"day": 1, "start": "09:00", "end": "17:00", "slot_duration": 30}]

  theme_config JSONB DEFAULT '{
    "primary_color": "#B8860B",
    "secondary_color": "#111111"
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers (no authentication)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Service details stored denormalized (in case provider changes services)
  service_name TEXT NOT NULL,
  service_duration INTEGER NOT NULL,
  service_price NUMERIC(10, 2) NOT NULL,

  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  customer_notes TEXT,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_provider_date ON appointments(provider_id, appointment_date);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);

-- Prevent double booking
CREATE UNIQUE INDEX idx_unique_appointment_slot
ON appointments(provider_id, appointment_date, appointment_time)
WHERE status != 'cancelled';

-- Sample data for testing
INSERT INTO service_providers (slug, name, business_name, service_type, email, phone, location, bio, pin, services, availability)
VALUES (
  'karloscuts',
  'Karlos Johnson',
  'King''s Cuts',
  'barber',
  'karlos@kingscuts.com',
  '+1-555-0123',
  '123 Main St, Brooklyn, NY',
  'Master barber with 10+ years experience. Specializing in classic cuts and modern fades.',
  '1234',
  '[
    {"name": "Classic Cut", "duration": 30, "price": 35.00, "description": "Traditional haircut with precision and style", "icon": "✂️", "is_active": true},
    {"name": "Fade", "duration": 45, "price": 45.00, "description": "Modern fade with clean lines", "icon": "🔥", "is_active": true},
    {"name": "Beard Trim", "duration": 20, "price": 20.00, "description": "Professional beard shaping and trim", "icon": "🧔", "is_active": true}
  ]'::JSONB,
  '[
    {"day": 0, "start": "09:00", "end": "18:00", "slot_duration": 30},
    {"day": 1, "start": "09:00", "end": "18:00", "slot_duration": 30},
    {"day": 2, "start": "09:00", "end": "18:00", "slot_duration": 30},
    {"day": 3, "start": "09:00", "end": "18:00", "slot_duration": 30},
    {"day": 4, "start": "09:00", "end": "18:00", "slot_duration": 30},
    {"day": 5, "start": "10:00", "end": "16:00", "slot_duration": 30}
  ]'::JSONB
);
