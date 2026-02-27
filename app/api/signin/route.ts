import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { detail: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find provider by email and password
    const result = await pool.query(
      'SELECT id, slug, name, business_name, email FROM service_providers WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { detail: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const provider = result.rows[0];

    return NextResponse.json({
      slug: provider.slug,
      name: provider.name,
      business_name: provider.business_name,
      email: provider.email,
    });

  } catch (error: any) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { detail: `Failed to sign in: ${error.message}` },
      { status: 500 }
    );
  }
}
