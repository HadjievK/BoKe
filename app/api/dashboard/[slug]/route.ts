import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { DashboardData, DashboardStats, AppointmentWithDetails, CustomerPublic } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const pin = searchParams.get('pin');

    if (!pin) {
      return NextResponse.json(
        { detail: 'PIN is required' },
        { status: 400 }
      );
    }

    // Verify PIN and get provider
    const providerResult = await pool.query(
      'SELECT id, slug, name, business_name FROM service_providers WHERE slug = $1 AND pin = $2',
      [slug, pin]
    );

    if (providerResult.rows.length === 0) {
      return NextResponse.json(
        { detail: 'Invalid PIN' },
        { status: 401 }
      );
    }

    const provider = providerResult.rows[0];
    const providerId = provider.id;

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Get stats
    const statsResult = await pool.query(
      `
      SELECT
        COUNT(CASE WHEN appointment_date = $1 THEN 1 END)::int as today_appointments,
        COUNT(CASE WHEN appointment_date >= date_trunc('week', CURRENT_DATE) THEN 1 END)::int as week_appointments,
        COUNT(DISTINCT customer_id)::int as total_customers
      FROM appointments
      WHERE provider_id = $2 AND status != 'cancelled'
      `,
      [today, providerId]
    );

    const stats: DashboardStats = {
      today_appointments: statsResult.rows[0].today_appointments,
      week_appointments: statsResult.rows[0].week_appointments,
      total_customers: statsResult.rows[0].total_customers,
      rating: 4.9, // Placeholder - implement reviews system later
    };

    // Get today's appointments with customer and service details
    const appointmentsResult = await pool.query(
      `
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
        AND a.appointment_date = $2
        AND a.status != 'cancelled'
      ORDER BY a.appointment_time ASC
      `,
      [providerId, today]
    );

    // Get services from provider's JSONB column
    const servicesResult = await pool.query(
      'SELECT services FROM service_providers WHERE id = $1',
      [providerId]
    );
    const services = servicesResult.rows[0]?.services || [];

    // Map appointments with full details
    const appointments: AppointmentWithDetails[] = appointmentsResult.rows.map((row) => {
      // Find the matching service from the services array
      const service = services.find((s: any, index: number) => {
        // Try to match by service index (stored as service_id in appointments)
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

    // Get recent customers
    const customersResult = await pool.query(
      `
      SELECT DISTINCT ON (c.id)
        c.id,
        c.email,
        c.first_name,
        c.last_name,
        c.phone,
        c.created_at
      FROM customers c
      JOIN appointments a ON c.id = a.customer_id
      WHERE a.provider_id = $1
      ORDER BY c.id, a.created_at DESC
      LIMIT 10
      `,
      [providerId]
    );

    const recent_customers: CustomerPublic[] = customersResult.rows;

    const dashboardData: DashboardData = {
      stats,
      appointments,
      recent_customers,
    };

    return NextResponse.json(dashboardData);

  } catch (error: any) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { detail: `Failed to fetch dashboard data: ${error.message}` },
      { status: 500 }
    );
  }
}
