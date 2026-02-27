'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProviderProfile } from '@/lib/api'
import type { ProviderWithServices } from '@/lib/types'

export default function ProviderProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [provider, setProvider] = useState<ProviderWithServices | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('services')

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

  const handleBookService = (serviceId: string) => {
    router.push(`/${slug}/book?service=${serviceId}`)
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
          <div className="mb-8">
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
                  onClick={() => handleBookService(service.id)}
                  className="bg-white border border-[#E8E2D9] rounded-xl p-5 flex items-center justify-between cursor-pointer transition-all hover:border-[#111111] hover:shadow-lg hover:-translate-y-0.5"
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

                  {/* Price & Book Button */}
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
                        handleBookService(service.id)
                      }}
                      className="bg-[#111111] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#B8860B] transition whitespace-nowrap"
                    >
                      Book
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
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E2D9] px-8 py-4 flex items-center justify-between z-50 shadow-2xl">
        <div className="text-sm text-[#888888]">
          Next available: <strong className="text-[#111111] font-semibold">Today</strong>
        </div>
        <button
          onClick={() => router.push(`/${slug}/book`)}
          className="bg-[#111111] text-white px-8 py-3.5 rounded-full text-[15px] font-semibold flex items-center gap-2 hover:bg-[#B8860B] hover:scale-105 transition-all"
        >
          Book an Appointment →
        </button>
      </div>
    </main>
  )
}
