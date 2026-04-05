import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import pool from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      message: 'If an account with that email exists, a reset link has been sent.',
    });

    const result = await pool.query(
      'SELECT id, email FROM service_providers WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return successResponse;
    }

    const provider = result.rows[0];

    // Generate a secure reset token (64 hex chars, 1 hour expiry)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store the token (upsert so only one active token per provider)
    await pool.query(
      `INSERT INTO password_reset_tokens (provider_id, token, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (provider_id)
       DO UPDATE SET token = $2, expires_at = $3, created_at = NOW()`,
      [provider.id, token, expiresAt.toISOString()]
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail(provider.email, resetLink);

    return successResponse;
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
