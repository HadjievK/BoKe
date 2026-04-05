import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  // Single query: find all existing slugs matching baseSlug or baseSlug + number
  const result = await pool.query(
    `SELECT slug FROM service_providers WHERE slug = $1 OR slug ~ $2`,
    [baseSlug, `^${baseSlug}\\d+$`]
  );

  const existing = new Set(result.rows.map((r: { slug: string }) => r.slug));
  if (!existing.has(baseSlug)) return baseSlug;

  let counter = 1;
  while (existing.has(`${baseSlug}${counter}`)) counter++;
  return `${baseSlug}${counter}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, business_name, service_type, email, phone, location, latitude, longitude, bio, services, password, google_id } = body;

    // For Google OAuth users, password is optional
    const isGoogleUser = !!google_id;
    let hashedPassword = null;

    if (!isGoogleUser) {
      // Email/password signup - password required
      if (!password || password.length < 8) {
        return NextResponse.json(
          { detail: 'Password must be at least 8 characters' },
          { status: 400 }
        );
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Check for duplicate email before attempting insert
    const emailCheck = await pool.query(
      'SELECT 1 FROM service_providers WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { detail: 'Email already registered. Please sign in.' },
        { status: 409 }
      );
    }

    // Validate at least one service
    if (!services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { detail: 'At least one service is required' },
        { status: 400 }
      );
    }

    // Validate all services have required fields
    const invalidService = services.find((s: any) => !s.name || !s.duration || !s.price);
    if (invalidService) {
      return NextResponse.json(
        { detail: 'All services must have a name, duration, and price' },
        { status: 400 }
      );
    }

    // Generate slug
    const baseSlug = generateSlug(business_name);
    const slug = await ensureUniqueSlug(baseSlug);

    // Prepare services as JSONB
    const servicesJson = JSON.stringify(
      services.map((s: any) => ({
        name: s.name,
        duration: s.duration,
        price: parseFloat(s.price),
        description: s.description,
        icon: s.icon,
        is_active: true,
      }))
    );

    // Default availability (Mon-Fri 9-5)
    const availabilityJson = JSON.stringify(
      Array.from({ length: 5 }, (_, i) => ({
        day: i,
        start: '09:00',
        end: '17:00',
        slot_duration: 30,
      }))
    );

    // Insert service provider
    const result = await pool.query(
      `
      INSERT INTO service_providers (
        slug, name, business_name, service_type, email, phone,
        location, latitude, longitude, bio, password, services, availability,
        oauth_provider, oauth_provider_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb, $14, $15)
      RETURNING id, slug, name, business_name, service_type, email, phone,
                location, latitude, longitude, bio, avatar_url, theme_config, created_at
      `,
      [
        slug,
        name,
        business_name,
        service_type,
        email,
        phone,
        location,
        latitude || null,
        longitude || null,
        bio,
        hashedPassword,
        servicesJson,
        availabilityJson,
        isGoogleUser ? 'google' : null,
        google_id || null,
      ]
    );

    const provider = result.rows[0];

    // Generate JWT token for immediate login
    const token = generateToken({
      providerId: provider.id,
      slug: provider.slug,
      email: provider.email,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    return NextResponse.json({
      slug,
      public_url: `${baseUrl}/${slug}`,
      dashboard_url: `${baseUrl}/dashboard/${slug}`,
      provider,
      token,
    });
  } catch (error: any) {
    console.error('Onboard error:', error);
    return NextResponse.json(
      { detail: 'Failed to create provider account. Please try again.' },
      { status: 500 }
    );
  }
}
