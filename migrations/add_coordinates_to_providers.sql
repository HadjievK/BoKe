-- Migration: Add latitude and longitude columns to service_providers table
-- Date: 2026-03-01

ALTER TABLE service_providers
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add index for geospatial queries (optional, for future features like "find providers near me")
CREATE INDEX IF NOT EXISTS idx_service_providers_coordinates ON service_providers(latitude, longitude);

-- Add comment explaining the columns
COMMENT ON COLUMN service_providers.latitude IS 'Business location latitude for Google Maps integration';
COMMENT ON COLUMN service_providers.longitude IS 'Business location longitude for Google Maps integration';
