# API Routing Structure - Refactoring Plan

## Current Structure Analysis

### Identified Issues

#### 🔴 Critical Issues

1. **Route Pattern Confusion - Three Different Slug Patterns**
   - `/api/[slug]/*` - Public customer booking APIs (no auth)
   - `/api/provider/[slug]/*` - Provider profile APIs (mixed auth)
   - `/api/dashboard/[slug]/*` - Dashboard admin APIs (requires auth)

   **Problems:**
   - Semantic overlap between provider profile and dashboard routes
   - Inconsistent naming with slug patterns at different hierarchy levels
   - Route collision risk with root-level `[slug]` pattern
   - Confusing API surface for frontend developers

2. **Mixed Responsibilities in `/api/provider/[slug]`**
   - GET is public (no auth) - returns provider profile for customers
   - PATCH requires JWT auth - updates provider settings
   - Violates single responsibility principle

3. **Duplicate Provider Update Endpoints**
   ```
   PATCH /api/provider/[slug]
   PUT   /api/provider/[slug]/settings
   ```
   Both update provider settings with overlapping fields.

#### 🟡 Design Concerns

4. **Inconsistent HTTP Methods**
   - Most updates use PATCH (correct for partial updates)
   - `/api/provider/[slug]/settings` uses PUT (implies full replacement)

5. **Root-level `[slug]` Dynamic Route**
   - Could match typos in static routes
   - Makes adding new top-level routes harder
   - Less explicit about intent

6. **Dead Code**
   - `/api/auth/[...nextauth]/route.ts` exists but project uses JWT auth

---

## Current Route Mapping

### Root-Level API Routes (Global)
```
/api/onboard           → POST  - Provider registration
/api/signin            → POST  - Provider authentication
/api/signout           → POST  - Provider logout
/api/auth/verify       → GET   - Verify JWT token
/api/auth/[...nextauth] → *   - NextAuth handlers (UNUSED - DELETE)
/api/health            → GET   - Health check
/api/test-env          → GET   - Environment test
```

### Public Customer-Facing Routes (`/api/[slug]/*`)
```
/api/[slug]/availability           → GET   - Get available time slots
/api/[slug]/book                   → POST  - Create booking (no auth)
/api/[slug]/booking/[token]        → GET   - View booking by token
                                   → PATCH - Cancel booking
```

### Provider Profile Routes (`/api/provider/[slug]/*`)
```
/api/provider/[slug]              → GET   - Public profile + services (NO AUTH)
                                  → PATCH - Update settings (JWT AUTH)
/api/provider/[slug]/settings     → PUT   - Update settings + password (JWT AUTH)
```

### Dashboard/Admin Routes (`/api/dashboard/[slug]/*`)
```
/api/dashboard/[slug]                     → GET   - Dashboard data (JWT AUTH)
/api/dashboard/[slug]/appointments        → GET   - List appointments (JWT AUTH)
/api/dashboard/[slug]/appointments/[id]   → PATCH - Update status (JWT AUTH)
/api/dashboard/[slug]/customers           → GET   - List customers (JWT AUTH)
/api/dashboard/[slug]/upload-photo        → POST  - Upload avatar/cover (JWT AUTH)
```

---

## Recommended Solution: Option B (Minimal Refactor)

**Goal:** Consolidate routes with minimal migration work while fixing core issues.

### Proposed Structure

```
/api/
├── /auth/*                        # Authentication
│   ├── /signin                    → POST (provider login)
│   ├── /signout                   → POST (provider logout)
│   └── /verify                    → GET (verify JWT)
│
├── /onboard                       → POST (provider signup)
│
├── /[slug]/*                      # PUBLIC customer booking APIs
│   ├── /profile                   → GET (public provider info)
│   ├── /availability              → GET (available slots)
│   ├── /book                      → POST (create booking)
│   └── /booking/[token]
│       ├── GET                    → View booking details
│       └── PATCH                  → Cancel booking
│
└── /dashboard/[slug]/*            # PROTECTED provider admin APIs
    ├── GET                        → Dashboard overview
    ├── PATCH                      → Update provider settings (consolidated)
    ├── /appointments
    │   ├── GET                    → List all appointments
    │   └── /[id]
    │       └── PATCH              → Update appointment status
    ├── /customers
    │   └── GET                    → List customers
    └── /upload-photo
        └── POST                   → Upload avatar/cover photo
```

### Changes Required

#### 1. Move Provider Profile to Public API
**Current:** `/api/provider/[slug]` GET endpoint
**New:** `/api/[slug]/profile` GET endpoint

