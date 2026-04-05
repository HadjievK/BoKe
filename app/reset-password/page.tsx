'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Invalid Reset Link</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">This link is invalid or has expired.</p>
        <Button asChild>
          <Link href="/signin">Back to Sign In</Link>
        </Button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Reset</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Your password has been updated. You can now sign in.</p>
        <Button asChild>
          <Link href="/signin">
            Sign In
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          New password
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-3.5 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              minLength={8}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-3.5 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition"
            />
          </div>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-6">
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  )
}
