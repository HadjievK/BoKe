-- Migration: Increase service_id column length
-- Run this in your Supabase SQL editor

-- Increase service_id column length from VARCHAR(10) to VARCHAR(50)
ALTER TABLE appointments
ALTER COLUMN service_id TYPE VARCHAR(50);

-- Verify the change
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'appointments'
AND column_name = 'service_id';
