import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Find valid, non-expired token
    const result = await pool.query(
      `SELECT provider_id FROM password_reset_tokens
       WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    const { provider_id } = result.rows[0];

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'UPDATE service_providers SET password = $1 WHERE id = $2',
      [hashedPassword, provider_id]
    );

    // Delete the used token
    await pool.query(
      'DELETE FROM password_reset_tokens WHERE provider_id = $1',
      [provider_id]
    );

    return NextResponse.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
