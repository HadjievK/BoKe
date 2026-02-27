'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()
  const [showOnboarding, setShowOnboarding] = useState(false)

  if (showOnboarding) {
    return <OnboardingForm onBack={() => setShowOnboarding(false)} />
  }

  return (
    <div className="landing">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-radial from-[rgba(201,153,58,0.12)] via-transparent to-transparent opacity-60" />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E")`,
          opacity: 0.6
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
      <div className="relative z-5 max-w-[1200px] mx-auto px-[60px] pt-20 grid grid-cols-[1fr_480px] gap-[60px] items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-[#F5EDD8] border border-[rgba(201,153,58,0.25)] rounded-full px-4 py-1.5 text-xs font-semibold text-[#C9993A] tracking-wider uppercase mb-6 animate-in">
            ✦ Trusted by 3,200+ professionals
          </div>

          <h1 className="text-[clamp(48px,5vw,72px)] font-black leading-none tracking-tight mb-6 animate-in delay-1" style={{ fontFamily: 'Fraunces, serif' }}>
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
            <button className="text-sm text-[#6B6455] hover:text-[#1C1812] font-medium flex items-center gap-1.5 transition-colors">
              ▷ See a demo
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
                <div className="bg-[#F5F0E8] rounded-[10px] p-3 text-center">
                  <div className="text-[20px] font-bold" style={{ fontFamily: 'Fraunces, serif' }}>7</div>
                  <div className="text-[10px] text-[#6B6455] mt-0.5">Today</div>
                </div>
                <div className="bg-[#F5F0E8] rounded-[10px] p-3 text-center">
                  <div className="text-[20px] font-bold" style={{ fontFamily: 'Fraunces, serif' }}>$486</div>
                  <div className="text-[10px] text-[#6B6455] mt-0.5">Revenue</div>
                </div>
                <div className="bg-[#F5F0E8] rounded-[10px] p-3 text-center">
                  <div className="text-[20px] font-bold" style={{ fontFamily: 'Fraunces, serif' }}>4.9★</div>
                  <div className="text-[10px] text-[#6B6455] mt-0.5">Rating</div>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { time: '9:00', name: 'Marcus W. — Fade', price: '$45', color: '#C9993A' },
                  { time: '10:30', name: 'Jordan L. — Classic Cut', price: '$35', color: '#6ECA88' },
                  { time: '12:00', name: 'Andre T. — Beard Trim', price: '$25', color: '#6BA3E8' }
                ].map((appt, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 bg-[#F5F0E8] rounded-[10px] border-l-[3px]" style={{ borderLeftColor: appt.color, opacity: i === 2 ? 0.7 : 1 }}>
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
      <div id="how" className="relative z-5 max-w-[1200px] mx-auto px-[60px] mt-[120px]">
        <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#6B6455] mb-4 flex items-center gap-2">
          ── How it works
        </div>
        <h2 className="text-[42px] font-black tracking-tight mb-[60px] max-w-[480px] leading-tight" style={{ fontFamily: 'Fraunces, serif' }}>
          Up and running in <em className="font-light italic text-[#C9993A]">three steps</em>
        </h2>

        <div className="grid grid-cols-3 gap-0.5 bg-[rgba(28,24,18,0.06)] rounded-[14px] overflow-hidden mb-[120px]">
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

function OnboardingForm({ onBack }: { onBack: () => void }) {
  const router = useRouter()
  // Your existing onboarding form logic here
  return (
    <div className="min-h-screen p-8">
      <button onClick={onBack} className="mb-4 text-[#C9993A]">← Back to landing</button>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Create Your Profile</h2>
        {/* Existing onboarding form */}
      </div>
    </div>
  )
}
