# Frontend Migration TODO

## Dashboard Authentication Update Required

The backend has been updated to use JWT authentication, but the frontend still uses the old password-based authentication.

### Current State
- Backend: JWT authentication (tokens, cookies)
- Frontend: Password in sessionStorage (old approach)

### Files Needing Updates

#### `app/dashboard/[slug]/page.tsx`
This file needs significant refactoring:

**Current (Password-based):**
```typescript
const [password, setPassword] = useState('')
const data = await getDashboardData(slug, password)
```

**Required (JWT-based):**
```typescript
// Check if authenticated on mount
useEffect(() => {
  const checkAuth = async () => {
    const auth = await verifyAuth();
    if (!auth.authenticated) {
      router.push('/signin');
      return;
    }
    // User is authenticated, load dashboard
    const data = await getDashboardData(slug);
    setDashboardData(data);
  };
  checkAuth();
}, []);
```

### Migration Steps

1. **Remove password state management**
   - Remove `password` state
   - Remove `sessionStorage` password storage
   - Remove password input form

2. **Add authentication check**
   - Import `verifyAuth` from `@/lib/api`
   - Check auth status on component mount
   - Redirect to `/signin` if not authenticated

3. **Update API calls**
   - Remove password parameter from all API calls:
     - `getDashboardData(slug)` - no password needed
     - `getAppointments(slug)` - no password needed
     - `getCustomers(slug)` - no password needed

4. **Add sign-out functionality**
   - Import `signOut` from `@/lib/api`
   - Add sign-out button
   - Call `signOut()` and redirect to signin

5. **Update settings route**
   - Change `password` parameter to `currentPassword`
   - This matches the new backend API

### Example Implementation

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getDashboardData, verifyAuth, signOut } from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Check if authenticated
        const auth = await verifyAuth()
        if (!auth.authenticated) {
          router.push('/signin')
          return
        }

        // Verify slug matches authenticated user
        if (auth.slug !== slug) {
          router.push(`/dashboard/${auth.slug}`)
          return
        }

        // Load dashboard data
        const data = await getDashboardData(slug)
        setDashboardData(data)
      } catch (error) {
        console.error('Failed to load dashboard:', error)
        router.push('/signin')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [slug, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/signin')
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <button onClick={handleSignOut}>Sign Out</button>
      {/* Rest of dashboard */}
    </div>
  )
}
```

### Testing

After migration:
1. Try accessing dashboard without signing in → should redirect to signin
2. Sign in → should redirect to dashboard
3. Refresh dashboard page → should stay on dashboard (token in cookie)
4. Sign out → should redirect to signin
5. Try accessing another provider's dashboard → should redirect or show error

### Temporary Workaround

To make the existing code compile, you can temporarily update the API types:

```typescript
// In lib/api.ts - make password optional
export async function getDashboardData(
  slug: string,
  password?: string  // Make optional for backward compatibility
): Promise<DashboardData>
```

But this is NOT recommended - the frontend should be fully migrated to use JWT.
