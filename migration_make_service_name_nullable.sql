-- Migration: Fix service_name column constraint
-- Run this in your Supabase SQL editor

-- RECOMMENDED APPROACH: Make service_name nullable
-- Since we store service_id and can retrieve the name from the services JSONB,
-- we don't need service_name to be NOT NULL
ALTER TABLE appointments
ALTER COLUMN service_name DROP NOT NULL;

-- Verify the change
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'appointments'
AND column_name = 'service_name';
