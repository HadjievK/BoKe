'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Lock, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { successAnimation, staggerContainer, staggerItem } from '@/lib/animations'

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
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4" style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-red-500 dark:text-red-400 mb-4">Invalid success page parameters</p>
          <Button asChild>
            <Link href="/">
              Go Home
            </Link>
          </Button>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative overflow-hidden" style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 dark:from-indigo-600/20 dark:to-purple-600/20 blur-3xl"
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
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-400/20 to-pink-400/20 dark:from-purple-600/20 dark:to-pink-600/20 blur-3xl"
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

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 max-w-2xl w-full text-center relative z-10"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Success Icon with animation */}
        <motion.div
          className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
          variants={successAnimation}
        >
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </motion.div>

        <motion.h1
          className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          variants={staggerItem}
        >
          🎉 You're All Set!
        </motion.h1>

        <motion.p
          className="text-lg text-gray-600 dark:text-gray-300 mb-8"
          variants={staggerItem}
        >
          Your booking page is live and ready to accept appointments
        </motion.p>

        {/* Public URL */}
        <motion.div
          className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6 border-2 border-indigo-200 dark:border-indigo-800"
          variants={staggerItem}
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Your Public Booking Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={publicUrl}
              readOnly
              className="flex-1 px-4 py-3 rounded-xl border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none font-mono text-sm"
            />
            <Button
              onClick={copyToClipboard}
              className="whitespace-nowrap"
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </Button>
          </div>
        </motion.div>

        {/* Password Reminder */}
        <motion.div
          className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6 mb-8"
          variants={staggerItem}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <label className="text-sm font-medium text-gray-900 dark:text-white">Dashboard Access</label>
          </div>
          <div className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
            Password Created ✓
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Use the password you just created to access your dashboard
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="grid md:grid-cols-2 gap-4"
          variants={staggerItem}
        >
          <Button
            variant="outline"
            size="lg"
            asChild
          >
            <Link href={`/${slug}`}>
              View My Booking Page
            </Link>
          </Button>
          <Button
            size="lg"
            asChild
            className="group"
          >
            <Link href={`/dashboard/${slug}`}>
              Go to Dashboard
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        {/* Share Instructions */}
        <motion.div
          className="mt-8 pt-8 border-t-2 border-gray-200 dark:border-gray-700"
          variants={staggerItem}
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Next Steps:</h3>
          <ul className="text-left text-sm text-gray-600 dark:text-gray-300 space-y-2">
            {[
              'Share your booking link with customers via social media, email, or text',
              'Use your password to access your dashboard and view appointments',
              'Check your dashboard regularly to see new bookings'
            ].map((step, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <span>{step}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <motion.div
            className="w-12 h-12 mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <div className="rounded-full h-12 w-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600"></div>
          </motion.div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  )
}
