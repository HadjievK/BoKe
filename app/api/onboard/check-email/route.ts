import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const result = await pool.query(
    'SELECT 1 FROM service_providers WHERE email = $1',
    [email.toLowerCase().trim()]
  );

  return NextResponse.json({ available: result.rows.length === 0 });
}
