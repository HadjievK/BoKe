# Booking Flow Test Plan

## Test Scenario: Customer Books an Appointment

### Prerequisites:
1. Provider profile exists (e.g., slug: "test-barber")
2. Database tables are set up (service_providers, customers, appointments)

### Test Steps:

#### 1. **Navigate to Provider Profile**
- URL: `http://localhost:3000/test-barber`
- Expected: See provider's services, bio, location
- Expected: See "Book" buttons for each service

#### 2. **Click "Book" on a Service**
- Action: Click "Book" button
- Expected: Redirect to `/test-barber/book?service=0`
- Expected: Service pre-selected

#### 3. **Select Date**
- Expected: Calendar shows current month
- Expected: Can navigate between months
- Action: Click a future date
- Expected: Date selected, time slots fetch

#### 4. **API: Fetch Available Time Slots**
```
GET /api/test-barber/availability?date=2026-03-28&service_id=0
```
Expected Response:
```json
{
  "date": "2026-03-28",
  "slots": [
    { "time": "09:00", "available": true },
    { "time": "09:30", "available": true },
    { "time": "10:00", "available": false },
    ...
  ]
}
```

#### 5. **Select Time Slot**
- Expected: Available slots shown in grid
- Expected: Booked slots disabled/grayed out
- Action: Click available time slot
- Expected: Time selected, form appears

#### 6. **Fill Customer Details**
- First Name: "John"
- Last Name: "Doe"
- Email: "john@example.com"
- Phone: "+1 555 0123"
- Notes: "Please trim the sides short"

#### 7. **Submit Booking**
```
POST /api/test-barber/book
{
  "service_id": "0",
  "appointment_date": "2026-03-28",
  "appointment_time": "10:00",
  "customer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1 555 0123",
    "notes": "Please trim the sides short"
  }
}
```

Expected Response:
```json
{
  "id": 1,
  "provider": {
    "name": "Test Barber",
    "business_name": "Test Cuts",
    "slug": "test-barber"
  },
  "service": {
    "name": "Classic Cut",
    "duration": 30,
    "price": 35
  },
  "appointment_date": "2026-03-28",
  "appointment_time": "10:00",
  "customer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  },
  "status": "confirmed",
  "created_at": "2026-02-27T12:00:00Z"
}
```

#### 8. **Success Screen**
- Expected: Confirmation message
- Expected: Appointment details displayed
- Expected: Option to book another appointment

#### 9. **Verify in Dashboard**
- Navigate to `/dashboard/test-barber`
- Enter password
- Expected: Appointment appears in today's list (if date is today)
- Expected: Calendar shows appointment count
- Expected: Auto-refresh works (30 seconds)

### Edge Cases to Test:

1. **Double Booking Prevention**
   - Two users try to book same slot simultaneously
   - Expected: Second booking fails with 409 error

2. **Past Date Selection**
   - Try to select date in the past
   - Expected: No available slots or disabled

3. **Invalid Service ID**
   - Try to book with non-existent service
   - Expected: 404 error

4. **Missing Customer Info**
   - Submit without required fields
   - Expected: Validation error

5. **Database Connection Error**
   - Simulate DB failure
   - Expected: 500 error with message

### Success Criteria:
✅ Customer can view available slots
✅ Customer can book appointment
✅ Appointment appears in dashboard immediately
✅ Calendar syncs within 30 seconds
✅ No double bookings allowed
✅ Error handling works correctly
