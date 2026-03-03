-- Add cover_photo_url column to service_providers table
ALTER TABLE service_providers
ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- Add comment
COMMENT ON COLUMN service_providers.cover_photo_url IS 'URL to the provider cover/banner photo displayed on public booking page';
