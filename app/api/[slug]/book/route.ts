import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

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
        { detail: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify provider exists and get service details
    const providerResult = await pool.query(
      'SELECT id, name, business_name, services FROM service_providers WHERE slug = $1',
      [slug]
    );

    if (providerResult.rows.length === 0) {
      return NextResponse.json(
        { detail: 'Provider not found' },
        { status: 404 }
      );
    }

    const provider = providerResult.rows[0];
    const providerId = provider.id;
    const services = provider.services || [];

    // Find the service
    const serviceIndex = parseInt(service_id);
    const service = services[serviceIndex];

    if (!service) {
      return NextResponse.json(
        { detail: 'Service not found' },
        { status: 404 }
      );
    }

    // Check if slot is still available
    const existingResult = await pool.query(
      `SELECT id FROM appointments
       WHERE provider_id = $1
         AND appointment_date = $2
         AND appointment_time = $3
         AND status != 'cancelled'`,
      [providerId, appointment_date, appointment_time]
    ).catch(() => ({ rows: [] }));

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { detail: 'This time slot is no longer available' },
        { status: 409 }
      );
    }

    // Create or get customer
    let customerId;
    const customerResult = await pool.query(
      'SELECT id FROM customers WHERE email = $1',
      [customer.email]
    ).catch(() => ({ rows: [] }));

    if (customerResult.rows.length > 0) {
      customerId = customerResult.rows[0].id;
    } else {
      const newCustomerResult = await pool.query(
        `INSERT INTO customers (email, first_name, last_name, phone)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [customer.email, customer.first_name, customer.last_name, customer.phone]
      );
      customerId = newCustomerResult.rows[0].id;
    }

    // Create appointment
    const appointmentResult = await pool.query(
      `INSERT INTO appointments (
        provider_id, customer_id, service_id, appointment_date, appointment_time,
        duration, price, customer_notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, created_at`,
      [
        providerId,
        customerId,
        service_id,
        appointment_date,
        appointment_time,
        service.duration,
        service.price,
        customer.notes || null,
        'confirmed'
      ]
    );

    const appointment = appointmentResult.rows[0];

    // Return confirmation
    return NextResponse.json({
      id: appointment.id,
      provider: {
        name: provider.name,
        business_name: provider.business_name,
        slug: slug
      },
      service: {
        name: service.name,
        duration: service.duration,
        price: service.price
      },
      appointment_date,
      appointment_time,
      customer: {
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email
      },
      status: 'confirmed',
      created_at: appointment.created_at
    });

  } catch (error: any) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { detail: `Failed to create booking: ${error.message}` },
      { status: 500 }
    );
  }
}
