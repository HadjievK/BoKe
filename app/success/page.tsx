'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug')
  const dashboardUrl = searchParams.get('dashboard')
  const [copied, setCopied] = useState(false)

  const publicUrl = `https://buke.app/${slug}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!slug) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 text-center">
          <p className="text-red-500">Invalid success page parameters</p>
          <Link href="/" className="inline-block bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition mt-4">
            Go Home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4" style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 max-w-2xl w-full text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 You're All Set!
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Your booking page is live and ready to accept appointments
        </p>

        {/* Public URL */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Your Public Booking Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={publicUrl}
              readOnly
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none font-mono text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition whitespace-nowrap shadow-lg shadow-purple-600/25"
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Password Reminder */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <label className="text-sm font-medium text-gray-900">Dashboard Access</label>
          </div>
          <div className="text-lg font-semibold text-purple-600 mb-2">
            Password Created ✓
          </div>
          <p className="text-xs text-gray-600">
            Use the password you just created to access your dashboard
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href={`/${slug}`}
            className="inline-flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-700 px-8 py-4 text-base font-semibold hover:border-purple-600 hover:text-purple-600 transition-colors"
          >
            View My Booking Page
          </Link>
          <Link
            href={`/dashboard/${slug}`}
            className="inline-flex items-center justify-center rounded-full bg-purple-600 text-white px-8 py-4 text-base font-semibold hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/25"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Share Instructions */}
        <div className="mt-8 pt-8 border-t-2 border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Next Steps:</h3>
          <ul className="text-left text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">1.</span>
              <span>Share your booking link with customers via social media, email, or text</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">2.</span>
              <span>Use your password to access your dashboard and view appointments</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">3.</span>
              <span>Check your dashboard regularly to see new bookings</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  )
}
