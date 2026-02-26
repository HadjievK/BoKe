"""Business logic for service provider operations"""
import re
import random
from uuid import UUID
from typing import Optional, List
from psycopg2.extras import RealDictRow
import json

from app.database.connection import execute_query
from app.models.schemas import (
    ProviderCreate, ProviderPublic, ProviderWithServices,
    ServiceCreate, ServicePublic, OnboardingResponse
)


def generate_slug(business_name: str) -> str:
    """Generate a unique URL-safe slug from business name"""
    # Remove special characters and convert to lowercase
    base = re.sub(r'[^a-z0-9]', '', business_name.lower())

    if not base:
        base = "business"

    slug = base
    counter = 1

    # Check uniqueness
    while True:
        existing = execute_query(
            "SELECT 1 FROM service_providers WHERE slug = %s",
            (slug,),
            fetch_one=True
        )
        if not existing:
            break
        slug = f"{base}{counter}"
        counter += 1

    return slug


def generate_pin() -> str:
    """Generate a 4-digit PIN"""
    return str(random.randint(1000, 9999))


def create_provider(provider_data: ProviderCreate) -> OnboardingResponse:
    """Create a new service provider with services"""
    # Generate slug and PIN
    slug = generate_slug(provider_data.business_name)
    pin = generate_pin()

    # Prepare services as JSONB
    services_json = json.dumps([
        {
            "name": s.name,
            "duration": s.duration,
            "price": float(s.price),
            "description": s.description,
            "icon": s.icon,
            "is_active": True
        }
        for s in provider_data.services
    ])

    # Default availability (Mon-Fri 9-5)
    availability_json = json.dumps([
        {"day": i, "start": "09:00", "end": "17:00", "slot_duration": 30}
        for i in range(5)  # 0-4 = Mon-Fri
    ])

    # Insert service provider
    provider = execute_query(
        """
        INSERT INTO service_providers (
            slug, name, business_name, service_type, email, phone,
            location, bio, pin, services, availability
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s::jsonb)
        RETURNING id, slug, name, business_name, service_type, email, phone,
                  location, bio, avatar_url, theme_config, created_at
        """,
        (
            slug,
            provider_data.name,
            provider_data.business_name,
            provider_data.service_type,
            provider_data.email,
            provider_data.phone,
            provider_data.location,
            provider_data.bio,
            pin,
            services_json,
            availability_json
        ),
        fetch_one=True
    )

    provider_public = ProviderPublic(**dict(provider))

    return OnboardingResponse(
        slug=slug,
        pin=pin,
        public_url=f"https://buke.app/{slug}",
        provider=provider_public
    )


def get_provider_by_slug(slug: str) -> Optional[ProviderWithServices]:
    """Get service provider profile with services"""
    # Get provider with services
    provider = execute_query(
        """
        SELECT id, slug, name, business_name, service_type, email, phone,
               location, bio, avatar_url, theme_config, services, created_at
        FROM service_providers
        WHERE slug = %s
        """,
        (slug,),
        fetch_one=True
    )

    if not provider:
        return None

    # Parse services from JSONB
    services_data = provider['services'] if provider['services'] else []

    # Convert to ServicePublic objects with generated UUIDs (for compatibility)
    services = []
    for idx, s in enumerate(services_data):
        if s.get('is_active', True):
            services.append(ServicePublic(
                id=f"{provider['id']}-{idx}",  # Generate consistent ID
                provider_id=provider['id'],
                name=s['name'],
                duration=s['duration'],
                price=s['price'],
                description=s.get('description'),
                icon=s.get('icon'),
                is_active=s.get('is_active', True),
                created_at=provider['created_at']
            ))

    provider_dict = dict(provider)
    provider_dict['services'] = services

    return ProviderWithServices(**provider_dict)


def verify_pin(slug: str, pin: str) -> bool:
    """Verify service provider's PIN for dashboard access"""
    result = execute_query(
        "SELECT 1 FROM service_providers WHERE slug = %s AND pin = %s",
        (slug, pin),
        fetch_one=True
    )
    return result is not None


def get_provider_id_by_slug(slug: str) -> Optional[UUID]:
    """Get provider ID from slug"""
    result = execute_query(
        "SELECT id FROM service_providers WHERE slug = %s",
        (slug,),
        fetch_one=True
    )
    return result['id'] if result else None


def get_service_by_name(provider_id: UUID, service_name: str) -> Optional[dict]:
    """Get a specific service from provider's services JSONB"""
    result = execute_query(
        "SELECT services FROM service_providers WHERE id = %s",
        (provider_id,),
        fetch_one=True
    )

    if not result or not result['services']:
        return None

    for service in result['services']:
        if service['name'] == service_name:
            return service

    return None
