'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getDashboardData, verifyAuth, signOut, getAppointments, updateAppointmentStatus, updateProviderProfile, updateProviderPassword } from '@/lib/api'
import type { DashboardData, AppointmentWithDetails } from '@/lib/types'
import { AppointmentStatus } from '@/lib/types'
import { formatDate, formatTime, formatCurrency, getCalendarDateRange, formatDateShort } from '@/lib/utils'
import ThemeToggle from '@/components/ThemeToggle'
import AppointmentCalendar from '@/components/dashboard/AppointmentCalendar'
import AppointmentDetailsModal from '@/components/dashboard/AppointmentDetailsModal'
import { View } from 'react-big-calendar'

export default function DashboardPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  // Calendar state
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [calendarView, setCalendarView] = useState<View>('week')
  const [currentDate, setCurrentDate] = useState(new Date())

  // Settings modal states
  const [showSettings, setShowSettings] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [location, setLocation] = useState('')
  const [services, setServices] = useState<any[]>([])
  const [settingsError, setSettingsError] = useState('')
  const [settingsSaving, setSettingsSaving] = useState(false)

  // Share modal state
  const [showShare, setShowShare] = useState(false)

  // Move useMemo to top level before any early returns
  const todayDate = useMemo(() => formatDateShort(new Date()), [])

  // Get greeting based on current time
  const getGreeting = useCallback(() => {
    const hour = new Date().getHours()

    if (hour < 12) {
      return 'Good morning'
    } else if (hour < 19) {
      return 'Good afternoon'
    } else {
      return 'Good evening'
    }
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const auth = await verifyAuth()

      if (!auth.authenticated) {
        router.push('/signin')
        return
      }

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
  }, [slug, router])

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Auto-refresh dashboard every 60 seconds (optimized from 30s)
  useEffect(() => {
    if (!authenticated) return

    const interval = setInterval(() => {
      fetchDashboard(true)
    }, 60000)

    return () => clearInterval(interval)
  }, [authenticated, slug])

  // Initialize settings from dashboardData when modal opens
  useEffect(() => {
    if (showSettings && dashboardData) {
      setLocation(dashboardData.provider.location || '')
      // Services would need to be fetched separately if needed
    }
  }, [showSettings, dashboardData])

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError('')

    try {
      const data = await getDashboardData(slug)
      setDashboardData(data)
      setAuthenticated(true)
    } catch (err: any) {
      setError(err.message)
      setAuthenticated(false)
      if (err.message.includes('Unauthorized')) {
        router.push('/signin')
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }, [slug, router])

  const fetchCalendarAppointments = useCallback(async () => {
    try {
      const { startDate, endDate } = getCalendarDateRange(calendarView, currentDate)
      const data = await getAppointments(slug, undefined, startDate, endDate)
      setAppointments(data.appointments || [])
    } catch (err) {
      console.error('Failed to fetch calendar appointments:', err)
    }
  }, [slug, calendarView, currentDate])

  // Fetch calendar appointments when view/date changes
  useEffect(() => {
    if (authenticated) {
      fetchCalendarAppointments()
    }
  }, [authenticated, fetchCalendarAppointments])

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

  const handleSelectAppointment = useCallback((appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment)
    setShowAppointmentModal(true)
  }, [])

  const handleNavigate = useCallback((date: Date, view: View) => {
    setCurrentDate(date)
    setCalendarView(view)
  }, [])

  const handleViewChange = useCallback((view: View) => {
    setCalendarView(view)
  }, [])

  const handleUpdateAppointmentStatus = useCallback(async (
    appointmentId: string,
    status: string,
    successMessage: string
  ) => {
    try {
      await updateAppointmentStatus(slug, appointmentId, status)
      // Run refreshes in parallel for faster updates
      await Promise.all([
        fetchCalendarAppointments(),
        fetchDashboard(true)
      ])
      alert(successMessage)
    } catch (err) {
      console.error('Failed to update appointment:', err)
      alert('Failed to update appointment')
    }
  }, [slug, fetchCalendarAppointments, fetchDashboard])

  const handleCancelAppointment = useCallback((appointmentId: string) => {
    return handleUpdateAppointmentStatus(
      appointmentId,
      AppointmentStatus.CANCELLED,
      'Appointment cancelled successfully'
    )
  }, [handleUpdateAppointmentStatus])

  const handleCompleteAppointment = useCallback((appointmentId: string) => {
    return handleUpdateAppointmentStatus(
      appointmentId,
      AppointmentStatus.COMPLETED,
      'Appointment marked as complete'
    )
  }, [handleUpdateAppointmentStatus])

  const handleSaveSettings = async () => {
    setSettingsError('')
    setSettingsSaving(true)

    try {
      // Update location
      await updateProviderProfile(slug, { location })

      // Update password if provided
      if (currentPassword && newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error('New passwords do not match')
        }

        await updateProviderPassword(slug, currentPassword, newPassword)
      }

      alert('Settings saved successfully!')
      setShowSettings(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      await fetchDashboard(true)
    } catch (err: any) {
      setSettingsError(err.message)
    } finally {
      setSettingsSaving(false)
    }
  }

  // Loading Screen
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full border border-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Dashboard</h1>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!dashboardData) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </main>
    )
  }

  const provider = dashboardData.provider

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white text-gray-900 px-6 py-4 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold">
              Bo<span className="text-purple-600">Ke</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setShowShare(true)}
              className="px-4 py-2 hover:bg-gray-100 rounded-lg transition text-sm font-medium"
            >
              Share
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 hover:bg-gray-100 rounded-lg transition text-sm font-medium"
            >
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-600/25"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Greeting Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {getGreeting()}, {provider.name.split(' ')[0]} ✨
          </h1>
          <p className="text-sm text-gray-600">
            {todayDate} · {dashboardData.appointments.length} appointments today
          </p>
        </div>

        {/* Stats Cards - Collapsible */}
        <details className="mb-6" open>
          <summary className="cursor-pointer text-lg font-semibold text-gray-900 mb-4">
            📊 Quick Stats
          </summary>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">TODAY</div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {dashboardData.stats.today_appointments}
              </div>
              <div className="text-xs text-gray-600">appointments</div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">THIS WEEK</div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {dashboardData.stats.week_appointments}
              </div>
              <div className="text-xs text-gray-600">appointments</div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">TOTAL CLIENTS</div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {dashboardData.stats.total_customers}
              </div>
              <div className="text-xs text-gray-600">all time</div>
            </div>
          </div>
        </details>

        {/* Calendar - Main View */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Appointment Calendar
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Click on any appointment to view details or take actions
            </p>
          </div>
          <AppointmentCalendar
            appointments={appointments}
            onSelectAppointment={handleSelectAppointment}
            onNavigate={handleNavigate}
            onViewChange={handleViewChange}
          />
        </div>
      </div>

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={showAppointmentModal}
        onClose={() => {
          setShowAppointmentModal(false)
          setSelectedAppointment(null)
        }}
        onCancel={handleCancelAppointment}
        onComplete={handleCompleteAppointment}
      />

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-2xl px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Share Your Booking Page</h2>
              <button
                onClick={() => setShowShare(false)}
                className="text-2xl hover:bg-white/20 rounded-lg w-8 h-8 flex items-center justify-center transition"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Preview Card */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="text-sm font-medium text-purple-900 mb-3">
                  Your Public Booking Page
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 bg-white px-4 py-3 rounded-lg font-mono text-sm text-gray-700 break-all border border-purple-200">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/{slug}
                  </div>
                </div>
                <p className="text-sm text-purple-900/70">
                  Share this link with your customers so they can book appointments with you
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/${slug}`
                    navigator.clipboard.writeText(url)
                    alert('Link copied to clipboard! 📋')
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-600/25"
                >
                  <span className="text-xl">📋</span>
                  Copy Link
                </button>
                <a
                  href={`/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-purple-700 border-2 border-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition"
                >
                  <span className="text-xl">👁️</span>
                  Preview
                </a>
              </div>

              {/* QR Code Placeholder */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                <div className="text-sm font-medium text-gray-700 mb-3">
                  Share via QR Code
                </div>
                <div className="w-48 h-48 mx-auto bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center">
                  <div className="text-gray-400 text-sm">
                    QR Code<br />Coming Soon
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  Customers can scan this QR code to book instantly
                </p>
              </div>

              {/* Social Share Options */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-3">
                  Share on Social Media
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/${slug}`
                      const text = `Book an appointment with ${provider.name}`
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    <span className="text-xl">𝕏</span>
                    Twitter
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/${slug}`
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <span className="text-xl">f</span>
                    Facebook
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/${slug}`
                      const text = `Book an appointment with ${provider.name}`
                      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    <span className="text-xl">💬</span>
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-end">
              <button
                onClick={() => setShowShare(false)}
                className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-2xl text-gray-600 hover:text-gray-900 transition"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              {settingsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {settingsError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="123 Main St, City, State"
                />
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={settingsSaving}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50"
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
