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

    // Verify provider exists and get calendar settings
    const providerResult = await pool.query(
      `SELECT id, services, calendar_start_time, calendar_end_time,
              slot_duration, buffer_time, working_days
       FROM service_providers WHERE slug = $1`,
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

    // Get calendar settings with defaults
    const calendarStartTime = provider.calendar_start_time || '09:00:00';
    const calendarEndTime = provider.calendar_end_time || '17:00:00';
    const slotDuration = provider.slot_duration || 30;
    const bufferTime = provider.buffer_time || 0;
    const workingDays = provider.working_days || {
      monday: true, tuesday: true, wednesday: true, thursday: true, friday: true,
      saturday: false, sunday: false
    };

    // Check if the requested date is a working day
    const requestedDate = new Date(date + 'T00:00:00');
    const dayName = requestedDate.toLocaleDateString('en-GB', { weekday: 'long' }).toLowerCase();

    if (!workingDays[dayName]) {
      return NextResponse.json({
        date,
        slots: [],
        message: 'Provider is not available on this day'
      });
    }

    // Get existing appointments for the date
    const appointmentsResult = await pool.query(
      `SELECT appointment_time, duration
       FROM appointments
       WHERE provider_id = $1
         AND appointment_date = $2
         AND status != 'cancelled'`,
      [providerId, date]
    ).catch(() => ({ rows: [] }));

    // Parse booked time slots and calculate blocked time ranges
    const bookedTimeRanges = appointmentsResult.rows.map(row => {
      // Parse time (handle both HH:MM and HH:MM:SS formats)
      const timeParts = row.appointment_time.split(':');
      const startHour = parseInt(timeParts[0]);
      const startMinute = parseInt(timeParts[1]);
      const startMinutes = startHour * 60 + startMinute;

      // Calculate end time based on duration + buffer time
      const endMinutes = startMinutes + (row.duration || 30) + bufferTime;

      return { startMinutes, endMinutes };
    });

    // Parse calendar start and end times
    const [startHourStr, startMinuteStr] = calendarStartTime.split(':');
    const [endHourStr, endMinuteStr] = calendarEndTime.split(':');
    const startHour = parseInt(startHourStr);
    const startMinute = parseInt(startMinuteStr);
    const endHour = parseInt(endHourStr);
    const endMinute = parseInt(endMinuteStr);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    // Generate time slots based on provider's settings
    const slots = [];

    for (let currentMinutes = startTotalMinutes; currentMinutes < endTotalMinutes; currentMinutes += slotDuration) {
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      // Check if this slot conflicts with any booked appointment
      // A slot is blocked if it overlaps with any existing appointment (including buffer)
      const isBlocked = bookedTimeRanges.some(range => {
        // Slot is blocked if it starts during an existing appointment or buffer period
        return currentMinutes >= range.startMinutes && currentMinutes < range.endMinutes;
      });

      slots.push({
        time: timeStr,
        available: !isBlocked
      });
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
