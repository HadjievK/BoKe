// TypeScript types for the application

export interface ThemeConfig {
  primary_color: string
  secondary_color: string
}

export interface Provider {
  id: string
  slug: string
  name: string
  business_name: string
  service_type: string
  email: string
  phone: string
  location?: string
  latitude?: number
  longitude?: number
  bio?: string
  avatar_url?: string
  theme_config: ThemeConfig
  calendar_start_time?: string
  calendar_end_time?: string
  slot_duration?: number
  buffer_time?: number
  working_days?: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
  created_at: string
}

export interface Service {
  id: string
  provider_id: string
  name: string
  duration: number // minutes
  price: number
  description?: string
  icon?: string
  is_active: boolean
  created_at: string
}

export interface ProviderWithServices extends Provider {
  services: Service[]
}

export interface Customer {
  email: string
  first_name: string
  last_name: string
  phone: string
}

export interface CustomerPublic extends Customer {
  id: string
  created_at: string
}

export const AppointmentStatus = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
} as const

export type AppointmentStatusType = typeof AppointmentStatus[keyof typeof AppointmentStatus]

export interface Appointment {
  id: string
  provider_id: string
  customer_id?: string // Optional for backward compatibility
  service_id: string
  service_name: string // Denormalized
  appointment_date: string // YYYY-MM-DD
  appointment_time: string // HH:MM:SS
  duration: number
  price: number
  customer_notes?: string
  status: AppointmentStatusType
  created_at: string
  // Inline customer fields (stateless booking)
  customer_email: string
  customer_first_name: string
  customer_last_name: string
  customer_phone?: string
}

export interface AppointmentWithDetails extends Appointment {
  service: Service
}

export interface TimeSlot {
  time: string // HH:MM
  available: boolean
}

export interface AvailabilityResponse {
  date: string
  slots: TimeSlot[]
}

export interface BookingRequest {
  service_id: string
  appointment_date: string // YYYY-MM-DD
  appointment_time: string // HH:MM
  customer: Customer
  customer_notes?: string
}

export interface BookingConfirmation {
  appointment: Appointment
  token: string
  message: string
}

// Booking Token Types
export interface BookingToken {
  id: string
  token: string
  appointment_id: string
  expires_at: string
  used_count: number
  last_used_at: string | null
  created_at: string
}

export interface BookingTokenValidation {
  valid: boolean
  expired?: boolean
  notFound?: boolean
  rateLimited?: boolean
}

export interface BookingManagementData {
  appointment: {
    id: string
    appointment_date: string
    appointment_time: string
    duration: number
    price: number
    status: AppointmentStatusType
    customer_notes?: string
    customer_email: string
    customer_first_name: string
    customer_last_name: string
    customer_phone?: string
  }
  provider: {
    name: string
    business_name: string
    location?: string
    phone?: string
  }
  service: {
    name: string
    duration: number
    price: number
  }
  token: {
    expires_at: string
    is_expired: boolean
  }
}

export interface OnboardingData {
  name: string
  business_name: string
  service_type: string
  email: string
  phone: string
  password: string
  location?: string
  latitude?: number
  longitude?: number
  bio?: string
  services: {
    name: string
    duration: number
    price: number
    description?: string
    icon?: string
  }[]
}

export interface OnboardingResponse {
  slug: string
  public_url: string
  dashboard_url: string
  provider: Provider
}

export interface DashboardStats {
  today_appointments: number
  week_appointments: number
  total_customers: number
  rating: number
}

export interface DashboardData {
  provider: {
    id: string
    slug: string
    name: string
    business_name: string
    location?: string
    calendar_start_time?: string
    calendar_end_time?: string
    slot_duration?: number
    buffer_time?: number
    working_days?: {
      monday: boolean
      tuesday: boolean
      wednesday: boolean
      thursday: boolean
      friday: boolean
      saturday: boolean
      sunday: boolean
    }
  }
  stats: DashboardStats
  appointments: AppointmentWithDetails[]
  recent_customers: CustomerPublic[]
}

// DEPRECATED: Customer authentication types - will be removed
// System now uses stateless token-based booking management
export interface CustomerJWTPayload {
  customerId: number
  email: string
}

export interface CustomerSignUpRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  phone: string
}

export interface CustomerSignInRequest {
  email: string
  password: string
}

export interface CustomerAuthResponse {
  customer: {
    id: number
    email: string
    first_name: string
    last_name: string
  }
  token: string
  upgraded?: boolean // Indicates if this was an account upgrade vs new signup
}

export interface CustomerBookingsResponse {
  provider: {
    name: string
    business_name: string | null
    slug: string
  }
  appointments: AppointmentWithDetails[]
}
