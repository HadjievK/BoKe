'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles, Check, Mail, Lock, User, Building2, Phone, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { registerProvider } from '@/lib/api'
import type { OnboardingData } from '@/lib/types'
import ReCAPTCHA from 'react-google-recaptcha'

const SERVICE_TYPES = [
  'Barber',
  'Dentist',
  'Nail Artist',
  'Massage Therapist',
  'Personal Trainer',
  'Hair Stylist',
  'Beautician',
  'Tattoo Artist',
  'Physical Therapist',
  'Yoga Instructor',
  'Other',
]

const WORKING_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

interface FormData {
  businessName: string
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  serviceType: string
  location: string
  workingDays: string[]
  calendarStartTime: string
  calendarEndTime: string
}

export default function GetStartedPage() {
  const router = useRouter()
  const [step, setStep] = useState<'info' | 'services' | 'schedule'>('info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    serviceType: '',
    location: '',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    calendarStartTime: '09:00',
    calendarEndTime: '18:00',
  })

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleWorkingDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }))
  }

  const validateStep = () => {
    if (step === 'info') {
      if (!formData.businessName.trim()) {
        setError('Business name is required')
        return false
      }
      if (!formData.name.trim()) {
        setError('Your name is required')
        return false
      }
      if (!formData.email.includes('@')) {
        setError('Valid email is required')
        return false
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
    } else if (step === 'services') {
      if (!formData.serviceType) {
        setError('Please select a service type')
        return false
      }
      if (!formData.location.trim()) {
        setError('Location is required')
        return false
      }
    } else if (step === 'schedule') {
      if (formData.workingDays.length === 0) {
        setError('Select at least one working day')
        return false
      }
      if (!recaptchaToken) {
        setError('Please complete the reCAPTCHA')
        return false
      }
    }
    setError('')
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return

    if (step === 'info') {
      setStep('services')
    } else if (step === 'services') {
      setStep('schedule')
    }
  }

  const handleBack = () => {
    setError('')
    if (step === 'services') {
      setStep('info')
    } else if (step === 'schedule') {
      setStep('services')
    }
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    setLoading(true)
    setError('')

    try {
      const onboardingData: OnboardingData = {
        business_name: formData.businessName,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        service_type: formData.serviceType,
        location: formData.location,
        services: [], // Will be set up in dashboard
      }

      const response = await registerProvider(onboardingData)

      // Store token
      localStorage.setItem('auth_token', response.token)

      // Redirect to dashboard
      router.push(`/dashboard/${response.provider.slug}`)
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
      setLoading(false)
    }
  }

  const stepProgress = step === 'info' ? 33 : step === 'services' ? 66 : 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-200 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-96 h-96 bg-blue-200 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-20 left-1/3 w-80 h-80 bg-pink-200 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30"
          animate={{
            x: [0, 50, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">BuKe</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Step {step === 'info' ? '1' : step === 'services' ? '2' : '3'} of 3
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {stepProgress}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${stepProgress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Card */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-8 sm:p-12">
              {/* Step header */}
              <div className="mb-8">
                <motion.h1
                  key={step}
                  className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {step === 'info' && 'Create Your Account'}
                  {step === 'services' && 'Business Details'}
                  {step === 'schedule' && 'Set Your Schedule'}
                </motion.h1>
                <motion.p
                  key={`${step}-desc`}
                  className="text-gray-600 dark:text-gray-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {step === 'info' && 'Start your journey with BuKe'}
                  {step === 'services' && 'Tell us about your business'}
                  {step === 'schedule' && 'When are you available?'}
                </motion.p>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form content */}
              <AnimatePresence mode="wait">
                {step === 'info' && (
                  <motion.div
                    key="info"
                    className="space-y-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Building2 className="inline h-4 w-4 mr-1" />
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => updateFormData('businessName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                        placeholder="John's Barber Shop"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <User className="inline h-4 w-4 mr-1" />
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                        placeholder="John Smith"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Mail className="inline h-4 w-4 mr-1" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Phone className="inline h-4 w-4 mr-1" />
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Lock className="inline h-4 w-4 mr-1" />
                        Password
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                        placeholder="At least 8 characters"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Lock className="inline h-4 w-4 mr-1" />
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                        placeholder="Repeat your password"
                      />
                    </div>
                  </motion.div>
                )}

                {step === 'services' && (
                  <motion.div
                    key="services"
                    className="space-y-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Service Type
                      </label>
                      <select
                        value={formData.serviceType}
                        onChange={(e) => updateFormData('serviceType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                      >
                        <option value="">Select a service type</option>
                        {SERVICE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => updateFormData('location', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                        placeholder="123 Main St, City, State"
                      />
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                      <div className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-1">
                            You'll customize your services later
                          </p>
                          <p className="text-sm text-purple-700 dark:text-purple-400">
                            After registration, you can add specific services, pricing, and durations in your dashboard.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 'schedule' && (
                  <motion.div
                    key="schedule"
                    className="space-y-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Working Days
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {WORKING_DAYS.map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleWorkingDay(day)}
                            className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                              formData.workingDays.includes(day)
                                ? 'bg-purple-600 border-purple-600 text-white'
                                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                            }`}
                          >
                            {day.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={formData.calendarStartTime}
                          onChange={(e) => updateFormData('calendarStartTime', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={formData.calendarEndTime}
                          onChange={(e) => updateFormData('calendarEndTime', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                        onChange={(token) => setRecaptchaToken(token)}
                        theme="light"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="mt-8 flex items-center justify-between">
                {step !== 'info' ? (
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    disabled={loading}
                    className="px-6"
                  >
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {step !== 'schedule' ? (
                  <Button
                    onClick={handleNext}
                    className="px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Get Started
                        <Sparkles className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Sign in link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link
                    href="/"
                    className="font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-3">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Easy Scheduling
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage appointments effortlessly
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-3">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Email Notifications
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatic booking confirmations
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Beautiful Pages
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Professional booking pages
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
