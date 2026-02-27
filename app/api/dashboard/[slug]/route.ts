import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { DashboardData, DashboardStats, AppointmentWithDetails, CustomerPublic } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');

    if (!password) {
      return NextResponse.json(
        { detail: 'Password is required' },
        { status: 400 }
      );
    }

    // Verify password and get provider
    const providerResult = await pool.query(
      'SELECT id, slug, name, business_name FROM service_providers WHERE slug = $1 AND password = $2',
      [slug, password]
    );

    if (providerResult.rows.length === 0) {
      return NextResponse.json(
        { detail: 'Invalid password' },
        { status: 401 }
      );
    }

    const provider = providerResult.rows[0];
    const providerId = provider.id;

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Get stats - handle if appointments table doesn't exist
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
    ).catch(() => ({ rows: [{ today_appointments: 0, week_appointments: 0, total_customers: 0 }] }));

    const stats: DashboardStats = {
      today_appointments: statsResult.rows[0]?.today_appointments || 0,
      week_appointments: statsResult.rows[0]?.week_appointments || 0,
      total_customers: statsResult.rows[0]?.total_customers || 0,
      rating: 4.9, // Placeholder - implement reviews system later
    };

    // Get today's appointments with customer and service details
    // First check if appointments table exists and has data
    const appointmentsResult = await pool.query(
      `
      SELECT
        a.id,
        a.provider_id,
        a.customer_id,
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
    ).catch(() => ({ rows: [] })); // Return empty if table doesn't exist

    // Get services from provider's JSONB column
    const servicesResult = await pool.query(
      'SELECT services FROM service_providers WHERE id = $1',
      [providerId]
    );
    const services = servicesResult.rows[0]?.services || [];

    // Map appointments with full details
    const appointments: AppointmentWithDetails[] = appointmentsResult.rows.map((row) => {
      // Use first service as default if no service mapping exists
      const service = services[0] || { name: 'Service', duration: 30, price: 0, icon: '✂️' };

      return {
        id: row.id,
        provider_id: row.provider_id,
        customer_id: row.customer_id,
        service_id: '0', // Default to first service
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
          id: '0',
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

    // Get recent customers - handle if table doesn't exist
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
    ).catch(() => ({ rows: [] })); // Return empty if table doesn't exist

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
