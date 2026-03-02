import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendBookingConfirmationEmail } from '@/lib/email';
import { AppointmentStatus } from '@/lib/types';
import { validateEmail } from '@/lib/utils';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { service_id, appointment_date, appointment_time, customer } = body;

    if (!service_id || !appointment_date || !appointment_time || !customer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate customer email
    if (!validateEmail(customer.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Verify provider exists and get service details
    const providerResult = await pool.query(
      'SELECT id, name, business_name, location, phone, services FROM service_providers WHERE slug = $1',
      [slug]
    );

    if (providerResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    const provider = providerResult.rows[0];
    const providerId = provider.id;
    const services = provider.services || [];

    // Find the service - service_id format is "providerId_index"
    let serviceIndex: number;
    if (service_id.includes('_')) {
      // New format: "providerId_index"
      const parts = service_id.split('_');
      serviceIndex = parseInt(parts[parts.length - 1]);
    } else {
      // Legacy format: just the index
      serviceIndex = parseInt(service_id);
    }

    const service = services[serviceIndex];

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Check if slot is still available
    const existingResult = await pool.query(
      `SELECT id FROM appointments
       WHERE provider_id = $1
         AND appointment_date = $2
         AND appointment_time = $3
         AND status = $4`,
      [providerId, appointment_date, appointment_time, AppointmentStatus.CONFIRMED]
    ).catch(() => ({ rows: [] }));

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      );
    }

    // Create appointment with inline customer data (no customer table lookup)
    const appointmentResult = await pool.query(
      `INSERT INTO appointments (
        provider_id, service_id, service_name, appointment_date, appointment_time,
        duration, price, customer_notes, status,
        customer_email, customer_first_name, customer_last_name, customer_phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        providerId,
        service_id,
        service.name,
        appointment_date,
        appointment_time,
        service.duration,
        service.price,
        customer.notes || null,
        AppointmentStatus.CONFIRMED,
        customer.email.toLowerCase(),
        customer.first_name,
        customer.last_name,
        customer.phone || null,
      ]
    );

    const appointment = appointmentResult.rows[0];

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');

    // Calculate expiration (24 hours after appointment)
    const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`);
    const expiresAt = new Date(appointmentDateTime);
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Store token
    await pool.query(
      `INSERT INTO booking_tokens (token, appointment_id, expires_at)
       VALUES ($1, $2, $3)`,
      [token, appointment.id, expiresAt]
    );

    // Generate magic link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const magicLink = `${baseUrl}/${slug}/booking/${token}`;

    // Send confirmation email
    try {
      await sendBookingConfirmationEmail({
        customer: {
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
          phone: customer.phone || '',
        },
        provider: {
          name: provider.name,
          business_name: provider.business_name,
          location: provider.location,
          phone: provider.phone,
          slug: slug,
        },
        service: {
          name: service.name,
          duration: service.duration,
          price: service.price,
        },
        appointment: {
          id: appointment.id,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
          customer_notes: appointment.customer_notes,
        },
        magicLink,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Continue - booking was created successfully
    }

    // Return confirmation with token for immediate access
    return NextResponse.json({
      appointment: {
        id: appointment.id,
        service_name: service.name,
        appointment_date,
        appointment_time,
        duration: service.duration,
        price: service.price,
        status: 'confirmed',
        customer_email: customer.email,
        customer_first_name: customer.first_name,
        customer_last_name: customer.last_name,
        created_at: appointment.created_at,
      },
      token,
      message: 'Booking confirmed! Check your email for a link to manage your booking.',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { error: `Failed to create booking: ${error.message}` },
      { status: 500 }
    );
  }
}
