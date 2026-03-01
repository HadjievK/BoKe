import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import type { ProviderWithServices } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get provider with services
    const result = await pool.query(
      `
      SELECT
        id, slug, name, business_name, service_type, email, phone,
        location, latitude, longitude, bio, avatar_url, theme_config, services, created_at
      FROM service_providers
      WHERE slug = $1
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { detail: 'Provider not found' },
        { status: 404 }
      );
    }

    const provider = result.rows[0];

    // Parse JSONB services into array
    const services = provider.services || [];

    // Transform services to match the expected format with proper IDs
    const formattedServices = services.map((service: any, index: number) => ({
      id: `${provider.id}_${index}`, // Create a unique ID
      provider_id: provider.id,
      name: service.name,
      duration: service.duration,
      price: service.price,
      description: service.description,
      icon: service.icon,
      is_active: service.is_active !== false,
      created_at: provider.created_at,
    }));

    const providerWithServices: ProviderWithServices = {
      id: provider.id,
      slug: provider.slug,
      name: provider.name,
      business_name: provider.business_name,
      service_type: provider.service_type,
      email: provider.email,
      phone: provider.phone,
      location: provider.location,
      latitude: provider.latitude,
      longitude: provider.longitude,
      bio: provider.bio,
      avatar_url: provider.avatar_url,
      theme_config: provider.theme_config || { primary_color: '#C9993A', secondary_color: '#1C1812' },
      created_at: provider.created_at,
      services: formattedServices,
    };

    return NextResponse.json(providerWithServices);

  } catch (error: any) {
    console.error('Provider API error:', error);
    return NextResponse.json(
      { detail: `Failed to fetch provider: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { location, latitude, longitude } = body;

    // Authenticate using JWT token
    const auth = authenticateRequest(request);

    if (!auth) {
      return NextResponse.json(
        { detail: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Verify the slug matches the authenticated provider
    if (auth.slug !== slug) {
      return NextResponse.json(
        { detail: 'Forbidden - Cannot update another provider\'s data' },
        { status: 403 }
      );
    }

    const providerId = auth.providerId;

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (location !== undefined) {
      updateFields.push(`location = $${paramIndex}`);
      updateValues.push(location);
      paramIndex++;
    }

    if (latitude !== undefined) {
      updateFields.push(`latitude = $${paramIndex}`);
      updateValues.push(latitude);
      paramIndex++;
    }

    if (longitude !== undefined) {
      updateFields.push(`longitude = $${paramIndex}`);
      updateValues.push(longitude);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { detail: 'No updates provided' },
        { status: 400 }
      );
    }

    // Add provider ID to values
    updateValues.push(providerId);

    const query = `
      UPDATE service_providers
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, slug, name, business_name, location, latitude, longitude
    `;

    const result = await pool.query(query, updateValues);

    return NextResponse.json({
      success: true,
      provider: result.rows[0],
    });

  } catch (error: any) {
    console.error('Provider update error:', error);
    return NextResponse.json(
      { detail: `Failed to update provider: ${error.message}` },
      { status: 500 }
    );
  }
}
