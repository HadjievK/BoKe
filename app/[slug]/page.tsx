'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProviderProfile, getAvailability, bookAppointment } from '@/lib/api'
import type { ProviderWithServices, Service, Customer, BookingRequest } from '@/lib/types'
import { formatDateISO } from '@/lib/utils'
import CalendarPicker from '@/components/booking/CalendarPicker'
import TimeSlotGrid from '@/components/booking/TimeSlotGrid'
import CustomerForm from '@/components/booking/CustomerForm'

type BookingStep = 'select-service' | 'select-datetime' | 'enter-details' | 'success'

export default function ProviderProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [provider, setProvider] = useState<ProviderWithServices | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('services')

  // Booking state
  const [bookingStep, setBookingStep] = useState<BookingStep>('select-service')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
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

  // Fetch time slots when date and service are selected
  useEffect(() => {
    if (selectedDate && selectedService) {
      fetchTimeSlots()
    }
  }, [selectedDate, selectedService])

  const fetchTimeSlots = async () => {
    if (!selectedDate || !selectedService) return

    setLoadingSlots(true)
    try {
      const dateStr = formatDateISO(selectedDate)
      const data = await getAvailability(slug, dateStr, selectedService.id)
      setTimeSlots(data.slots)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleSelectService = (service: Service) => {
    setSelectedService(service)
    setBookingStep('select-datetime')
    setSelectedDate(null)
    setSelectedTime(null)
    // Scroll to booking section
    setTimeout(() => {
      document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setBookingStep('enter-details')
  }

  const handleCustomerSubmit = async (customer: Customer) => {
    if (!selectedService || !selectedDate || !selectedTime) return

    setBooking(true)
    setError('')

    try {
      const bookingRequest: BookingRequest = {
        service_id: selectedService.id,
        appointment_date: formatDateISO(selectedDate),
        appointment_time: selectedTime,
        customer
      }

      const result = await bookAppointment(slug, bookingRequest)
      setConfirmation(result)
      setBookingStep('success')
      // Scroll to success message
      setTimeout(() => {
        document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBooking(false)
    }
  }

  const handleBookAnother = () => {
    setBookingStep('select-service')
    setSelectedService(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setConfirmation(null)
    setError('')
    // Scroll to services
    setTimeout(() => {
      document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8860B] mx-auto mb-4"></div>
          <p className="text-[#444444]">Loading...</p>
        </div>
      </main>
    )
  }

  if (error || !provider) {
    return (
      <main className="min-h-screen bg-[#F8F5F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md border border-[#E8E2D9]">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2 text-[#111111]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Provider Not Found
          </h1>
          <p className="text-[#888888] mb-6">{error || 'This booking page does not exist'}</p>
          <a
            href="/"
            className="inline-block bg-[#111111] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#B8860B] transition"
          >
            Go Home
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8F5F0]">
      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden bg-[#111111]">
        {/* Background Pattern */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.015) 20px, rgba(255,255,255,0.015) 21px),
              repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.015) 20px, rgba(255,255,255,0.015) 21px),
              radial-gradient(ellipse 70% 80% at 80% 20%, rgba(184,134,11,0.2) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 20% 80%, rgba(184,134,11,0.1) 0%, transparent 55%)
            `
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-end p-8 max-w-[680px] mx-auto">
          <div className="flex items-end gap-5 mb-4">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #B8860B, #7A5A08)',
                border: '3px solid rgba(255,255,255,0.15)',
                fontFamily: 'Playfair Display, serif'
              }}
            >
              {provider.name.charAt(0)}
            </div>

            {/* Open Badge */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-1"
              style={{
                background: 'rgba(45,122,79,0.2)',
                border: '1px solid rgba(45,122,79,0.4)',
                color: '#6ECA88'
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#6ECA88] animate-pulse" />
              Open now
            </div>
          </div>

          {/* Name & Info */}
          <h1
            className="text-4xl font-black text-white leading-none mb-2"
            style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em' }}
          >
            {provider.business_name || provider.name}
          </h1>

          <div className="flex items-center gap-4 text-sm text-white/50 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span>✂️</span>
              <span>{provider.name}</span>
            </div>
            {provider.location && (
              <div className="flex items-center gap-1.5">
                <span>📍</span>
                <span>{provider.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#E8E2D9] sticky top-0 z-50 shadow-sm">
        <div className="max-w-[680px] mx-auto px-8 flex gap-0">
          {['services', 'about'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-4 text-sm font-semibold border-b-2 transition ${
                activeTab === tab
                  ? 'border-[#111111] text-[#111111]'
                  : 'border-transparent text-[#888888] hover:text-[#111111]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[680px] mx-auto px-8 py-7 pb-24">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 gap-3 mb-7">
          <div className="bg-white border border-[#E8E2D9] rounded-xl p-4 text-center">
            <div className="text-xl mb-1.5">✂️</div>
            <div className="text-xl font-bold text-[#111111] mb-0.5" style={{ fontFamily: 'Playfair Display, serif' }}>
              {provider.services.length}
            </div>
            <div className="text-xs text-[#888888]">Services</div>
          </div>
          <div className="bg-white border border-[#E8E2D9] rounded-xl p-4 text-center">
            <div className="text-xl mb-1.5">👥</div>
            <div className="text-xl font-bold text-[#111111] mb-0.5" style={{ fontFamily: 'Playfair Display, serif' }}>
              New
            </div>
            <div className="text-xs text-[#888888]">Provider</div>
          </div>
        </div>

        {/* Services Section */}
        {activeTab === 'services' && (
          <div className="mb-8" id="services-section">
            <h2
              className="text-xl font-bold text-[#111111] mb-3.5"
              style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '-0.01em' }}
            >
              Services & Pricing
            </h2>

            <div className="space-y-2">
              {provider.services.map((service) => (
                <div
                  key={service.id}
                  className={`bg-white border rounded-xl p-5 flex items-center justify-between transition-all ${
                    selectedService?.id === service.id
                      ? 'border-[#B8860B] shadow-lg'
                      : 'border-[#E8E2D9] hover:border-[#111111] hover:shadow-lg cursor-pointer'
                  }`}
                  onClick={() => selectedService?.id !== service.id && handleSelectService(service)}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Icon */}
                    <div
                      className="w-11 h-11 rounded-xl bg-[#F8F5F0] flex items-center justify-center text-lg flex-shrink-0"
                    >
                      {service.icon || '✂️'}
                    </div>

                    {/* Service Info */}
                    <div>
                      <div className="text-[15px] font-semibold text-[#111111] mb-0.5">
                        {service.name}
                      </div>
                      <div className="text-xs text-[#888888]">
                        {service.duration} min
                        {service.description && ` · ${service.description}`}
                      </div>
                    </div>
                  </div>

                  {/* Price & Select Button */}
                  <div className="flex items-center gap-3">
                    <div
                      className="text-lg font-bold text-[#111111]"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      ${service.price}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectService(service)
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                        selectedService?.id === service.id
                          ? 'bg-[#B8860B] text-white'
                          : 'bg-[#111111] text-white hover:bg-[#B8860B]'
                      }`}
                    >
                      {selectedService?.id === service.id ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Section */}
        {activeTab === 'about' && (
          <div>
            <h2
              className="text-xl font-bold text-[#111111] mb-3.5"
              style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '-0.01em' }}
            >
              About {provider.name}
            </h2>
            <div className="text-sm text-[#444444] leading-relaxed font-light">
              {provider.bio || `Professional service provider offering quality services. Book your appointment today!`}
            </div>
          </div>
        )}

        {/* Booking Section - Shows when service is selected */}
        {bookingStep !== 'select-service' && (
          <div id="booking-section" className="mt-8 scroll-mt-8">
            {/* Selected Service Summary */}
            <div className="bg-[#B8860B]/10 border border-[#B8860B]/30 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{selectedService?.icon || '✂️'}</div>
                  <div>
                    <div className="font-semibold text-[#111111]">{selectedService?.name}</div>
                    <div className="text-sm text-[#888888]">
                      {selectedService?.duration} min · ${selectedService?.price}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleBookAnother}
                  className="text-sm text-[#B8860B] hover:text-[#8A6830] font-semibold"
                >
                  Change
                </button>
              </div>
            </div>

            {bookingStep === 'select-datetime' && (
              <>
                <h2
                  className="text-xl font-bold text-[#111111] mb-4"
                  style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '-0.01em' }}
                >
                  Select Date & Time
                </h2>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Calendar */}
                  <div className="bg-white border border-[#E8E2D9] rounded-xl p-6">
                    <h3 className="text-base font-semibold text-[#111111] mb-4">Choose a Date</h3>
                    <CalendarPicker
                      selectedDate={selectedDate}
                      onDateSelect={handleDateSelect}
                      minDate={new Date()}
                    />
                  </div>

                  {/* Time Slots */}
                  <div className="bg-white border border-[#E8E2D9] rounded-xl p-6">
                    <h3 className="text-base font-semibold text-[#111111] mb-4">
                      {selectedDate ? 'Available Times' : 'Select a date first'}
                    </h3>
                    {selectedDate && (
                      <TimeSlotGrid
                        slots={timeSlots}
                        selectedTime={selectedTime}
                        onTimeSelect={handleTimeSelect}
                        loading={loadingSlots}
                      />
                    )}
                    {!selectedDate && (
                      <div className="text-center py-12 text-[#888888]">
                        <div className="text-4xl mb-3">📅</div>
                        <p className="text-sm">Pick a date to see available time slots</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {bookingStep === 'enter-details' && selectedDate && selectedTime && (
              <>
                <h2
                  className="text-xl font-bold text-[#111111] mb-4"
                  style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '-0.01em' }}
                >
                  Your Information
                </h2>

                <div className="bg-[#F8F5F0]/50 border border-[#E8E2D9] rounded-xl p-4 mb-6">
                  <div className="text-sm text-[#888888] mb-1">Selected Time</div>
                  <div className="font-semibold text-[#111111]">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
                  </div>
                </div>

                <CustomerForm
                  onSubmit={handleCustomerSubmit}
                  loading={booking}
                />

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}
              </>
            )}

            {bookingStep === 'success' && confirmation && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h2
                  className="text-2xl font-bold text-[#111111] mb-2"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Booking Confirmed!
                </h2>
                <p className="text-[#888888] mb-6">
                  Your appointment has been successfully booked.
                </p>

                <div className="bg-white border border-[#E8E2D9] rounded-xl p-6 max-w-md mx-auto mb-6 text-left">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-[#888888] mb-1">Service</div>
                      <div className="font-semibold text-[#111111]">{confirmation.appointment.service.name}</div>
                    </div>
                    <div className="border-t border-[#E8E2D9] pt-3">
                      <div className="text-xs text-[#888888] mb-1">Date & Time</div>
                      <div className="font-semibold text-[#111111]">
                        {new Date(confirmation.appointment.appointment_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })} at {confirmation.appointment.appointment_time}
                      </div>
                    </div>
                    <div className="border-t border-[#E8E2D9] pt-3">
                      <div className="text-xs text-[#888888] mb-1">Duration</div>
                      <div className="font-semibold text-[#111111]">{confirmation.appointment.duration} minutes</div>
                    </div>
                    <div className="border-t border-[#E8E2D9] pt-3">
                      <div className="text-xs text-[#888888] mb-1">Price</div>
                      <div className="font-semibold text-[#111111]">${confirmation.appointment.price}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBookAnother}
                  className="bg-[#111111] text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#B8860B] transition"
                >
                  Book Another Appointment
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky CTA - Only show when no service is selected */}
      {bookingStep === 'select-service' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E2D9] px-8 py-4 flex items-center justify-between z-50 shadow-2xl">
          <div className="text-sm text-[#888888]">
            Next available: <strong className="text-[#111111] font-semibold">Today</strong>
          </div>
          <button
            onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#111111] text-white px-8 py-3.5 rounded-full text-[15px] font-semibold flex items-center gap-2 hover:bg-[#B8860B] hover:scale-105 transition-all"
          >
            Choose a Service →
          </button>
        </div>
      )}
    </main>
  )
}
