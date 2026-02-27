-- Migration: Add service_id column to appointments table
-- Run this in your Supabase SQL editor if the column is missing

-- Check if column exists and add it if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'appointments'
        AND column_name = 'service_id'
    ) THEN
        ALTER TABLE appointments
        ADD COLUMN service_id VARCHAR(10) NOT NULL DEFAULT '0';

        RAISE NOTICE 'Column service_id added to appointments table';
    ELSE
        RAISE NOTICE 'Column service_id already exists in appointments table';
    END IF;
END $$;
