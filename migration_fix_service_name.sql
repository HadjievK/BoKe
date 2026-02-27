-- Migration: Check and fix service_name column issue
-- Run this in your Supabase SQL editor

-- Option 1: If service_name column exists and should be nullable (recommended)
-- Make service_name nullable since we store service details in the services JSONB array
ALTER TABLE appointments
ALTER COLUMN service_name DROP NOT NULL;

-- Option 2: If you want to keep it NOT NULL, we need to add a default
-- ALTER TABLE appointments
-- ALTER COLUMN service_name SET DEFAULT 'Unknown Service';

-- Verify the columns in appointments table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;
