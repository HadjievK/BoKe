import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';
import { authenticateRequest } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { currentPassword, updates } = body;

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
        { detail: 'Forbidden - Cannot update another provider\'s settings' },
        { status: 403 }
      );
    }

    // For sensitive updates (like password changes), require current password
    if (updates.password && !currentPassword) {
      return NextResponse.json(
        { detail: 'Current password is required to change password' },
        { status: 400 }
      );
    }

    const providerId = auth.providerId;

    // If changing password, verify current password first
    if (updates.password) {
      const authResult = await pool.query(
        'SELECT password FROM service_providers WHERE id = $1',
        [providerId]
      );

      if (authResult.rows.length === 0) {
        return NextResponse.json(
          { detail: 'Provider not found' },
          { status: 404 }
        );
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, authResult.rows[0].password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { detail: 'Invalid current password' },
          { status: 401 }
        );
      }
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (updates.password) {
      // Hash the new password before storing
      const hashedPassword = await bcrypt.hash(updates.password, 10);
      updateFields.push(`password = $${paramIndex}`);
      updateValues.push(hashedPassword);
      paramIndex++;
    }

    if (updates.location !== undefined) {
      updateFields.push(`location = $${paramIndex}`);
      updateValues.push(updates.location);
      paramIndex++;
    }

    if (updates.services) {
      updateFields.push(`services = $${paramIndex}::jsonb`);
      updateValues.push(JSON.stringify(updates.services));
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { detail: 'No updates provided' },
        { status: 400 }
      );
    }

    // Add provider ID to values
    updateValues.push(providerId);

    const query = `
      UPDATE service_providers
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, slug, name, business_name, location
    `;

    const result = await pool.query(query, updateValues);

    return NextResponse.json({
      success: true,
      provider: result.rows[0],
    });

  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { detail: `Failed to update settings: ${error.message}` },
      { status: 500 }
    );
  }
}
