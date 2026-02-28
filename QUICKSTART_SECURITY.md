# Quick Start: Security Updates

## 🚀 Setup (5 minutes)

### Step 1: Install Dependencies
Already done! ✅
```bash
npm install bcrypt @types/bcrypt jsonwebtoken @types/jsonwebtoken
```

### Step 2: Set Environment Variable
```bash
# Generate a secure JWT secret
openssl rand -base64 32

# Copy the output and create .env.local
echo "JWT_SECRET=YOUR_OUTPUT_HERE" >> .env.local
```

Example `.env.local`:
```
JWT_SECRET=A8xQ+3kF9nL2pR7wM5vB1dH4jN6tY8cE0qW9sX7zK5mV2uP4lG1fJ3hR6nT8wB0y
DATABASE_URL=your_database_connection_string
```

### Step 3: Restart Development Server
```bash
npm run dev
```

---

## 🧪 Test It Works

### Test 1: Sign Up (creates hashed password)
```bash
curl -X POST http://localhost:3000/api/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "business_name": "Test Business",
    "service_type": "barber",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "location": "Test City",
    "bio": "Test bio",
    "services": [
      {
        "name": "Test Service",
        "duration": 30,
        "price": 50,
        "icon": "✂️",
        "description": "Test description"
      }
    ]
  }'
```

### Test 2: Sign In (gets JWT token)
```bash
curl -X POST http://localhost:3000/api/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

Should return:
```json
{
  "slug": "testbusiness",
  "name": "Test User",
  "business_name": "Test Business",
  "email": "test@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Test 3: Access Dashboard (with JWT)
```bash
curl http://localhost:3000/api/dashboard/testbusiness \
  -b cookies.txt
```

Should return dashboard data ✅

### Test 4: Access Dashboard (without JWT)
```bash
curl http://localhost:3000/api/dashboard/testbusiness
```

Should return 401 Unauthorized ✅

---

## 🔍 Verify Password Hashing

Check your database:
```sql
SELECT email, password FROM service_providers LIMIT 1;
```

Password should look like:
```
$2b$10$N9qo8uLOickgx2ZMRZoMye6qZvIvyq9D/j4n2xhz9SH4f5MQnKjqC
```

NOT like:
```
password123
```

---

## 📱 Frontend Integration

### Update Sign In Page

```typescript
import { signIn } from '@/lib/api';

const handleSignIn = async (e: FormEvent) => {
  e.preventDefault();
  try {
    const response = await signIn(email, password);
    // Token stored automatically in localStorage + cookie
    router.push(`/dashboard/${response.slug}`);
  } catch (error) {
    setError('Invalid email or password');
  }
};
```

### Update Dashboard Page

```typescript
import { getDashboardData } from '@/lib/api';

// Remove password parameter
const Dashboard = () => {
  useEffect(() => {
    const loadData = async () => {
      try {
        // No password needed anymore
        const data = await getDashboardData(slug);
        setDashboardData(data);
      } catch (error) {
        // If 401, redirect to sign in
        if (error.message.includes('Unauthorized')) {
          router.push('/signin');
        }
      }
    };
    loadData();
  }, [slug]);
};
```

### Add Sign Out Button

```typescript
import { signOut } from '@/lib/api';

const handleSignOut = async () => {
  await signOut();
  router.push('/signin');
};

return (
  <button onClick={handleSignOut}>
    Sign Out
  </button>
);
```

---

## ⚠️ Migration Required

### For Existing Users

Existing users with plain text passwords cannot log in. Choose one:

**Option A: Password Reset (Recommended)**
1. Send password reset emails
2. Users create new passwords
3. New passwords are hashed

**Option B: One-time Migration**
```typescript
// In signin route, after password validation fails
if (!isPasswordValid) {
  // Check if password is plain text (temporary)
  if (provider.password === password) {
    // Hash it and update
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE service_providers SET password = $1 WHERE id = $2',
      [hashed, provider.id]
    );
    // Continue with sign in...
  }
}
```

---

## 🐛 Troubleshooting

### "Error: JWT_SECRET is not defined"
**Fix:** Make sure `.env.local` has `JWT_SECRET=...`
```bash
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env.local
npm run dev
```

### "Error: Invalid token"
**Fix:** Token expired or invalid. Sign in again.

### "401 Unauthorized"
**Fix:** Token not sent or invalid. Check:
1. Token stored in localStorage?
2. Cookie included in request?
3. Authorization header correct?

### Existing users can't log in
**Fix:** Passwords are hashed now. See migration section above.

---

## 📚 Documentation

- `docs/SECURITY_SUMMARY.md` - Complete overview
- `docs/JWT_AUTHENTICATION.md` - Detailed JWT guide
- `docs/SECURITY_IMPROVEMENTS.md` - Password hashing details
- `.env.example` - Environment variables template

---

## ✅ Checklist

- [x] Install dependencies (bcrypt, jsonwebtoken)
- [ ] Set JWT_SECRET in .env.local
- [ ] Restart development server
- [ ] Test sign up (check password is hashed)
- [ ] Test sign in (get JWT token)
- [ ] Test dashboard access (with token)
- [ ] Test dashboard access (without token)
- [ ] Update frontend sign-in page
- [ ] Update frontend dashboard pages
- [ ] Add sign-out functionality
- [ ] Handle existing users migration
- [ ] Deploy to production

---

## 🚨 Before Production

1. **Generate new JWT_SECRET for production**
   ```bash
   openssl rand -base64 32
   # Use this in production environment variables
   ```

2. **Never commit secrets to git**
   - `.env.local` is already in `.gitignore`
   - Use Vercel/hosting platform environment variables

3. **Test thoroughly on staging first**

4. **Have rollback plan ready**

---

## 💡 Next Security Improvements

Consider implementing:
- Rate limiting (prevent brute force)
- Email verification
- Password strength requirements
- Two-factor authentication (2FA)
- Token refresh mechanism
- Audit logging

See `docs/SECURITY_SUMMARY.md` for details.
