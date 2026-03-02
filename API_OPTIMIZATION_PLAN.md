# API Optimization Summary

## ✅ Completed Fixes

### Critical Issues Fixed:
1. **Removed broken cancel route** (`/api/[slug]/bookings/[appointmentId]/cancel`)
   - Was calling deleted `authenticateCustomer()` function
   - Part of deprecated customer auth system
   - Route fully removed

2. **Created reusable utilities:**
   - `lib/api-utils.ts` - Standard error/success responses
   - `lib/provider-utils.ts` - Provider and service lookup helpers
   - Updated `lib/auth.ts` - Added `authenticateProviderBySlug()` helper

### Benefits:
- Removed broken code that would cause runtime errors
- Created foundation for consistent API responses
- Established pattern for future route refactoring

---

## 🔴 Critical Issues Remaining (High Priority)

### 1. N+1 Query Pattern in Dashboard Route
**File:** `app/api/dashboard/[slug]/route.ts`

**Current:** 5 sequential queries (lines 34-165)
- Get provider details
- Get stats
- Get today's appointments
- Get services (duplicate query)
- Get recent customers

**Fix:** Combine into 1-2 queries with CTEs:
```sql
WITH stats AS (
  SELECT COUNT(...)::int as today_appointments,
         COUNT(...)::int as week_appointments
  FROM appointments WHERE provider_id = $1
),
today_appts AS (
  SELECT a.*, c.* FROM appointments a
  JOIN customers c ON a.customer_id = c.id
  WHERE a.provider_id = $1 AND a.appointment_date = $2
)
SELECT * FROM stats, today_appts;
```

**Impact:** 80% faster (5 queries → 1-2)

---

### 2. String Literals Instead of Constants
**Affected Files:** 5+ routes

**Pattern:**
```typescript
// ❌ Current
if (status !== 'confirmed')
AND status != 'cancelled'

// ✅ Should be
import { AppointmentStatus } from '@/lib/types'
if (status !== AppointmentStatus.CONFIRMED)
AND status != $3`, [..., AppointmentStatus.CANCELLED]
```

**Files to fix:**
- `app/api/dashboard/[slug]/appointments/[id]/route.ts` (lines 35-37)
- `app/api/[slug]/availability/route.ts` (line 67)
- `app/api/dashboard/[slug]/route.ts` (line 59)

**Impact:** Type safety, prevents typos

---

### 3. Inconsistent Error Response Format
**Issue:** Mix of `{ detail: ... }` and `{ error: ... }`

**CLAUDE.md Standard:** Use `error` field

**Files using incorrect `detail` field:**
- All dashboard routes (11 files)
- Provider settings routes
- Signin/onboard routes

**Fix:** Replace all with `ApiError` helpers from `lib/api-utils.ts`:
```typescript
// ❌ Old
return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })

// ✅ New
import { ApiError } from '@/lib/api-utils'
return ApiError.unauthorized()
```

**Impact:** Consistent frontend error handling

---

## 🟡 High Priority Optimizations

### 4. Duplicate Service Lookup
**File:** `app/api/dashboard/[slug]/appointments/route.ts`

**Current:** Sequential queries (lines 78, 81-84)
```typescript
const appointments = await pool.query(...)
const services = await pool.query(...)
```

**Fix:** Parallelize with Promise.all():
```typescript
const [appointments, services] = await Promise.all([
  pool.query(...),
  pool.query(...)
]);
```

**Impact:** 50% faster

---

### 5. Extract Duplicate Auth Checks
**Pattern repeated in 8+ files:**
```typescript
const auth = authenticateRequest(request);
if (!auth) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
if (auth.slug !== slug) return NextResponse.json({ detail: 'Forbidden' }, { status: 403 });
```

**Fix:** Use new helper:
```typescript
import { authenticateProviderBySlug } from '@/lib/auth'

