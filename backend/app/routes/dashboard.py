"""API routes for barber dashboard (PIN-protected)"""
from fastapi import APIRouter, HTTPException, Query
from datetime import date
from typing import Optional

from app.models.schemas import (
    DashboardData,
    AppointmentWithDetails,
    CustomerPublic
)
from app.services.barber_service import verify_pin, get_barber_id_by_slug
from app.services.dashboard_service import (
    get_dashboard_data,
    get_customers_for_barber
)
from app.services.appointment_service import get_appointments_for_barber

router = APIRouter()


@router.get("/dashboard/{slug}", response_model=DashboardData)
async def get_dashboard(
    slug: str,
    pin: str = Query(..., description="4-digit PIN for authentication")
):
    """
    Get dashboard data for a barber

    Requires PIN authentication
    """
    # Verify PIN
    if not verify_pin(slug, pin):
        raise HTTPException(status_code=401, detail="Invalid PIN")

    barber_id = get_barber_id_by_slug(slug)
    if not barber_id:
        raise HTTPException(status_code=404, detail="Barber not found")

    dashboard = get_dashboard_data(barber_id)
    return dashboard


@router.get("/dashboard/{slug}/appointments", response_model=list[AppointmentWithDetails])
async def get_appointments(
    slug: str,
    pin: str = Query(..., description="4-digit PIN for authentication"),
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)")
):
    """
    Get appointments for a date range

    Requires PIN authentication
    """
    # Verify PIN
    if not verify_pin(slug, pin):
        raise HTTPException(status_code=401, detail="Invalid PIN")

    barber_id = get_barber_id_by_slug(slug)
    if not barber_id:
        raise HTTPException(status_code=404, detail="Barber not found")

    appointments = get_appointments_for_barber(barber_id, start_date, end_date)
    return appointments


@router.get("/dashboard/{slug}/customers", response_model=list[CustomerPublic])
async def get_customers(
    slug: str,
    pin: str = Query(..., description="4-digit PIN for authentication")
):
    """
    Get all customers who have booked with this barber

    Requires PIN authentication
    """
    # Verify PIN
    if not verify_pin(slug, pin):
        raise HTTPException(status_code=401, detail="Invalid PIN")

    barber_id = get_barber_id_by_slug(slug)
    if not barber_id:
        raise HTTPException(status_code=404, detail="Barber not found")

    customers = get_customers_for_barber(barber_id)
    return customers
