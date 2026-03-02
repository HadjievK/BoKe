import { Resend } from 'resend';
import { formatDate, formatTime } from '@/lib/utils';

const resend = new Resend(process.env.RESEND_API_KEY);

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

  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Hi ${customer.first_name},</h2>
  <p>Your appointment has been confirmed!</p>

  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0;">📅 ${service.name}</h3>
    <p><strong>Provider:</strong> ${provider.business_name || provider.name}</p>
    <p><strong>Date:</strong> ${formatDate(appointment.appointment_date)}</p>
    <p><strong>Time:</strong> ${formatTime(appointment.appointment_time)}</p>
    <p><strong>Duration:</strong> ${service.duration} minutes</p>
    <p><strong>Price:</strong> $${service.price.toFixed(2)}</p>
    ${appointment.customer_notes ? `<p><strong>Your notes:</strong> ${appointment.customer_notes}</p>` : ''}
  </div>

  ${provider.location ? `<p>📍 <strong>Location:</strong> ${provider.location}</p>` : ''}
  ${provider.phone ? `<p>📞 <strong>Phone:</strong> ${provider.phone}</p>` : ''}

  <div style="margin: 30px 0;">
    <a href="${magicLink}"
       style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
      Manage Booking
    </a>
  </div>

  <p style="color: #666; font-size: 14px;">
    Need to cancel or view details? Use the link above.<br>
    This link expires 24 hours after your appointment.
  </p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  <p style="color: #999; font-size: 12px;">
    Questions? Reply to this email or contact ${provider.business_name || provider.name}.
  </p>
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
