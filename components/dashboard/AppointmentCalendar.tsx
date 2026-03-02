'use client'

import React, { useMemo, useState, useCallback } from 'react'
import { Calendar, momentLocalizer, View, Event } from 'react-big-calendar'
import moment from 'moment'
import { AppointmentWithDetails } from '@/lib/types'
import '@/components/dashboard/calendar-styles.css'

const localizer = momentLocalizer(moment)

interface CalendarEvent extends Event {
  resource: AppointmentWithDetails
  status: 'confirmed' | 'cancelled' | 'completed'
}

interface AppointmentCalendarProps {
  appointments: AppointmentWithDetails[]
  onSelectAppointment: (appointment: AppointmentWithDetails) => void
  onNavigate?: (date: Date, view: View) => void
  onViewChange?: (view: View) => void
}

export default function AppointmentCalendar({
  appointments,
  onSelectAppointment,
  onNavigate,
  onViewChange,
}: AppointmentCalendarProps) {
  const [currentView, setCurrentView] = useState<View>('week')
  const [currentDate, setCurrentDate] = useState(new Date())

  // Transform appointments to calendar events
  const events = useMemo<CalendarEvent[]>(() => {
    const validEvents: CalendarEvent[] = []

    for (const apt of appointments) {
      // Skip appointments with invalid date/time
      if (!apt.appointment_date || !apt.appointment_time) {
        console.warn('Missing appointment date/time:', apt)
        continue
      }

      // Use moment for reliable date parsing from PostgreSQL
      const momentDate = moment(`${apt.appointment_date} ${apt.appointment_time}`, 'YYYY-MM-DD HH:mm:ss')

      // Validate the date is valid
      if (!momentDate.isValid()) {
        console.warn('Invalid appointment date/time:', apt)
        continue
      }

      const startTime = momentDate.toDate()
      const endTime = new Date(startTime.getTime() + apt.duration * 60000)

      validEvents.push({
        title: `${apt.customer.first_name} ${apt.customer.last_name} · ${apt.service.name}`,
        start: startTime,
        end: endTime,
        resource: apt,
        status: apt.status,
      })
    }

    return validEvents
  }, [appointments])

  // Handle event selection
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      onSelectAppointment(event.resource)
    },
    [onSelectAppointment]
  )

  // Handle navigation
  const handleNavigate = useCallback(
    (date: Date) => {
      setCurrentDate(date)
      if (onNavigate) {
        onNavigate(date, currentView)
      }
    },
    [currentView, onNavigate]
  )

  // Handle view change
  const handleViewChange = useCallback(
    (view: View) => {
      setCurrentView(view)
      if (onViewChange) {
        onViewChange(view)
      }
    },
    [onViewChange]
  )

  // Custom event styling based on status
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const statusClass = `status-${event.status}`
    return {
      className: statusClass,
    }
  }, [])

  // Custom day prop getter to highlight today
  const dayPropGetter = useCallback((date: Date) => {
    const isToday = moment(date).isSame(moment(), 'day')
    if (isToday) {
      return {
        className: 'rbc-today',
      }
    }
    return {}
  }, [])

  return (
    <div className="appointment-calendar-wrapper" style={{ height: '700px' }}>
      <Calendar<CalendarEvent>
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        defaultView="week"
        views={['week', 'day', 'month']}
        view={currentView}
        onView={handleViewChange}
        date={currentDate}
        onNavigate={handleNavigate}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        step={30}
        timeslots={2}
        min={new Date(2024, 0, 1, 8, 0, 0)} // 8 AM
        max={new Date(2024, 0, 1, 20, 0, 0)} // 8 PM
        toolbar={true}
        popup={true}
        tooltipAccessor={(event: CalendarEvent) => {
          const { customer, service, status } = event.resource
          return `${customer.first_name} ${customer.last_name}\n${service.name}\nStatus: ${status}`
        }}
        messages={{
          today: 'Today',
          previous: 'Back',
          next: 'Next',
          month: 'Month',
          week: 'Week',
          day: 'Day',
          showMore: (total) => `+${total} more`,
        }}
      />
    </div>
  )
}
