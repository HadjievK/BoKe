# Calendar Settings Feature

## Overview
Service providers can now configure their calendar availability settings, which automatically reflect on the customer booking page.

## Features

### Provider Dashboard - Calendar Settings Tab
Located in Settings → Calendar Settings:

1. **Working Hours**
   - Start Time (default: 09:00)
   - End Time (default: 17:00)

2. **Time Slot Settings**
   - Slot Duration: 15min, 30min, 45min, 1h, 1.5h, 2h (default: 30min)
   - Buffer Time: 0, 5min, 10min, 15min, 30min (default: 0)

3. **Working Days**
   - Checkboxes for each day of the week
   - Default: Monday-Friday enabled, Saturday-Sunday disabled

### Customer Booking Page
The availability API automatically:
- Generates time slots based on provider's settings
- Respects working hours
- Uses configured slot duration
- Applies buffer time between appointments
- Shows only available days based on working_days configuration
- Returns empty slots with message for non-working days

## Database Schema

### New Columns in `service_providers` table:
```sql
calendar_start_time TIME DEFAULT '09:00:00'
calendar_end_time TIME DEFAULT '17:00:00'
slot_duration INTEGER DEFAULT 30
buffer_time INTEGER DEFAULT 0
working_days JSONB DEFAULT '{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": false, "sunday": false}'
```

## API Updates

### GET `/api/[slug]/availability`
Now reads calendar settings from provider profile:
- Dynamically generates slots based on `calendar_start_time`, `calendar_end_time`, and `slot_duration`
- Applies `buffer_time` when calculating blocked slots
- Checks `working_days` to determine if date is available

### PATCH `/api/provider/[slug]`
Now accepts calendar settings:
```typescript
{
  calendar_start_time?: string,      // "HH:MM:SS" format
  calendar_end_time?: string,        // "HH:MM:SS" format
  slot_duration?: number,            // minutes
  buffer_time?: number,              // minutes
  working_days?: {
    monday: boolean,
    tuesday: boolean,
    wednesday: boolean,
    thursday: boolean,
    friday: boolean,
    saturday: boolean,
    sunday: boolean
  }
}
```

### GET `/api/dashboard/[slug]`
Now returns calendar settings in provider data

## Migration

Run the migration script to add calendar settings columns:
```bash
# In Supabase SQL Editor
psql < docs/migration_add_calendar_settings.sql
```

Or manually run:
```sql
ALTER TABLE service_providers
ADD COLUMN IF NOT EXISTS calendar_start_time TIME DEFAULT '09:00:00',
ADD COLUMN IF NOT EXISTS calendar_end_time TIME DEFAULT '17:00:00',
ADD COLUMN IF NOT EXISTS slot_duration INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS buffer_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS working_days JSONB DEFAULT '{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": false, "sunday": false}'::jsonb;
```

## Example Use Cases

### Scenario 1: Hairdresser with 45-minute appointments
- Slot Duration: 45 minutes
- Buffer Time: 15 minutes (cleanup/preparation)
- Working Hours: 09:00 - 18:00
- Result: Appointments every hour (45min + 15min buffer)

### Scenario 2: Weekend-only service
- Working Days: Saturday and Sunday only
- Customers can only book on weekends

### Scenario 3: Extended hours on specific days
(Future enhancement - per-day hours configuration)

## Testing
1. Sign in to dashboard
2. Go to Settings → Calendar Settings
3. Modify any setting (e.g., change slot duration to 45 minutes)
4. Save changes
5. Open your public booking page in incognito/new tab
6. Verify time slots reflect new duration

## Notes
- All existing providers will have default settings (9 AM - 5 PM, 30-min slots, Monday-Friday)
- Settings are applied globally for all services (per-service configuration is a future enhancement)
- Buffer time is added AFTER each appointment automatically
