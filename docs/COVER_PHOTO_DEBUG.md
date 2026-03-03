# Cover Photo Troubleshooting Guide

## Step 1: Verify Database Column Exists

Run this in **Supabase SQL Editor**:

```sql
-- Check if cover_photo_url column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'service_providers'
AND column_name IN ('avatar_url', 'cover_photo_url');
```

**Expected Result**: Should show both `avatar_url` and `cover_photo_url` columns.

**If cover_photo_url is missing**, run the migration:

```sql
-- Add cover_photo_url column
ALTER TABLE service_providers
ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;
```

## Step 2: Check Existing Data

```sql
SELECT id, slug, name,
  CASE WHEN avatar_url IS NULL THEN 'NULL'
       WHEN LENGTH(avatar_url) > 0 THEN 'HAS VALUE'
       ELSE 'EMPTY' END as avatar_status,
  CASE WHEN cover_photo_url IS NULL THEN 'NULL'
       WHEN LENGTH(cover_photo_url) > 0 THEN 'HAS VALUE'
       ELSE 'EMPTY' END as cover_status,
  SUBSTRING(avatar_url, 1, 50) as avatar_preview,
  SUBSTRING(cover_photo_url, 1, 50) as cover_preview
FROM service_providers
ORDER BY id DESC
LIMIT 5;
```

## Step 3: Test Upload in Dashboard

1. Go to your provider dashboard: `/dashboard/[your-slug]`
2. Click **Settings** (gear icon)
3. Go to **Account** tab
4. Try uploading a cover photo
5. **Open Browser DevTools** (F12)
6. Go to **Network** tab
7. Click "Upload Cover Photo"
8. Look for the API call to `upload-photo`

### Check for Errors:

- **401 Unauthorized**: Token expired, sign in again
- **403 Forbidden**: Slug mismatch
- **400 Bad Request**: File validation failed
- **500 Server Error**: Database issue

## Step 4: Check Network Response

After uploading, check the API response:

**Success Response (200)**:
```json
{
  "url": "data:image/jpeg;base64,/9j/4AAQ...",
  "message": "Cover photo uploaded successfully"
}
```

## Step 5: Verify Data Saved

After successful upload, run:

```sql
SELECT id, slug,
  CASE WHEN cover_photo_url IS NOT NULL THEN 'SAVED' ELSE 'NULL' END as status,
  LENGTH(cover_photo_url) as data_length
FROM service_providers
WHERE slug = 'YOUR_SLUG_HERE';
```

Replace `YOUR_SLUG_HERE` with your actual provider slug.

## Step 6: Check Frontend Display

After upload:
1. Click "Save" in Settings modal
2. Navigate to public booking page: `/[your-slug]`
3. **Refresh the page** (Ctrl+F5)
4. Open DevTools Console (F12)
5. Check for errors

## Common Issues:

### Issue 1: Column doesn't exist
**Solution**: Run the migration SQL from Step 1

### Issue 2: Upload succeeds but doesn't display
**Cause**: Frontend not fetching the new field
**Solution**:
- Check browser console for errors
- Hard refresh (Ctrl+F5)
- Check if provider API includes `cover_photo_url`:

```sql
-- Test the provider API query
SELECT id, slug, name, business_name, service_type, email, phone,
       location, latitude, longitude, bio, avatar_url, cover_photo_url,
       theme_config, services, created_at
FROM service_providers
WHERE slug = 'YOUR_SLUG_HERE';
```

### Issue 3: File too large
**Solution**: Resize image to max 1200x400px, compress to under 5MB

### Issue 4: Wrong file format
**Solution**: Use JPG, PNG, or WebP format

## Step 7: Manual Test Insert

If upload still fails, test direct database insert:

```sql
UPDATE service_providers
SET cover_photo_url = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjOTMzM2VhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5URVNUIENPVEVSIFRVU1RFIENPVEVSIFRFU1QgQ09WRVJURVNUIENPVEVSIFRVU1QgQ09WRVJURVNUIENPVEVSIFRVU1QgQ09WRVJURVNUIENPVEVSIFRVU1QgQ09WRVJURVNUIENPVEVSIFRVU1QgQ09WRVJURVNUIENPVEVSIFRFU1QgQ09WRVI8L3RleHQ+PC9zdmc+'
WHERE slug = 'YOUR_SLUG_HERE';
```

Then visit `/[your-slug]` and refresh. You should see a purple banner with "TEST COVER" text.

If this works, the issue is with the upload, not the display.

## Step 8: Check Browser Console

On the booking page `/[your-slug]`, open console and check:

```javascript
// Type this in console to see provider data
console.log(window.__NEXT_DATA__)
```

Look for `cover_photo_url` in the provider object.

---

**Need Help?** Share:
1. Result of Step 1 (column check)
2. Result of Step 5 (data verification)
3. Screenshot of Network tab showing upload response
4. Any error messages in browser console