```typescript
// Create: app/api/[slug]/profile/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Move logic from /api/provider/[slug] GET
}
```

#### 2. Consolidate Provider Settings Updates
**Remove:**
- `/api/provider/[slug]` PATCH endpoint
- `/api/provider/[slug]/settings` PUT endpoint

**Update:** `/api/dashboard/[slug]` to handle all provider updates

```typescript
// Update: app/api/dashboard/[slug]/route.ts
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Consolidate all provider update logic here
  // Handle: location, lat/lng, calendar settings, password changes
}
```

#### 3. Delete Dead Code
```bash
rm app/api/auth/[...nextauth]/route.ts
rm -r app/api/provider/
```

#### 4. Update Frontend API Client
```typescript
// lib/api.ts - Update imports
export async function getProviderProfile(slug: string) {
  // OLD: const res = await fetch(`/api/provider/${slug}`)
  const res = await fetch(`/api/${slug}/profile`)
  return res.json()
}

export async function updateProviderSettings(slug: string, data: any) {
  // OLD: const res = await fetch(`/api/provider/${slug}`, { method: 'PATCH' })
  const res = await fetch(`/api/dashboard/${slug}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  return res.json()
}
```

---

## Migration Checklist

### Phase 1: Prepare New Routes
- [ ] Create `/api/[slug]/profile/route.ts`
- [ ] Update `/api/dashboard/[slug]/route.ts` PATCH handler
- [ ] Test new endpoints with existing frontend (parallel deployment)

### Phase 2: Update Frontend
- [ ] Update `lib/api.ts` with new endpoints
- [ ] Update components using old endpoints:
  - [ ] `app/[slug]/page.tsx` (booking page)
  - [ ] `app/dashboard/[slug]/page.tsx` (dashboard)
  - [ ] Any other consumers
- [ ] Test end-to-end flows

### Phase 3: Remove Old Routes
- [ ] Delete `/api/provider/[slug]/route.ts`
- [ ] Delete `/api/provider/[slug]/settings/route.ts`
- [ ] Delete `/api/auth/[...nextauth]/route.ts`
- [ ] Verify no references remain

### Phase 4: Documentation
- [ ] Update CLAUDE.md with new API structure
- [ ] Add API route comments
- [ ] Update any API documentation

---

## Benefits of This Refactor

✅ **Clear Separation**
- Public routes: `/api/[slug]/*`
- Protected routes: `/api/dashboard/[slug]/*`

✅ **No Redundancy**
- Single endpoint for provider updates
- Consistent HTTP method usage (PATCH for partial updates)

✅ **Easier to Secure**
- All protected routes under `/api/dashboard/*`
- Can apply middleware at namespace level

✅ **Better Developer Experience**
- Intuitive URL structure
- Easier to remember and use
- Less confusion about which endpoint to call

✅ **Minimal Migration Risk**
- Small, focused changes
- Can test in parallel before switching
- Easy rollback if needed

---

## Alternative: Option A (Future Consideration)

For larger scale, consider **semantic grouping**:

```
/api/
├── /auth/*                    # Authentication
├── /providers/*               # Provider operations
│   ├── /onboard
│   └── /[slug]/*              # All provider endpoints
└── /bookings/*                # Customer booking flow
    └── /[slug]/*              # All booking endpoints
```

**When to implement:**
- When API grows beyond 20-30 endpoints
- When adding API versioning (`/api/v1/`, `/api/v2/`)
- When multiple teams work on different API domains

---

## Next.js Best Practices Alignment

✅ **Good:**
- Using Route Handlers correctly
- Proper dynamic routes with `[slug]`
- Async params handling (Next.js 15)

🎯 **Can Improve:**
- **Middleware** - Use `middleware.ts` for auth instead of per-route checks
- **Error Handling** - Consistent error response format
- **API Versioning** - Plan for future API evolution
- **Rate Limiting** - Add protection for public endpoints

---

## Summary

This refactor addresses core architectural issues while maintaining backward compatibility during migration. The proposed changes are:

1. **Move** public provider profile to `/api/[slug]/profile`
2. **Consolidate** settings updates to `/api/dashboard/[slug]` PATCH
3. **Delete** redundant `/api/provider/*` routes
4. **Remove** unused NextAuth route

**Estimated Effort:** 4-6 hours
**Risk Level:** Low (can run old and new routes in parallel)
**Impact:** High (clearer architecture, easier maintenance)
