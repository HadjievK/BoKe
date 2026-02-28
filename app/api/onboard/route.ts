import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';

function generateSlug(businessName: string): string {
  const base = businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return base || 'business';
}

function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const result = await pool.query(
      'SELECT 1 FROM service_providers WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      return slug;
    }

    slug = `${baseSlug}${counter}`;
    counter++;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, business_name, service_type, email, phone, location, bio, services, password, google_id } = body;

    // For Google OAuth users, password is optional
    const isGoogleUser = !!google_id;
    let hashedPassword = null;

    if (!isGoogleUser) {
      // Email/password signup - password required
      if (!password || password.length < 6) {
        return NextResponse.json(
          { detail: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }
      hashedPassword = await bcrypt.hash(password, 10);
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
        location, bio, password, services, availability,
        oauth_provider, oauth_provider_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12, $13)
      RETURNING id, slug, name, business_name, service_type, email, phone,
                location, bio, avatar_url, theme_config, created_at
      `,
      [
        slug,
        name,
        business_name,
        service_type,
        email,
        phone,
        location,
        bio,
        hashedPassword,
        servicesJson,
        availabilityJson,
        isGoogleUser ? 'google' : null,
        google_id || null,
      ]
    );

    const provider = result.rows[0];

    return NextResponse.json({
      slug,
      public_url: `https://boke-brown-ten.vercel.app/${slug}`,
      dashboard_url: `https://boke-brown-ten.vercel.app/dashboard/${slug}`,
      provider,
    });
  } catch (error: any) {
    console.error('Onboard error:', error);

    // Check for duplicate email
    if (error.message?.toLowerCase().includes('email') &&
        error.message?.toLowerCase().includes('unique')) {
      return NextResponse.json(
        { detail: 'Email already registered' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { detail: `Failed to create provider account: ${error.message}` },
      { status: 500 }
    );
  }
}