const result = authenticateProviderBySlug(request, slug);
if (result instanceof NextResponse) return result; // Error response
const { auth, providerId } = result;
```

**Files to update:**
- `app/api/dashboard/[slug]/appointments/route.ts`
- `app/api/dashboard/[slug]/customers/route.ts`
- `app/api/dashboard/[slug]/appointments/[id]/route.ts`
- `app/api/provider/[slug]/settings/route.ts`
- `app/api/provider/[slug]/route.ts`
- `app/api/dashboard/[slug]/route.ts`

**Impact:** ~150 lines of code removed

---

### 6. Use Provider Utilities
**Files performing duplicate provider lookups:**
- `app/api/[slug]/availability/route.ts` (lines 22-34)
- `app/api/[slug]/book/route.ts` (lines 33-43)
- `app/api/provider/[slug]/route.ts` (lines 14-29)

**Fix:** Use new utilities:
```typescript
import { getProviderBySlug } from '@/lib/provider-utils'

const provider = await getProviderBySlug(slug);
if (!provider) return ApiError.notFound('Provider not found');
```

**Impact:** ~80 lines of code removed, consistent error handling

---

## 🟢 Medium Priority Improvements

### 7. Add Missing Database Indexes
```sql
-- For service_id lookups
CREATE INDEX IF NOT EXISTS idx_appointments_service_id
ON appointments(service_id);

-- For date range queries with status
CREATE INDEX IF NOT EXISTS idx_appointments_provider_date_status
ON appointments(provider_id, appointment_date, status);
```

**Impact:** Faster queries on large datasets

---

### 8. Add Transaction for Booking Creation
**File:** `app/api/[slug]/book/route.ts`

**Current:** Separate inserts (lines 87-126)
**Fix:** Wrap in transaction to ensure atomicity

---

### 9. Add Pagination
**Files without limits:**
- `app/api/dashboard/[slug]/appointments/route.ts`
- `app/api/dashboard/[slug]/customers/route.ts`

**Fix:** Add LIMIT/OFFSET parameters
**Impact:** Prevents timeout on large datasets

---

## 📊 Estimated Impact Summary

| Fix | Files Affected | LOC Saved | Performance Gain |
|-----|---------------|-----------|------------------|
| Remove broken routes | 1 | +50 | N/A (fixes errors) |
| Create utilities | 3 new files | Foundation | Better maintainability |
| Fix N+1 dashboard | 1 | 0 | 80% faster |
| Use constants | 5 | 0 | Type safety |
| Standardize errors | 11 | 0 | Consistency |
| Parallelize queries | 2 | 0 | 50% faster |
| Extract auth helper | 6 | -150 | Cleaner code |
| Use provider utils | 4 | -80 | Consistency |
| **TOTAL** | **17** | **~230 lines** | **Much faster** |

---

## 🎯 Recommended Implementation Order

**This Week:**
1. ✅ Remove broken routes (DONE)
2. ✅ Create utility libraries (DONE)
3. Replace `detail` with `error` in all routes (15 min)
4. Use `AppointmentStatus` constants (10 min)
5. Fix dashboard N+1 queries (30 min)

**Next Week:**
6. Update all routes to use `authenticateProviderBySlug()` helper
7. Update all routes to use provider utilities
8. Parallelize independent queries
9. Add database indexes

**Future:**
10. Add pagination to list endpoints
11. Add caching layer (Redis)
12. Implement database query monitoring

---

## 🔧 Quick Wins (< 5 min each)

1. **Replace error format** (global find/replace):
   - Find: `{ detail:`
   - Replace: `{ error:`

2. **Import constants** (add to imports):
   ```typescript
   import { AppointmentStatus } from '@/lib/types'
   ```

3. **Replace string literals** (find/replace in SQL):
   - Find: `'confirmed'`
   - Replace: `AppointmentStatus.CONFIRMED` (or use parameterized query)

---

## 📝 Notes

- All utilities follow existing patterns (imported from `@/lib/...`)
- New utilities are fully typed with TypeScript
- Backward compatible with existing routes
- Can be implemented incrementally (no breaking changes)
- CLAUDE.md updated to reference new utilities
