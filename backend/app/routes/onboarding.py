"""API routes for onboarding"""
from fastapi import APIRouter, HTTPException
import traceback
import sys

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
        # Log the full error for debugging
        print(f"ERROR in onboard_provider: {str(e)}", file=sys.stderr)
        print(f"Traceback: {traceback.format_exc()}", file=sys.stderr)

        # Check for duplicate email
        if 'email' in str(e).lower() and 'unique' in str(e).lower():
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        # Return detailed error in development, generic in production
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create provider account: {str(e)}"
        )
