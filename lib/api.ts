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


// ============ Dashboard API (Password-protected) ============

export async function getDashboardData(slug: string, password: string): Promise<DashboardData> {
  const res = await fetch(`${API_URL}/api/dashboard/${slug}?password=${password}`)

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Invalid password')
    }
    throw new Error('Failed to fetch dashboard data')
  }

  return res.json()
}

export async function getAppointments(
  slug: string,
  password: string,
  startDate?: string,
  endDate?: string
): Promise<AppointmentWithDetails[]> {
  const params = new URLSearchParams({ password })
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)

  const res = await fetch(`${API_URL}/api/dashboard/${slug}/appointments?${params}`)

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Invalid password')
    }
    throw new Error('Failed to fetch appointments')
  }

  return res.json()
}

export async function getCustomers(slug: string, password: string): Promise<CustomerPublic[]> {
  const res = await fetch(`${API_URL}/api/dashboard/${slug}/customers?password=${password}`)

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Invalid password')
    }
    throw new Error('Failed to fetch customers')
  }

  return res.json()
}
