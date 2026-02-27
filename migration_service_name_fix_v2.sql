-- Migration: Fix service_name column issue
-- Run this in your Supabase SQL editor

DO $$
BEGIN
    -- Check if service_name column exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'appointments'
        AND column_name = 'service_name'
    ) THEN
        -- Make it nullable
        ALTER TABLE appointments
        ALTER COLUMN service_name DROP NOT NULL;

        RAISE NOTICE 'service_name column made nullable';
    ELSE
        -- Column doesn't exist, create it as nullable
        ALTER TABLE appointments
        ADD COLUMN service_name VARCHAR(255);

        RAISE NOTICE 'service_name column created as nullable';
    END IF;
END $$;

-- Verify all columns
SELECT column_name, data_type, is_nullable, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;
