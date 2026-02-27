-- Migration: Add missing columns to appointments table
-- Run this in your Supabase SQL editor

DO $$
BEGIN
    -- Add duration column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'appointments'
        AND column_name = 'duration'
    ) THEN
        ALTER TABLE appointments
        ADD COLUMN duration INTEGER NOT NULL DEFAULT 30;
        RAISE NOTICE 'Column duration added to appointments table';
    ELSE
        RAISE NOTICE 'Column duration already exists';
    END IF;

    -- Add price column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'appointments'
        AND column_name = 'price'
    ) THEN
        ALTER TABLE appointments
        ADD COLUMN price DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
        RAISE NOTICE 'Column price added to appointments table';
    ELSE
        RAISE NOTICE 'Column price already exists';
    END IF;

    -- Add customer_notes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'appointments'
        AND column_name = 'customer_notes'
    ) THEN
        ALTER TABLE appointments
        ADD COLUMN customer_notes TEXT;
        RAISE NOTICE 'Column customer_notes added to appointments table';
    ELSE
        RAISE NOTICE 'Column customer_notes already exists';
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'appointments'
        AND column_name = 'status'
    ) THEN
        ALTER TABLE appointments
        ADD COLUMN status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed'));
        RAISE NOTICE 'Column status added to appointments table';
    ELSE
        RAISE NOTICE 'Column status already exists';
    END IF;

END $$;

-- Verify all columns are present
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;
