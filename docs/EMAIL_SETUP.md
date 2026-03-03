# Email Service Setup - Resend

This document explains how to set up email functionality for the BuKe booking platform using Resend.

## Overview

The booking system sends transactional emails to customers:
- **Booking confirmation** - Sent immediately after successful booking with magic link
- **Cancellation confirmation** - Sent when customer cancels their appointment

## Why Resend?

- **Modern API** built for Next.js/React applications
- **Free tier**: 3,000 emails/month, 100 emails/day
- **React Email** component support for template building
- **Simple integration** with excellent developer experience
- **Reliable delivery** with built-in analytics dashboard

## Getting Your API Key

### 1. Create a Resend Account

Visit [resend.com](https://resend.com) and sign up for a free account.

### 2. Verify Your Domain (Production)

For production use, you need to verify your domain to send emails:

1. Go to [Resend Dashboard → Domains](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the provided DNS records to your domain provider:
   - **MX records** - For receiving bounce notifications
   - **TXT records** (SPF, DKIM) - For authentication
   - **CNAME record** (DKIM) - For signing
5. Wait for verification (usually takes a few minutes to 24 hours)

**Note:** For development/testing, you can use Resend's test domain (`onboarding@resend.dev`) without verification, but these emails will only be delivered to your verified email address.

### 3. Generate API Key

1. Go to [Resend Dashboard → API Keys](https://resend.com/api-keys)
2. Click **"Create API Key"**
3. Give it a descriptive name (e.g., "BuKe Production" or "BuKe Development")
4. Select permissions:
   - **Send emails** (required)
   - **Domains** (optional, for domain management via API)
5. Click **"Create"**
6. **Copy the API key immediately** - it will only be shown once

### 4. Add to Environment Variables

#### Local Development (.env.local)

```bash
# Email Service (Resend)
RESEND_API_KEY="re_123456789_YOUR_ACTUAL_API_KEY"
FROM_EMAIL="bookings@yourdomain.com"

# Base URL for magic links
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

#### Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add the following variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `RESEND_API_KEY` | `re_123456789_YOUR_ACTUAL_API_KEY` | Production, Preview, Development |
| `FROM_EMAIL` | `bookings@yourdomain.com` | Production, Preview, Development |
| `NEXT_PUBLIC_BASE_URL` | `https://your-production-domain.com` | Production |
| `NEXT_PUBLIC_BASE_URL` | `https://your-preview-domain.vercel.app` | Preview |

4. Redeploy your application for changes to take effect

## Configuration Details

### RESEND_API_KEY

- **Format**: `re_` followed by a string of characters
- **Example**: `re_123456789AbCdEfGhIjKlMnOpQrStUvWxYz`
- **Get from**: [resend.com/api-keys](https://resend.com/api-keys)
- **Keep secure**: Never commit to version control
- **Optional for builds**: The app will build successfully without this key (email sending will be skipped)

### FROM_EMAIL

- **Format**: `name@yourdomain.com`
- **Requirements**:
  - Must be from a domain you've verified in Resend
  - For development/testing: Use `onboarding@resend.dev` (default Resend test domain)
  - For production: Use your verified domain (e.g., `bookings@yourdomain.com`, `noreply@yourdomain.com`)
- **Examples**:
  - Development: `onboarding@resend.dev`
  - Production: `bookings@buke.app`
  - Production: `noreply@yourbarber.com`

### NEXT_PUBLIC_BASE_URL

- **Format**: Full URL including protocol (http:// or https://)
- **Used for**: Generating magic links in emails
- **Examples**:
  - Local: `http://localhost:3000`
  - Production: `https://buke.app`
  - Custom domain: `https://bookings.yourcompany.com`

## Pricing Tiers

### Free Tier
- **3,000 emails/month**
- **100 emails/day**
- **Good for**: Testing, small businesses, low-volume operations

### Pro Tier ($20/month)
- **50,000 emails/month**
- **Recommended for**: 10,000+ providers with moderate booking volume

### Business Tier ($85/month)
- **1,000,000 emails/month**
- **Recommended for**: High-volume platforms

### Cost Calculation Example

For a platform with:
- 10,000 service providers
- 10 bookings per provider per month
- 10% cancellation rate

**Monthly email volume:**
- 100,000 confirmation emails
- 10,000 cancellation emails
- **Total: 110,000 emails/month**

**Required plan:** Pro ($20/month) or Business ($85/month)

## Testing Email Sending

### 1. Development Mode (Without Verified Domain)

For testing during development, use Resend's test domain:

```bash
FROM_EMAIL="onboarding@resend.dev"
```

**Important**: Emails sent from `onboarding@resend.dev` will only be delivered to:
- The email address associated with your Resend account
- Emails added to your Resend "Allowed Recipients" list

To add test recipients:
1. Go to [Resend Dashboard → Settings → Allowed Recipients](https://resend.com/settings/allowed-recipients)
2. Add email addresses you want to test with
3. Verify each email address (Resend will send a verification link)

### 2. Production Mode (With Verified Domain)

Once your domain is verified, update:

```bash
FROM_EMAIL="bookings@yourdomain.com"
```

Emails will be delivered to all recipients.

### 3. Test Booking Flow

1. Start development server: `npm run dev`
2. Navigate to a provider's booking page: `http://localhost:3000/test-provider`
3. Complete a booking with your email address
4. Check your inbox for the confirmation email
5. Click the magic link buttons to test:
   - **View Details** - Opens booking page
   - **Reschedule** - Opens booking page with reschedule modal
   - **Cancel Booking** - Opens booking page with cancel confirmation modal

### 4. Check Resend Dashboard

After sending test emails:
1. Go to [Resend Dashboard → Emails](https://resend.com/emails)
2. View sent emails, delivery status, and opens/clicks
3. Check for bounce/complaint rates

## Email Templates

Email templates are defined in `lib/email.ts`:

### Booking Confirmation Email

Contains:
- Customer greeting with first name
- Appointment details card (service, date, time, duration, price)
- Provider information (location, phone)
- Customer notes (if provided)
- **Three action buttons:**
  - 📋 View Details → Opens booking page
  - 📅 Reschedule → Opens booking page with reschedule modal
  - ❌ Cancel Booking → Opens booking page with cancel confirmation
- Expiration notice (links expire 24 hours after appointment)
- Footer with provider contact info

### Cancellation Email

Contains:
- Customer greeting
- Cancelled booking details (service, date, time)
- Link to book a new appointment
- Footer with contact info

## Security & Best Practices

### API Key Security

✅ **DO:**
- Store API keys in environment variables
- Use different API keys for development and production
- Rotate API keys periodically (every 6-12 months)
- Restrict API key permissions to minimum required

❌ **DON'T:**
- Commit API keys to version control
- Share API keys in public channels
- Use production keys in development
- Hardcode API keys in source code

### Email Sending Best Practices

1. **Verify your domain** - Improves deliverability and reduces spam complaints
2. **Set up SPF/DKIM/DMARC** - Authenticates your emails
3. **Monitor bounce rates** - Keep below 5% to maintain sender reputation
4. **Handle unsubscribes** - Not applicable for transactional emails, but consider for marketing
5. **Rate limiting** - Resend has built-in rate limiting per plan tier

### Magic Link Security

The booking system uses secure magic links:
- **Cryptographically secure tokens** - Generated with `crypto.randomBytes(32)`
- **Time-limited** - Expire 24 hours after appointment time
- **Single-purpose** - Each token is tied to one appointment
- **Rate-limited** - Max 20 requests per token
- **No authentication needed** - Customers don't need passwords

## Graceful Degradation

The application handles missing Resend API key gracefully:

- **Build time**: App builds successfully without API key
- **Runtime**: If API key is missing:
  - Email sending is skipped
  - Warning logged: `"Resend API key not configured - skipping email send"`
  - Booking still succeeds
  - User sees success message with token link
  - Magic link still works for booking management

This allows:
- Testing without email service
- Development without API key
- Deployment without breaking builds

## Troubleshooting

### Emails Not Sending

**Check:**
1. API key is correct in environment variables
2. `FROM_EMAIL` matches a verified domain
3. Check Resend dashboard for error logs
4. Verify environment variables are loaded (`console.log(process.env.RESEND_API_KEY)`)

**Common causes:**
- Invalid API key
- Unverified domain
- Rate limit exceeded (100/day on free tier)
- Recipient email bouncing

### Emails Going to Spam

**Solutions:**
1. Verify your domain with proper DNS records
2. Set up SPF, DKIM, and DMARC records
3. Check sender reputation in Resend dashboard
4. Avoid spammy content in subject lines
5. Ensure consistent "From" address

### Domain Verification Stuck

**Steps:**
1. Wait 24-48 hours for DNS propagation
2. Use DNS checker tools to verify records are published
3. Try removing and re-adding domain in Resend
4. Contact Resend support if still failing

### Development Testing Issues

**If emails not arriving:**
1. Use `onboarding@resend.dev` as FROM_EMAIL
2. Add your test email to "Allowed Recipients" in Resend dashboard
3. Verify the test recipient email address
4. Check spam folder

## Migration from Other Email Services

If migrating from another service (SendGrid, Mailgun, etc.):

1. Install Resend package: `npm install resend`
2. Replace email service initialization in `lib/email.ts`
3. Update environment variables
4. Test thoroughly before switching production
5. Keep old service active during transition period

## Monitoring & Analytics

### Resend Dashboard

Monitor:
- **Delivery rate** - Should be >95%
- **Bounce rate** - Should be <5%
- **Complaint rate** - Should be <0.1%
- **Opens/clicks** - Indicates engagement

### Error Handling

Emails are sent with try/catch:
```typescript
try {
  await sendBookingConfirmationEmail(data);
} catch (emailError) {
  console.error('Failed to send confirmation email:', emailError);
  // Continue - booking was created successfully
}
```

This ensures:
- Booking succeeds even if email fails
- Errors are logged for debugging
- User still gets booking confirmation on screen

## Support

- **Resend Docs**: [resend.com/docs](https://resend.com/docs)
- **Resend Support**: [resend.com/support](https://resend.com/support)
- **API Reference**: [resend.com/docs/api-reference](https://resend.com/docs/api-reference)
- **Status Page**: [status.resend.com](https://status.resend.com)

## Next Steps

After setting up email service:

1. ✅ Create Resend account
2. ✅ Generate API key
3. ✅ Add to environment variables
4. ✅ Test booking flow
5. ⏳ Verify domain for production
6. ⏳ Monitor deliverability
7. ⏳ Set up DNS records (SPF, DKIM, DMARC)
8. ⏳ Consider upgrading plan based on volume
