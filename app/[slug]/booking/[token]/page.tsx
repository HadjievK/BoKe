'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, DollarSign, MapPin, Phone, Mail, User, Sparkles, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import { AppointmentStatus, BookingManagementData } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'

export default function BookingPage({
  params,
}: {
  params: { slug: string; token: string }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const action = searchParams.get('action')

  const [booking, setBooking] = useState<BookingManagementData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)

  useEffect(() => {
    fetchBooking()

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

      await fetchBooking()
      setCancelling(false)
      setShowActionModal(false)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setCancelling(false)
    }
  }

  const handleReschedule = () => {
    router.push(`/${params.slug}?reschedule=true`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-purple-200 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
        </div>

        <motion.div
          className="text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">Loading your booking...</p>
        </motion.div>
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-red-200 dark:bg-red-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <motion.div
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <Link href={`/${params.slug}`}>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Book New Appointment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  if (!booking) return null

  const { appointment, provider, service, token } = booking
  const isCancelled = appointment.status === AppointmentStatus.CANCELLED
  const isCompleted = appointment.status === AppointmentStatus.COMPLETED
  const isPast = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`) < new Date()
  const canCancel = !isCancelled && !isCompleted && !isPast && !token.is_expired

  const getStatusConfig = () => {
    if (isCancelled) {
      return {
        icon: XCircle,
        text: 'Cancelled',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        gradient: 'from-gray-400 to-gray-600'
      }
    }
    if (isCompleted) {
      return {
        icon: CheckCircle,
        text: 'Completed',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        gradient: 'from-green-400 to-emerald-600'
      }
    }
    if (isPast) {
      return {
        icon: Clock,
        text: 'Past',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        gradient: 'from-blue-400 to-indigo-600'
      }
    }
    return {
      icon: CheckCircle,
      text: 'Confirmed',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      gradient: 'from-purple-400 to-blue-600'
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-200 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-96 h-96 bg-blue-200 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-20 left-1/3 w-80 h-80 bg-pink-200 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30"
          animate={{
            x: [0, 50, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href={`/${params.slug}`} className="flex items-center space-x-2 group">
            <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {provider.business_name || provider.name}
            </span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Status badge */}
            <div className="mb-8 text-center">
              <motion.div
                className="inline-flex items-center space-x-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${statusConfig.color} font-medium`}>
                  <StatusIcon className="h-5 w-5" />
                  <span>{statusConfig.text}</span>
                </div>
              </motion.div>
            </div>

            {/* Main card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Gradient header */}
              <div className={`h-2 bg-gradient-to-r ${statusConfig.gradient}`} />

              <div className="p-8 sm:p-12">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Your Appointment
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Everything you need to know about your booking
                </p>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <Alert variant="error" animated>
                      {error}
                    </Alert>
                  )}
                </AnimatePresence>

                {/* Appointment details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Service card */}
                  <motion.div
                    className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Service</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {service.name}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {appointment.duration} min
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            ${appointment.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Date & Time card */}
                  <motion.div
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">When</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatDate(appointment.appointment_date)}
                        </p>
                        <p className="text-base text-gray-600 dark:text-gray-300 mt-1">
                          {formatTime(appointment.appointment_time)}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Provider info card */}
                  {(provider.location || provider.phone) && (
                    <motion.div
                      className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-100 dark:border-green-800"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Location</p>
                          {provider.location && (
                            <p className="text-base text-gray-900 dark:text-white mb-2">
                              {provider.location}
                            </p>
                          )}
                          {provider.phone && (
                            <a
                              href={`tel:${provider.phone}`}
                              className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                            >
                              <Phone className="w-4 h-4 mr-1" />
                              {provider.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Customer info card */}
                  <motion.div
                    className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-100 dark:border-amber-800"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Your Details</p>
                        <p className="text-base font-medium text-gray-900 dark:text-white">
                          {appointment.customer_first_name} {appointment.customer_last_name}
                        </p>
                        <a
                          href={`mailto:${appointment.customer_email}`}
                          className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors mt-1"
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          {appointment.customer_email}
                        </a>
                        {appointment.customer_phone && (
                          <a
                            href={`tel:${appointment.customer_phone}`}
                            className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors mt-1"
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            {appointment.customer_phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Customer notes */}
                {appointment.customer_notes && (
                  <motion.div
                    className="mb-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Your Notes</p>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {appointment.customer_notes}
                    </p>
                  </motion.div>
                )}

                {/* Token expiration warning */}
                {token.is_expired && (
                  <motion.div
                    className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start space-x-3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      This booking link has expired. You can no longer manage this booking through this link.
                    </p>
                  </motion.div>
                )}

                {/* Action buttons */}
                <div className="space-y-3">
                  {canCancel && (
                    <>
                      <Button
                        onClick={handleReschedule}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Reschedule Appointment
                      </Button>
                      <Button
                        onClick={() => setShowActionModal(true)}
                        disabled={cancelling}
                        variant="outline"
                        className="w-full border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 h-12"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                      </Button>
                    </>
                  )}

                  <Link href={`/${params.slug}`} className="block">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 h-12"
                    >
                      Book Another Appointment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Help text */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Questions about your booking?{' '}
                <a
                  href={`mailto:${appointment.customer_email}`}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                >
                  Reply to your confirmation email
                </a>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Cancellation modal */}
      <AnimatePresence>
        {showActionModal && action === 'cancel' && canCancel && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Cancel Booking?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Are you sure you want to cancel your appointment with{' '}
                  <span className="font-medium">{provider.business_name || provider.name}</span>
                  {' '}on{' '}
                  <span className="font-medium">{formatDate(appointment.appointment_date)}</span>
                  {' '}at{' '}
                  <span className="font-medium">{formatTime(appointment.appointment_time)}</span>?
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowActionModal(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={cancelling}
                >
                  Keep Booking
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Reschedule modal */}
        {showActionModal && action === 'reschedule' && canCancel && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                  <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Reschedule Appointment
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  You&apos;ll be redirected to the booking page where you can select a new date and time.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowActionModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReschedule}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
