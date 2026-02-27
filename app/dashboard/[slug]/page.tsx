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
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month' | 'year'>('week')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  // Settings modal states
  const [showSettings, setShowSettings] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [location, setLocation] = useState('')
  const [services, setServices] = useState<any[]>([])
  const [settingsError, setSettingsError] = useState('')
  const [settingsSaving, setSettingsSaving] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem(`password_${slug}`)
    if (stored) {
      setPassword(stored)
      fetchDashboard(stored)
    }
  }, [slug])

  useEffect(() => {
    // Load current settings when modal opens
    if (showSettings && dashboardData) {
      const fetchSettings = async () => {
        try {
          const response = await fetch(`/api/provider/${slug}`)
          if (response.ok) {
            const data = await response.json()
            setLocation(data.location || '')
            setServices(data.services || [])
          }
        } catch (err) {
          console.error('Failed to load settings:', err)
        }
      }
      fetchSettings()
    }
  }, [showSettings, slug])

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

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const getWeekDays = (date: Date) => {
    const start = new Date(date)
    start.setDate(date.getDate() - date.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      return day
    })
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
              Bu<span className="text-[#C9993A]">Ke</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setShowCalendarModal(true)}
                className="px-3 py-1.5 bg-white/10 rounded-md hover:bg-white/20 transition"
              >
                📅 Calendar
              </button>
              <button className="px-3 py-1.5 hover:bg-white/10 rounded-md transition">👥 Clients</button>
              <button className="px-3 py-1.5 hover:bg-white/10 rounded-md transition">📋 Services</button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-3 py-1.5 hover:bg-white/10 rounded-md transition"
              >
                ⚙️ Settings
              </button>
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
            {todayDate} · {dashboardData.appointments.length} appointments today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 border border-[rgba(28,24,18,0.08)]">
            <div className="text-sm text-[#6B6455] mb-2">TODAY</div>
            <div className="text-4xl font-bold text-[#1C1812] mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
              {dashboardData.stats.today_appointments}
            </div>
            <div className="text-xs text-[#6B6455]">appointments</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[rgba(28,24,18,0.08)]">
            <div className="text-sm text-[#6B6455] mb-2">THIS WEEK</div>
            <div className="text-4xl font-bold text-[#1C1812] mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
              {dashboardData.stats.week_appointments}
            </div>
            <div className="text-xs text-[#6B6455]">appointments</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[rgba(28,24,18,0.08)]">
            <div className="text-sm text-[#6B6455] mb-2">TOTAL CLIENTS</div>
            <div className="text-4xl font-bold text-[#1C1812] mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
              {dashboardData.stats.total_customers}
            </div>
            <div className="text-xs text-[#6B6455]">all time</div>
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
                            : appt.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
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

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[rgba(28,24,18,0.08)] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-[#1C1812]" style={{ fontFamily: 'Fraunces, serif' }}>
                  Calendar
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCalendarView('week')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      calendarView === 'week'
                        ? 'bg-[#1C1812] text-white'
                        : 'bg-[#F5F0E8] text-[#1C1812] hover:bg-[#F5EDD8]'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setCalendarView('month')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      calendarView === 'month'
                        ? 'bg-[#1C1812] text-white'
                        : 'bg-[#F5F0E8] text-[#1C1812] hover:bg-[#F5EDD8]'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setCalendarView('year')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      calendarView === 'year'
                        ? 'bg-[#1C1812] text-white'
                        : 'bg-[#F5F0E8] text-[#1C1812] hover:bg-[#F5EDD8]'
                    }`}
                  >
                    Year
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="text-2xl text-[#6B6455] hover:text-[#1C1812] transition"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Week View */}
              {calendarView === 'week' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#1C1812]" style={{ fontFamily: 'Fraunces, serif' }}>
                      {getWeekDays(selectedDate)[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {getWeekDays(selectedDate)[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const newDate = new Date(selectedDate)
                          newDate.setDate(newDate.getDate() - 7)
                          setSelectedDate(newDate)
                        }}
                        className="px-3 py-1 bg-[#F5F0E8] rounded-md hover:bg-[#F5EDD8] transition"
                      >
                        ← Prev
                      </button>
                      <button
                        onClick={() => setSelectedDate(new Date())}
                        className="px-3 py-1 bg-[#F5F0E8] rounded-md hover:bg-[#F5EDD8] transition"
                      >
                        Today
                      </button>
                      <button
                        onClick={() => {
                          const newDate = new Date(selectedDate)
                          newDate.setDate(newDate.getDate() + 7)
                          setSelectedDate(newDate)
                        }}
                        className="px-3 py-1 bg-[#F5F0E8] rounded-md hover:bg-[#F5EDD8] transition"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {getWeekDays(selectedDate).map((day, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border-2 min-h-[120px] ${
                          day.toDateString() === new Date().toDateString()
                            ? 'border-[#C9993A] bg-[#F5EDD8]'
                            : 'border-[rgba(28,24,18,0.08)] bg-white'
                        }`}
                      >
                        <div className="text-xs text-[#6B6455] font-medium mb-1">
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className={`text-2xl font-bold mb-2 ${
                          day.toDateString() === new Date().toDateString()
                            ? 'text-[#C9993A]'
                            : 'text-[#1C1812]'
                        }`} style={{ fontFamily: 'Fraunces, serif' }}>
                          {day.getDate()}
                        </div>
                        <div className="text-xs text-[#6B6455]">
                          {Math.floor(Math.random() * 5)} appointments
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Month View */}
              {calendarView === 'month' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#1C1812]" style={{ fontFamily: 'Fraunces, serif' }}>
                      {getMonthName(currentMonth)}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const newMonth = new Date(currentMonth)
                          newMonth.setMonth(newMonth.getMonth() - 1)
                          setCurrentMonth(newMonth)
                        }}
                        className="px-3 py-1 bg-[#F5F0E8] rounded-md hover:bg-[#F5EDD8] transition"
                      >
                        ← Prev
                      </button>
                      <button
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-3 py-1 bg-[#F5F0E8] rounded-md hover:bg-[#F5EDD8] transition"
                      >
                        Today
                      </button>
                      <button
                        onClick={() => {
                          const newMonth = new Date(currentMonth)
                          newMonth.setMonth(newMonth.getMonth() + 1)
                          setCurrentMonth(newMonth)
                        }}
                        className="px-3 py-1 bg-[#F5F0E8] rounded-md hover:bg-[#F5EDD8] transition"
                      >
                        Next →
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-sm font-semibold text-[#6B6455] py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}
                    {Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => i + 1).map(day => {
                      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                      const isToday = date.toDateString() === new Date().toDateString()
                      const hasAppointments = Math.random() > 0.5

                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDate(date)}
                          className={`aspect-square p-2 rounded-lg transition flex flex-col items-center justify-center ${
                            isToday
                              ? 'bg-[#1C1812] text-white'
                              : hasAppointments
                              ? 'bg-[#F5EDD8] text-[#1C1812] hover:bg-[#E8C96A]'
                              : 'bg-white border border-[rgba(28,24,18,0.08)] hover:bg-[#F5F0E8]'
                          }`}
                        >
                          <div className="text-lg font-bold" style={{ fontFamily: 'Fraunces, serif' }}>
                            {day}
                          </div>
                          {hasAppointments && !isToday && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#C9993A] mt-1" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Year View */}
              {calendarView === 'year' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#1C1812]" style={{ fontFamily: 'Fraunces, serif' }}>
                      {currentYear}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentYear(currentYear - 1)}
                        className="px-3 py-1 bg-[#F5F0E8] rounded-md hover:bg-[#F5EDD8] transition"
                      >
                        ← Prev
                      </button>
                      <button
                        onClick={() => setCurrentYear(new Date().getFullYear())}
                        className="px-3 py-1 bg-[#F5F0E8] rounded-md hover:bg-[#F5EDD8] transition"
                      >
                        This Year
                      </button>
                      <button
                        onClick={() => setCurrentYear(currentYear + 1)}
                        className="px-3 py-1 bg-[#F5F0E8] rounded-md hover:bg-[#F5EDD8] transition"
                      >
                        Next →
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 12 }, (_, i) => {
                      const monthDate = new Date(currentYear, i, 1)
                      const monthName = monthDate.toLocaleDateString('en-US', { month: 'long' })
                      const isCurrentMonth = i === new Date().getMonth() && currentYear === new Date().getFullYear()

                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setCurrentMonth(monthDate)
                            setCalendarView('month')
                          }}
                          className={`p-4 rounded-lg border-2 transition ${
                            isCurrentMonth
                              ? 'border-[#C9993A] bg-[#F5EDD8]'
                              : 'border-[rgba(28,24,18,0.08)] bg-white hover:bg-[#F5F0E8]'
                          }`}
                        >
                          <div className={`text-lg font-bold mb-2 ${
                            isCurrentMonth ? 'text-[#C9993A]' : 'text-[#1C1812]'
                          }`} style={{ fontFamily: 'Fraunces, serif' }}>
                            {monthName}
                          </div>
                          <div className="text-sm text-[#6B6455]">
                            {Math.floor(Math.random() * 50 + 10)} appointments
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[rgba(28,24,18,0.08)] px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#1C1812]" style={{ fontFamily: 'Fraunces, serif' }}>
                Settings
              </h2>
              <button
                onClick={() => {
                  setShowSettings(false)
                  setSettingsError('')
                }}
                className="text-2xl text-[#6B6455] hover:text-[#1C1812] transition"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Change Password */}
              <div>
                <h3 className="text-lg font-bold text-[#1C1812] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                  Change Password
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#1C1812] mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 characters)"
                      minLength={6}
                      className="w-full bg-[#F5F0E8] border border-[rgba(28,24,18,0.12)] rounded-lg px-4 py-3 text-sm focus:border-[#C9993A] focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1C1812] mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      minLength={6}
                      className="w-full bg-[#F5F0E8] border border-[rgba(28,24,18,0.12)] rounded-lg px-4 py-3 text-sm focus:border-[#C9993A] focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-[rgba(28,24,18,0.08)]" />

              {/* Update Location */}
              <div>
                <h3 className="text-lg font-bold text-[#1C1812] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                  Business Location
                </h3>
                <div>
                  <label className="block text-sm font-medium text-[#1C1812] mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. 123 Main St, Brooklyn, NY"
                    className="w-full bg-[#F5F0E8] border border-[rgba(28,24,18,0.12)] rounded-lg px-4 py-3 text-sm focus:border-[#C9993A] focus:outline-none transition"
                  />
                </div>
              </div>

              <hr className="border-[rgba(28,24,18,0.08)]" />

              {/* Manage Services */}
              <div>
                <h3 className="text-lg font-bold text-[#1C1812] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                  Manage Services
                </h3>
                <div className="space-y-3">
                  {services.map((service, index) => (
                    <div key={index} className="flex gap-3 items-start p-4 bg-[#F5F0E8] rounded-lg">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => {
                            const updated = [...services]
                            updated[index].name = e.target.value
                            setServices(updated)
                          }}
                          placeholder="Service name"
                          className="bg-white border border-[rgba(28,24,18,0.12)] rounded-lg px-3 py-2 text-sm focus:border-[#C9993A] focus:outline-none"
                        />
                        <input
                          type="number"
                          value={service.duration}
                          onChange={(e) => {
                            const updated = [...services]
                            updated[index].duration = parseInt(e.target.value)
                            setServices(updated)
                          }}
                          placeholder="Duration (min)"
                          className="bg-white border border-[rgba(28,24,18,0.12)] rounded-lg px-3 py-2 text-sm focus:border-[#C9993A] focus:outline-none"
                        />
                        <input
                          type="number"
                          value={service.price}
                          onChange={(e) => {
                            const updated = [...services]
                            updated[index].price = parseFloat(e.target.value)
                            setServices(updated)
                          }}
                          placeholder="Price ($)"
                          className="bg-white border border-[rgba(28,24,18,0.12)] rounded-lg px-3 py-2 text-sm focus:border-[#C9993A] focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => {
                          setServices(services.filter((_, i) => i !== index))
                        }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setServices([...services, { name: '', duration: 30, price: 0, icon: '✂️' }])
                    }}
                    className="w-full py-3 border-2 border-dashed border-[rgba(28,24,18,0.12)] rounded-lg text-sm font-medium text-[#6B6455] hover:border-[#C9993A] hover:text-[#C9993A] transition"
                  >
                    + Add Service
                  </button>
                </div>
              </div>

              {settingsError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {settingsError}
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={async () => {
                  setSettingsError('')
                  setSettingsSaving(true)

                  try {
                    // Validate passwords match
                    if (newPassword && newPassword !== confirmPassword) {
                      throw new Error('Passwords do not match')
                    }

                    if (newPassword && newPassword.length < 6) {
                      throw new Error('Password must be at least 6 characters')
                    }

                    const updates: any = {}
                    if (newPassword) updates.password = newPassword
                    if (location) updates.location = location
                    if (services.length > 0) updates.services = services

                    const response = await fetch(`/api/provider/${slug}/settings`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ password, updates }),
                    })

                    if (!response.ok) {
                      const data = await response.json()
                      throw new Error(data.detail || 'Failed to update settings')
                    }

                    // Refresh dashboard data
                    await fetchDashboard(newPassword || password)
                    setShowSettings(false)
                    setNewPassword('')
                    setConfirmPassword('')
                  } catch (err: any) {
                    setSettingsError(err.message)
                  } finally {
                    setSettingsSaving(false)
                  }
                }}
                disabled={settingsSaving}
                className="w-full bg-[#1C1812] text-[#F5F0E8] py-3 rounded-lg font-semibold hover:bg-[#C9993A] hover:text-[#1C1812] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {settingsSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
