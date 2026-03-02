'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { registerProvider } from '@/lib/api'
import type { OnboardingData } from '@/lib/types'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles, Check, Calendar, Zap, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '@/lib/animations'
import { ServiceProfessionals } from '@/components/ServiceProfessionals'
import { BookingDemo } from '@/components/BookingDemo'
import { Features } from '@/components/Features'

const SERVICE_PILLS = [
  { emoji: '✂️', label: 'Barbers' },
  { emoji: '🦷', label: 'Dentists' },
  { emoji: '💅', label: 'Nail Artists' },
  { emoji: '💪', label: 'Trainers' },
  { emoji: '💆', label: 'Massage' },
]

const SERVICE_TYPES = [
  { value: 'barber', label: 'Barber', icon: '✂️' },
  { value: 'dentist', label: 'Dentist', icon: '🦷' },
  { value: 'nail_artist', label: 'Nail Artist', icon: '💅' },
  { value: 'massage', label: 'Massage', icon: '💆' },
  { value: 'trainer', label: 'Trainer', icon: '💪' },
  { value: 'other', label: 'Other', icon: '✨' },
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

  // Form state
  const [serviceType, setServiceType] = useState('barber')
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

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

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
        service_type: serviceType,
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
      <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-6xl">
            <motion.a
              href="/"
              className="text-2xl font-bold tracking-tight text-gray-900"
              whileHover={{ scale: 1.05 }}
            >
              Bu<span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Ke</span>
            </motion.a>
            <div className="flex items-center gap-4">
              <a href="/signin" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
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
                <motion.div variants={staggerItem}>
                  <Badge className="inline-flex items-center gap-2 mb-6">
                    <Sparkles className="w-4 h-4" />
                    Trusted by 3,200+ professionals
                  </Badge>
                </motion.div>

                <motion.h1
                  className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6 text-gray-900"
                  variants={staggerItem}
                >
                  Your booking page.<br />
                  Ready{" "}
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    in 1 minute
                  </span>
                </motion.h1>

                <motion.p
                  className="text-lg text-gray-600 max-w-md mb-6 leading-relaxed"
                  variants={staggerItem}
                >
                  BuKe gives barbers, dentists, nail artists, and trainers a beautiful booking page — no code, no hassle. Your clients book. You earn.
                </motion.p>

                <motion.div
                  className="flex flex-col gap-3 mb-10"
                  variants={staggerItem}
                >
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-5 h-5 text-indigo-600" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-5 h-5 text-indigo-600" />
                    <span>Free forever plan</span>
                  </div>
                </motion.div>

                <motion.div
                  className="flex flex-wrap gap-2 mb-10"
                  variants={staggerItem}
                >
                  {SERVICE_PILLS.map((pill, index) => (
                    <motion.span
                      key={pill.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-default"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {pill.emoji} {pill.label}
                    </motion.span>
                  ))}
                  <motion.span
                    className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500 shadow-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1 }}
                  >
                    + more
                  </motion.span>
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

        {/* Stats Bar */}
        <section className="border-y border-gray-200 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/50">
          <div className="container mx-auto px-6 py-12 max-w-6xl">
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {[
                { value: "3.2k+", label: "Active professionals" },
                { value: "89k", label: "Bookings processed" },
                { value: "4.9★", label: "Average rating" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  variants={staggerItem}
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Booking Demo Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <span className="text-sm font-semibold text-indigo-600 tracking-wider uppercase mb-4 block">
                See it in action
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                From booking to{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  confirmation
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
        <section id="how-it-works" className="py-24 bg-white">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <span className="text-sm font-semibold text-indigo-600 tracking-wider uppercase">
                How it works
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold mt-4 text-gray-900">
                Up and running in{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  three steps
                </span>
              </h2>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {[
                {
                  number: "01",
                  icon: Calendar,
                  title: "Create your profile",
                  description: "Tell us your name, business type, services, and location. Takes under 5 minutes — no technical knowledge needed.",
                },
                {
                  number: "02",
                  icon: Share2,
                  title: "Share your link",
                  description: "You get a personal booking page instantly. Share it on Instagram, WhatsApp, or anywhere your clients are.",
                },
                {
                  number: "03",
                  icon: Zap,
                  title: "Clients book & you manage",
                  description: "Clients pick their slot. You see everything in your dashboard. Reminders sent automatically. You focus on your craft.",
                },
              ].map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={step.number}
                    className="relative rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-xl hover:border-indigo-200 transition-all group"
                    variants={staggerItem}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <span className="text-xs font-bold text-indigo-600 tracking-widest">
                      {step.number}
                    </span>
                    <div className="my-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* Service Professionals Section */}
        <ServiceProfessionals />

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-b from-white to-indigo-50/30">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-12 sm:p-16 text-center shadow-2xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              {/* Animated floating circles */}
              <motion.div
                className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm"
                animate={{
                  y: [0, -20, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm"
                animate={{
                  y: [0, 20, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm"
                animate={{
                  y: [0, -15, 0],
                  x: [0, 10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />

              <div className="relative z-10">
                <motion.h2
                  className="text-3xl sm:text-5xl font-bold mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Ready to get <span className="text-indigo-200">booked?</span>
                </motion.h2>
                <motion.p
                  className="text-indigo-100 text-lg mb-8 max-w-md mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Join thousands of professionals already growing their business with BuKe.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    onClick={() => setShowOnboarding(true)}
                    size="lg"
                    className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl hover:shadow-2xl group"
                  >
                    Create your free page
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

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
            <label className="block text-sm font-semibold mb-3 text-gray-900">Service Type</label>
            <div className="grid grid-cols-3 gap-3">
              {SERVICE_TYPES.map((type, index) => (
                <motion.button
                  key={type.value}
                  onClick={() => setServiceType(type.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    serviceType === type.value
                      ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{type.label}</div>
                </motion.button>
              ))}
            </div>
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
              <motion.div
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

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

const DashboardMockup = () => (
  <div className="rounded-3xl shadow-2xl border border-gray-200 p-6 max-w-md ml-auto bg-white">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700">
          K
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">King&apos;s Cuts</p>
          <p className="text-xs text-gray-600">buke.app/kingcuts</p>
        </div>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
        <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
        Live
      </span>
    </div>

    <div className="grid grid-cols-3 gap-3 mb-6">
      {[
        { value: "7", label: "Today" },
        { value: "$486", label: "Revenue" },
        { value: "4.9★", label: "Rating" }
      ].map((stat) => (
        <div key={stat.label} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center">
          <p className="text-xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-xs text-gray-600">{stat.label}</p>
        </div>
      ))}
    </div>

    <div className="space-y-2">
      {[
        { time: "9:00", name: "Marcus W. — Fade", price: "$45" },
        { time: "10:30", name: "Jordan L. — Cut", price: "$35" },
        { time: "12:00", name: "Andre T. — Trim", price: "$25" }
      ].map((apt) => (
        <div key={apt.time} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-900">{apt.time}</span>
            <span className="text-sm text-gray-600">{apt.name}</span>
          </div>
          <span className="text-sm font-semibold text-purple-600">{apt.price}</span>
        </div>
      ))}
    </div>
  </div>
)
