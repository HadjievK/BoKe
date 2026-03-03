import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import type { DashboardData, DashboardStats, AppointmentWithDetails, CustomerPublic } from '@/lib/types';
import { authenticateProviderBySlug } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Authenticate and verify slug match
    const authResult = authenticateProviderBySlug(request, slug);
    if (authResult instanceof NextResponse) return authResult;

    const { auth, providerId } = authResult;

    // Get provider details
    const providerResult = await pool.query(
      'SELECT id, slug, name, business_name, location, avatar_url, cover_photo_url, calendar_start_time, calendar_end_time, slot_duration, buffer_time, working_days FROM service_providers WHERE id = $1',
      [providerId]
    );

    if (providerResult.rows.length === 0) {
      return NextResponse.json(
        { detail: 'Provider not found' },
        { status: 404 }
      );
    }

    const provider = providerResult.rows[0];

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
    // Handle both old (customer_id FK) and new (inline customer data) appointments
    const appointmentsResult = await pool.query(
      `
      SELECT
        a.id,
        a.provider_id,
        a.customer_id,
        a.service_id,
        a.service_name,
        a.appointment_date,
        a.appointment_time,
        a.duration,
        a.price,
        a.customer_notes,
        a.status,
        a.created_at,
        COALESCE(a.customer_email, c.email) as customer_email,
        COALESCE(a.customer_first_name, c.first_name) as customer_first_name,
        COALESCE(a.customer_last_name, c.last_name) as customer_last_name,
        COALESCE(a.customer_phone, c.phone) as customer_phone
      FROM appointments a
      LEFT JOIN customers c ON a.customer_id = c.id
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
        service_id: row.service_id || '0',
        service_name: row.service_name || service.name || 'Service',
        appointment_date: row.appointment_date,
        appointment_time: row.appointment_time,
        duration: row.duration,
        price: row.price,
        customer_notes: row.customer_notes,
        status: row.status,
        created_at: row.created_at,
        customer_email: row.customer_email,
        customer_first_name: row.customer_first_name,
        customer_last_name: row.customer_last_name,
        customer_phone: row.customer_phone,
        service: {
          id: row.service_id || '0',
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
      provider: {
        id: provider.id,
        slug: provider.slug,
        name: provider.name,
        business_name: provider.business_name,
        location: provider.location,
        calendar_start_time: provider.calendar_start_time,
        calendar_end_time: provider.calendar_end_time,
        slot_duration: provider.slot_duration,
        buffer_time: provider.buffer_time,
        working_days: provider.working_days,
      },
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

/**
 * PATCH /api/dashboard/[slug] - Update provider settings
 * Consolidated endpoint for all provider updates (replaces /api/provider/[slug] PATCH and /api/provider/[slug]/settings PUT)
 * Requires JWT authentication
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    console.log('PATCH body received:', JSON.stringify(body, null, 2));

    // Authenticate and verify slug match
    const authResult = authenticateProviderBySlug(request, slug);
    if (authResult instanceof NextResponse) return authResult;

    const { auth, providerId } = authResult;

    // Handle password change (requires current password verification)
    if (body.password) {
      if (!body.currentPassword) {
        return NextResponse.json(
          { detail: 'Current password is required to change password' },
          { status: 400 }
        );
      }

      // Verify current password
      const authResult = await pool.query(
        'SELECT password FROM service_providers WHERE id = $1',
        [providerId]
      );

      if (authResult.rows.length === 0) {
        return NextResponse.json(
          { detail: 'Provider not found' },
          { status: 404 }
        );
      }

      const isPasswordValid = await bcrypt.compare(body.currentPassword, authResult.rows[0].password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { detail: 'Invalid current password' },
          { status: 401 }
        );
      }
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;
    let hashedPassword: string | null = null;

    // Password update (defer hashing until after validation)
    if (body.password !== undefined) {
      updateFields.push(`password = $${paramIndex}`);
      hashedPassword = ''; // Placeholder, will be replaced after validation
      updateValues.push(hashedPassword);
      paramIndex++;
    }

    // Location fields
    if (body.location !== undefined) {
      updateFields.push(`location = $${paramIndex}`);
      updateValues.push(body.location);
      paramIndex++;
    }

    if (body.latitude !== undefined) {
      updateFields.push(`latitude = $${paramIndex}`);
      updateValues.push(body.latitude);
      paramIndex++;
    }

    if (body.longitude !== undefined) {
      updateFields.push(`longitude = $${paramIndex}`);
      updateValues.push(body.longitude);
      paramIndex++;
    }

    // Calendar settings
    if (body.calendar_start_time !== undefined) {
      updateFields.push(`calendar_start_time = $${paramIndex}`);
      updateValues.push(body.calendar_start_time);
      paramIndex++;
    }

    if (body.calendar_end_time !== undefined) {
      updateFields.push(`calendar_end_time = $${paramIndex}`);
      updateValues.push(body.calendar_end_time);
      paramIndex++;
    }

    if (body.slot_duration !== undefined) {
      updateFields.push(`slot_duration = $${paramIndex}`);
      updateValues.push(body.slot_duration);
      paramIndex++;
    }

    if (body.buffer_time !== undefined) {
      updateFields.push(`buffer_time = $${paramIndex}`);
      updateValues.push(body.buffer_time);
      paramIndex++;
    }

    if (body.working_days !== undefined) {
      updateFields.push(`working_days = $${paramIndex}`);
      updateValues.push(JSON.stringify(body.working_days));
      paramIndex++;
    }

    // Services JSONB with validation
    if (body.services !== undefined) {
      // Validate services array
      if (!Array.isArray(body.services)) {
        return NextResponse.json(
          { detail: 'Services must be an array' },
          { status: 400 }
        );
      }

      if (body.services.length === 0) {
        return NextResponse.json(
          { detail: 'At least one service is required' },
          { status: 400 }
        );
      }

      // Validate each service
      for (const service of body.services) {
        if (!service.name || typeof service.name !== 'string' || service.name.trim().length === 0) {
          return NextResponse.json(
            { detail: 'Each service must have a valid name' },
            { status: 400 }
          );
        }
        if (service.name.length > 100) {
          return NextResponse.json(
            { detail: 'Service name must be under 100 characters' },
            { status: 400 }
          );
        }
        if (service.duration === undefined || typeof service.duration !== 'number' || service.duration <= 0) {
          return NextResponse.json(
            { detail: 'Each service must have a valid duration greater than 0' },
            { status: 400 }
          );
        }
        if (service.duration > 480) {
          return NextResponse.json(
            { detail: 'Service duration cannot exceed 480 minutes' },
            { status: 400 }
          );
        }
        if (service.price === undefined || typeof service.price !== 'number' || service.price < 0) {
          return NextResponse.json(
            { detail: 'Each service must have a valid price of 0 or greater' },
            { status: 400 }
          );
        }
        if (service.description !== undefined && typeof service.description === 'string' && service.description.length > 500) {
          return NextResponse.json(
            { detail: 'Service description must be under 500 characters' },
            { status: 400 }
          );
        }
      }

      updateFields.push(`services = $${paramIndex}::jsonb`);
      updateValues.push(JSON.stringify(body.services));
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { detail: 'No updates provided' },
        { status: 400 }
      );
    }

    // Now hash the password if needed (after validation that updates exist)
    if (body.password !== undefined) {
      hashedPassword = await bcrypt.hash(body.password, 10);
      // Replace placeholder with actual hash
      const passwordIndex = updateFields.findIndex(f => f.startsWith('password'));
      if (passwordIndex !== -1) {
        updateValues[passwordIndex] = hashedPassword;
      }
    }

    // Add provider ID to values
    updateValues.push(providerId);

    const query = `
      UPDATE service_providers
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, slug, name, business_name, location, latitude, longitude,
                calendar_start_time, calendar_end_time, slot_duration, buffer_time, working_days
    `;

    const result = await pool.query(query, updateValues);

    return NextResponse.json({
      success: true,
      provider: result.rows[0],
    });

  } catch (error: any) {
    console.error('Provider settings update error:', error);
    return NextResponse.json(
      { detail: `Failed to update provider settings: ${error.message}` },
      { status: 500 }
    );
  }
}
