# BuKe MVP Testing Guide

## Quick Verification

Use this guide to verify that your BuKe MVP is working correctly.

## Prerequisites

- Backend running on http://localhost:8000
- Frontend running on http://localhost:3000
- Database migrated with sample data

## Test Suite

### Test 1: API Health Check

**Objective**: Verify backend is running

```bash
curl http://localhost:8000/health
```

**Expected Response**:
```json
{"status": "healthy"}
```

**✅ Pass**: Status code 200 and status is "healthy"
**❌ Fail**: Connection refused or error response

---

### Test 2: API Documentation

**Objective**: Verify FastAPI docs are accessible

1. Open browser to http://localhost:8000/docs
2. You should see Swagger UI with all endpoints listed

**✅ Pass**: Documentation loads with endpoints visible
**❌ Fail**: 404 or blank page

---

### Test 3: Sample Data Test

**Objective**: Verify sample barber exists

```bash
curl http://localhost:8000/api/barber/karloscuts
```

**Expected Response**:
```json
{
  "id": "...",
  "slug": "karloscuts",
  "name": "Karlos Johnson",
  "business_name": "King's Cuts",
  "services": [...]
}
```

**✅ Pass**: Status 200 with barber data
**❌ Fail**: 404 or error (run schema.sql again)

---

### Test 4: Frontend Landing Page

**Objective**: Verify landing page loads

1. Open http://localhost:3000
2. You should see "Welcome to BuKe" heading
3. Registration form should be visible

**✅ Pass**: Page loads, form is visible
**❌ Fail**: Blank page or errors in console

---

### Test 5: Service Provider Registration

**Objective**: Complete full registration flow

1. Go to http://localhost:3000
2. Fill out form:
   - Service Type: Barber
   - Name: Test User
   - Business Name: Test Shop
   - Email: test@example.com
   - Phone: 555-123-4567
   - Location: Test City
   - Bio: Test bio
   - Service: Test Cut, 30 minutes, $25
3. Click "Create My Booking Page"

**Expected Outcome**:
- Redirected to success page
- See your unique slug (e.g., "testshop")
- See 4-digit PIN displayed
- Copy link button works

**✅ Pass**: All above elements present
**❌ Fail**: Error message or no redirect

---

### Test 6: Barber Profile Page

**Objective**: View public booking page

1. From success page, click "View My Booking Page"
   OR go to http://localhost:3000/testshop (your slug)

**Expected Outcome**:
- Barber name and business name displayed
- Location shown with icon
- Bio displayed
- Services shown as cards with prices
- "Book" buttons present

**✅ Pass**: All profile info displays correctly
**❌ Fail**: 404 or missing data

---

### Test 7: Booking Flow - Service Selection

**Objective**: Start booking process

1. From barber profile, click "Book" on any service
2. OR click "Book Appointment" CTA

**Expected Outcome**:
- Redirected to /testshop/book
- See "Book an Appointment" heading
- Progress steps shown (3 steps)
- Services displayed as cards

**✅ Pass**: Booking page loads with service selection
**❌ Fail**: Error or blank page

---

### Test 8: Booking Flow - Date Selection

**Objective**: Select a date

1. Click on a service
2. Calendar should appear
3. Click on tomorrow's date

**Expected Outcome**:
- Service details shown at top
- Calendar displays next 7 days
- Today and past dates disabled
- Clicking a date shows time slots below

**✅ Pass**: Calendar works, time slots load
**❌ Fail**: No time slots or error

---

### Test 9: Booking Flow - Time Selection

**Objective**: Select a time slot

1. After selecting date, scroll to time slots
2. Click an available time (green/enabled)

**Expected Outcome**:
- Time slot highlights when selected
- Form appears below for customer details
- Booking summary shows at top

**✅ Pass**: Time slot selected, form appears
**❌ Fail**: Nothing happens or error

---

### Test 10: Booking Flow - Customer Details

**Objective**: Complete booking

1. Fill out customer form:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Phone: 555-987-6543
2. Click "Confirm Booking"

**Expected Outcome**:
- Loading state shows briefly
- Redirected to success screen (green background)
- Confirmation message displayed
- Appointment details shown (service, date, time, price)
- "Book Another Appointment" button present

**✅ Pass**: Booking confirmed, success screen shown
**❌ Fail**: Error message or validation issues

---

### Test 11: Double Booking Prevention

**Objective**: Verify same slot can't be booked twice

1. Go back to the same barber profile
2. Try to book the SAME service, date, and time as Test 10
3. Complete the flow

**Expected Outcome**:
- When you select the previously booked time, it should be marked unavailable (grayed out)
- OR if somehow you get through, you should get an error: "This time slot is not available"

**✅ Pass**: Slot is unavailable or error message shown
**❌ Fail**: Successfully books duplicate appointment

---

### Test 12: Dashboard Access - Wrong PIN

**Objective**: Test PIN authentication

1. Go to http://localhost:3000/dashboard/testshop
2. Enter wrong PIN (e.g., "0000")
3. Click "Access Dashboard"

**Expected Outcome**:
- Error message: "Invalid PIN"
- Dashboard does not load

**✅ Pass**: Error shown, access denied
**❌ Fail**: Dashboard loads or no error

---

### Test 13: Dashboard Access - Correct PIN

**Objective**: Access dashboard with correct PIN

1. Go to http://localhost:3000/dashboard/testshop
2. Enter the PIN from your registration (check success page)
3. Click "Access Dashboard"

**Expected Outcome**:
- Dashboard loads with dark theme
- Stats cards show:
  - Today's Appointments: 1 (from Test 10)
  - This Week: 1
  - Total Customers: 1
  - Rating: 5.0
- Today's appointments section shows John Doe's booking
- Recent customers section shows John Doe

