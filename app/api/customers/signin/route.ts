import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { generateCustomerToken } from '@/lib/auth';
import { CustomerSignInRequest, CustomerAuthResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: CustomerSignInRequest = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find customer by email
    const result = await query(
      'SELECT id, email, password, first_name, last_name FROM customers WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const customer = result.rows[0];

    // Check if password exists (might be null for customers who haven't set password yet)
    if (!customer.password) {
      return NextResponse.json(
        { error: 'Please set your password first. Check your email for instructions.' },
        { status: 401 }
      );
    }

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await query(
      'UPDATE customers SET last_login_at = NOW() WHERE id = $1',
      [customer.id]
    );

    // Generate JWT token (30-day expiration)
    const token = generateCustomerToken({
      customerId: customer.id,
      email: customer.email
    });

    // Return customer info and token
    const response: CustomerAuthResponse = {
      customer: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name
      },
      token
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Customer signin error:', error);
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    );
  }
}
