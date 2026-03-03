'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { registerProvider } from '@/lib/api'
import type { OnboardingData } from '@/lib/types'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles, Check, Calendar, Zap, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '@/lib/animations'
import { ServiceProfessionals } from '@/components/ServiceProfessionals'
import { BookingDemo } from '@/components/BookingDemo'
import { Features } from '@/components/Features'
import { HowItWorks } from '@/components/HowItWorks'
import { CTA } from '@/components/CTA'
import ThemeToggle from '@/components/ThemeToggle'
import ReCAPTCHA from 'react-google-recaptcha'

const SERVICE_CATEGORIES = [
  'Barbers',
  'Dentists',
  'Nail Artists',
  'Trainers',
  'Massage Therapists',
  'Hair Stylists',
  'Personal Trainers',
  'Beauty Specialists',
]

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

interface Service {
  name: string
  duration: number
  price: number
  icon: string
  description?: string
}

export default function Home() {
  const router = useRouter()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  // Form state
  const [serviceType, setServiceType] = useState('')
  const [customServiceType, setCustomServiceType] = useState('')
  const [isOver18, setIsOver18] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [location, setLocation] = useState('')
  const [latitude, setLatitude] = useState<number | undefined>()
  const [longitude, setLongitude] = useState<number | undefined>()
  const [bio, setBio] = useState('')
  const [services, setServices] = useState<Service[]>([
    { name: 'Classic Cut', duration: 30, price: 35, icon: '✂️' },
    { name: 'Fade', duration: 45, price: 45, icon: '✂️' },
    { name: 'Beard Trim', duration: 20, price: 25, icon: '💈' }
  ])

  const updateService = (index: number, field: keyof Service, value: string | number) => {
    const updated = [...services]
    updated[index] = { ...updated[index], [field]: value }
    setServices(updated)
  }

  const removeService = (index: number) => {
    if (services.length <= 1) {
      setError('You must have at least one service')
      return
    }
    setServices(services.filter((_, i) => i !== index))
    setError('') // Clear error when successfully removing
  }

  const addService = () => {
    setServices([...services, { name: '', duration: 30, price: 0, icon: '✂️' }])
  }

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token)
    setCaptchaVerified(!!token)
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    // Validate 18+ confirmation
    if (!isOver18) {
      setError('You must confirm that you are 18 years or older')
      setLoading(false)
      return
    }

    // Validate CAPTCHA
    if (!captchaVerified) {
      setError('Please complete the CAPTCHA verification')
      setLoading(false)
      return
    }

    // Validate service type
    const finalServiceType = serviceType === 'Other' && customServiceType
      ? customServiceType
      : serviceType

    if (!finalServiceType) {
      setError('Please select or enter a service type')
      setLoading(false)
      return
    }

    // Validate at least one service
    if (services.length === 0) {
      setError('You must add at least one service')
      setLoading(false)
      return
    }

    // Validate all services have required fields
    const invalidService = services.find(s => !s.name || !s.duration || !s.price)
    if (invalidService) {
      setError('All services must have a name, duration, and price')
      setLoading(false)
      return
    }

    try {
      const data: OnboardingData = {
        name,
        business_name: businessName,
        service_type: finalServiceType,
        email,
        phone,
        password,
        location,
        latitude,
        longitude,
        bio,
        services
      }

      const response = await registerProvider(data)
      router.push(`/success?slug=${response.slug}&dashboard=${response.dashboard_url}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  if (!showOnboarding) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900" style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-6xl">
            <motion.a
              href="/"
              className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
              whileHover={{ scale: 1.05 }}
            >
              Bu<span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Ke</span>
            </motion.a>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <a href="/signin" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Sign in
              </a>
              <Button
                onClick={() => setShowOnboarding(true)}
                size="sm"
              >
                Get started free
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          {/* Animated Gradient Blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-0 -right-48 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-400/30 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                x: [0, 50, 0],
                y: [0, 30, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-400/30 to-pink-400/30 blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3],
                x: [0, -50, 0],
                y: [0, -30, 0]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-white pointer-events-none" />

          <div className="container mx-auto px-6 max-w-6xl relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left column */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.h1
                  className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6 text-gray-900 dark:text-white"
                  variants={staggerItem}
                >
                  Your booking page.<br />
                  Ready{" "}
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    in 1 minute
                  </span>
                </motion.h1>

                <motion.p
                  className="text-lg text-gray-600 dark:text-gray-300 max-w-md mb-6 leading-relaxed"
                  variants={staggerItem}
                >
                  BuKe gives barbers, dentists, nail artists, and trainers a beautiful booking page — no code, no hassle. Your clients book. You earn.
                </motion.p>

                {/* Sliding text animation */}
                <motion.div
                  className="relative overflow-hidden h-12 mb-10"
                  variants={staggerItem}
                >
                  <div className="absolute inset-0 flex items-center">
                    <motion.div
                      className="flex gap-8 whitespace-nowrap"
                      animate={{
                        x: [0, -1000],
                      }}
                      transition={{
                        x: {
                          repeat: Infinity,
                          repeatType: "loop",
                          duration: 20,
                          ease: "linear",
                        },
                      }}
                    >
                      {/* Duplicate the array twice for seamless loop */}
                      {[...SERVICE_CATEGORIES, ...SERVICE_CATEGORIES].map((category, index) => (
                        <span
                          key={index}
                          className="text-lg font-medium bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                        >
                          {category}
                        </span>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex flex-wrap gap-4"
                  variants={staggerItem}
                >
                  <Button
                    onClick={() => setShowOnboarding(true)}
                    size="lg"
                    className="group"
                  >
                    Create your page
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    See how it works
                  </Button>
                </motion.div>
              </motion.div>

              {/* Right column — Dashboard Mockup */}
              <motion.div
                className="relative hidden lg:block"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="relative">
                  <DashboardMockup />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Booking Demo Section */}
        <section className="py-24 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mb-4 block">
                See it in action
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                From booking to{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  confirmation
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Watch how seamlessly your clients book appointments while you stay in control
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={scaleIn}
            >
              <BookingDemo />
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <Features />

        {/* How It Works */}
        <HowItWorks />

        {/* Service Professionals Section */}
        <ServiceProfessionals />

        {/* CTA Section */}
        <CTA onGetStarted={() => setShowOnboarding(true)} />

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-gray-50/50 py-12">
          <div className="container mx-auto px-6 max-w-6xl text-center">
            <p className="text-2xl font-bold mb-4 text-gray-900">
              Bu<span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Ke</span>
            </p>
            <p className="text-sm text-gray-600">
              © 2026 BuKe. Simple booking for service professionals.
            </p>
          </div>
        </footer>
      </div>
    )
  }

  // Onboarding Form
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white py-20"
      style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl"
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
      </div>

      <div className="container mx-auto px-6 max-w-2xl relative">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => setShowOnboarding(false)}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4 font-medium transition-colors"
          >
            ← Back to home
          </button>
          <h1 className="text-4xl font-bold text-gray-900">
            Create Your <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Page</span>
          </h1>
          <p className="text-gray-600 mt-2">Get your booking page live in 5 minutes</p>
        </motion.div>

        <motion.div
          className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Service Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">Service Type</label>
            <select
              value={serviceType}
              onChange={(e) => {
                setServiceType(e.target.value)
                if (e.target.value !== 'Other') {
                  setCustomServiceType('')
                }
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 transition"
            >
              <option value="">Select a service type...</option>
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {serviceType === 'Other' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <input
                  type="text"
                  value={customServiceType}
                  onChange={(e) => setCustomServiceType(e.target.value)}
                  placeholder="Enter your service type..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 transition"
                />
              </motion.div>
            )}
          </motion.div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="John's Cuts"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 0192"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Brooklyn, NY"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">Bio (Optional)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell clients about yourself..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10 transition resize-none"
            />
          </div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-sm font-semibold mb-3 text-gray-900">
              Services <span className="text-red-500">*</span>
              <span className="text-xs text-gray-600 font-normal ml-2">(At least one required)</span>
            </label>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {services.map((service, index) => (
                  <motion.div
                    key={index}
                    className="flex gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                    layout
                  >
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) => updateService(index, 'name', e.target.value)}
                      placeholder="Service name"
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 transition"
                    />
                    <input
                      type="number"
                      value={service.duration}
                      onChange={(e) => updateService(index, 'duration', parseInt(e.target.value))}
                      placeholder="Duration"
                      className="w-24 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 transition"
                    />
                    <input
                      type="number"
                      value={service.price}
                      onChange={(e) => updateService(index, 'price', parseFloat(e.target.value))}
                      placeholder="Price"
                      className="w-24 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 transition"
                    />
                    <motion.button
                      onClick={() => removeService(index)}
                      disabled={services.length === 1}
                      className={`px-4 py-3 rounded-xl border border-gray-200 transition ${
                        services.length === 1
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-50'
                      }`}
                      title={services.length === 1 ? 'Cannot remove the last service' : 'Remove service'}
                      whileHover={services.length > 1 ? { scale: 1.1 } : {}}
                      whileTap={services.length > 1 ? { scale: 0.9 } : {}}
                    >
                      🗑️
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <motion.button
                onClick={addService}
                className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-600 transition text-sm font-medium text-gray-700 hover:text-indigo-600"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                + Add Service
              </motion.button>
            </div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <Alert variant="error" animated>
                {error}
              </Alert>
            )}
          </AnimatePresence>

          {/* 18+ Confirmation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
          >
            <input
              type="checkbox"
              id="age-confirm"
              checked={isOver18}
              onChange={(e) => setIsOver18(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 focus:ring-2 cursor-pointer"
            />
            <label htmlFor="age-confirm" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              I confirm that I am <strong>18 years of age or older</strong> and agree to the Terms of Service and Privacy Policy.
            </label>
          </motion.div>

          {/* Google reCAPTCHA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
              onChange={handleCaptchaChange}
              theme="light"
            />
          </motion.div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full group"
            size="lg"
          >
            {loading ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block mr-2"
                >
                  ⏳
                </motion.span>
                Creating your page...
              </>
            ) : (
              <>
                Create My Page
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

const DashboardMockup = () => {
  const today = new Date()
  const currentMonth = today.toLocaleString('default', { month: 'long' })
  const currentYear = today.getFullYear()

  // Get days in current month
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay()

  // Example appointments on specific days
  const appointments = {
    8: [{ time: "9:00 AM", client: "Sarah M.", service: "Haircut" }],
    12: [
      { time: "10:00 AM", client: "John D.", service: "Fade" },
      { time: "2:00 PM", client: "Mike R.", service: "Beard Trim" }
    ],
    15: [{ time: "11:30 AM", client: "Emma W.", service: "Color" }],
    20: [
      { time: "9:30 AM", client: "Alex P.", service: "Haircut" },
      { time: "1:00 PM", client: "Chris L.", service: "Style" }
    ],
    23: [{ time: "3:00 PM", client: "Lisa K.", service: "Treatment" }],
  }

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  return (
    <div className="rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg ml-auto bg-white dark:bg-gray-800">
      {/* Calendar Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{currentMonth} {currentYear}</h3>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const hasAppointments = day && appointments[day as keyof typeof appointments]
            const isToday = day === today.getDate()

            return (
              <div
                key={index}
                className={`
                  aspect-square flex items-center justify-center rounded-lg text-sm font-medium
                  ${!day ? 'invisible' : ''}
                  ${isToday ? 'bg-indigo-600 text-white' : ''}
                  ${hasAppointments && !isToday ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-600' : ''}
                  ${!hasAppointments && !isToday ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                  transition-colors cursor-pointer relative
                `}
              >
                {day}
                {hasAppointments && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-current" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming appointments */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Upcoming Appointments</h4>
        <div className="space-y-2">
          {[
            { date: "Today", time: "2:00 PM", client: "Mike R.", service: "Beard Trim", color: "indigo" },
            { date: "Mar 15", time: "11:30 AM", client: "Emma W.", service: "Color", color: "purple" },
            { date: "Mar 20", time: "9:30 AM", client: "Alex P.", service: "Haircut", color: "purple" },
          ].map((apt, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full bg-${apt.color}-600`} />
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{apt.client}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{apt.date} · {apt.time}</div>
                </div>
              </div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{apt.service}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
