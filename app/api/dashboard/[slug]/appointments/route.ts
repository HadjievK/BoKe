import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { AppointmentWithDetails } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!password) {
      return NextResponse.json(
        { detail: 'Password is required' },
        { status: 400 }
      );
    }

    // Verify password and get provider
    const providerResult = await pool.query(
      'SELECT id FROM service_providers WHERE slug = $1 AND password = $2',
      [slug, password]
    );

    if (providerResult.rows.length === 0) {
      return NextResponse.json(
        { detail: 'Invalid password' },
        { status: 401 }
      );
    }

    const providerId = providerResult.rows[0].id;

    // Build query based on date filters
    let query = `
      SELECT
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
        c.created_at as customer_created_at
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      WHERE a.provider_id = $1
    `;

    const queryParams: any[] = [providerId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND a.appointment_date >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND a.appointment_date <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

    const appointmentsResult = await pool.query(query, queryParams);

    // Get services from provider's JSONB column
    const servicesResult = await pool.query(
      'SELECT services FROM service_providers WHERE id = $1',
      [providerId]
    );
    const services = servicesResult.rows[0]?.services || [];

    // Map appointments with full details
    const appointments: AppointmentWithDetails[] = appointmentsResult.rows.map((row) => {
      const service = services.find((s: any, index: number) => {
        return index.toString() === row.service_id || s.name === row.service_id;
      }) || services[0] || { name: 'Service', duration: 30, price: 0, icon: '✂️' };

      return {
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
          created_at: row.customer_created_at,
        },
        service: {
          id: row.service_id,
          provider_id: row.provider_id,
          name: service.name || 'Service',
          duration: service.duration || row.duration,
          price: service.price || row.price,
          description: service.description,
          icon: service.icon || '✂️',
          is_active: service.is_active !== false,
          created_at: row.created_at,
        },
      };
    });

    // Calculate appointment counts by date
    const appointmentsByDate: Record<string, number> = {};
    appointmentsResult.rows.forEach((row) => {
      const date = row.appointment_date;
      appointmentsByDate[date] = (appointmentsByDate[date] || 0) + 1;
    });

    return NextResponse.json({
      appointments,
      appointments_by_date: appointmentsByDate
    });

  } catch (error: any) {
    console.error('Appointments API error:', error);
    return NextResponse.json(
      { detail: `Failed to fetch appointments: ${error.message}` },
      { status: 500 }
    );
  }
}
