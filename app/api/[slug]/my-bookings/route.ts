import { NextRequest, NextResponse } from 'next/server';
import { authenticateCustomer } from '@/lib/auth';
import { query } from '@/lib/db';
import { CustomerBookingsResponse } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Authenticate customer using JWT token
    const customerAuth = authenticateCustomer(request);

    if (!customerAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get provider by slug
    const providerResult = await query(
      'SELECT id, name, business_name, slug FROM service_providers WHERE slug = $1',
      [slug]
    );

    if (providerResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    const provider = providerResult.rows[0];

    // Get all appointments for this customer with this provider
    const appointmentsResult = await query(
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
       WHERE a.provider_id = $1
         AND a.customer_id = $2
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [provider.id, customerAuth.customerId]
    );

    // Transform database results into AppointmentWithDetails format
    const appointments = appointmentsResult.rows.map((row) => ({
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
    }));

    const response: CustomerBookingsResponse = {
      provider: {
        name: provider.name,
        business_name: provider.business_name,
        slug: provider.slug
      },
      appointments
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Get customer bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
