-- Add currency field to service_providers
-- Stores the provider's preferred currency code (ISO 4217)
-- Defaults to EUR for European focus

ALTER TABLE service_providers
  ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'EUR';
