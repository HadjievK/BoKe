import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { password, updates } = body;

    if (!password) {
      return NextResponse.json(
        { detail: 'Current password is required' },
        { status: 400 }
      );
    }

    // Verify current password
    const authResult = await pool.query(
      'SELECT id FROM service_providers WHERE slug = $1 AND password = $2',
      [slug, password]
    );

    if (authResult.rows.length === 0) {
      return NextResponse.json(
        { detail: 'Invalid password' },
        { status: 401 }
      );
    }

    const providerId = authResult.rows[0].id;

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (updates.password) {
      updateFields.push(`password = $${paramIndex}`);
      updateValues.push(updates.password);
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
