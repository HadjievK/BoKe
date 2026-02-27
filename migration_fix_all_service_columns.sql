-- Migration: Fix all service-related column constraints
-- Run this in your Supabase SQL editor

DO $$
BEGIN
    -- Make service_duration nullable if it exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'appointments'
        AND column_name = 'service_duration'
    ) THEN
        ALTER TABLE appointments
        ALTER COLUMN service_duration DROP NOT NULL;
        RAISE NOTICE 'service_duration column made nullable';
    END IF;

    -- Make service_price nullable if it exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'appointments'
        AND column_name = 'service_price'
    ) THEN
        ALTER TABLE appointments
        ALTER COLUMN service_price DROP NOT NULL;
        RAISE NOTICE 'service_price column made nullable';
    END IF;

    -- Make any other service columns nullable
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'appointments'
        AND column_name = 'service_description'
    ) THEN
        ALTER TABLE appointments
        ALTER COLUMN service_description DROP NOT NULL;
        RAISE NOTICE 'service_description column made nullable';
    END IF;

END $$;

-- Show all columns to verify
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;
