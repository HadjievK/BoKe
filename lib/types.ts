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
  bio?: string
  avatar_url?: string
  theme_config: ThemeConfig
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

export interface Appointment {
  id: string
  provider_id: string
  customer_id: string
  service_id: string
  appointment_date: string // YYYY-MM-DD
  appointment_time: string // HH:MM:SS
  duration: number
  price: number
  customer_notes?: string
  status: 'confirmed' | 'cancelled' | 'completed'
  created_at: string
}

export interface AppointmentWithDetails extends Appointment {
  customer: CustomerPublic
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
  appointment: AppointmentWithDetails
  message: string
}

export interface OnboardingData {
  name: string
  business_name: string
  service_type: string
  email: string
  phone: string
  password: string
  location?: string
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
  }
  stats: DashboardStats
  appointments: AppointmentWithDetails[]
  recent_customers: CustomerPublic[]
}
