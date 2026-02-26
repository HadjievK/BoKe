"""Business logic for dashboard"""
from datetime import date, timedelta
from uuid import UUID
from typing import List

from app.database.connection import execute_query
from app.models.schemas import (
    DashboardData, DashboardStats,
    AppointmentWithDetails, CustomerPublic
)
from app.services.appointment_service import get_appointments_for_barber


def get_dashboard_data(provider_id: UUID) -> DashboardData:
    """
    Get all dashboard data for a service provider
    """
    today = date.today()
    week_start = today - timedelta(days=today.weekday())  # Monday of current week
    week_end = week_start + timedelta(days=6)  # Sunday

    # Get stats
    today_count = execute_query(
        """
        SELECT COUNT(*) as count
        FROM appointments
        WHERE provider_id = %s
          AND appointment_date = %s
          AND status != 'cancelled'
        """,
        (provider_id, today),
        fetch_one=True
    )

    week_count = execute_query(
        """
        SELECT COUNT(*) as count
        FROM appointments
        WHERE provider_id = %s
          AND appointment_date BETWEEN %s AND %s
          AND status != 'cancelled'
        """,
        (provider_id, week_start, week_end),
        fetch_one=True
    )

    total_customers = execute_query(
        """
        SELECT COUNT(DISTINCT customer_id) as count
        FROM appointments
        WHERE provider_id = %s
        """,
        (provider_id,),
        fetch_one=True
    )

    stats = DashboardStats(
        today_appointments=today_count['count'] or 0,
        week_appointments=week_count['count'] or 0,
        total_customers=total_customers['count'] or 0,
        rating=5.0
    )

    # Get today's appointments with details
    appointments = get_appointments_for_barber(
        provider_id,
        start_date=today,
        end_date=today
    )

    # Get recent customers (last 5 unique customers)
    recent_customers_data = execute_query(
        """
        SELECT DISTINCT ON (c.id)
            c.id, c.email, c.first_name, c.last_name, c.phone, c.created_at
        FROM customers c
        JOIN appointments a ON c.id = a.customer_id
        WHERE a.provider_id = %s
        ORDER BY c.id, a.created_at DESC
        LIMIT 5
        """,
        (provider_id,),
        fetch_all=True
    )

    recent_customers = [CustomerPublic(**dict(c)) for c in recent_customers_data]

    return DashboardData(
        stats=stats,
        appointments=appointments,
        recent_customers=recent_customers
    )


def get_customers_for_barber(provider_id: UUID) -> List[CustomerPublic]:
    """
    Get all unique customers who have booked with this provider
    """
    customers_data = execute_query(
        """
        SELECT DISTINCT c.id, c.email, c.first_name, c.last_name, c.phone, c.created_at
        FROM customers c
        JOIN appointments a ON c.id = a.customer_id
        WHERE a.provider_id = %s
        ORDER BY c.created_at DESC
        """,
        (provider_id,),
        fetch_all=True
    )

    return [CustomerPublic(**dict(c)) for c in customers_data]
