"""Pydantic models for request/response validation - Updated for simplified schema"""
from typing import Optional, List, Any
from datetime import date, time, datetime
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID


# ============ Theme & Service Models ============

class ThemeConfig(BaseModel):
    primary_color: str = "#B8860B"
    secondary_color: str = "#111111"


class ServiceInline(BaseModel):
    """Service stored as JSONB in provider table"""
    name: str
    duration: int = Field(..., gt=0, description="Duration in minutes")
    price: float = Field(..., gt=0)
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool = True


class AvailabilitySlot(BaseModel):
    """Availability slot stored as JSONB"""
    day: int = Field(..., ge=0, le=6, description="Day of week: 0=Mon, 6=Sun")
    start: str = Field(..., description="Start time HH:MM")
    end: str = Field(..., description="End time HH:MM")
    slot_duration: int = 30


# ============ Service Provider Models ============

class BarberBase(BaseModel):
    name: str
    business_name: str
    service_type: str
    email: EmailStr
    phone: str
    location: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class BarberCreate(BarberBase):
    services: List[ServiceInline] = []


class BarberPublic(BarberBase):
    id: UUID
    slug: str
    theme_config: ThemeConfig
    created_at: datetime

    class Config:
        from_attributes = True


# For compatibility with frontend
class ServicePublic(BaseModel):
    """Service model for API responses (compatibility layer)"""
    id: str  # Will be "provider_id-index"
    barber_id: UUID
    name: str
    duration: int
    price: float
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True


class BarberWithServices(BarberPublic):
    services: List[ServicePublic] = []


class OnboardingResponse(BaseModel):
    slug: str
    pin: str
    public_url: str
    barber: BarberPublic


# ============ Customer Models ============

class CustomerBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: str


class CustomerCreate(CustomerBase):
    pass


class CustomerPublic(CustomerBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Appointment Models ============

class AppointmentCreate(BaseModel):
    service_id: str  # Format: "provider_id-index"
    appointment_date: date
    appointment_time: time
    customer: CustomerCreate
    customer_notes: Optional[str] = None


class AppointmentPublic(BaseModel):
    id: UUID
    barber_id: UUID  # Actually provider_id
    customer_id: UUID
    service_id: str
    appointment_date: date
    appointment_time: time
    duration: int
    price: Decimal
    customer_notes: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class AppointmentWithDetails(AppointmentPublic):
    customer: CustomerPublic
    service: ServicePublic


class BookingConfirmation(BaseModel):
    appointment: AppointmentWithDetails
    message: str = "Booking confirmed successfully!"


# ============ Availability Models ============

class TimeSlot(BaseModel):
    time: str  # Format: "HH:MM"
    available: bool


class AvailabilityResponse(BaseModel):
    date: date
    slots: List[TimeSlot]


# ============ Dashboard Models ============

class DashboardStats(BaseModel):
    today_appointments: int
    week_appointments: int
    total_customers: int
    rating: float = 5.0  # Static for MVP


class DashboardData(BaseModel):
    stats: DashboardStats
    appointments: List[AppointmentWithDetails]
    recent_customers: List[CustomerPublic]


# Compatibility aliases
ServiceCreate = ServiceInline  # For backward compatibility
