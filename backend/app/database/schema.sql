-- BuKe MVP Database Schema

-- Barbers/Service Providers (Tenants)
CREATE TABLE barbers (
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
  theme_config JSONB DEFAULT '{
    "primary_color": "#B8860B",
    "secondary_color": "#111111"
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services offered by each barber
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_barber ON services(barber_id);

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
  barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  customer_notes TEXT,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_barber_date ON appointments(barber_id, appointment_date);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);

-- Prevent double booking (race condition protection)
CREATE UNIQUE INDEX idx_unique_appointment_slot
ON appointments(barber_id, appointment_date, appointment_time)
WHERE status != 'cancelled';

-- Availability slots (weekly recurring schedule)
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration INTEGER DEFAULT 30,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_availability_barber ON availability(barber_id);

-- Sample data for testing
INSERT INTO barbers (slug, name, business_name, service_type, email, phone, location, bio, pin)
VALUES (
  'karloscuts',
  'Karlos Johnson',
  'King''s Cuts',
  'barber',
  'karlos@kingscuts.com',
  '+1-555-0123',
  '123 Main St, Brooklyn, NY',
  'Master barber with 10+ years experience. Specializing in classic cuts and modern fades.',
  '1234'
);

-- Get the barber_id for sample data
DO $$
DECLARE
  barber_uuid UUID;
BEGIN
  SELECT id INTO barber_uuid FROM barbers WHERE slug = 'karloscuts';

  -- Sample services
  INSERT INTO services (barber_id, name, duration, price, description, icon)
  VALUES
    (barber_uuid, 'Classic Cut', 30, 35.00, 'Traditional haircut with precision and style', '✂️'),
    (barber_uuid, 'Fade', 45, 45.00, 'Modern fade with clean lines', '🔥'),
    (barber_uuid, 'Beard Trim', 20, 20.00, 'Professional beard shaping and trim', '🧔');

  -- Sample availability (Mon-Fri 9AM-6PM, Sat 10AM-4PM)
  INSERT INTO availability (barber_id, day_of_week, start_time, end_time, slot_duration)
  VALUES
    (barber_uuid, 0, '09:00', '18:00', 30), -- Monday
    (barber_uuid, 1, '09:00', '18:00', 30), -- Tuesday
    (barber_uuid, 2, '09:00', '18:00', 30), -- Wednesday
    (barber_uuid, 3, '09:00', '18:00', 30), -- Thursday
    (barber_uuid, 4, '09:00', '18:00', 30), -- Friday
    (barber_uuid, 5, '10:00', '16:00', 30); -- Saturday
END $$;
