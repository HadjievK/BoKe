'use client'

import React from 'react'
import { AppointmentWithDetails } from '@/lib/types'
import { format } from 'date-fns'

interface AppointmentDetailsModalProps {
  appointment: AppointmentWithDetails | null
  isOpen: boolean
  onClose: () => void
  onCancel: (appointmentId: string) => Promise<void>
  onComplete: (appointmentId: string) => Promise<void>
}

export default function AppointmentDetailsModal({
  appointment,
  isOpen,
  onClose,
  onCancel,
  onComplete,
}: AppointmentDetailsModalProps) {
  if (!isOpen || !appointment) return null

  const appointmentDateTime = new Date(
    `${appointment.appointment_date}T${appointment.appointment_time}`
  )

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    }

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      await onCancel(appointment.id)
      onClose()
    }
  }

  const handleComplete = async () => {
    if (confirm('Mark this appointment as completed?')) {
      await onComplete(appointment.id)
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Appointment Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Status
              </label>
              {getStatusBadge(appointment.status)}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Date
                </label>
                <p className="text-gray-900 font-medium">
                  {format(appointmentDateTime, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Time
                </label>
                <p className="text-gray-900 font-medium">
                  {format(appointmentDateTime, 'h:mm a')}
                </p>
              </div>
            </div>

            {/* Service */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Service
              </label>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-gray-900 font-medium">
                  {appointment.service.name}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>{appointment.duration} minutes</span>
                  <span>•</span>
                  <span>${appointment.price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Customer
              </label>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2">
                <p className="text-gray-900 font-medium">
                  {appointment.customer.first_name}{' '}
                  {appointment.customer.last_name}
                </p>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <a
                      href={`mailto:${appointment.customer.email}`}
                      className="hover:text-purple-600 transition-colors"
                    >
                      {appointment.customer.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <a
                      href={`tel:${appointment.customer.phone}`}
                      className="hover:text-purple-600 transition-colors"
                    >
                      {appointment.customer.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Notes */}
            {appointment.customer_notes && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Notes
                </label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {appointment.customer_notes}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
            {appointment.status === 'confirmed' && (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  Cancel Appointment
                </button>
                <button
                  onClick={handleComplete}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Mark Complete
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
