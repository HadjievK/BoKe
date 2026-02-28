import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { CustomerPublic } from '@/lib/types';
import { authenticateRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

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
        { detail: 'Forbidden - Cannot access another provider\'s customers' },
        { status: 403 }
      );
    }

    const providerId = auth.providerId;

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
