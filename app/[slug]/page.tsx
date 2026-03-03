'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, MapPin, CheckCircle, Sparkles, ArrowRight } from 'lucide-react'
import { getProviderProfile, getAvailability, bookAppointment } from '@/lib/api'
import type { ProviderWithServices, Service, Customer, BookingRequest } from '@/lib/types'
import { formatDateISO } from '@/lib/utils'
import CalendarPicker from '@/components/booking/CalendarPicker'
import TimeSlotGrid from '@/components/booking/TimeSlotGrid'
import CustomerForm from '@/components/booking/CustomerForm'
import { Alert } from '@/components/ui/alert'

type BookingStep = 'select-datetime' | 'enter-details' | 'success'

export default function ProviderProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [provider, setProvider] = useState<ProviderWithServices | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('services')

  // Booking state
  const [bookingStep, setBookingStep] = useState<BookingStep>('select-datetime')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [timeSlots, setTimeSlots] = useState<any[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [booking, setBooking] = useState(false)
  const [confirmation, setConfirmation] = useState<any>(null)

  useEffect(() => {
    async function fetchProvider() {
      try {
        const data = await getProviderProfile(slug)
        setProvider(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProvider()
  }, [slug])

  // Fetch time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots()
    }
  }, [selectedDate])

  const fetchTimeSlots = async () => {
    if (!selectedDate || !provider) return

    setLoadingSlots(true)
    try {
      const dateStr = formatDateISO(selectedDate)
      const data = await getAvailability(slug, dateStr, provider.services[0]?.id || '')
      setTimeSlots(data.slots)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setBookingStep('enter-details')
    setTimeout(() => {
      document.getElementById('customer-form-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleCustomerSubmit = async (customer: Customer) => {
    if (!selectedDate || !selectedTime || !provider) return

    setBooking(true)
    setError('')

    try {
      const bookingRequest: BookingRequest = {
        service_id: provider.services[0]?.id || '',
        appointment_date: formatDateISO(selectedDate),
        appointment_time: selectedTime,
        customer
      }

      const result = await bookAppointment(slug, bookingRequest)
      setConfirmation(result)
      setBookingStep('success')
      setTimeout(() => {
        document.getElementById('success-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBooking(false)
    }
  }

  const handleBookAnother = () => {
    setBookingStep('select-datetime')
    setSelectedDate(null)
    setSelectedTime(null)
    setConfirmation(null)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <main className="min-h-screen relative overflow-hidden" style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 dark:bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 dark:bg-pink-500 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6" />
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading your experience...</p>
          </motion.div>
        </div>
      </main>
    )
  }

  if (error || !provider) {
    return (
      <main className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 dark:bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center max-w-md border border-white/20 dark:border-gray-700/50"
        >
          <div className="text-7xl mb-6">😕</div>
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Provider Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">{error || 'This booking page does not exist'}</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition-transform shadow-xl shadow-purple-500/25"
          >
            Go Home
            <ArrowRight size={20} />
          </a>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative" style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300 dark:bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-300 dark:bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-300 dark:bg-pink-500 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10">
        {/* Hero Section with Cover Photo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          {/* Cover Photo Background - Full Hero */}
          <div className="relative min-h-[300px]">
            {/* Background Image or Gradient */}
            {provider.cover_photo_url ? (
              <div className="absolute inset-0">
                <img
                  src={provider.cover_photo_url}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600" />
            )}

            {/* Content over cover photo */}
            <div className="relative z-10 backdrop-blur-[2px]">
              <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-start gap-6 mb-6">
                  {/* Avatar with photo or gradient */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl font-bold text-white flex-shrink-0 shadow-2xl shadow-black/50 overflow-hidden border-4 border-white/20"
                    style={{
                      background: provider.avatar_url ? 'transparent' : 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
                    }}
                  >
                    {provider.avatar_url ? (
                      <img
                        src={provider.avatar_url}
                        alt={provider.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      provider.name.charAt(0)
                    )}
                  </motion.div>

                  <div className="flex-1">
                    {/* Status Badge */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 bg-green-500/90 dark:bg-green-600/90 text-white border border-white/30 backdrop-blur-md shadow-lg"
                    >
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      Available Now
                    </motion.div>

                    {/* Business Name */}
                    <motion.h1
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-5xl font-black mb-3 text-white drop-shadow-lg"
                      style={{ letterSpacing: '-0.02em' }}
                    >
                      {provider.business_name || provider.name}
                    </motion.h1>

                    {/* Provider Info */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-6 text-white/90 flex-wrap drop-shadow-md"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-white" />
                        <span className="font-medium">{provider.name}</span>
                      </div>
                      {provider.location && (
                        <a
                          href={provider.latitude && provider.longitude
                            ? `https://www.google.com/maps/dir/?api=1&destination=${provider.latitude},${provider.longitude}`
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:text-white transition-colors"
                        >
                          <MapPin size={18} />
                          <span>{provider.location}</span>
                        </a>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-800/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 flex gap-0">
              {['services', 'about'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-6 py-4 text-sm font-semibold transition ${
                    activeTab === tab
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Body Content */}
        <div className="max-w-7xl mx-auto px-6 py-12 pb-32">
          <AnimatePresence mode="wait">
            {activeTab === 'services' && bookingStep !== 'success' && (
              <motion.div
                key="services"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-2 gap-8"
              >
                {/* Left: Services */}
                <div id="services-section">
                  <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Services & Pricing
                  </h2>

                  <div className="space-y-4">
                    {provider.services.map((service, index) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all"
                      >
                        <div className="flex items-start gap-4">
                          {service.icon && (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg">
                              {service.icon}
                            </div>
                          )}

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {service.name}
                              </h3>
                              <div className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                ${service.price}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                              <Clock size={16} />
                              <span>{service.duration} minutes</span>
                            </div>
                            {service.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {service.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Right: Booking Calendar */}
                <div>
                  <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Book Your Appointment
                  </h2>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Calendar */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="text-purple-600" size={24} />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Choose a Date</h3>
                      </div>
                      <CalendarPicker
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                      />
                    </div>

                    {/* Time Slots */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="text-purple-600" size={24} />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {selectedDate ? 'Available Times' : 'Select a date first'}
                        </h3>
                      </div>
                      {selectedDate ? (
                        <TimeSlotGrid
                          slots={timeSlots}
                          selectedTime={selectedTime}
                          onTimeSelect={handleTimeSelect}
                          loading={loadingSlots}
                        />
                      ) : (
                        <div className="text-center py-16">
                          <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-6xl mb-4"
                          >
                            📅
                          </motion.div>
                          <p className="text-gray-600 dark:text-gray-400">Pick a date to see available time slots</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* About Section */}
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-3xl"
              >
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
                  <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    About {provider.name}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg">
                    {provider.bio || `Professional service provider offering quality services. Book your appointment today!`}
                  </p>

                  {provider.location && (
                    <div className="flex items-start gap-3 p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30">
                      <MapPin className="text-purple-600 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white mb-1">Location</div>
                        <div className="text-gray-700 dark:text-gray-300">{provider.location}</div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Customer Form Section */}
          <AnimatePresence>
            {bookingStep === 'enter-details' && selectedDate && selectedTime && (
              <motion.div
                id="customer-form-section"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="mt-12 scroll-mt-8 max-w-3xl mx-auto"
              >
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-2xl">
                  <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Your Information
                  </h2>

                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-8 border border-purple-100 dark:border-purple-800/30">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Selected Time</div>
                    <div className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                      <CheckCircle className="text-green-500" size={24} />
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
                    </div>
                  </div>

                  <CustomerForm
                    onSubmit={handleCustomerSubmit}
                    loading={booking}
                  />

                  {error && (
                    <div className="mt-6">
                      <Alert variant="error" animated>
                        {error}
                      </Alert>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Section */}
          <AnimatePresence>
            {bookingStep === 'success' && confirmation && (
              <motion.div
                id="success-section"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12 scroll-mt-8 max-w-3xl mx-auto"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="text-8xl mb-6"
                >
                  ✅
                </motion.div>

                <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Booking Confirmed!
                </h2>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 mb-8 border border-purple-100 dark:border-purple-800/30"
                >
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    ✉️ Check your email
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">
                    We&apos;ve sent a confirmation to <strong className="text-purple-600">{confirmation.appointment.customer_email}</strong>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    The email includes your booking details and a secure link to view or cancel your appointment.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-white/20 dark:border-gray-700/50 shadow-xl text-left"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Service</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{confirmation.appointment.service_name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Date & Time</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {new Date(confirmation.appointment.appointment_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })} at {confirmation.appointment.appointment_time}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Duration</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">{confirmation.appointment.duration} minutes</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Price</div>
                        <div className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">${confirmation.appointment.price}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  {confirmation.token && (
                    <Link
                      href={`/${slug}/booking/${confirmation.token}`}
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl hover:scale-105 transition-transform font-semibold text-lg shadow-2xl shadow-purple-500/50"
                    >
                      View Booking Details
                      <ArrowRight size={20} />
                    </Link>
                  )}

                  <button
                    onClick={handleBookAnother}
                    className="inline-flex items-center justify-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-purple-600 dark:text-purple-400 px-8 py-4 rounded-2xl border-2 border-purple-600 hover:scale-105 transition-transform font-semibold text-lg shadow-xl"
                  >
                    Book Another
                    <Sparkles size={20} />
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sticky CTA */}
        <AnimatePresence>
          {bookingStep === 'select-datetime' && !selectedTime && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-white/20 dark:border-gray-800/50 px-6 py-5 flex items-center justify-between z-50 shadow-2xl"
            >
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Next available: <strong className="text-purple-600 dark:text-purple-400 text-base">Today</strong>
              </div>
              <button
                onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl text-base font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-purple-500/50"
              >
                Select Date & Time
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  )
}
