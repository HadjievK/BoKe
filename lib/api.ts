// API client functions

// In production, use relative URLs (same domain)
// In development, you need to run the backend locally on port 8000
const API_URL = process.env.NODE_ENV === 'production'
  ? ''
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')

import type {
  ProviderWithServices,
  Service,
  AvailabilityResponse,
  BookingRequest,
  BookingConfirmation,
  OnboardingData,
  OnboardingResponse,
  DashboardData,
  AppointmentWithDetails,
  CustomerPublic
} from './types'


// ============ Public Booking API ============

export async function getProviderProfile(slug: string): Promise<ProviderWithServices> {
  const res = await fetch(`${API_URL}/api/provider/${slug}`)

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Provider not found')
    }
    throw new Error('Failed to fetch provider profile')
  }

  return res.json()
}

export async function getServices(slug: string): Promise<Service[]> {
  const res = await fetch(`${API_URL}/api/${slug}/services`)

  if (!res.ok) {
    throw new Error('Failed to fetch services')
  }

  return res.json()
}

export async function getAvailability(
  slug: string,
  date: string,
  serviceId?: string
): Promise<AvailabilityResponse> {
  const params = new URLSearchParams({ date })
  if (serviceId) {
    params.append('service_id', serviceId)
  }

  const res = await fetch(`${API_URL}/api/${slug}/availability?${params}`)

  if (!res.ok) {
    throw new Error('Failed to fetch availability')
  }

  return res.json()
}

export async function bookAppointment(
  slug: string,
  booking: BookingRequest
): Promise<BookingConfirmation> {
  const res = await fetch(`${API_URL}/api/${slug}/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(booking),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || 'Failed to book appointment')
  }

  return res.json()
}


// ============ Onboarding API ============

export async function registerProvider(data: OnboardingData): Promise<OnboardingResponse> {
  const res = await fetch(`${API_URL}/api/onboard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || 'Failed to register')
  }

  return res.json()
}


// ============ Dashboard API (JWT-protected) ============
// Note: Backward compatible - password parameter deprecated but optional

// Helper to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// Helper to add auth headers
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

/**
 * @deprecated password parameter - now uses JWT authentication
 */
export async function getDashboardData(slug: string, password?: string): Promise<DashboardData> {
  const res = await fetch(`${API_URL}/api/dashboard/${slug}`, {
    headers: getAuthHeaders(),
    credentials: 'include', // Include cookies
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Unauthorized - Please sign in');
    }
    throw new Error('Failed to fetch dashboard data');
  }

  return res.json();
}

/**
 * @deprecated password parameter - now uses JWT authentication
 */
export async function getAppointments(
  slug: string,
  password?: string,
  startDate?: string,
  endDate?: string
): Promise<{ appointments: AppointmentWithDetails[], appointments_by_date: Record<string, number> }> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const queryString = params.toString();
  const url = queryString
    ? `${API_URL}/api/dashboard/${slug}/appointments?${queryString}`
    : `${API_URL}/api/dashboard/${slug}/appointments`;

  const res = await fetch(url, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Unauthorized - Please sign in');
    }
    throw new Error('Failed to fetch appointments');
  }

  return res.json();
}

/**
 * @deprecated password parameter - now uses JWT authentication
 */
export async function getCustomers(slug: string, password?: string): Promise<CustomerPublic[]> {
  const res = await fetch(`${API_URL}/api/dashboard/${slug}/customers`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Unauthorized - Please sign in');
    }
    throw new Error('Failed to fetch customers');
  }

  return res.json();
}

// ============ Auth API ============

export interface SignInResponse {
  slug: string;
  name: string;
  business_name: string;
  email: string;
  token: string;
}

export async function signIn(email: string, password: string): Promise<SignInResponse> {
  const res = await fetch(`${API_URL}/api/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to sign in');
  }

  const data = await res.json();

  // Store token in localStorage for Authorization header
  if (typeof window !== 'undefined' && data.token) {
    localStorage.setItem('auth_token', data.token);
  }

  return data;
}

export async function signOut(): Promise<void> {
  await fetch(`${API_URL}/api/signout`, {
    method: 'POST',
    credentials: 'include',
  });

  // Clear token from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}

export async function verifyAuth(): Promise<{ authenticated: boolean; providerId?: number; slug?: string; email?: string }> {
  const res = await fetch(`${API_URL}/api/auth/verify`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) {
    return { authenticated: false };
  }

  return res.json();
}
