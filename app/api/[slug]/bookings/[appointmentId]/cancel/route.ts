import { NextRequest, NextResponse } from 'next/server';
import { authenticateCustomer } from '@/lib/auth';
import pool from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string; appointmentId: string } }
) {
  try {
    const { slug, appointmentId } = params;

    // Authenticate customer using JWT token
    const customerAuth = authenticateCustomer(request);

    if (!customerAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get provider by slug
    const providerResult = await pool.query(
      'SELECT id FROM service_providers WHERE slug = $1',
      [slug]
    );

    if (providerResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    const providerId = providerResult.rows[0].id;

    // Get appointment and verify it belongs to this customer
    const appointmentResult = await pool.query(
      `SELECT
        a.id,
        a.customer_id,
        a.status,
        a.appointment_date,
        a.appointment_time
       FROM appointments a
       WHERE a.id = $1 AND a.provider_id = $2`,
      [appointmentId, providerId]
    );

    if (appointmentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const appointment = appointmentResult.rows[0];

    // Verify appointment belongs to authenticated customer
    if (appointment.customer_id !== customerAuth.customerId) {
      return NextResponse.json(
        { error: 'You do not have permission to cancel this appointment' },
        { status: 403 }
      );
    }

    // Verify appointment is in confirmed status
    if (appointment.status !== 'confirmed') {
      return NextResponse.json(
        { error: `Cannot cancel appointment with status: ${appointment.status}` },
        { status: 400 }
      );
    }

    // Verify appointment is in the future
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const now = new Date();

    if (appointmentDateTime < now) {
      return NextResponse.json(
        { error: 'Cannot cancel past appointments' },
        { status: 400 }
      );
    }

    // Update appointment status to cancelled
    const updateResult = await pool.query(
      `UPDATE appointments
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND customer_id = $2 AND status = 'confirmed'
       RETURNING *`,
      [appointmentId, customerAuth.customerId]
    );

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to cancel appointment' },
        { status: 500 }
      );
    }

    // Fetch complete appointment details with customer and service info
    const detailsResult = await pool.query(
      `SELECT
        a.id,
        a.provider_id,
        a.customer_id,
        a.service_id,
        a.appointment_date,
        a.appointment_time,
        a.duration,
        a.price,
        a.customer_notes,
        a.status,
        a.created_at,
        c.id as customer_id,
        c.email as customer_email,
        c.first_name as customer_first_name,
        c.last_name as customer_last_name,
        c.phone as customer_phone,
        c.created_at as customer_created_at,
        s.id as service_id,
        s.name as service_name,
        s.duration as service_duration,
        s.price as service_price,
        s.description as service_description,
        s.icon as service_icon,
        s.is_active as service_is_active,
        s.created_at as service_created_at
       FROM appointments a
       JOIN customers c ON a.customer_id = c.id
       JOIN services s ON a.service_id = s.id
       WHERE a.id = $1`,
      [appointmentId]
    );

    const row = detailsResult.rows[0];

    const appointmentWithDetails = {
      id: row.id,
      provider_id: row.provider_id,
      customer_id: row.customer_id,
      service_id: row.service_id,
      appointment_date: row.appointment_date,
      appointment_time: row.appointment_time,
      duration: row.duration,
      price: row.price,
      customer_notes: row.customer_notes,
      status: row.status,
      created_at: row.created_at,
      customer: {
        id: row.customer_id,
        email: row.customer_email,
        first_name: row.customer_first_name,
        last_name: row.customer_last_name,
        phone: row.customer_phone,
        created_at: row.customer_created_at
      },
      service: {
        id: row.service_id,
        provider_id: row.provider_id,
        name: row.service_name,
        duration: row.service_duration,
        price: row.service_price,
        description: row.service_description,
        icon: row.service_icon,
        is_active: row.service_is_active,
        created_at: row.service_created_at
      }
    };

    return NextResponse.json({
      appointment: appointmentWithDetails,
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
}
