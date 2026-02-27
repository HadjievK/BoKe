'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { getProviderProfile, getAvailability, bookAppointment } from '@/lib/api'
import type { ProviderWithServices, Service, Customer, BookingRequest } from '@/lib/types'
import { formatDate, formatTime, formatCurrency, formatDateISO } from '@/lib/utils'
import ServiceCard from '@/components/booking/ServiceCard'
import CalendarPicker from '@/components/booking/CalendarPicker'
import TimeSlotGrid from '@/components/booking/TimeSlotGrid'
import CustomerForm from '@/components/booking/CustomerForm'
import ThemeToggle from '@/components/ThemeToggle'

type BookingStep = 'service' | 'datetime' | 'details' | 'confirm' | 'success'

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const preSelectedServiceId = searchParams.get('service')

  const [provider, setProvider] = useState<ProviderWithServices | null>(null)
  const [step, setStep] = useState<BookingStep>('service')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Booking state
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

        // Pre-select service if provided
        if (preSelectedServiceId) {
          const service = data.services.find(s => s.id === preSelectedServiceId)
          if (service) {
            setSelectedService(service)
            setStep('datetime')
          }
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProvider()
  }, [slug, preSelectedServiceId])

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

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setStep('datetime')
    setSelectedDate(null)
    setSelectedTime(null)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setStep('details')
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
      setStep('success')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-ink-light">Loading...</p>
        </div>
      </main>
    )
  }

  if (error && !provider) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="card text-center max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => router.push(`/${slug}`)} className="btn-primary">
            Go Back
          </button>
        </div>
      </main>
    )
  }

  if (!provider) return null

  // Success screen
  if (step === 'success' && confirmation) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-success via-success-light to-success flex items-center justify-center p-4">
        <div className="card max-w-2xl w-full text-center">
          <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-ink mb-4">
            Booking Confirmed!
          </h1>

          <p className="text-lg text-ink-light mb-8">
            Your appointment has been successfully booked
          </p>

          <div className="bg-cream rounded-xl p-6 mb-6 text-left">
            <div className="grid gap-4">
              <div>
                <div className="text-sm text-ink-light mb-1">Service</div>
                <div className="font-semibold">{confirmation.appointment.service.name}</div>
              </div>
              <div>
                <div className="text-sm text-ink-light mb-1">Date & Time</div>
                <div className="font-semibold">
                  {formatDate(confirmation.appointment.appointment_date)} at{' '}
                  {formatTime(confirmation.appointment.appointment_time)}
                </div>
              </div>
              <div>
                <div className="text-sm text-ink-light mb-1">Duration</div>
                <div className="font-semibold">{confirmation.appointment.duration} minutes</div>
              </div>
              <div>
                <div className="text-sm text-ink-light mb-1">Price</div>
                <div className="font-semibold text-gold text-xl">
                  {formatCurrency(confirmation.appointment.price)}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push(`/${slug}/book`)}
              className="btn-primary w-full"
            >
              Book Another Appointment
            </button>
            <button
              onClick={() => router.push(`/${slug}`)}
              className="btn-secondary w-full"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push(`/${slug}`)}
            className="text-gold hover:text-gold-dark inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to {provider.business_name}
          </button>
          <ThemeToggle />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-display mb-2">Book an Appointment</h1>
          <p className="text-muted-foreground">Select a service and time that works for you</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center gap-2 mb-8">
          {['service', 'datetime', 'details'].map((s, i) => (
            <div
              key={s}
              className={`h-2 w-20 rounded-full ${
                ['service', 'datetime', 'details'].indexOf(step) >= i
                  ? 'bg-gold'
                  : 'bg-cream-dark'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Select Service */}
        {step === 'service' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Choose a Service</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {provider.services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  selected={selectedService?.id === service.id}
                  onClick={() => handleServiceSelect(service)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 'datetime' && selectedService && (
          <div>
            <div className="card mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedService.name}</h3>
                  <p className="text-sm text-ink-light">
                    {selectedService.duration} min • {formatCurrency(selectedService.price)}
                  </p>
                </div>
                <button
                  onClick={() => setStep('service')}
                  className="text-gold text-sm hover:text-gold-dark"
                >
                  Change
                </button>
              </div>
            </div>

            <div className="card mb-6">
              <h2 className="text-2xl font-bold mb-6">Select Date</h2>
              <CalendarPicker
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            </div>

            {selectedDate && (
              <div className="card">
                <h2 className="text-2xl font-bold mb-6">
                  Available Times for {formatDate(selectedDate)}
                </h2>
                {loadingSlots ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div>
                  </div>
                ) : (
                  <TimeSlotGrid
                    slots={timeSlots}
                    selectedTime={selectedTime}
                    onTimeSelect={handleTimeSelect}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Customer Details */}
        {step === 'details' && selectedService && selectedDate && selectedTime && (
          <div>
            <div className="card mb-6">
              <h3 className="font-semibold mb-2">Booking Summary</h3>
              <div className="text-sm text-ink-light space-y-1">
                <p>{selectedService.name}</p>
                <p>{formatDate(selectedDate)} at {formatTime(selectedTime)}</p>
                <p className="text-gold font-semibold">{formatCurrency(selectedService.price)}</p>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Your Details</h2>
              <CustomerForm onSubmit={handleCustomerSubmit} loading={booking} />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
