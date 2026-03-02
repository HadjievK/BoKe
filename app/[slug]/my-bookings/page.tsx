'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppointmentWithDetails, AppointmentStatus, AppointmentStatusType, CustomerBookingsResponse } from '@/lib/types'

export default function CustomerBookingsPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [bookingsData, setBookingsData] = useState<CustomerBookingsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndFetchBookings()
  }, [params.slug])

  const checkAuthAndFetchBookings = async () => {
    const token = localStorage.getItem('customer_token')

    if (!token) {
      router.push(`/${params.slug}/signin`)
      return
    }

    try {
      // Fetch bookings (endpoint will authenticate)
      const bookingsResponse = await fetch(`/api/${params.slug}/my-bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!bookingsResponse.ok) {
        // If unauthorized, remove token and redirect
        if (bookingsResponse.status === 401) {
          localStorage.removeItem('customer_token')
          router.push(`/${params.slug}/signin`)
          return
        }
        const data = await bookingsResponse.json()
        setError(data.error || 'Failed to fetch bookings')
        setLoading(false)
        return
      }

      const data = await bookingsResponse.json()
      setBookingsData(data)
      setLoading(false)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('customer_token')
    router.push(`/${params.slug}/signin`)
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    const token = localStorage.getItem('customer_token')
    setCancellingId(appointmentId)

    try {
      const response = await fetch(`/api/${params.slug}/bookings/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to cancel appointment')
        setCancellingId(null)
        return
      }

      // Update state locally instead of refetching
      setBookingsData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          appointments: prev.appointments.map(apt =>
            apt.id === appointmentId ? { ...apt, status: AppointmentStatus.CANCELLED } : apt
          )
        }
      })
      setCancellingId(null)
      alert('Appointment cancelled successfully')
    } catch (err) {
      alert('An error occurred. Please try again.')
      setCancellingId(null)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const getStatusColor = (status: AppointmentStatusType) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'bg-purple-100 text-purple-800'
      case AppointmentStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800'
      case AppointmentStatus.COMPLETED:
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isUpcoming = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${time}`)
    return appointmentDateTime >= new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push(`/${params.slug}/signin`)}
            className="mt-4 text-purple-600 hover:text-purple-500"
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  const upcomingAppointments = bookingsData?.appointments.filter(apt =>
    isUpcoming(apt.appointment_date, apt.appointment_time)
  ) || []

  const pastAppointments = bookingsData?.appointments.filter(apt =>
    !isUpcoming(apt.appointment_date, apt.appointment_time)
  ) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Appointments
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                with {bookingsData?.provider.business_name || bookingsData?.provider.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/${params.slug}`}
                className="text-sm text-purple-600 hover:text-purple-500"
              >
                Book New Appointment
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upcoming Appointments */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Upcoming Appointments
          </h2>
          {upcomingAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No upcoming appointments</p>
              <Link
                href={`/${params.slug}`}
                className="mt-4 inline-block text-purple-600 hover:text-purple-500"
              >
                Book your first appointment
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.service.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p className="font-medium">
                          {formatDate(appointment.appointment_date)}
                        </p>
                        <p>{formatTime(appointment.appointment_time)}</p>
                        <p>{appointment.duration} minutes - ${appointment.price.toFixed(2)}</p>
                        {appointment.customer_notes && (
                          <p className="mt-2 text-gray-700">
                            <span className="font-medium">Notes:</span> {appointment.customer_notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {appointment.status === AppointmentStatus.CONFIRMED && (
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          disabled={cancellingId === appointment.id}
                          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingId === appointment.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Past Appointments
            </h2>
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white rounded-lg shadow p-6 opacity-75"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.service.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p className="font-medium">
                          {formatDate(appointment.appointment_date)}
                        </p>
                        <p>{formatTime(appointment.appointment_time)}</p>
                        <p>{appointment.duration} minutes - ${appointment.price.toFixed(2)}</p>
                        {appointment.customer_notes && (
                          <p className="mt-2 text-gray-700">
                            <span className="font-medium">Notes:</span> {appointment.customer_notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
