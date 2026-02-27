'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerProvider } from '@/lib/api'
import type { OnboardingData } from '@/lib/types'

const SERVICE_PILLS = [
  { emoji: '✂️', label: 'Barbers' },
  { emoji: '🦷', label: 'Dentists' },
  { emoji: '💅', label: 'Nail Artists' },
  { emoji: '💪', label: 'Personal Trainers' },
  { emoji: '💆', label: 'Massage' },
]

const SERVICE_TYPES = [
  { value: 'barber', label: 'Barber', icon: '✂️' },
  { value: 'dentist', label: 'Dentist', icon: '🦷' },
  { value: 'nail_artist', label: 'Nail Artist', icon: '💅' },
  { value: 'massage', label: 'Massage', icon: '💆' },
  { value: 'trainer', label: 'Trainer', icon: '💪' },
  { value: 'other', label: 'Other', icon: '✨' },
]

interface Service {
  name: string
  duration: number
  price: number
  icon: string
  description?: string
}

export default function Home() {
  const router = useRouter()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [serviceType, setServiceType] = useState('barber')
  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [services, setServices] = useState<Service[]>([
    { name: 'Classic Cut', duration: 30, price: 35, icon: '✂️' },
    { name: 'Fade', duration: 45, price: 45, icon: '✂️' },
    { name: 'Beard Trim', duration: 20, price: 25, icon: '💈' }
  ])

  const updateService = (index: number, field: keyof Service, value: string | number) => {
    const updated = [...services]
    updated[index] = { ...updated[index], [field]: value }
    setServices(updated)
  }

  const removeService = (index: number) => {
    if (services.length <= 1) {
      setError('You must have at least one service')
      return
    }
    setServices(services.filter((_, i) => i !== index))
    setError('') // Clear error when successfully removing
  }

  const addService = () => {
    setServices([...services, { name: '', duration: 30, price: 0, icon: '✂️' }])
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    // Validate at least one service
    if (services.length === 0) {
      setError('You must add at least one service')
      setLoading(false)
      return
    }

    // Validate all services have required fields
    const invalidService = services.find(s => !s.name || !s.duration || !s.price)
    if (invalidService) {
      setError('All services must have a name, duration, and price')
      setLoading(false)
      return
    }

    try {
      const data: OnboardingData = {
        name,
        business_name: businessName,
        service_type: serviceType,
        email,
        phone,
        password,
        location,
        bio,
        services
      }

      const response = await registerProvider(data)
      router.push(`/success?slug=${response.slug}&dashboard=${response.dashboard_url}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  if (!showOnboarding) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-7xl">
            <a href="/" className="font-display text-2xl font-semibold tracking-tight">
              Bu<span className="text-gold">Ke</span>
            </a>
            <div className="flex items-center gap-4">
              <a href="/signin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sign in
              </a>
              <button
                onClick={() => setShowOnboarding(true)}
                className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Get started free →
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left column */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold-dark mb-8">
                  ✦ Trusted by 3,200+ professionals
                </div>

                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight mb-6">
                  Your booking{" "}
                  <br className="hidden sm:block" />
                  page in{" "}
                  <em className="text-gold not-italic font-display">5 minutes.</em>
                </h1>

                <p className="text-lg text-muted-foreground max-w-md mb-8 leading-relaxed">
                  BuKe gives barbers, dentists, nail artists, and personal trainers a beautiful booking page — no code, no hassle. Your clients book. You earn.
                </p>

                <div className="flex flex-wrap gap-2 mb-10">
                  {SERVICE_PILLS.map((pill) => (
                    <span
                      key={pill.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
                    >
                      {pill.emoji} {pill.label}
                    </span>
                  ))}
                  <span className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
                    + more
                  </span>
                </div>

                <button
                  onClick={() => setShowOnboarding(true)}
                  className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-8 py-4 text-base font-semibold hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Create your page →
                </button>
              </div>

              {/* Right column — Dashboard Mockup */}
              <div className="relative hidden lg:block">
                <div className="animate-float">
                  <DashboardMockup />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-y border-border bg-card/50">
          <div className="container mx-auto px-6 py-12 max-w-7xl">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
              {[
                { value: "3.2k+", label: "Active professionals" },
                { value: "89k", label: "Bookings processed" },
                { value: "4.9★", label: "Average rating" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display text-4xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
                ── How it works
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold mt-4">
                Up and running in <em className="text-gold not-italic">three steps</em>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  number: "01",
                  emoji: "📝",
                  title: "Create your profile",
                  description: "Tell us your name, business type, services, and location. Takes under 5 minutes — no technical knowledge needed.",
                },
                {
                  number: "02",
                  emoji: "🔗",
                  title: "Share your link",
                  description: "You get a personal booking page instantly. Share it on Instagram, WhatsApp, or anywhere your clients are.",
                },
                {
                  number: "03",
                  emoji: "📅",
                  title: "Clients book & you manage",
                  description: "Clients pick their slot. You see everything in your dashboard. Reminders sent automatically. You focus on your craft.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="relative rounded-2xl border border-border bg-card p-8 hover:shadow-lg transition-shadow"
                >
                  <span className="text-xs font-bold text-gold-dark tracking-widest">
                    {step.number}
                  </span>
                  <div className="text-4xl my-4">{step.emoji}</div>
                  <h3 className="font-display text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="relative overflow-hidden rounded-3xl bg-foreground text-background p-12 sm:p-16 text-center">
              <div className="relative z-10">
                <h2 className="font-display text-3xl sm:text-5xl font-semibold mb-4">
                  Ready to get <em className="text-gold not-italic">booked?</em>
                </h2>
                <p className="text-background/70 text-lg mb-8 max-w-md mx-auto">
                  Join thousands of professionals already growing their business with BuKe.
                </p>
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="inline-flex items-center justify-center rounded-full bg-gold text-foreground px-8 py-4 text-base font-semibold hover:bg-gold-light transition-colors hover:scale-[1.02] active:scale-[0.98]"
                >
                  Create your free page →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-card/30 py-12">
          <div className="container mx-auto px-6 max-w-7xl text-center">
            <p className="font-display text-2xl font-semibold mb-4">
              Bu<span className="text-gold">Ke</span>
            </p>
            <p className="text-sm text-muted-foreground">
              © 2026 BuKe. Simple booking for service professionals.
            </p>
          </div>
        </footer>
      </div>
    )
  }

  // Onboarding Form
  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="mb-8">
          <button
            onClick={() => setShowOnboarding(false)}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mb-4"
          >
            ← Back to home
          </button>
          <h1 className="font-display text-4xl font-bold">Create Your Page</h1>
          <p className="text-muted-foreground mt-2">Get your booking page live in 5 minutes</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          {/* Service Type */}
          <div>
            <label className="block text-sm font-semibold mb-3">Service Type</label>
            <div className="grid grid-cols-3 gap-3">
              {SERVICE_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setServiceType(type.value)}
                  className={`p-4 rounded-xl border-2 transition ${
                    serviceType === type.value
                      ? 'border-foreground bg-foreground/5'
                      : 'border-border hover:border-muted'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-foreground focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="John's Cuts"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-foreground focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-foreground focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 0192"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-foreground focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-foreground focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Brooklyn, NY"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-foreground focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Bio (Optional)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell clients about yourself..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-foreground focus:outline-none transition resize-none"
            />
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Services <span className="text-red-500">*</span>
              <span className="text-xs text-muted-foreground font-normal ml-2">(At least one required)</span>
            </label>
            <div className="space-y-3">
              {services.map((service, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => updateService(index, 'name', e.target.value)}
                    placeholder="Service name"
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:border-foreground focus:outline-none transition"
                  />
                  <input
                    type="number"
                    value={service.duration}
                    onChange={(e) => updateService(index, 'duration', parseInt(e.target.value))}
                    placeholder="Duration"
                    className="w-24 px-4 py-3 rounded-xl border border-border bg-background focus:border-foreground focus:outline-none transition"
                  />
                  <input
                    type="number"
                    value={service.price}
                    onChange={(e) => updateService(index, 'price', parseFloat(e.target.value))}
                    placeholder="Price"
                    className="w-24 px-4 py-3 rounded-xl border border-border bg-background focus:border-foreground focus:outline-none transition"
                  />
                  <button
                    onClick={() => removeService(index)}
                    disabled={services.length === 1}
                    className={`px-4 py-3 rounded-xl border border-border transition ${
                      services.length === 1
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-foreground/5'
                    }`}
                    title={services.length === 1 ? 'Cannot remove the last service' : 'Remove service'}
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <button
                onClick={addService}
                className="w-full py-3 rounded-xl border-2 border-dashed border-border hover:border-foreground transition text-sm font-medium"
              >
                + Add Service
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-foreground text-background py-4 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating your page...' : 'Create My Page →'}
          </button>
        </div>
      </div>
    </div>
  )
}

const DashboardMockup = () => (
  <div className="rounded-3xl shadow-2xl border p-6 max-w-md ml-auto border-gold-dark bg-gold-light">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center font-display font-bold text-gold-dark">
          K
        </div>
        <div>
          <p className="font-semibold text-sm">King&apos;s Cuts</p>
          <p className="text-xs text-muted-foreground">buke.app/kingcuts</p>
        </div>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold-dark">
        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
        Live
      </span>
    </div>

    <div className="grid grid-cols-3 gap-3 mb-6">
      {[
        { value: "7", label: "Today" },
        { value: "$486", label: "Revenue" },
        { value: "4.9★", label: "Rating" }
      ].map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border bg-background p-3 text-center">
          <p className="font-display text-xl font-bold">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>

    <div className="space-y-2">
      {[
        { time: "9:00", name: "Marcus W. — Fade", price: "$45" },
        { time: "10:30", name: "Jordan L. — Cut", price: "$35" },
        { time: "12:00", name: "Andre T. — Trim", price: "$25" }
      ].map((apt) => (
        <div key={apt.time} className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-foreground">{apt.time}</span>
            <span className="text-sm text-muted-foreground">{apt.name}</span>
          </div>
          <span className="text-sm font-semibold text-gold-dark">{apt.price}</span>
        </div>
      ))}
    </div>
  </div>
)
