'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Calendar, Zap, Palette, Share2, BarChart3, Lock } from 'lucide-react'
import { Card } from './ui/card'

const features = [
  {
    icon: Zap,
    title: 'Setup in 1 Minute',
    description: 'Create your professional booking page faster than making coffee. No technical skills required.',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Palette,
    title: 'Beautiful Design',
    description: 'Choose from stunning templates that make your business look professional and trustworthy.',
    gradient: 'from-pink-500 to-purple-500',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Automatic calendar sync, timezone detection, and intelligent booking management.',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Share2,
    title: 'Share Anywhere',
    description: 'Get a custom link to share on social media, email, or embed on your website.',
    gradient: 'from-green-500 to-teal-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics Included',
    description: 'Track bookings, popular times, and customer insights to grow your business.',
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    icon: Lock,
    title: 'Secure & Reliable',
    description: 'Bank-level security with 99.9% uptime. Your data and your clients are protected.',
    gradient: 'from-red-500 to-pink-500',
  },
]

export function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              get booked
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features that help you manage appointments effortlessly
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="p-8 h-full hover:shadow-xl transition-shadow duration-300 border-gray-100 group">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
