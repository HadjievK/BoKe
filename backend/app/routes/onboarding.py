"""API routes for onboarding"""
from fastapi import APIRouter, HTTPException

from app.models.schemas import BarberCreate, OnboardingResponse
from app.services.barber_service import create_barber

router = APIRouter()


@router.post("/onboard", response_model=OnboardingResponse)
async def onboard_barber(barber_data: BarberCreate):
    """
    Register a new barber/service provider

    Creates barber account, services, and default availability.
    Returns slug, PIN, and public booking URL.
    """
    try:
        result = create_barber(barber_data)
        return result
    except Exception as e:
        # Check for duplicate email
        if 'barbers_email_key' in str(e):
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        raise HTTPException(
            status_code=500,
            detail="Failed to create barber account"
        )
