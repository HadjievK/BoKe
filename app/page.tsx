'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerProvider } from '@/lib/api'
import type { OnboardingData } from '@/lib/types'

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
    setServices(services.filter((_, i) => i !== index))
  }

  const addService = (name: string) => {
    if (name.trim()) {
      setServices([...services, { name: name.trim(), duration: 30, price: 0, icon: '' }])
    }
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

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
        services: services.map(s => ({
          name: s.name,
          duration: s.duration,
          price: s.price,
          icon: s.icon,
          description: s.description
        }))
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
      <div className="landing">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(201,153,58,0.12)] via-transparent to-transparent"
               style={{
                 backgroundImage: 'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(201,153,58,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 90% 80%, rgba(201,153,58,0.08) 0%, transparent 55%)'
               }} />
          <div className="absolute inset-0 opacity-60"
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E")`
               }} />
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-[60px] py-7">
          <div className="text-[22px] font-black tracking-tight" style={{ fontFamily: 'Fraunces, serif' }}>
            Bu<span className="text-[#C9993A]">Ke</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#how" className="text-sm text-[#6B6455] hover:text-[#1C1812] font-medium transition-colors">How it works</a>
            <a href="#pricing" className="text-sm text-[#6B6455] hover:text-[#1C1812] font-medium transition-colors">Pricing</a>
            <button
              onClick={() => setShowOnboarding(true)}
              className="bg-[#1C1812] text-[#F5F0E8] px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#C9993A] hover:text-[#1C1812] transition-all"
            >
              Get started free →
            </button>
          </div>
        </nav>

        {/* Hero */}
        <div className="relative z-5 max-w-[1200px] mx-auto px-[60px] pt-20 grid grid-cols-[1fr_480px] gap-[60px] items-center min-h-[calc(100vh-180px)]">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#F5EDD8] border border-[rgba(201,153,58,0.25)] rounded-full px-4 py-1.5 text-xs font-semibold text-[#C9993A] tracking-wider uppercase mb-6 animate-in">
              ✦ Trusted by 3,200+ professionals
            </div>

            <h1 className="text-[clamp(48px,5vw,72px)] font-black leading-[1.0] tracking-tight mb-6 animate-in delay-1" style={{ fontFamily: 'Fraunces, serif' }}>
              Your booking<br />page in<br />
              <em className="font-light italic text-[#C9993A]">5 minutes.</em>
            </h1>

            <p className="text-[17px] text-[#6B6455] leading-relaxed font-light max-w-[460px] mb-10 animate-in delay-2">
              BuKe gives barbers, dentists, nail artists, and personal trainers a beautiful booking page — no code, no hassle. Your clients book. You earn.
            </p>

            <div className="flex flex-wrap gap-2.5 mb-8 animate-in delay-2">
              {['✂️ Barbers', '🦷 Dentists', '💅 Nail Artists', '💪 Personal Trainers', '💆 Massage', '+ more'].map((pill, i) => (
                <div key={i} className="flex items-center gap-2 bg-white border-[1.5px] border-[rgba(28,24,18,0.1)] rounded-full px-4 py-2 text-[13px] font-medium text-[#6B6455] cursor-pointer hover:border-[#C9993A] hover:bg-[#F5EDD8] hover:text-[#1C1812] transition-all">
                  {pill}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 animate-in delay-3">
              <button
                onClick={() => setShowOnboarding(true)}
                className="bg-[#1C1812] text-[#F5F0E8] px-9 py-4 rounded-full text-[15px] font-semibold flex items-center gap-2 hover:bg-[#C9993A] hover:text-[#1C1812] hover:scale-105 transition-all"
              >
                Create your page →
              </button>
            </div>

            <div className="flex items-center gap-5 mt-12 pt-8 border-t border-[rgba(28,24,18,0.08)] animate-in delay-3">
              <div>
                <div className="text-[28px] font-bold" style={{ fontFamily: 'Fraunces, serif' }}>3.2k+</div>
                <div className="text-xs text-[#6B6455]">Active professionals</div>
              </div>
              <div className="w-px h-9 bg-[rgba(28,24,18,0.1)]" />
              <div>
                <div className="text-[28px] font-bold" style={{ fontFamily: 'Fraunces, serif' }}>89k</div>
                <div className="text-xs text-[#6B6455]">Bookings processed</div>
              </div>
              <div className="w-px h-9 bg-[rgba(28,24,18,0.1)]" />
              <div>
                <div className="text-[28px] font-bold" style={{ fontFamily: 'Fraunces, serif' }}>4.9★</div>
                <div className="text-xs text-[#6B6455]">Average rating</div>
              </div>
            </div>
          </div>

          {/* Right - Mockup */}
          <div className="relative">
            <div className="absolute -top-5 -right-8 bg-white rounded-full shadow-lg px-4 py-2.5 text-[13px] font-medium flex items-center gap-2 border border-[rgba(28,24,18,0.06)] animate-[float2_5s_ease-in-out_infinite] delay-[1s]">
              🔔 New booking from <strong className="ml-1">Marcus</strong>
            </div>

            <div className="bg-white rounded-[20px] shadow-[0_32px_80px_rgba(28,24,18,0.12),0_8px_24px_rgba(28,24,18,0.06)] overflow-hidden border border-[rgba(28,24,18,0.06)] animate-[float_6s_ease-in-out_infinite]">
              <div className="bg-[#1C1812] px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#C9993A] to-[#8A6830] flex items-center justify-center text-white font-bold text-base" style={{ fontFamily: 'Fraunces, serif' }}>
                    K
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-white" style={{ fontFamily: 'Fraunces, serif' }}>King's Cuts</div>
                    <div className="text-[11px] text-white/40">boke.app/kingcuts</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-[rgba(110,202,136,0.15)] border border-[rgba(110,202,136,0.3)] rounded-full px-2.5 py-1 text-[11px] text-[#6ECA88] font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6ECA88] animate-[pulse_2s_ease_infinite]" />
                  Live
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  {[{ val: '7', lab: 'Today' }, { val: '$486', lab: 'Revenue' }, { val: '4.9★', lab: 'Rating' }].map((stat, i) => (
                    <div key={i} className="bg-[#F5F0E8] rounded-[10px] p-3 text-center">
                      <div className="text-[20px] font-bold" style={{ fontFamily: 'Fraunces, serif' }}>{stat.val}</div>
                      <div className="text-[10px] text-[#6B6455] mt-0.5">{stat.lab}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {[
                    { time: '9:00', name: 'Marcus W. — Fade', price: '$45', color: '#C9993A' },
                    { time: '10:30', name: 'Jordan L. — Classic Cut', price: '$35', color: '#6ECA88' },
                    { time: '12:00', name: 'Andre T. — Beard Trim', price: '$25', color: '#6BA3E8', opacity: 0.7 }
                  ].map((appt, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2.5 bg-[#F5F0E8] rounded-[10px] border-l-[3px]" style={{ borderLeftColor: appt.color, opacity: appt.opacity || 1 }}>
                      <div className="text-[13px] font-bold min-w-[52px]" style={{ fontFamily: 'Fraunces, serif' }}>{appt.time}</div>
                      <div className="text-[13px] font-medium flex-1">{appt.name}</div>
                      <div className="text-[13px] font-bold text-[#C9993A]" style={{ fontFamily: 'Fraunces, serif' }}>{appt.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 -left-10 bg-white rounded-full shadow-lg px-4 py-2.5 text-[13px] font-medium flex items-center gap-2 border border-[rgba(28,24,18,0.06)] animate-[float2_7s_ease-in-out_infinite] delay-[2.5s]">
              💳 Payment received <strong className="ml-1 text-[#4A7C59]">$45</strong>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div id="how" className="relative z-5 max-w-[1200px] mx-auto px-[60px] mt-[120px] mb-[120px]">
          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#6B6455] mb-4 flex items-center gap-2">
            ── How it works
          </div>
          <h2 className="text-[42px] font-black tracking-tight mb-[60px] max-w-[480px] leading-tight" style={{ fontFamily: 'Fraunces, serif' }}>
            Up and running in <em className="font-light italic text-[#C9993A]">three steps</em>
          </h2>

          <div className="grid grid-cols-3 gap-0.5 bg-[rgba(28,24,18,0.06)] rounded-[14px] overflow-hidden">
            {[
              { num: '01', icon: '📝', title: 'Create your profile', desc: 'Tell us your name, business type, services, and location. Takes under 5 minutes — no technical knowledge needed.' },
              { num: '02', icon: '🔗', title: 'Share your link', desc: 'You get a personal booking page instantly. Share it on Instagram, WhatsApp, or anywhere your clients are.' },
              { num: '03', icon: '📅', title: 'Clients book & you manage', desc: 'Clients pick their slot. You see everything in your dashboard. Reminders sent automatically. You focus on your craft.' }
            ].map((step, i) => (
              <div key={i} className="bg-[#FDFAF5] p-10 hover:bg-[#F5EDD8] transition-colors">
                <div className="text-[72px] font-black leading-none tracking-tighter text-[rgba(28,24,18,0.06)] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                  {step.num}
                </div>
                <div className="w-12 h-12 bg-[#1C1812] rounded-xl flex items-center justify-center text-[20px] mb-5">
                  {step.icon}
                </div>
                <div className="text-[22px] font-bold tracking-tight mb-2.5" style={{ fontFamily: 'Fraunces, serif' }}>
                  {step.title}
                </div>
                <div className="text-sm text-[#6B6455] leading-relaxed font-light">
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Onboarding form (existing logic continues...)
  return (
    <div className="onboarding grid grid-cols-[1fr_520px] min-h-screen">
      {/* Left panel */}
      <div className="bg-[#1C1812] px-[60px] py-[60px] flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-[200px] -left-[200px] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(201,153,58,0.15)_0%,transparent_70%)]" />

        <div className="relative z-10 text-[24px] font-black text-white" style={{ fontFamily: 'Fraunces, serif' }}>
          Bu<span className="text-[#C9993A]">Ke</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-[48px] font-black text-white leading-tight tracking-tight mb-5" style={{ fontFamily: 'Fraunces, serif' }}>
            You're one<br />step away<br />from <em className="font-light italic text-[#E8C96A]">full</em><br />bookings.
          </h2>
          <p className="text-base text-white/50 leading-relaxed font-light max-w-[360px] mb-10">
            Fill in the details and your personal booking page goes live immediately.
          </p>

          <div className="space-y-3.5">
            {[
              'Your own booking page — shareable link',
              'Calendar & appointment dashboard',
              'SMS & email reminders to clients',
              'Deposit collection to prevent no-shows',
              'Free to start — no credit card needed'
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-white/65">
                <div className="w-5.5 h-5.5 rounded-full bg-[rgba(201,153,58,0.2)] border border-[rgba(201,153,58,0.4)] flex items-center justify-center text-xs text-[#C9993A] flex-shrink-0">✓</div>
                {feat}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/25">
          By continuing you agree to our Terms & Privacy Policy
        </div>
      </div>

      {/* Right panel - form */}
      <div className="bg-[#FDFAF5] px-14 py-[60px] overflow-y-auto flex flex-col justify-center">
        <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#B8AFA3] mb-2">Step 1 of 1</div>
        <h3 className="text-[30px] font-black tracking-tight mb-1.5" style={{ fontFamily: 'Fraunces, serif' }}>Tell us about you</h3>
        <p className="text-sm text-[#6B6455] mb-9 font-light">Your profile will be live in seconds.</p>

        {/* Progress */}
        <div className="flex gap-1.5 mb-9">
          <div className="flex-1 h-0.5 bg-[rgba(28,24,18,0.08)] rounded-full overflow-hidden">
            <div className="h-full bg-[#C9993A] rounded-full w-full transition-all" />
          </div>
        </div>

        {/* Service type */}
        <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#6B6455] mb-3.5 mt-6">What do you do?</div>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {SERVICE_TYPES.map((svc) => (
            <div
              key={svc.value}
              onClick={() => setServiceType(svc.value)}
              className={`border-2 rounded-lg p-3.5 text-center cursor-pointer transition-all bg-white
                ${serviceType === svc.value ? 'border-[#C9993A] bg-[#F5EDD8]' : 'border-[rgba(28,24,18,0.1)] hover:border-[rgba(201,153,58,0.4)] hover:bg-[#F5EDD8]'}`}
            >
              <div className="text-[22px] mb-1.5">{svc.icon}</div>
              <div className={`text-[11px] font-semibold ${serviceType === svc.value ? 'text-[#1C1812]' : 'text-[#6B6455]'}`}>{svc.label}</div>
            </div>
          ))}
        </div>

        {/* Personal info */}
        <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#6B6455] mb-3.5 mt-6">Your info</div>
        <div className="grid grid-cols-2 gap-3 mb-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#6B6455] mb-1.5 tracking-wide">First name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Karlos"
              className="w-full bg-white border-[1.5px] border-[rgba(28,24,18,0.12)] rounded-lg px-3.5 py-3 text-sm focus:border-[#C9993A] focus:shadow-[0_0_0_3px_rgba(201,153,58,0.1)] outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B6455] mb-1.5 tracking-wide">Last name</label>
            <input
              type="text"
              placeholder="e.g. Johnson"
              className="w-full bg-white border-[1.5px] border-[rgba(28,24,18,0.12)] rounded-lg px-3.5 py-3 text-sm focus:border-[#C9993A] focus:shadow-[0_0_0_3px_rgba(201,153,58,0.1)] outline-none transition"
            />
          </div>
        </div>

        <div className="mb-3.5">
          <label className="block text-xs font-semibold text-[#6B6455] mb-1.5 tracking-wide">Business / Shop name</label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. King's Cuts"
            className="w-full bg-white border-[1.5px] border-[rgba(28,24,18,0.12)] rounded-lg px-3.5 py-3 text-sm focus:border-[#C9993A] focus:shadow-[0_0_0_3px_rgba(201,153,58,0.1)] outline-none transition"
          />
        </div>

        {/* Contact */}
        <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#6B6455] mb-3.5 mt-6">Contact & Location</div>
        <div className="grid grid-cols-2 gap-3 mb-3.5">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#B8AFA3]">📞</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
              className="w-full bg-white border-[1.5px] border-[rgba(28,24,18,0.12)] rounded-lg pl-9 pr-3.5 py-3 text-sm focus:border-[#C9993A] focus:shadow-[0_0_0_3px_rgba(201,153,58,0.1)] outline-none transition"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#B8AFA3]">✉</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full bg-white border-[1.5px] border-[rgba(28,24,18,0.12)] rounded-lg pl-9 pr-3.5 py-3 text-sm focus:border-[#C9993A] focus:shadow-[0_0_0_3px_rgba(201,153,58,0.1)] outline-none transition"
            />
          </div>
        </div>

        <div className="relative mb-3.5">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#B8AFA3]">🔐</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password (min. 6 characters)"
            minLength={6}
            className="w-full bg-white border-[1.5px] border-[rgba(28,24,18,0.12)] rounded-lg pl-9 pr-3.5 py-3 text-sm focus:border-[#C9993A] focus:shadow-[0_0_0_3px_rgba(201,153,58,0.1)] outline-none transition"
            required
          />
        </div>

        <div className="relative mb-3.5">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#B8AFA3]">📍</span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. 123 Main St, Brooklyn, NY"
            className="w-full bg-white border-[1.5px] border-[rgba(28,24,18,0.12)] rounded-lg pl-9 pr-3.5 py-3 text-sm focus:border-[#C9993A] focus:shadow-[0_0_0_3px_rgba(201,153,58,0.1)] outline-none transition"
          />
        </div>

        {/* Services offered */}
        <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#6B6455] mb-3.5 mt-6">Services you offer</div>
        <div className="flex flex-wrap gap-2 mb-2">
          {services.map((service, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-[#F5EDD8] border border-[rgba(201,153,58,0.3)] rounded-full px-3 py-1.5 text-xs font-medium">
              {service.name}
              <button
                onClick={() => removeService(i)}
                className="w-3.5 h-3.5 rounded-full bg-[rgba(28,24,18,0.15)] hover:bg-[#C45C3A] hover:text-white text-[rgba(28,24,18,0.4)] flex items-center justify-center text-[9px] transition"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <input
          type="text"
          placeholder="+ Type a service and press Enter (e.g. Hot Towel Shave)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addService(e.currentTarget.value)
              e.currentTarget.value = ''
            }
          }}
          className="w-full bg-white border-[1.5px] border-dashed border-[rgba(28,24,18,0.15)] rounded-lg px-3.5 py-2.5 text-[13px] focus:border-[#C9993A] focus:border-solid outline-none transition"
        />

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#1C1812] text-[#F5F0E8] py-4 rounded-full text-[15px] font-semibold hover:bg-[#C9993A] hover:text-[#1C1812] hover:scale-[1.02] transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating your profile...' : 'Create my profile & go live →'}
        </button>

        <div className="text-center text-[13px] text-[#6B6455] mt-4">
          Already have an account? <button onClick={() => setShowOnboarding(false)} className="text-[#C9993A] font-semibold">Sign in</button>
        </div>
      </div>
    </div>
  )
}
