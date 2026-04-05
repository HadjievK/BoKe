'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { scaleIn, fadeInUp } from '@/lib/animations'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email) {
      setError('Please enter your email address')
      return
    }
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setForgotSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden" style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 dark:from-indigo-600/20 dark:to-purple-600/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-purple-400/20 to-pink-400/20 dark:from-purple-600/20 dark:to-pink-600/20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-[60px] py-7 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link href="/" className="text-[22px] font-bold tracking-tight text-gray-900 dark:text-white">
            Bu<span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Ke</span>
          </Link>
        </motion.div>
        <div className="flex items-center gap-8">
          <Link href="/#how-it-works" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
            How it works
          </Link>
          <Button size="sm" asChild>
            <Link href="/">
              Get started
            </Link>
          </Button>
        </div>
      </nav>

      {/* Sign In Form */}
      <div className="max-w-md mx-auto px-6 py-20 relative z-10">
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700"
          initial="hidden"
          animate="visible"
          variants={scaleIn}
        >
          {forgotMode ? (
            forgotSent ? (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                  If an account exists for <strong>{email}</strong>, we've sent a password reset link.
                </p>
                <button
                  onClick={() => { setForgotMode(false); setForgotSent(false); setError('') }}
                  className="text-indigo-600 font-semibold text-sm hover:underline"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Forgot password?</h1>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Enter your email and we'll send a reset link</p>
                </div>
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        required
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-3.5 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition"
                      />
                    </div>
                  </div>
                  <AnimatePresence>
                    {error && <Alert variant="error" animated>{error}</Alert>}
                  </AnimatePresence>
                  <Button type="submit" disabled={loading} className="w-full" size="lg">
                    {loading ? 'Sending...' : 'Send reset link'}
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <button
                    onClick={() => { setForgotMode(false); setError('') }}
                    className="text-sm text-indigo-600 font-semibold hover:underline"
                  >
                    Back to sign in
                  </button>
                </div>
              </>
            )
          ) : (
            <>
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">back</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-300">Sign in to access your dashboard</p>
              </motion.div>

              <form onSubmit={handleSignIn} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      required
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-3.5 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setForgotMode(true); setError('') }}
                      className="text-xs text-indigo-600 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      minLength={8}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-3.5 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition"
                    />
                  </div>
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <Alert variant="error" animated>
                      {error}
                    </Alert>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full group"
                    size="lg"
                  >
                    {loading ? (
                      'Signing in...'
                    ) : (
                      <>
                        Sign in
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/" className="text-indigo-600 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
