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
  password VARCHAR(255),  -- NULL for Google OAuth-only users
  location VARCHAR(255),
  bio TEXT,
  services JSONB DEFAULT '[]'::jsonb,
  avatar_url TEXT,

  -- OAuth fields
  oauth_provider VARCHAR(50),  -- 'google', 'facebook', etc. (NULL for email/password)
  oauth_provider_id VARCHAR(255),  -- Google ID, Facebook ID, etc.

  -- Tracking
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,

  -- Constraints
  CONSTRAINT password_or_oauth CHECK (
    password IS NOT NULL OR oauth_provider IS NOT NULL
  )
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
CREATE INDEX IF NOT EXISTS idx_service_providers_email ON service_providers(email);
CREATE INDEX IF NOT EXISTS idx_service_providers_oauth ON service_providers(oauth_provider, oauth_provider_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Sample data for testing (optional)
-- Uncomment to insert test provider

/*
-- Email/Password User
INSERT INTO service_providers (
  slug, name, business_name, service_type, email, phone, password, location, bio, services
) VALUES (
  'test-barber',
  'John Smith',
  'King''s Cuts',
  'barber',
  'john@kingcuts.com',
  '+1 555 0192',
  '$2b$10$...',  -- bcrypt hashed password
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

-- Google OAuth User
INSERT INTO service_providers (
  slug, name, business_name, service_type, email, phone, password, oauth_provider, oauth_provider_id, location, bio, services
) VALUES (
  'google-barber',
  'Jane Doe',
  'Jane''s Salon',
  'barber',
  'jane@gmail.com',
  '+1 555 0193',
  NULL,  -- No password for Google users
  'google',
  '1234567890',  -- Google ID
  'Manhattan, NY',
  'Professional stylist with 8 years experience.',
  '[
    {
      "name": "Haircut & Style",
      "duration": 45,
      "price": 50,
      "icon": "✂️",
      "description": "Complete styling service"
    }
  ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;
*/
