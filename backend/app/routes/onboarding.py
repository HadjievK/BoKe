"""API routes for onboarding"""
from fastapi import APIRouter, HTTPException

from app.models.schemas import ProviderCreate, OnboardingResponse
from app.services.provider_service import create_provider

router = APIRouter()


@router.post("/onboard", response_model=OnboardingResponse)
async def onboard_provider(provider_data: ProviderCreate):
    """
    Register a new service provider

    Creates provider account, services, and default availability.
    Returns slug, PIN, and public booking URL.
    """
    try:
        result = create_provider(provider_data)
        return result
    except Exception as e:
        # Check for duplicate email
        if 'email' in str(e).lower() and 'unique' in str(e).lower():
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        raise HTTPException(
            status_code=500,
            detail="Failed to create provider account"
        )
