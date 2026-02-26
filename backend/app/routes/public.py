"""API routes for public booking endpoints"""
from fastapi import APIRouter, HTTPException, Query
from datetime import date
from typing import Optional

from app.models.schemas import (
    ProviderWithServices,
    ServicePublic,
    AvailabilityResponse,
    AppointmentCreate,
    BookingConfirmation
)
from app.services.provider_service import get_provider_by_slug, get_provider_id_by_slug
from app.services.availability_service import get_available_slots
from app.services.appointment_service import create_appointment

router = APIRouter()


@router.get("/provider/{slug}", response_model=ProviderWithServices)
async def get_provider_profile(slug: str):
    """
    Get provider profile with services for public booking page
    """
    provider = get_provider_by_slug(slug)

    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    return provider


@router.get("/{slug}/services", response_model=list[ServicePublic])
async def get_provider_services(slug: str):
    """
    Get all active services for a provider
    """
    provider = get_provider_by_slug(slug)

    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    return provider.services


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
    provider_id = get_provider_id_by_slug(slug)

    if not provider_id:
        raise HTTPException(status_code=404, detail="Provider not found")

    # Get service duration if provided
    service_duration = 30  # Default
    if service_id:
        from app.services.appointment_service import get_service_details
        service = get_service_details(provider_id, service_id)
        if service:
            service_duration = service['duration']

    slots = get_available_slots(provider_id, date, service_duration)

    return slots


@router.post("/{slug}/book", response_model=BookingConfirmation)
async def book_appointment(slug: str, booking: AppointmentCreate):
    """
    Create a new appointment

    Validates availability and prevents double booking
    """
    provider_id = get_provider_id_by_slug(slug)

    if not provider_id:
        raise HTTPException(status_code=404, detail="Provider not found")

    try:
        confirmation = create_appointment(provider_id, booking)
        return confirmation
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create appointment")
