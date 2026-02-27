'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getDashboardData } from '@/lib/api'
import type { DashboardData } from '@/lib/types'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
  const params = useParams()
  const slug = params.slug as string

  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    const stored = sessionStorage.getItem(`password_${slug}`)
    if (stored) {
      setPassword(stored)
      fetchDashboard(stored)
    }
  }, [slug])

  const fetchDashboard = async (passwordValue: string) => {
    setLoading(true)
    setError('')

    try {
      const data = await getDashboardData(slug, passwordValue)
      setDashboardData(data)
      setAuthenticated(true)
      sessionStorage.setItem(`password_${slug}`, passwordValue)
    } catch (err: any) {
      setError(err.message)
      setAuthenticated(false)
      sessionStorage.removeItem(`password_${slug}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length >= 6) {
      fetchDashboard(password)
    }
  }

  const handleLogout = () => {
    setAuthenticated(false)
    setPassword('')
    setDashboardData(null)
    sessionStorage.removeItem(`password_${slug}`)
  }

  // Password Entry Screen
  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full border border-[rgba(28,24,18,0.08)]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#F5EDD8] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#C9993A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#1C1812] mb-2" style={{ fontFamily: 'Fraunces, serif' }}>Dashboard Access</h1>
            <p className="text-[#6B6455]">Enter your password to continue</p>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-6">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#F5F0E8] border border-[rgba(28,24,18,0.12)] rounded-lg text-[#1C1812] focus:border-[#C9993A] focus:outline-none transition"
                placeholder="Enter your password"
                autoFocus
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={password.length < 6 || loading}
              className="w-full bg-[#1C1812] text-[#F5F0E8] font-semibold py-3 rounded-lg hover:bg-[#C9993A] hover:text-[#1C1812] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  if (!dashboardData) {
    return (
      <main className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9993A] mx-auto mb-4"></div>
          <p className="text-[#6B6455]">Loading dashboard...</p>
        </div>
      </main>
    )
  }

  const provider = dashboardData.appointments[0]?.customer
    ? { first_name: dashboardData.appointments[0].customer.first_name, last_name: dashboardData.appointments[0].customer.last_name }
    : { first_name: slug.charAt(0).toUpperCase() + slug.slice(1), last_name: '' }
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <main className="min-h-screen bg-[#F5F0E8]">
      {/* Header */}
      <header className="bg-[#1C1812] text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-black" style={{ fontFamily: 'Fraunces, serif' }}>
              Slot<span className="text-[#C9993A]">Craft</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <button className="px-3 py-1.5 bg-white/10 rounded-md hover:bg-white/20 transition">📅 Calendar</button>
              <button className="px-3 py-1.5 hover:bg-white/10 rounded-md transition">👥 Clients</button>
              <button className="px-3 py-1.5 hover:bg-white/10 rounded-md transition">📋 Services</button>
              <button className="px-3 py-1.5 hover:bg-white/10 rounded-md transition">💰 Earnings</button>
              <button className="px-3 py-1.5 hover:bg-white/10 rounded-md transition">⚙️ Settings</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm hover:text-[#C9993A] transition">🔔</button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#C9993A] text-[#1C1812] rounded-md text-sm font-semibold hover:bg-[#E8C96A] transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Greeting Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1C1812] mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
            Good morning, {provider.first_name} ✨
          </h1>
          <p className="text-sm text-[#6B6455]">
            {todayDate} · {dashboardData.appointments.length} appointments today · ${dashboardData.appointments.reduce((sum, a) => sum + a.price, 0)} expected
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 border border-[rgba(28,24,18,0.08)]">
            <div className="text-sm text-[#6B6455] mb-2">TODAY</div>
            <div className="text-4xl font-bold text-[#1C1812] mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
              {dashboardData.stats.today_appointments}
            </div>
            <div className="text-xs text-[#6B6455]">↑ 2 more than yesterday</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[rgba(28,24,18,0.08)]">
            <div className="text-sm text-[#6B6455] mb-2">REVENUE TODAY</div>
            <div className="text-4xl font-bold text-[#1C1812] mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
              {formatCurrency(dashboardData.appointments.reduce((sum, a) => sum + a.price, 0))}
            </div>
            <div className="text-xs text-[#6B6455]">↑ 8.5% vs last week</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[rgba(28,24,18,0.08)]">
            <div className="text-sm text-[#6B6455] mb-2">NEW CLIENTS</div>
            <div className="text-4xl font-bold text-[#1C1812] mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
              {dashboardData.stats.total_customers}
            </div>
            <div className="text-xs text-[#6B6455]">↑ 12% vs last month</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[rgba(28,24,18,0.08)]">
            <div className="text-sm text-[#6B6455] mb-2">TOTAL CLIENTS</div>
            <div className="text-4xl font-bold text-[#1C1812] mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
              {dashboardData.stats.total_customers}
            </div>
            <div className="text-xs text-[#6B6455]">since Jan 2026</div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_400px] gap-6">
          {/* Left Column - Appointments */}
          <div>
            {/* Week Navigation */}
            <div className="bg-white rounded-xl p-4 mb-4 border border-[rgba(28,24,18,0.08)]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-bold text-[#1C1812]" style={{ fontFamily: 'Fraunces, serif' }}>
                  Week of Feb 24
                </div>
                <button className="text-sm text-[#C9993A] font-medium hover:underline">Full calendar →</button>
              </div>
              <div className="flex gap-2">
                {['24', '25', '26', '27', '28', '01', '02'].map((day, i) => (
                  <button
                    key={day}
                    className={`flex-1 py-3 rounded-lg text-center font-medium transition ${
                      i === 2
                        ? 'bg-[#1C1812] text-white'
                        : 'bg-[#F5F0E8] text-[#1C1812] hover:bg-[#F5EDD8]'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Today's Appointments */}
            <div className="bg-white rounded-xl p-6 border border-[rgba(28,24,18,0.08)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1C1812]" style={{ fontFamily: 'Fraunces, serif' }}>
                  Today's appointments
                </h2>
                <button className="text-sm text-[#C9993A] font-medium hover:underline">Block time</button>
              </div>

              {dashboardData.appointments.length === 0 ? (
                <div className="text-center py-12 text-[#6B6455]">
                  <div className="text-5xl mb-3">📭</div>
                  <p>No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboardData.appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="flex items-center gap-4 p-4 bg-[#FDFAF5] rounded-lg border border-[rgba(28,24,18,0.06)] hover:border-[#C9993A] transition group"
                    >
                      <div className="text-lg font-bold text-[#1C1812] min-w-[60px]" style={{ fontFamily: 'Fraunces, serif' }}>
                        {formatTime(appt.appointment_time)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[#1C1812] mb-0.5">
                          {appt.customer.first_name} {appt.customer.last_name}
                        </div>
                        <div className="text-sm text-[#6B6455]">
                          {appt.service.name} · {appt.duration} min
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#1C1812]" style={{ fontFamily: 'Fraunces, serif' }}>
                          {formatCurrency(appt.price)}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          appt.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : appt.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Profile & Calendar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-[#1C1812] rounded-xl p-6 text-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C9993A] to-[#8A6830] flex items-center justify-center text-2xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>
                  {provider.first_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg" style={{ fontFamily: 'Fraunces, serif' }}>
                    {provider.first_name} {provider.last_name}
                  </div>
                  <div className="text-sm text-white/60">slotcraft.app/{slug}</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-white/80">
                  <span>📍</span>
                  <span>123 Atlantic Ave, Brooklyn</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <span>📞</span>
                  <span>+1 718 555 0192</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <span>✉️</span>
                  <span>{slug}@kingcuts.com</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <span>✂️</span>
                  <span>Fade, Classic Cut, Beard Trim, Shave</span>
                </div>
              </div>

              <button className="w-full mt-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition">
                Edit profile
              </button>
            </div>

            {/* Mini Calendar */}
            <div className="bg-white rounded-xl p-6 border border-[rgba(28,24,18,0.08)]">
              <div className="flex items-center justify-between mb-4">
                <div className="font-bold text-[#1C1812]" style={{ fontFamily: 'Fraunces, serif' }}>
                  February 2026
                </div>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-[#F5F0E8] rounded">←</button>
                  <button className="p-1 hover:bg-[#F5F0E8] rounded">→</button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                  <div key={d} className="text-[#6B6455] font-medium">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {Array.from({ length: 29 }, (_, i) => i + 1).map(day => (
                  <button
                    key={day}
                    className={`aspect-square flex items-center justify-center rounded-lg transition ${
                      day === 26
                        ? 'bg-[#1C1812] text-white font-bold'
                        : day % 5 === 0
                        ? 'bg-[#F5EDD8] text-[#1C1812] font-medium'
                        : 'text-[#1C1812] hover:bg-[#F5F0E8]'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Next 5 Days */}
            <div className="bg-white rounded-xl p-6 border border-[rgba(28,24,18,0.08)]">
              <div className="font-bold text-[#1C1812] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                Next 5 days
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Marcus W.', service: 'Fade', time: 'Thu 2:00 PM' },
                  { name: 'Sarah K.', service: 'Classic Cut', time: 'Thu 4:30 PM' },
                  { name: 'Dmitri V.', service: 'Shave', time: 'Fri 10:00 AM' },
                  { name: 'Andre T.', service: 'Fade + Design', time: 'Fri 1:30 PM' },
                  { name: 'Kevin P.', service: 'Classic Cut', time: 'Sat 11:00 AM' },
                ].map((appt, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-[#C9993A]"></div>
                    <div className="flex-1">
                      <div className="font-medium text-[#1C1812]">{appt.name}</div>
                      <div className="text-[#6B6455]">{appt.service}</div>
                    </div>
                    <div className="text-[#6B6455]">{appt.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
