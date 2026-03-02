import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { generateCustomerToken } from '@/lib/auth';
import { CustomerSignUpRequest, CustomerAuthResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: CustomerSignUpRequest = await request.json();
    const { email, password, first_name, last_name, phone } = body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name || !phone) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingCustomer = await pool.query(
      'SELECT id, password, first_name, last_name FROM customers WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingCustomer.rows.length > 0) {
      const customer = existingCustomer.rows[0];

      // If password already exists → normal duplicate error
      if (customer.password !== null) {
        return NextResponse.json(
          { error: 'Email already registered. Please sign in instead.' },
          { status: 400 }
        );
      }

      // Password is NULL → verify identity via name matching
      const normalizeName = (name: string) =>
        name.toLowerCase().trim().replace(/\s+/g, ' ');

      const nameMatch =
        normalizeName(customer.first_name) === normalizeName(first_name) &&
        normalizeName(customer.last_name) === normalizeName(last_name);

      if (!nameMatch) {
        return NextResponse.json(
          {
            error: 'An account exists with this email but different name. Please contact support if this is your email.',
            requiresVerification: true
          },
          { status: 403 }
        );
      }

      // Names match → upgrade account by setting password
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        `UPDATE customers
         SET password = $1, phone = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING id, email, first_name, last_name`,
        [hashedPassword, phone, customer.id]
      );

      // Generate token (same as normal signup)
      const token = generateCustomerToken({
        customerId: customer.id,
        email: result.rows[0].email
      });

      return NextResponse.json(
        {
          customer: result.rows[0],
          token,
          upgraded: true
        },
        { status: 200 } // 200 instead of 201 indicates upgrade
      );
    }

    // New customer → continue with INSERT logic
    // Hash password with bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new customer
    const result = await pool.query(
      `INSERT INTO customers (email, password, first_name, last_name, phone, email_verified)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING id, email, first_name, last_name, created_at`,
      [email.toLowerCase(), hashedPassword, first_name, last_name, phone]
    );

    const customer = result.rows[0];

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

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Customer signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
