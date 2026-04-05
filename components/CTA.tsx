'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Button } from './ui/button'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

interface CTAProps {
  onGetStarted?: () => void
}

export function CTA({ onGetStarted }: CTAProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />

      {/* Animated circles */}
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Ready to transform your bookings?
          </h2>
          <p className="text-xl sm:text-2xl mb-12 text-indigo-100 max-w-2xl mx-auto">
            Join thousands of professionals who have simplified their scheduling
          </p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              size="lg"
              onClick={onGetStarted}
              className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-6 text-lg group shadow-xl"
            >
              Start Your Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Watch Demo
            </Button>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 text-indigo-100"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Setup in 60 seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Just 4.99/month</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
