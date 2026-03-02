-- Migration: Add calendar settings to service_providers table
-- Run this in your Supabase SQL editor

ALTER TABLE service_providers
ADD COLUMN IF NOT EXISTS calendar_start_time TIME DEFAULT '09:00:00',
ADD COLUMN IF NOT EXISTS calendar_end_time TIME DEFAULT '17:00:00',
ADD COLUMN IF NOT EXISTS slot_duration INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS buffer_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS working_days JSONB DEFAULT '{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": false, "sunday": false}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN service_providers.calendar_start_time IS 'Daily working start time';
COMMENT ON COLUMN service_providers.calendar_end_time IS 'Daily working end time';
COMMENT ON COLUMN service_providers.slot_duration IS 'Time slot duration in minutes';
COMMENT ON COLUMN service_providers.buffer_time IS 'Buffer time between appointments in minutes';
COMMENT ON COLUMN service_providers.working_days IS 'Working days configuration as JSON object';
