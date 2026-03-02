'use client'

import { AppointmentWithDetails } from '@/lib/types'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import { X, Calendar, Clock, User, DollarSign, Phone, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface AppointmentPreviewProps {
  appointment: AppointmentWithDetails | null
  position: { x: number; y: number } | null
  onClose: () => void
  onOpenDetails: () => void
}

export default function AppointmentPreview({
  appointment,
  position,
  onClose,
  onOpenDetails,
}: AppointmentPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (appointment && position) {
      // Small delay to prevent immediate close
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [appointment, position, onClose])

  if (!appointment || !position) return null

  // Validate appointment date/time
  if (!appointment.appointment_date || !appointment.appointment_time) {
    return null
  }

  let appointmentDateTime: Date
  try {
    appointmentDateTime = new Date(
      `${appointment.appointment_date}T${appointment.appointment_time}`
    )
    if (isNaN(appointmentDateTime.getTime())) {
      return null
    }
  } catch (error) {
    return null
  }

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return colors[status as keyof typeof colors] || colors.confirmed
  }

  // Adjust position to keep preview in viewport
  const adjustedPosition = { ...position }
  if (typeof window !== 'undefined') {
    const previewWidth = 320
    const previewHeight = 400

    if (position.x + previewWidth > window.innerWidth) {
      adjustedPosition.x = window.innerWidth - previewWidth - 20
    }

    if (position.y + previewHeight > window.innerHeight) {
      adjustedPosition.y = Math.max(20, window.innerHeight - previewHeight - 20)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={previewRef}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
        className="fixed z-[9999] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        style={{
          left: `${adjustedPosition.x}px`,
          top: `${adjustedPosition.y}px`,
          width: '320px',
          maxHeight: '500px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Appointment Details</h3>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
          {/* Service */}
          <div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Service</span>
            </div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 ml-6">
              {appointment.service.name}
            </p>
            {appointment.service.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-6 mt-1">
                {appointment.service.description}
              </p>
            )}
          </div>

          {/* Date & Time */}
          <div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Date & Time</span>
            </div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 ml-6">
              {formatDate(appointmentDateTime)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
              {formatTime(appointment.appointment_time)} • {appointment.duration} min
            </p>
          </div>

          {/* Customer */}
          <div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Customer</span>
            </div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 ml-6">
              {appointment.customer.first_name} {appointment.customer.last_name}
            </p>
            {appointment.customer.email && (
              <div className="flex items-center gap-2 ml-6 mt-1">
                <Mail className="w-3 h-3 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {appointment.customer.email}
                </p>
              </div>
            )}
            {appointment.customer.phone && (
              <div className="flex items-center gap-2 ml-6 mt-1">
                <Phone className="w-3 h-3 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {appointment.customer.phone}
                </p>
              </div>
            )}
          </div>

          {/* Price */}
          <div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Price</span>
            </div>
            <p className="font-bold text-lg text-indigo-600 dark:text-indigo-400 ml-6">
              {formatCurrency(appointment.service.price)}
            </p>
          </div>

          {/* Notes */}
          {appointment.customer_notes && (
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Notes
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                {appointment.customer_notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={onOpenDetails}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
          >
            View Full Details
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
