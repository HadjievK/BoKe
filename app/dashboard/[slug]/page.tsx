'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getDashboardData, verifyAuth, signOut } from '@/lib/api'
import type { DashboardData } from '@/lib/types'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import ThemeToggle from '@/components/ThemeToggle'

export default function DashboardPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month' | 'year'>('week')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [appointmentsByDate, setAppointmentsByDate] = useState<Record<string, number>>({})

  // Settings modal states
  const [showSettings, setShowSettings] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [location, setLocation] = useState('')
  const [services, setServices] = useState<any[]>([])
  const [settingsError, setSettingsError] = useState('')
  const [settingsSaving, setSettingsSaving] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await verifyAuth()

        if (!auth.authenticated) {
          // Not authenticated, redirect to signin
          router.push('/signin')
          return
        }

        // Verify slug matches authenticated provider
        if (auth.slug !== slug) {
          router.push(`/dashboard/${auth.slug}`)
          return
        }

        setAuthenticated(true)
        await fetchDashboard()
      } catch (err: any) {
        console.error('Auth check failed:', err)
        router.push('/signin')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [slug, router])

  // Auto-refresh dashboard every 30 seconds
  useEffect(() => {
    if (!authenticated) return

    const interval = setInterval(() => {
      fetchDashboard(true) // Silent refresh (no loading spinner)
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [authenticated, slug])

  // Fetch calendar appointments when view/date changes
  useEffect(() => {
    if (authenticated && showCalendarModal) {
      fetchCalendarAppointments()
    }
  }, [authenticated, showCalendarModal, calendarView, currentMonth, currentYear, selectedDate])

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

  const fetchDashboard = async (silent = false) => {
    if (!silent) setLoading(true)
    setError('')

    try {
      const data = await getDashboardData(slug)
      setDashboardData(data)
      setAuthenticated(true)
    } catch (err: any) {
      setError(err.message)
      setAuthenticated(false)
      // If unauthorized, redirect to signin
      if (err.message.includes('Unauthorized')) {
        router.push('/signin')
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const fetchCalendarAppointments = async () => {

    try {
      let startDate, endDate

      // Calculate date range based on calendar view
      if (calendarView === 'week') {
        const weekStart = getWeekDays(selectedDate)[0]
        const weekEnd = getWeekDays(selectedDate)[6]
        startDate = weekStart.toISOString().split('T')[0]
        endDate = weekEnd.toISOString().split('T')[0]
      } else if (calendarView === 'month') {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        startDate = new Date(year, month, 1).toISOString().split('T')[0]
        endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]
      } else if (calendarView === 'year') {
        startDate = `${currentYear}-01-01`
        endDate = `${currentYear}-12-31`
      }

      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const response = await fetch(
        `/api/dashboard/${slug}/appointments?${params.toString()}`,
        {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setAppointmentsByDate(data.appointments_by_date || {})
      }
    } catch (err) {
      console.error('Failed to fetch calendar appointments:', err)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Sign out error:', err)
    }
    setAuthenticated(false)
    setDashboardData(null)
    router.push('/signin')
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

  // Loading Screen
  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full border border-[rgba(28,24,18,0.08)]">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#F5EDD8] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-[#C9993A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#1C1812] mb-2" style={{ fontFamily: 'Fraunces, serif' }}>Loading Dashboard</h1>
            <p className="text-[#6B6455]">Please wait...</p>
          </div>
        </div>
      </main>
    )
  }

  // Dashboard Main Content
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

  const provider = dashboardData.provider
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-ink text-ink-foreground px-6 py-4 border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-black font-display">
              Bu<span className="text-gold">Ke</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setShowCalendarModal(true)}
                className="px-3 py-1.5 bg-gold/10 rounded-md hover:bg-gold/20 transition"
              >
                📅 Calendar
              </button>
              <button className="px-3 py-1.5 hover:bg-gold/10 rounded-md transition">👥 Clients</button>
              <button className="px-3 py-1.5 hover:bg-gold/10 rounded-md transition">📋 Services</button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-3 py-1.5 hover:bg-gold/10 rounded-md transition"
              >
                ⚙️ Settings
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="text-sm hover:text-gold transition">🔔</button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gold text-background rounded-md text-sm font-semibold hover:bg-gold-dark transition"
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
            Good morning, {provider.name.split(' ')[0]} ✨
          </h1>
          <p className="text-sm text-[#6B6455]">
            {todayDate} · {dashboardData.appointments.length} appointments today
          </p>
        </div>

        {/* Public Booking Link */}
        <div className="bg-gradient-to-r from-[#C9993A] to-[#8A6830] rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium mb-2 opacity-90">Your Public Booking Page</div>
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm" style={{ fontFamily: 'Fraunces, serif' }}>
                  {typeof window !== 'undefined' ? window.location.origin : ''}/{slug}
                </div>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/${slug}`
                    navigator.clipboard.writeText(url)
                    alert('Link copied to clipboard! 📋')
                  }}
                  className="px-4 py-2 bg-white text-[#1C1812] font-semibold rounded-lg hover:bg-[#F5F0E8] transition"
                >
                  📋 Copy Link
                </button>
                <a
                  href={`/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm font-semibold rounded-lg hover:bg-white/30 transition"
                >
                  👁️ Preview
                </a>
              </div>
            </div>
          </div>
          <p className="text-sm mt-3 opacity-80">
            Share this link with your customers so they can book appointments with you
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
                  {provider.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg" style={{ fontFamily: 'Fraunces, serif' }}>
                    {provider.name}
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
                          {appointmentsByDate[day.toISOString().split('T')[0]] || 0} appointments
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
                      const dateStr = date.toISOString().split('T')[0]
                      const isToday = date.toDateString() === new Date().toDateString()
                      const hasAppointments = (appointmentsByDate[dateStr] || 0) > 0

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
                            {Object.keys(appointmentsByDate).filter(date => {
                              const d = new Date(date)
                              return d.getFullYear() === currentYear && d.getMonth() === i
                            }).reduce((sum, date) => sum + (appointmentsByDate[date] || 0), 0)} appointments
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
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full bg-[#F5F0E8] border border-[rgba(28,24,18,0.12)] rounded-lg px-4 py-3 text-sm focus:border-[#C9993A] focus:outline-none transition"
                    />
                  </div>
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

                    // Require current password if changing password
                    if (newPassword && !currentPassword) {
                      throw new Error('Current password is required to change password')
                    }

                    const updates: any = {}
                    if (newPassword) updates.password = newPassword
                    if (location) updates.location = location
                    if (services.length > 0) updates.services = services

                    const token = localStorage.getItem('auth_token')
                    const response = await fetch(`/api/provider/${slug}/settings`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token || ''}`,
                      },
                      credentials: 'include',
                      body: JSON.stringify({ currentPassword, updates }),
                    })

                    if (!response.ok) {
                      const data = await response.json()
                      throw new Error(data.detail || 'Failed to update settings')
                    }

                    // Refresh dashboard data
                    await fetchDashboard()
                    setShowSettings(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
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
