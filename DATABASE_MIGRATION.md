# Database Migration Guide

## Issue: Missing `service_id` Column

The production database's `appointments` table is missing the `service_id` column, which causes booking failures.

## Solution

Run the migration script in your Supabase SQL Editor:

### Option 1: Automatic Migration (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the contents of `migration_add_service_id.sql`
6. Click "Run" or press Ctrl+Enter

### Option 2: Manual SQL Command

If you prefer to run a simple command, execute this in the SQL Editor:

```sql
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS service_id VARCHAR(10) NOT NULL DEFAULT '0';
```

### Verification

After running the migration, verify the column was added:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;
```

You should see `service_id` in the list with type `character varying`.

### Testing

After adding the column, test the booking flow:

1. Visit your booking page: `https://boke-brown-ten.vercel.app/[your-slug]/book`
2. Select a service, date, and time
3. Fill in customer details
4. Submit the booking
5. Verify the booking completes successfully

## Next Steps

If you continue to see errors after running the migration:

1. Check Vercel deployment logs for detailed error messages
2. Verify your database connection string is correct in Vercel environment variables
3. Ensure your database has the latest schema from `database_schema.sql`
