'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerBarber } from '@/lib/api'
import type { OnboardingData } from '@/lib/types'

const SERVICE_TYPES = [
  { value: 'barber', label: 'Barber', icon: '✂️' },
  { value: 'dentist', label: 'Dentist', icon: '🦷' },
  { value: 'nail_artist', label: 'Nail Artist', icon: '💅' },
  { value: 'massage', label: 'Massage Therapist', icon: '💆' },
  { value: 'salon', label: 'Hair Salon', icon: '💇' },
  { value: 'other', label: 'Other', icon: '📅' },
]

interface Service {
  name: string
  duration: number
  price: number
  icon: string
}

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [serviceType, setServiceType] = useState('')
  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [services, setServices] = useState<Service[]>([
    { name: '', duration: 30, price: 0, icon: '' }
  ])

  const addService = () => {
    setServices([...services, { name: '', duration: 30, price: 0, icon: '' }])
  }

  const updateService = (index: number, field: keyof Service, value: string | number) => {
    const updated = [...services]
    updated[index] = { ...updated[index], [field]: value }
    setServices(updated)
  }

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate
      if (!serviceType || !name || !businessName || !email || !phone) {
        throw new Error('Please fill in all required fields')
      }

      const validServices = services.filter(s => s.name && s.duration > 0 && s.price > 0)
      if (validServices.length === 0) {
        throw new Error('Please add at least one service')
      }

      const data: OnboardingData = {
        name,
        business_name: businessName,
        service_type: serviceType,
        email,
        phone,
        location: location || undefined,
        bio: bio || undefined,
        services: validServices
      }

      const result = await registerBarber(data)

      // Redirect to success page
      router.push(`/success?slug=${result.slug}&pin=${result.pin}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-cream via-white to-cream-dark">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-ink mb-4">
            Welcome to <span className="text-gold">BuKe</span>
          </h1>
          <p className="text-xl text-ink-light">
            Create your personalized booking page in minutes
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="card max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Get Started</h2>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* Service Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Service Type *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SERVICE_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setServiceType(type.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    serviceType === type.value
                      ? 'border-gold bg-gold text-white'
                      : 'border-cream-dark hover:border-gold'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Business Name *</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="input-field"
                placeholder="King's Cuts"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-field"
              placeholder="123 Main St, Brooklyn, NY"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Tell your customers about yourself..."
            />
          </div>

          {/* Services */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Services *</label>
            {services.map((service, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={service.name}
                  onChange={(e) => updateService(index, 'name', e.target.value)}
                  className="input-field flex-1"
                  placeholder="Service name"
                />
                <input
                  type="number"
                  value={service.duration || ''}
                  onChange={(e) => updateService(index, 'duration', parseInt(e.target.value) || 0)}
                  className="input-field w-24"
                  placeholder="Min"
                  min="5"
                />
                <input
                  type="number"
                  value={service.price || ''}
                  onChange={(e) => updateService(index, 'price', parseFloat(e.target.value) || 0)}
                  className="input-field w-24"
                  placeholder="$"
                  min="0"
                  step="0.01"
                />
                {services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addService}
              className="text-gold hover:text-gold-dark font-medium text-sm"
            >
              + Add Service
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-lg"
          >
            {loading ? 'Creating...' : 'Create My Booking Page'}
          </button>
        </form>
      </div>
    </main>
  )
}