**✅ Pass**: Dashboard loads with correct data
**❌ Fail**: Wrong numbers or missing data

---

### Test 14: Sample Data Dashboard

**Objective**: Test with pre-loaded sample data

1. Go to http://localhost:3000/dashboard/karloscuts
2. Enter PIN: 1234
3. Click "Access Dashboard"

**Expected Outcome**:
- Dashboard loads
- Shows Karlos's business data
- May show appointments if any sample appointments exist

**✅ Pass**: Dashboard accessible
**❌ Fail**: Invalid PIN or no data

---

### Test 15: Mobile Responsiveness

**Objective**: Verify mobile layout

1. Open any page (profile, booking, dashboard)
2. Open browser DevTools (F12)
3. Toggle device toolbar (Ctrl+Shift+M)
4. Select iPhone or Android device

**Expected Outcome**:
- Layout adapts to mobile screen
- All buttons are tappable
- Text is readable
- No horizontal scroll
- Forms are usable

**✅ Pass**: All pages work well on mobile
**❌ Fail**: Layout broken or unusable

---

### Test 16: Input Validation

**Objective**: Test form validation

1. Go to registration page
2. Try to submit empty form
3. Enter invalid email (e.g., "notanemail")
4. Enter invalid phone (e.g., "123")

**Expected Outcome**:
- Required field errors show
- Email validation shows error
- Phone validation shows error
- Form won't submit until valid

**✅ Pass**: All validation works
**❌ Fail**: Invalid data accepted

---

### Test 17: Database Verification

**Objective**: Verify data is stored correctly

```bash
# Connect to your database
psql $DATABASE_URL

# Check barbers
SELECT slug, name, business_name FROM barbers WHERE slug = 'testshop';

# Check appointments
SELECT
  a.appointment_date,
  a.appointment_time,
  c.first_name,
  c.last_name
FROM appointments a
JOIN customers c ON a.customer_id = c.id
WHERE a.barber_id = (SELECT id FROM barbers WHERE slug = 'testshop');
```

**Expected Outcome**:
- Your test barber exists
- John Doe's appointment exists
- All data is correct

**✅ Pass**: Data in database matches bookings
**❌ Fail**: Missing or incorrect data

---

### Test 18: API Direct Test

**Objective**: Test API endpoint directly

```bash
# Get availability
curl "http://localhost:8000/api/testshop/availability?date=2026-03-01"

# Expected response:
{
  "date": "2026-03-01",
  "slots": [
    {"time": "09:00", "available": true},
    {"time": "09:30", "available": true},
    ...
  ]
}
```

**✅ Pass**: Returns slots array
**❌ Fail**: Error or empty slots

---

### Test 19: Error Handling

**Objective**: Test graceful error handling

1. Try to access non-existent barber: http://localhost:3000/nonexistent

**Expected Outcome**:
- Shows "Barber Not Found" page
- Has "Go Home" button
- No console errors

**✅ Pass**: Nice error page shown
**❌ Fail**: Blank page or crash

---

### Test 20: Session Persistence

**Objective**: Test PIN session storage

1. Access dashboard with correct PIN
2. Close the tab
3. Open new tab to same dashboard URL

**Expected Outcome**:
- Dashboard loads without asking for PIN again
- (Session stored in sessionStorage)

**✅ Pass**: PIN remembered in session
**❌ Fail**: Asks for PIN again

---

## Test Results Summary

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | API Health Check | ⬜ | |
| 2 | API Documentation | ⬜ | |
| 3 | Sample Data | ⬜ | |
| 4 | Landing Page | ⬜ | |
| 5 | Registration | ⬜ | |
| 6 | Profile Page | ⬜ | |
| 7 | Service Selection | ⬜ | |
| 8 | Date Selection | ⬜ | |
| 9 | Time Selection | ⬜ | |
| 10 | Booking Complete | ⬜ | |
| 11 | Double Booking | ⬜ | |
| 12 | Wrong PIN | ⬜ | |
| 13 | Correct PIN | ⬜ | |
| 14 | Sample Dashboard | ⬜ | |
| 15 | Mobile Responsive | ⬜ | |
| 16 | Input Validation | ⬜ | |
| 17 | Database Check | ⬜ | |
| 18 | API Direct | ⬜ | |
| 19 | Error Handling | ⬜ | |
| 20 | Session Storage | ⬜ | |

## Common Issues and Solutions

### Issue: Frontend can't connect to backend
**Solution**:
- Check NEXT_PUBLIC_API_URL in .env.local
- Verify backend is running
- Check browser console for CORS errors

### Issue: No time slots available
**Solution**:
- Check availability table has data
- Verify day_of_week matches (0=Mon, 6=Sun)
- Check selected date is not in the past

### Issue: Database connection failed
**Solution**:
- Verify DATABASE_URL format
- Check Supabase project is active
- Test connection with: `psql $DATABASE_URL -c "SELECT 1"`

### Issue: Build errors
**Solution**:
- Delete node_modules and .next
- Run `npm install` again
- Check Node version (18+)

## Performance Benchmarks

Expected performance on local development:

- **API Response Time**: < 100ms
- **Page Load Time**: < 1s
- **Time to Interactive**: < 2s
- **Booking Flow**: < 30s end-to-end

## Security Checklist

- [ ] SQL injection: All queries use parameterized statements
- [ ] XSS: React escapes by default
- [ ] CSRF: Not applicable (no session cookies)
- [ ] CORS: Configured correctly
- [ ] Input validation: All forms validated
- [ ] No secrets in git: .env files ignored

## Ready for Production?

All tests passing? ✅
Documentation complete? ✅
Environment variables set? ⬜
Database backed up? ⬜
Monitoring configured? ⬜

If all green, you're ready to deploy! Follow DEPLOYMENT.md
