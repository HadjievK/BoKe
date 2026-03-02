import { Resend } from 'resend';
import { formatDate, formatTime } from '@/lib/utils';

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface BookingEmailData {
  customer: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
  provider: {
    name: string;
    business_name: string;
    location?: string;
    phone?: string;
    slug: string;
  };
  service: {
    name: string;
    duration: number;
    price: number;
  };
  appointment: {
    id: string;
    appointment_date: string;
    appointment_time: string;
    customer_notes?: string;
  };
  magicLink: string;
}

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  // Skip email sending if Resend is not configured
  if (!resend) {
    console.warn('Resend API key not configured - skipping email send');
    return { success: false, message: 'Email service not configured' };
  }

  const { customer, provider, service, appointment, magicLink } = data;

  const subject = `Booking Confirmed: ${service.name} with ${provider.business_name || provider.name}`;

  return resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to: customer.email,
    subject,
    html: generateBookingConfirmationHTML(data),
  });
}

export async function sendCancellationEmail(
  data: Omit<BookingEmailData, 'magicLink'>
) {
  // Skip email sending if Resend is not configured
  if (!resend) {
    console.warn('Resend API key not configured - skipping email send');
    return { success: false, message: 'Email service not configured' };
  }

  const { customer, provider, service, appointment } = data;

  const subject = `Booking Cancelled: ${service.name}`;

  return resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to: customer.email,
    subject,
    html: generateCancellationHTML(data),
  });
}

function generateBookingConfirmationHTML(data: BookingEmailData): string {
  const { customer, provider, service, appointment, magicLink } = data;

  // Generate action links
  const cancelLink = `${magicLink}?action=cancel`;
  const rescheduleLink = `${magicLink}?action=reschedule`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <!-- Main Container -->
  <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 30px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">✅ Booking Confirmed!</h1>
    </div>

    <!-- Content -->
    <div style="padding: 30px 20px;">
      <p style="color: #333; font-size: 16px; margin: 0 0 20px;">Hi <strong>${customer.first_name}</strong>,</p>
      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 25px;">Your appointment has been successfully confirmed. Here are your booking details:</p>

      <!-- Appointment Card -->
      <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; margin: 0 0 25px;">
        <h2 style="color: #7c3aed; margin: 0 0 15px; font-size: 18px; font-weight: 600;">${service.name}</h2>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 15px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">Provider:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${provider.business_name || provider.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">📅 Date:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${formatDate(appointment.appointment_date)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">🕐 Time:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${formatTime(appointment.appointment_time)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">⏱️ Duration:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${service.duration} minutes</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">💰 Price:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">$${service.price.toFixed(2)}</td>
            </tr>
            ${provider.location ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">📍 Location:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${provider.location}</td>
            </tr>` : ''}
            ${provider.phone ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">📞 Phone:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${provider.phone}</td>
            </tr>` : ''}
          </table>
        </div>

        ${appointment.customer_notes ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 0.5px;">Your Notes</p>
          <p style="color: #374151; font-size: 14px; margin: 0; line-height: 1.5;">${appointment.customer_notes}</p>
        </div>` : ''}
      </div>

      <!-- Action Buttons -->
      <div style="margin: 30px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 0 5px 10px 0;">
              <a href="${magicLink}" style="display: block; background: #7c3aed; color: white; padding: 14px 20px; text-decoration: none; border-radius: 8px; text-align: center; font-weight: 600; font-size: 14px;">📋 View Details</a>
            </td>
            <td style="padding: 0 0 10px 5px;">
              <a href="${rescheduleLink}" style="display: block; background: #3b82f6; color: white; padding: 14px 20px; text-decoration: none; border-radius: 8px; text-align: center; font-weight: 600; font-size: 14px;">📅 Reschedule</a>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 0;">
              <a href="${cancelLink}" style="display: block; background: #ef4444; color: white; padding: 14px 20px; text-decoration: none; border-radius: 8px; text-align: center; font-weight: 600; font-size: 14px;">❌ Cancel Booking</a>
            </td>
          </tr>
        </table>
      </div>

      <!-- Info Box -->
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 20px 0;">
        <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.5;">
          <strong>⚡ Quick actions:</strong> Use the buttons above to manage your appointment. Links expire 24 hours after your appointment time.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px;">Questions about your booking?</p>
      <p style="color: #6b7280; font-size: 13px; margin: 0;">Reply to this email or contact <strong>${provider.business_name || provider.name}</strong></p>
    </div>
  </div>

  <!-- Footer Note -->
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">This is an automated email from ${provider.business_name || provider.name}</p>
  </div>
</body>
</html>
  `;
}

function generateCancellationHTML(
  data: Omit<BookingEmailData, 'magicLink'>
): string {
  const { customer, provider, service, appointment } = data;

  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Hi ${customer.first_name},</h2>
  <p>Your appointment has been cancelled.</p>

  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Cancelled Booking</h3>
    <p><strong>Service:</strong> ${service.name}</p>
    <p><strong>Date:</strong> ${formatDate(appointment.appointment_date)}</p>
    <p><strong>Time:</strong> ${formatTime(appointment.appointment_time)}</p>
  </div>

  <p>You can book a new appointment anytime at:</p>
  <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/${provider.slug}">${provider.business_name || provider.name}</a></p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  <p style="color: #999; font-size: 12px;">
    Questions? Reply to this email.
  </p>
</body>
</html>
  `;
}
