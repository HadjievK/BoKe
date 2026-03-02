'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatTime } from '@/lib/utils'
import { AppointmentStatus, BookingManagementData } from '@/lib/types'

export default function BookingPage({
  params,
}: {
  params: { slug: string; token: string }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const action = searchParams.get('action') // 'cancel' or 'reschedule'

  const [booking, setBooking] = useState<BookingManagementData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)

  useEffect(() => {
    fetchBooking()

    // Auto-show action modal if coming from email link
    if (action === 'cancel' || action === 'reschedule') {
      setShowActionModal(true)
    }
  }, [params.token, action])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/${params.slug}/booking/${params.token}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to load booking')
        setLoading(false)
        return
      }

      setBooking(data)
      setLoading(false)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    setCancelling(true)
    setError('')

    try {
      const response = await fetch(`/api/${params.slug}/booking/${params.token}`, {
        method: 'PATCH',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to cancel booking')
        setCancelling(false)
        return
      }

      // Refresh booking data
      await fetchBooking()
      setCancelling(false)
      setShowActionModal(false)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setCancelling(false)
    }
  }

  const handleReschedule = () => {
    // Redirect to main booking page with pre-selected service
    router.push(`/${params.slug}?reschedule=true`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking...</p>
        </div>
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href={`/${params.slug}`}
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Book New Appointment
          </Link>
        </div>
      </div>
    )
  }

  if (!booking) return null

  const { appointment, provider, service, token } = booking
  const isCancelled = appointment.status === AppointmentStatus.CANCELLED
  const isCompleted = appointment.status === AppointmentStatus.COMPLETED
  const isPast = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`) < new Date()
  const canCancel = !isCancelled && !isCompleted && !isPast && !token.is_expired

  const getStatusBadge = () => {
    if (isCancelled) {
      return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">Cancelled</span>
    }
    if (isCompleted) {
      return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Completed</span>
    }
    if (isPast) {
      return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Past</span>
    }
    return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">✓ Confirmed</span>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-purple-600 text-white p-6">
            <h1 className="text-2xl font-bold">
              {provider.business_name || provider.name}
            </h1>
            <p className="mt-1 opacity-90">Your Booking Details</p>
          </div>

          {/* Status */}
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Booking Status</h2>
            </div>
            {getStatusBadge()}
          </div>

          {/* Booking Details */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Appointment Details</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="text-2xl mr-2">📅</span>
                  <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(appointment.appointment_date)}
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <span className="text-2xl mr-2">🕐</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatTime(appointment.appointment_time)}
                    </p>
                    <p className="text-sm text-gray-600">{appointment.duration} minutes</p>
                  </div>
                </div>

                <div className="flex">
                  <span className="text-2xl mr-2">💰</span>
                  <div>
                    <p className="font-medium text-gray-900">${appointment.price.toFixed(2)}</p>
                  </div>
                </div>

                {appointment.customer_notes && (
                  <div className="flex">
                    <span className="text-2xl mr-2">📝</span>
                    <div>
                      <p className="font-medium text-gray-900">Your Notes</p>
                      <p className="text-sm text-gray-600">{appointment.customer_notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Provider Info */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Provider Information</h3>
              <div className="space-y-2">
                {provider.location && (
                  <div className="flex">
                    <span className="text-xl mr-2">📍</span>
                    <p className="text-gray-700">{provider.location}</p>
                  </div>
                )}
                {provider.phone && (
                  <div className="flex">
                    <span className="text-xl mr-2">📞</span>
                    <p className="text-gray-700">{provider.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Information</h3>
              <div className="space-y-1">
                <p className="text-gray-700">
                  {appointment.customer_first_name} {appointment.customer_last_name}
                </p>
                <p className="text-gray-600">{appointment.customer_email}</p>
                {appointment.customer_phone && (
                  <p className="text-gray-600">{appointment.customer_phone}</p>
                )}
              </div>
            </div>

            {/* Token Expiration Warning */}
            {token.is_expired && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                <p className="text-sm">
                  ⚠️ This booking link has expired. You can no longer manage this booking through this link.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-3">
            {canCancel && (
              <>
                <button
                  onClick={handleReschedule}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
                >
                  📅 Reschedule Appointment
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {cancelling ? 'Cancelling...' : '❌ Cancel Booking'}
                </button>
              </>
            )}

            <Link
              href={`/${params.slug}`}
              className="block w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 text-center font-medium"
            >
              Book Another Appointment
            </Link>
          </div>
        </div>

        {/* Action Modal - Auto-opens from email links */}
        {showActionModal && action && canCancel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              {action === 'cancel' ? (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Booking?</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to cancel your appointment with {provider.business_name || provider.name} on {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowActionModal(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Keep Booking
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                    >
                      {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Reschedule Appointment</h3>
                  <p className="text-gray-600 mb-6">
                    You'll be redirected to the booking page where you can select a new date and time.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowActionModal(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReschedule}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Questions about your booking?{' '}
            <a href={`mailto:${appointment.customer_email}`} className="text-purple-600 hover:text-purple-700">
              Reply to your confirmation email
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
