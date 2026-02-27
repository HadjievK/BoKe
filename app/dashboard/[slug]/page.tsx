'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getDashboardData } from '@/lib/api'
import type { DashboardData } from '@/lib/types'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
  const params = useParams()
  const slug = params.slug as string

  const [password, setPin] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  useEffect(() => {
    // Check for stored PIN (simple session storage for MVP)
    const stored = sessionStorage.getItem(`password_${slug}`)
    if (stored) {
      setPin(stored)
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

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length === 4) {
      fetchDashboard(password)
    }
  }

  const handleLogout = () => {
    setAuthenticated(false)
    setPin('')
    setDashboardData(null)
    sessionStorage.removeItem(`password_${slug}`)
  }

  // Password Entry Screen
  if (!authenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard Access</h1>
            <p className="text-gray-400">Enter your password to continue</p>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-6">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-gray-700 border-2 border-gray-600 rounded-xl text-white focus:border-gold focus:outline-none"
                placeholder="Enter your password"
                autoFocus
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={password.length < 6 || loading}
              className="w-full bg-gold hover:bg-gold-dark text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spassword rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </main>
    )
  }

  // Dashboard Screen
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            <span className="text-gold">BuKe</span> Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-3xl font-bold text-gold mb-1">
              {dashboardData.stats.today_appointments}
            </div>
            <div className="text-sm text-gray-400">Today's Appointments</div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-3xl font-bold text-gold mb-1">
              {dashboardData.stats.week_appointments}
            </div>
            <div className="text-sm text-gray-400">This Week</div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-3xl font-bold text-gold mb-1">
              {dashboardData.stats.total_customers}
            </div>
            <div className="text-sm text-gray-400">Total Customers</div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-gold mb-1">
              {dashboardData.stats.rating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Rating</div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-8">
          <h2 className="text-2xl font-bold mb-6">Today's Appointments</h2>

          {dashboardData.appointments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-3">📭</div>
              <p>No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="bg-gray-700/50 rounded-xl p-4 border border-gray-600 hover:border-gold transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl font-bold text-gold">
                          {formatTime(appt.appointment_time)}
                        </div>
                        <div className="px-3 py-1 bg-gold/20 text-gold text-xs font-semibold rounded-full">
                          {appt.status}
                        </div>
                      </div>

                      <h3 className="font-semibold text-lg mb-1">
                        {appt.customer.first_name} {appt.customer.last_name}
                      </h3>

                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                        <span>📧 {appt.customer.email}</span>
                        <span>📱 {appt.customer.phone}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-300">
                          {appt.service.icon} {appt.service.name}
                        </span>
                        <span className="text-gray-400">
                          {appt.duration} min
                        </span>
                      </div>

                      {appt.customer_notes && (
                        <div className="mt-2 text-sm text-gray-400 italic">
                          Note: {appt.customer_notes}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-gold">
                        {formatCurrency(appt.price)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Customers */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">Recent Customers</h2>

          {dashboardData.recent_customers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No customers yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {dashboardData.recent_customers.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-gray-700/50 rounded-xl p-4 border border-gray-600"
                >
                  <h3 className="font-semibold mb-2">
                    {customer.first_name} {customer.last_name}
                  </h3>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>{customer.email}</p>
                    <p>{customer.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
