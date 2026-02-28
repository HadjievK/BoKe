import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';

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

    // Find provider by email
    const result = await pool.query(
      'SELECT id, slug, name, business_name, email, password FROM service_providers WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { detail: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const provider = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, provider.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { detail: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      providerId: provider.id,
      slug: provider.slug,
      email: provider.email,
    });

    // Create response with HTTP-only cookie
    const response = NextResponse.json({
      slug: provider.slug,
      name: provider.name,
      business_name: provider.business_name,
      email: provider.email,
      token, // Also return token in response for localStorage option
    });

    // Set HTTP-only cookie for better security
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { detail: `Failed to sign in: ${error.message}` },
      { status: 500 }
    );
  }
}
