import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendCancellationEmail } from '@/lib/email';
import { AppointmentStatus } from '@/lib/types';

// GET - Retrieve booking details by token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
) {
  try {
    const { token } = await params;

    // Validate token and fetch appointment
    const result = await pool.query(
      `SELECT
        bt.*,
        a.*,
        sp.name as provider_name,
        sp.business_name as provider_business_name,
        sp.location as provider_location,
        sp.phone as provider_phone
      FROM booking_tokens bt
      JOIN appointments a ON bt.appointment_id = a.id
      JOIN service_providers sp ON a.provider_id = sp.id
      WHERE bt.token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const row = result.rows[0];

    // Check rate limiting
    if (row.used_count > 20) {
      return NextResponse.json(
        { error: 'Too many requests for this booking link' },
        { status: 429 }
      );
    }

    // Update usage counter
    await pool.query(
      `UPDATE booking_tokens
       SET used_count = used_count + 1, last_used_at = NOW()
       WHERE token = $1`,
      [token]
    );

    // Check expiration (allow viewing even if expired)
    const now = new Date();
    const expiresAt = new Date(row.expires_at);
    const isExpired = expiresAt < now;

    // Return booking details
    return NextResponse.json({
      appointment: {
        id: row.id,
        appointment_date: row.appointment_date,
        appointment_time: row.appointment_time,
        duration: row.duration,
        price: row.price,
        status: row.status,
        customer_notes: row.customer_notes,
        customer_email: row.customer_email,
        customer_first_name: row.customer_first_name,
        customer_last_name: row.customer_last_name,
        customer_phone: row.customer_phone,
      },
      provider: {
        name: row.provider_name,
        business_name: row.provider_business_name,
        location: row.provider_location,
        phone: row.provider_phone,
      },
      service: {
        name: row.service_name,
        duration: row.duration,
        price: row.price,
      },
      token: {
        expires_at: row.expires_at,
        is_expired: isExpired,
      },
    });

  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve booking' },
      { status: 500 }
    );
  }
}

// PATCH - Cancel booking
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
) {
  try {
    const { slug, token } = await params;

    // Validate token
    const tokenResult = await pool.query(
      `SELECT bt.*, a.*,
              sp.name as provider_name,
              sp.business_name as provider_business_name,
              sp.slug as provider_slug
       FROM booking_tokens bt
       JOIN appointments a ON bt.appointment_id = a.id
       JOIN service_providers sp ON a.provider_id = sp.id
       WHERE bt.token = $1`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const row = tokenResult.rows[0];

    // Check expiration (strict for modifications)
    const now = new Date();
    const expiresAt = new Date(row.expires_at);
    if (expiresAt < now) {
      return NextResponse.json(
        { error: 'This booking link has expired' },
        { status: 410 }
      );
    }

    // Check if already cancelled
    if (row.status === AppointmentStatus.CANCELLED) {
      return NextResponse.json(
        { error: 'This booking is already cancelled' },
        { status: 400 }
      );
    }

    // Check if appointment is in the past
    const appointmentDateTime = new Date(`${row.appointment_date}T${row.appointment_time}`);
    if (appointmentDateTime < now) {
      return NextResponse.json(
        { error: 'Cannot cancel past appointments' },
        { status: 400 }
      );
    }

    // Update appointment status
    await pool.query(
      `UPDATE appointments SET status = $1 WHERE id = $2`,
      [AppointmentStatus.CANCELLED, row.appointment_id]
    );

    // Send cancellation email (provider data already fetched in first query)
    try {
      await sendCancellationEmail({
        customer: {
          email: row.customer_email,
          first_name: row.customer_first_name,
          last_name: row.customer_last_name,
          phone: row.customer_phone || '',
        },
        provider: {
          name: row.provider_name,
          business_name: row.provider_business_name,
          slug: row.provider_slug,
        },
        service: {
          name: row.service_name,
          duration: row.duration,
          price: row.price,
        },
        appointment: {
          id: row.appointment_id,
          appointment_date: row.appointment_date,
          appointment_time: row.appointment_time,
          customer_notes: row.customer_notes,
        },
      });
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    return NextResponse.json({
      message: 'Booking cancelled successfully',
      appointment: {
        id: row.appointment_id,
        status: AppointmentStatus.CANCELLED,
      },
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
