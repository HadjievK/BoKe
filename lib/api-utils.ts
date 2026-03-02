import { NextResponse } from 'next/server';

/**
 * Standard error response format
 */
export function errorResponse(
  message: string,
  status: number = 400
): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Standard success response format
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  const response: any = { data };
  if (message) response.message = message;
  return NextResponse.json(response, { status });
}

/**
 * Common HTTP error responses
 */
export const ApiError = {
  badRequest: (msg: string = 'Bad request') => errorResponse(msg, 400),
  unauthorized: (msg: string = 'Unauthorized') => errorResponse(msg, 401),
  forbidden: (msg: string = 'Forbidden') => errorResponse(msg, 403),
  notFound: (msg: string = 'Not found') => errorResponse(msg, 404),
  conflict: (msg: string = 'Conflict') => errorResponse(msg, 409),
  internal: (msg: string = 'Internal server error') => errorResponse(msg, 500),
};
