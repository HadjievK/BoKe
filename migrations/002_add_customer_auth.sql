-- Add authentication fields to customers table
ALTER TABLE customers
ADD COLUMN password VARCHAR(255),
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN last_login_at TIMESTAMP;

-- Add index on email for faster lookups during authentication
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Add comment explaining the schema
COMMENT ON COLUMN customers.password IS 'Bcrypt hashed password for customer authentication';
COMMENT ON COLUMN customers.email_verified IS 'Whether customer has verified their email address';
COMMENT ON COLUMN customers.updated_at IS 'Timestamp of last customer record update';
COMMENT ON COLUMN customers.last_login_at IS 'Timestamp of last successful customer login';
