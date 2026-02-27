import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { CustomerPublic } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const pin = searchParams.get('pin');

    if (!pin) {
      return NextResponse.json(
        { detail: 'PIN is required' },
        { status: 400 }
      );
    }

    // Verify PIN and get provider
    const providerResult = await pool.query(
      'SELECT id FROM service_providers WHERE slug = $1 AND pin = $2',
      [slug, pin]
    );

    if (providerResult.rows.length === 0) {
      return NextResponse.json(
        { detail: 'Invalid PIN' },
        { status: 401 }
      );
    }

    const providerId = providerResult.rows[0].id;

    // Get all unique customers who have booked with this provider
    const customersResult = await pool.query(
      `
      SELECT DISTINCT ON (c.id)
        c.id,
        c.email,
        c.first_name,
        c.last_name,
        c.phone,
        c.created_at
      FROM customers c
      JOIN appointments a ON c.id = a.customer_id
      WHERE a.provider_id = $1
      ORDER BY c.id, c.created_at DESC
      `,
      [providerId]
    );

    const customers: CustomerPublic[] = customersResult.rows;

    return NextResponse.json(customers);

  } catch (error: any) {
    console.error('Customers API error:', error);
    return NextResponse.json(
      { detail: `Failed to fetch customers: ${error.message}` },
      { status: 500 }
    );
  }
}
