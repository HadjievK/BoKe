"""Business logic for appointment booking"""
from datetime import date, time, datetime
from typing import Optional
from uuid import UUID

from app.database.connection import execute_query
from app.models.schemas import (
    AppointmentCreate, AppointmentWithDetails,
    BookingConfirmation, CustomerCreate, CustomerPublic,
    ServicePublic
)
from app.services.availability_service import is_slot_available


def get_or_create_customer(customer_data: CustomerCreate) -> UUID:
    """
    Find existing customer by email or create new one

    Returns customer UUID
    """
    # Check if customer exists
    existing = execute_query(
        "SELECT id FROM customers WHERE email = %s",
        (customer_data.email,),
        fetch_one=True
    )

    if existing:
        # Update customer info in case details changed
        execute_query(
            """
            UPDATE customers
            SET first_name = %s, last_name = %s, phone = %s
            WHERE id = %s
            """,
            (
                customer_data.first_name,
                customer_data.last_name,
                customer_data.phone,
                existing['id']
            )
        )
        return existing['id']

    # Create new customer
    new_customer = execute_query(
        """
        INSERT INTO customers (email, first_name, last_name, phone)
        VALUES (%s, %s, %s, %s)
        RETURNING id
        """,
        (
            customer_data.email,
            customer_data.first_name,
            customer_data.last_name,
            customer_data.phone
        ),
        fetch_one=True
    )

    return new_customer['id']


def get_service_details(provider_id: UUID, service_id: str) -> Optional[dict]:
    """Get service details from provider's JSONB services array"""
    result = execute_query(
        "SELECT services FROM service_providers WHERE id = %s",
        (provider_id,),
        fetch_one=True
    )

    if not result or not result['services']:
        return None

    # service_id is formatted as "provider_id-index"
    try:
        idx = int(service_id.split('-')[-1])
        services = result['services']
        if 0 <= idx < len(services):
            return services[idx]
    except (ValueError, IndexError):
        pass

    return None


def create_appointment(
    provider_id: UUID,
    appointment_data: AppointmentCreate
) -> BookingConfirmation:
    """
    Create a new appointment

    Validates availability and prevents double booking
    """
    # Get service details from JSONB
    service = get_service_details(provider_id, appointment_data.service_id)

    if not service:
        raise ValueError("Service not found or inactive")

    # Validate appointment is in the future
    appointment_datetime = datetime.combine(
        appointment_data.appointment_date,
        appointment_data.appointment_time
    )

    if appointment_datetime < datetime.now():
        raise ValueError("Cannot book appointments in the past")

    # Check if slot is available
    if not is_slot_available(
        provider_id,
        appointment_data.appointment_date,
        appointment_data.appointment_time,
        service['duration']
    ):
        raise ValueError("This time slot is not available")

    # Get or create customer
    customer_id = get_or_create_customer(appointment_data.customer)

    # Create appointment with denormalized service details
    try:
        appointment = execute_query(
            """
            INSERT INTO appointments (
                provider_id, customer_id,
                service_name, service_duration, service_price,
                appointment_date, appointment_time,
                customer_notes, status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, provider_id, customer_id,
                      service_name, service_duration, service_price,
                      appointment_date, appointment_time,
                      customer_notes, status, created_at
            """,
            (
                provider_id,
                customer_id,
                service['name'],
                service['duration'],
                service['price'],
                appointment_data.appointment_date,
                appointment_data.appointment_time,
                appointment_data.customer_notes,
                'confirmed'
            ),
            fetch_one=True
        )
    except Exception as e:
        if 'idx_unique_appointment_slot' in str(e):
            raise ValueError("This time slot was just booked by someone else")
        raise e

    # Get customer details
    customer = execute_query(
        "SELECT id, email, first_name, last_name, phone, created_at FROM customers WHERE id = %s",
        (customer_id,),
        fetch_one=True
    )

    # Build service object for response
    service_obj = ServicePublic(
        id=appointment_data.service_id,
        barber_id=provider_id,
        name=service['name'],
        duration=service['duration'],
        price=service['price'],
        description=service.get('description'),
        icon=service.get('icon'),
        is_active=service.get('is_active', True),
        created_at=appointment['created_at']
    )

    # Build response
    appointment_with_details = AppointmentWithDetails(
        id=appointment['id'],
        barber_id=appointment['provider_id'],
        customer_id=appointment['customer_id'],
        service_id=appointment_data.service_id,
        appointment_date=appointment['appointment_date'],
        appointment_time=appointment['appointment_time'],
        duration=appointment['service_duration'],
        price=appointment['service_price'],
        customer_notes=appointment['customer_notes'],
        status=appointment['status'],
        created_at=appointment['created_at'],
        customer=CustomerPublic(**dict(customer)),
        service=service_obj
    )

    return BookingConfirmation(appointment=appointment_with_details)


def get_appointments_for_barber(
    provider_id: UUID,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> list[AppointmentWithDetails]:
    """
    Get appointments for a provider with customer details
    """
    query = """
        SELECT
            a.id, a.provider_id, a.customer_id,
            a.service_name, a.service_duration, a.service_price,
            a.appointment_date, a.appointment_time,
            a.customer_notes, a.status, a.created_at,
            c.id as c_id, c.email, c.first_name, c.last_name, c.phone, c.created_at as c_created_at
        FROM appointments a
        JOIN customers c ON a.customer_id = c.id
        WHERE a.provider_id = %s
    """
    params = [provider_id]

    if start_date:
        query += " AND a.appointment_date >= %s"
        params.append(start_date)

    if end_date:
        query += " AND a.appointment_date <= %s"
        params.append(end_date)

    query += " ORDER BY a.appointment_date, a.appointment_time"

    results = execute_query(query, tuple(params), fetch_all=True)

    appointments = []
    for row in results:
        customer = CustomerPublic(
            id=row['c_id'],
            email=row['email'],
            first_name=row['first_name'],
            last_name=row['last_name'],
            phone=row['phone'],
            created_at=row['c_created_at']
        )

        service = ServicePublic(
            id=f"{provider_id}-0",  # Dummy ID
            barber_id=provider_id,
            name=row['service_name'],
            duration=row['service_duration'],
            price=row['service_price'],
            description=None,
            icon=None,
            is_active=True,
            created_at=row['created_at']
        )

        appointment = AppointmentWithDetails(
            id=row['id'],
            barber_id=row['provider_id'],
            customer_id=row['customer_id'],
            service_id=f"{provider_id}-0",
            appointment_date=row['appointment_date'],
            appointment_time=row['appointment_time'],
            duration=row['service_duration'],
            price=row['service_price'],
            customer_notes=row['customer_notes'],
            status=row['status'],
            created_at=row['created_at'],
            customer=customer,
            service=service
        )

        appointments.append(appointment)

    return appointments
