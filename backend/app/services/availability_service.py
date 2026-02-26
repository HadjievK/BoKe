"""Business logic for availability and booking"""
from datetime import datetime, timedelta, date, time
from typing import List, Optional
from uuid import UUID

from app.database.connection import execute_query
from app.models.schemas import TimeSlot, AvailabilityResponse


def time_to_minutes(t: time) -> int:
    """Convert time to minutes since midnight"""
    return t.hour * 60 + t.minute


def minutes_to_time(minutes: int) -> time:
    """Convert minutes since midnight to time"""
    return time(hour=minutes // 60, minute=minutes % 60)


def times_overlap(start1: time, duration1: int, start2: time, duration2: int) -> bool:
    """Check if two time ranges overlap"""
    start1_mins = time_to_minutes(start1)
    end1_mins = start1_mins + duration1

    start2_mins = time_to_minutes(start2)
    end2_mins = start2_mins + duration2

    return start1_mins < end2_mins and start2_mins < end1_mins


def get_available_slots(provider_id: UUID, target_date: date, service_duration: int) -> AvailabilityResponse:
    """
    Calculate available time slots for a provider on a specific date

    Args:
        provider_id: UUID of the provider
        target_date: Date to check availability
        service_duration: Duration of the service in minutes

    Returns:
        AvailabilityResponse with list of time slots
    """
    # Get day of week (0=Monday, 6=Sunday)
    day_of_week = target_date.weekday()

    # Get provider's availability from JSONB
    result = execute_query(
        "SELECT availability FROM service_providers WHERE id = %s",
        (provider_id,),
        fetch_one=True
    )

    if not result or not result['availability']:
        return AvailabilityResponse(date=target_date, slots=[])

    # Find availability for this day
    availability_data = None
    for avail in result['availability']:
        if avail.get('day') == day_of_week:
            availability_data = avail
            break

    if not availability_data:
        return AvailabilityResponse(date=target_date, slots=[])

    start_time_str = availability_data['start']
    end_time_str = availability_data['end']
    slot_duration = availability_data.get('slot_duration', 30)

    # Parse times
    start_time = datetime.strptime(start_time_str, '%H:%M').time()
    end_time = datetime.strptime(end_time_str, '%H:%M').time()

    # Generate all possible slots
    slots: List[TimeSlot] = []
    current_minutes = time_to_minutes(start_time)
    end_minutes = time_to_minutes(end_time)

    while current_minutes + service_duration <= end_minutes:
        slot_time = minutes_to_time(current_minutes)
        slots.append(TimeSlot(
            time=slot_time.strftime('%H:%M'),
            available=True
        ))
        current_minutes += slot_duration

    # Get existing appointments for this date
    appointments = execute_query(
        """
        SELECT appointment_time, service_duration
        FROM appointments
        WHERE provider_id = %s
          AND appointment_date = %s
          AND status != 'cancelled'
        """,
        (provider_id, target_date),
        fetch_all=True
    )

    # Mark slots as unavailable if they overlap with existing appointments
    for slot in slots:
        slot_time = datetime.strptime(slot.time, '%H:%M').time()

        for appt in appointments:
            if times_overlap(slot_time, service_duration, appt['appointment_time'], appt['service_duration']):
                slot.available = False
                break

    # Filter out past slots if date is today
    today = date.today()
    if target_date == today:
        current_time = datetime.now().time()
        slots = [
            slot for slot in slots
            if datetime.strptime(slot.time, '%H:%M').time() > current_time
        ]

    return AvailabilityResponse(date=target_date, slots=slots)


def is_slot_available(provider_id: UUID, appointment_date: date, appointment_time: time, duration: int) -> bool:
    """
    Check if a specific slot is available

    Returns True if slot is free, False otherwise
    """
    # Get day of week
    day_of_week = appointment_date.weekday()

    # Get provider's availability from JSONB
    result = execute_query(
        "SELECT availability FROM service_providers WHERE id = %s",
        (provider_id,),
        fetch_one=True
    )

    if not result or not result['availability']:
        return False

    # Find availability for this day
    availability_data = None
    for avail in result['availability']:
        if avail.get('day') == day_of_week:
            availability_data = avail
            break

    if not availability_data:
        return False

    # Check if slot is within working hours
    start_time = datetime.strptime(availability_data['start'], '%H:%M').time()
    end_time = datetime.strptime(availability_data['end'], '%H:%M').time()

    slot_start_mins = time_to_minutes(appointment_time)
    slot_end_mins = slot_start_mins + duration
    start_mins = time_to_minutes(start_time)
    end_mins = time_to_minutes(end_time)

    if slot_start_mins < start_mins or slot_end_mins > end_mins:
        return False

    # Check for conflicts with existing appointments
    conflicts = execute_query(
        """
        SELECT 1
        FROM appointments
        WHERE provider_id = %s
          AND appointment_date = %s
          AND status != 'cancelled'
        """,
        (provider_id, appointment_date),
        fetch_all=True
    )

    # Manual overlap check since we can't use OVERLAPS with separate columns
    for conflict in conflicts:
        appt_time = execute_query(
            """
            SELECT appointment_time, service_duration
            FROM appointments
            WHERE provider_id = %s
              AND appointment_date = %s
              AND status != 'cancelled'
            """,
            (provider_id, appointment_date),
            fetch_all=True
        )

        for a in appt_time:
            if times_overlap(appointment_time, duration, a['appointment_time'], a['service_duration']):
                return False

    return True
