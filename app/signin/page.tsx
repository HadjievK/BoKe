'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import pool from '@/lib/db'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Invalid credentials')
      }

      // Redirect to dashboard
      router.push(`/dashboard/${data.slug}`)
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-[60px] py-7">
        <Link href="/" className="text-[22px] font-black tracking-tight" style={{ fontFamily: 'Fraunces, serif' }}>
          Bu<span className="text-[#C9993A]">Ke</span>
        </Link>
        <div className="flex items-center gap-8">
          <Link href="/#how" className="text-sm text-[#6B6455] hover:text-[#1C1812] font-medium transition-colors">
            How it works
          </Link>
          <Link href="/#pricing" className="text-sm text-[#6B6455] hover:text-[#1C1812] font-medium transition-colors">
            Pricing
          </Link>
          <Link
            href="/"
            className="bg-[#1C1812] text-[#F5F0E8] px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#C9993A] hover:text-[#1C1812] transition-all"
          >
            Get started free →
          </Link>
        </div>
      </nav>

      {/* Sign In Form */}
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[rgba(28,24,18,0.08)]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1C1812] mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
              Welcome back
            </h1>
            <p className="text-[#6B6455]">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1C1812] mb-2">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#B8AFA3]">✉</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                  className="w-full bg-[#F5F0E8] border border-[rgba(28,24,18,0.12)] rounded-lg pl-9 pr-3.5 py-3 text-sm focus:border-[#C9993A] focus:shadow-[0_0_0_3px_rgba(201,153,58,0.1)] outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1C1812] mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#B8AFA3]">🔐</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  className="w-full bg-[#F5F0E8] border border-[rgba(28,24,18,0.12)] rounded-lg pl-9 pr-3.5 py-3 text-sm focus:border-[#C9993A] focus:shadow-[0_0_0_3px_rgba(201,153,58,0.1)] outline-none transition"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1C1812] text-[#F5F0E8] py-3 rounded-lg font-semibold hover:bg-[#C9993A] hover:text-[#1C1812] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#6B6455]">
              Don't have an account?{' '}
              <Link href="/" className="text-[#C9993A] font-semibold hover:underline">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
