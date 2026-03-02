import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { CustomerJWTPayload } from './types';

// Use environment variable for JWT secret
// In production, this MUST be a strong random secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  providerId: number;
  slug: string;
  email: string;
}

/**
 * Generate a JWT token for a provider
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extract JWT token from request
 * Checks Authorization header (Bearer token) or cookies
 */
export function extractToken(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const token = request.cookies.get('auth_token')?.value;
  if (token) {
    return token;
  }

  return null;
}

/**
 * Authenticate request and return provider info
 */
export function authenticateRequest(request: NextRequest): JWTPayload | null {
  const token = extractToken(request);
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Generate a JWT token for a customer
 */
export function generateCustomerToken(payload: CustomerJWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
}

/**
 * Verify and decode a customer JWT token
 */
export function verifyCustomerToken(token: string): CustomerJWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as CustomerJWTPayload;
    // Verify it has customer fields (not provider fields)
    if (decoded.customerId && decoded.email) {
      return decoded;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Extract customer JWT token from request
 * Checks Authorization header (Bearer token) or cookies
 */
export function extractCustomerToken(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const token = request.cookies.get('customer_auth_token')?.value;
  if (token) {
    return token;
  }

  return null;
}

/**
 * Authenticate customer request and return customer info
 */
export function authenticateCustomer(request: NextRequest): CustomerJWTPayload | null {
  const token = extractCustomerToken(request);
  if (!token) {
    return null;
  }

  return verifyCustomerToken(token);
}
