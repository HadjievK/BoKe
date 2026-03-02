-- Migration: Add booking tokens table and inline customer data to appointments
-- Date: 2026-03-02
-- Description: Implements stateless email-based booking system

-- Step 1: Create booking_tokens table
CREATE TABLE IF NOT EXISTS booking_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(64) UNIQUE NOT NULL,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  used_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for booking_tokens
CREATE INDEX IF NOT EXISTS idx_booking_tokens_token ON booking_tokens(token);
CREATE INDEX IF NOT EXISTS idx_booking_tokens_appointment ON booking_tokens(appointment_id);
CREATE INDEX IF NOT EXISTS idx_booking_tokens_expires ON booking_tokens(expires_at);

-- Step 2: Add inline customer fields to appointments
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS customer_first_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS customer_last_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);

-- Step 3: Backfill existing appointments with customer data from customers table
UPDATE appointments a
SET
  customer_email = c.email,
  customer_first_name = c.first_name,
  customer_last_name = c.last_name,
  customer_phone = c.phone
FROM customers c
WHERE a.customer_id = c.id
  AND a.customer_email IS NULL;

-- Step 4: Make customer fields NOT NULL after backfill
ALTER TABLE appointments
  ALTER COLUMN customer_email SET NOT NULL,
  ALTER COLUMN customer_first_name SET NOT NULL,
  ALTER COLUMN customer_last_name SET NOT NULL;

-- Step 5: Drop foreign key constraint and make customer_id nullable
ALTER TABLE appointments
  DROP CONSTRAINT IF EXISTS appointments_customer_id_fkey,
  ALTER COLUMN customer_id DROP NOT NULL;

-- Step 6: Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_appointments_customer_email ON appointments(customer_email);

-- Cleanup query (run manually after migration is verified):
-- DELETE FROM booking_tokens WHERE expires_at < NOW() - INTERVAL '30 days';
