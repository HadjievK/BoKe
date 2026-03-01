import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params;
    const body = await request.json();
    const { status } = body;

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
        { detail: 'Forbidden - Cannot access another provider\'s appointments' },
        { status: 403 }
      );
    }

    const providerId = auth.providerId;

    // Validate status
    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return NextResponse.json(
        { detail: 'Invalid status. Must be: confirmed, cancelled, or completed' },
        { status: 400 }
      );
    }

    // Update appointment status
    const result = await pool.query(
      `UPDATE appointments
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND provider_id = $3
       RETURNING *`,
      [status, id, providerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { detail: 'Appointment not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Appointment updated successfully',
      appointment: result.rows[0]
    });

  } catch (error: any) {
    console.error('Update appointment error:', error);
    return NextResponse.json(
      { detail: `Failed to update appointment: ${error.message}` },
      { status: 500 }
    );
  }
}
