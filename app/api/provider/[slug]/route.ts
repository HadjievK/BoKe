import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
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
        location, bio, avatar_url, theme_config, services, created_at
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
