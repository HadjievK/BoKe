'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getBarberProfile } from '@/lib/api'
import type { BarberWithServices } from '@/lib/types'
import ServiceCard from '@/components/booking/ServiceCard'

export default function BarberProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [barber, setBarber] = useState<BarberWithServices | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchBarber() {
      try {
        const data = await getBarberProfile(slug)
        setBarber(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBarber()
  }, [slug])

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

  if (error || !barber) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="card text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">Barber Not Found</h1>
          <p className="text-ink-light mb-6">{error || 'This booking page does not exist'}</p>
          <a href="/" className="btn-primary inline-block">
            Go Home
          </a>
        </div>
      </main>
    )
  }

  const handleBookService = (serviceId: string) => {
    router.push(`/${slug}/book?service=${serviceId}`)
  }

  return (
    <main className="min-h-screen bg-cream">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gold via-gold-dark to-gold-light text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          {barber.avatar_url ? (
            <img
              src={barber.avatar_url}
              alt={barber.name}
              className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white shadow-xl"
            />
          ) : (
            <div className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white shadow-xl bg-white/20 flex items-center justify-center text-5xl">
              {barber.name.charAt(0)}
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {barber.business_name}
          </h1>
          <p className="text-xl mb-2 opacity-90">{barber.name}</p>

          {barber.location && (
            <div className="flex items-center justify-center gap-2 text-sm opacity-80">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{barber.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {barber.bio && (
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="card">
            <p className="text-ink-light leading-relaxed">{barber.bio}</p>
          </div>
        </div>
      )}

      {/* Services */}
      <div className="container mx-auto max-w-4xl px-4 pb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Our Services</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {barber.services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={() => handleBookService(service.id)}
            />
          ))}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-cream-dark p-4 shadow-xl md:hidden">
        <button
          onClick={() => router.push(`/${slug}/book`)}
          className="btn-primary w-full"
        >
          Book Appointment
        </button>
      </div>
    </main>
  )
}
