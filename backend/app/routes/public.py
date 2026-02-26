"""API routes for public booking endpoints"""
from fastapi import APIRouter, HTTPException, Query
from datetime import date
from typing import Optional

from app.models.schemas import (
    BarberWithServices,
    ServicePublic,
    AvailabilityResponse,
    AppointmentCreate,
    BookingConfirmation
)
from app.services.barber_service import get_barber_by_slug, get_barber_id_by_slug
from app.services.availability_service import get_available_slots
from app.services.appointment_service import create_appointment

router = APIRouter()


@router.get("/barber/{slug}", response_model=BarberWithServices)
async def get_barber_profile(slug: str):
    """
    Get barber profile with services for public booking page
    """
    barber = get_barber_by_slug(slug)

    if not barber:
        raise HTTPException(status_code=404, detail="Barber not found")

    return barber


@router.get("/{slug}/services", response_model=list[ServicePublic])
async def get_barber_services(slug: str):
    """
    Get all active services for a barber
    """
    barber = get_barber_by_slug(slug)

    if not barber:
        raise HTTPException(status_code=404, detail="Barber not found")

    return barber.services


@router.get("/{slug}/availability", response_model=AvailabilityResponse)
async def get_availability(
    slug: str,
    date: date = Query(..., description="Date to check availability (YYYY-MM-DD)"),
    service_id: Optional[str] = Query(None, description="Service ID to get duration")
):
    """
    Get available time slots for a specific date

    If service_id is provided, uses that service's duration.
    Otherwise, uses default 30-minute slots.
    """
    barber_id = get_barber_id_by_slug(slug)

    if not barber_id:
        raise HTTPException(status_code=404, detail="Barber not found")

    # Get service duration if provided
    service_duration = 30  # Default
    if service_id:
        from app.services.appointment_service import get_service_details
        service = get_service_details(barber_id, service_id)
        if service:
            service_duration = service['duration']

    slots = get_available_slots(barber_id, date, service_duration)

    return slots


@router.post("/{slug}/book", response_model=BookingConfirmation)
async def book_appointment(slug: str, booking: AppointmentCreate):
    """
    Create a new appointment

    Validates availability and prevents double booking
    """
    barber_id = get_barber_id_by_slug(slug)

    if not barber_id:
        raise HTTPException(status_code=404, detail="Barber not found")

    try:
        confirmation = create_appointment(barber_id, booking)
        return confirmation
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create appointment")
