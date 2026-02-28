'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/api'
import { signIn as nextAuthSignIn } from 'next-auth/react'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await signIn(email, password)
      // Token is automatically stored by signIn function
      // Redirect to dashboard
      router.push(`/dashboard/${data.slug}`)
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await nextAuthSignIn('google', { callbackUrl: '/dashboard' })
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google')
      setGoogleLoading(false)
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

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(28,24,18,0.12)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#6B6455]">or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full bg-white border-2 border-[rgba(28,24,18,0.12)] text-[#1C1812] py-3 rounded-lg font-semibold hover:bg-[#F5F0E8] hover:border-[#C9993A] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>

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
