import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const serviceId = searchParams.get('service_id');

    if (!date) {
      return NextResponse.json(
        { detail: 'Date is required' },
        { status: 400 }
      );
    }

    // Verify provider exists
    const providerResult = await pool.query(
      'SELECT id, services FROM service_providers WHERE slug = $1',
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

    // Get existing appointments for the date
    const appointmentsResult = await pool.query(
      `SELECT appointment_time, duration
       FROM appointments
       WHERE provider_id = $1
         AND appointment_date = $2
         AND status != 'cancelled'`,
      [providerId, date]
    ).catch(() => ({ rows: [] }));

    const bookedSlots = appointmentsResult.rows.map(row => row.appointment_time);

    // Generate time slots (9 AM to 6 PM, 30-minute intervals)
    const slots = [];
    const startHour = 9;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        // Check if slot is already booked
        const isBooked = bookedSlots.includes(timeStr);

        slots.push({
          time: timeStr,
          available: !isBooked
        });
      }
    }

    return NextResponse.json({
      date,
      slots
    });

  } catch (error: any) {
    console.error('Availability API error:', error);
    return NextResponse.json(
      { detail: `Failed to fetch availability: ${error.message}` },
      { status: 500 }
    );
  }
}
