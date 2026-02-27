-- BuKe Database Schema
-- Run this in your Supabase SQL editor

-- Service Providers Table
CREATE TABLE IF NOT EXISTS service_providers (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  service_type VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  password VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  bio TEXT,
  services JSONB DEFAULT '[]'::jsonb,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  service_id VARCHAR(50) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  customer_notes TEXT,
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider_id, appointment_date, appointment_time)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_provider_date ON appointments(provider_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_service_providers_slug ON service_providers(slug);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Sample data for testing (optional)
-- Uncomment to insert test provider

/*
INSERT INTO service_providers (
  slug, name, business_name, service_type, email, phone, password, location, bio, services
) VALUES (
  'test-barber',
  'John Smith',
  'King''s Cuts',
  'barber',
  'john@kingcuts.com',
  '+1 555 0192',
  'password123',
  'Brooklyn, NY',
  '10 years of professional barbering experience. Specializing in fades and classic cuts.',
  '[
    {
      "name": "Classic Cut",
      "duration": 30,
      "price": 35,
      "icon": "✂️",
      "description": "Scissors and clippers finish"
    },
    {
      "name": "Fade",
      "duration": 45,
      "price": 45,
      "icon": "💈",
      "description": "Low, mid or high fade"
    },
    {
      "name": "Beard Trim",
      "duration": 20,
      "price": 25,
      "icon": "🧔",
      "description": "Beard shape and trim"
    }
  ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;
*/
