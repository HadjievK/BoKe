import { NextRequest, NextResponse } from 'next/server';
import { authenticateCustomer } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Authenticate customer using JWT token
    const customerAuth = authenticateCustomer(request);

    if (!customerAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch customer details from database
    const result = await query(
      'SELECT id, email, first_name, last_name FROM customers WHERE id = $1',
      [customerAuth.customerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = result.rows[0];

    return NextResponse.json({
      customer: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name
      }
    });

  } catch (error) {
    console.error('Customer auth verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify authentication' },
      { status: 500 }
    );
  }
}
