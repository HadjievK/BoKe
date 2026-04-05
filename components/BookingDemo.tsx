'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, User, Check, Smartphone, Monitor } from 'lucide-react'
import { Card } from './ui/card'

export function BookingDemo() {
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  // Animation sequence
  useEffect(() => {
    if (!isPlaying) return

    const timings = [3000, 2000, 2000, 2000, 3000] // Duration for each step
    const timer = setTimeout(() => {
      setStep((prev) => (prev + 1) % 5)
    }, timings[step])

    return () => clearTimeout(timer)
  }, [step, isPlaying])

  const bookingData = {
    service: 'Haircut & Styling',
    date: '5 March 2026',
    time: '14:00',
    customer: 'Alex Johnson',
    professional: 'Sarah\'s Salon',
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Control buttons */}
      <div className="absolute -top-12 right-0 z-20 flex gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 bg-white rounded-lg shadow-md text-sm hover:bg-gray-50 transition-colors"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => setStep(0)}
          className="px-4 py-2 bg-white rounded-lg shadow-md text-sm hover:bg-gray-50 transition-colors"
        >
          Restart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left side - Customer Phone */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-600">Customer View</span>
          </div>

          {/* Phone mockup */}
          <div className="relative mx-auto w-[320px]">
            {/* Phone frame */}
            <div className="relative bg-gray-900 rounded-[3rem] p-4 shadow-2xl">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-10" />

              {/* Screen */}
              <div className="bg-white rounded-[2.5rem] overflow-hidden h-[600px] relative">
                <AnimatePresence mode="wait">
                  {/* Step 0-1: Booking Form */}
                  {(step === 0 || step === 1) && (
                    <motion.div
                      key="booking-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 h-full overflow-auto"
                    >
                      {/* Header */}
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">{bookingData.professional}</h3>
                        <p className="text-sm text-gray-500">Book an appointment</p>
                      </div>

                      {/* Service Selection */}
                      <div className="mb-4">
                        <label className="text-xs font-medium text-gray-600 mb-2 block">Select Service</label>
                        <motion.div
                          className="p-4 border-2 border-indigo-600 rounded-xl bg-indigo-50"
                          initial={{ borderColor: '#e5e7eb' }}
                          animate={step >= 1 ? { borderColor: '#4f46e5' } : {}}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm font-medium">{bookingData.service}</div>
                              <div className="text-xs text-gray-500">45 min • $50</div>
                            </div>
                            {step >= 1 && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center"
                              >
                                <Check className="w-4 h-4 text-white" />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      </div>

                      {/* Date Selection */}
                      <div className="mb-4">
                        <label className="text-xs font-medium text-gray-600 mb-2 block">Select Date</label>
                        <motion.div
                          className="p-4 border-2 rounded-xl"
                          initial={{ borderColor: '#e5e7eb', backgroundColor: '#fff' }}
                          animate={step >= 1 ? {
                            borderColor: '#4f46e5',
                            backgroundColor: '#eef2ff'
                          } : {}}
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <span className="text-sm">{bookingData.date}</span>
                          </div>
                        </motion.div>
                      </div>

                      {/* Time Selection */}
                      <div className="mb-4">
                        <label className="text-xs font-medium text-gray-600 mb-2 block">Select Time</label>
                        <motion.div
                          className="p-4 border-2 rounded-xl"
                          initial={{ borderColor: '#e5e7eb', backgroundColor: '#fff' }}
                          animate={step >= 1 ? {
                            borderColor: '#4f46e5',
                            backgroundColor: '#eef2ff'
                          } : {}}
                        >
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <span className="text-sm">{bookingData.time}</span>
                          </div>
                        </motion.div>
                      </div>

                      {/* Name Input */}
                      <div className="mb-6">
                        <label className="text-xs font-medium text-gray-600 mb-2 block">Your Name</label>
                        <motion.div
                          className="p-4 border-2 rounded-xl"
                          initial={{ borderColor: '#e5e7eb', backgroundColor: '#fff' }}
                          animate={step >= 1 ? {
                            borderColor: '#4f46e5',
                            backgroundColor: '#eef2ff'
                          } : {}}
                        >
                          <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-gray-400" />
                            <span className="text-sm">{bookingData.customer}</span>
                          </div>
                        </motion.div>
                      </div>

                      {/* Book Button */}
                      <motion.button
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg"
                        whileTap={{ scale: 0.98 }}
                        animate={step === 1 ? { scale: [1, 0.98, 1] } : {}}
                      >
                        Confirm Booking
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Step 2: Success Animation */}
                  {step === 2 && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="h-full flex flex-col items-center justify-center p-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.6 }}
                        className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6"
                      >
                        <Check className="w-12 h-12 text-white" />
                      </motion.div>
                      <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl font-bold mb-2"
                      >
                        Booking Confirmed!
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm text-gray-600 text-center"
                      >
                        You'll receive a confirmation email shortly
                      </motion.p>

                      {/* Booking details */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-6 w-full bg-gray-50 rounded-xl p-4"
                      >
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Service</span>
                            <span className="font-medium">{bookingData.service}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date</span>
                            <span className="font-medium">{bookingData.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Time</span>
                            <span className="font-medium">{bookingData.time}</span>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Step 3-4: Shown in calendar (placeholder) */}
                  {(step === 3 || step === 4) && (
                    <motion.div
                      key="calendar-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex items-center justify-center bg-indigo-50"
                    >
                      <div className="text-center px-6">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 0.5, repeat: 2 }}
                          className="inline-block mb-4"
                        >
                          <Calendar className="w-16 h-16 text-indigo-600" />
                        </motion.div>
                        <p className="text-sm text-gray-600 font-medium">
                          Adding to your calendar...
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Service Provider Calendar */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Service Provider View</span>
          </div>

          <Card className="p-6 shadow-xl border-gray-200">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">My Calendar</h3>
                <p className="text-sm text-gray-500">March 2026</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Mini Calendar Grid */}
            <div className="mb-6">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-xs text-gray-500 text-center font-medium">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {[...Array(35)].map((_, i) => {
                  const dayNum = i - 2
                  const isToday = dayNum === 5
                  const hasAppointment = dayNum === 5 && step >= 3

                  return (
                    <div
                      key={i}
                      className={`aspect-square flex items-center justify-center text-xs rounded-lg relative
                        ${dayNum < 1 || dayNum > 31 ? 'text-gray-300' : 'text-gray-700'}
                        ${isToday ? 'bg-indigo-100 font-bold' : ''}
                      `}
                    >
                      {dayNum > 0 && dayNum <= 31 && dayNum}
                      {hasAppointment && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute bottom-0.5 w-1 h-1 bg-purple-600 rounded-full"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Today's Appointments */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-3">Today's Appointments</h4>
              <div className="space-y-2">
                {/* Existing appointment */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium">Morning Consultation</span>
                    <span className="text-xs text-gray-500">10:00</span>
                  </div>
                  <p className="text-xs text-gray-500">John Smith</p>
                </div>

                {/* New appointment appears */}
                <AnimatePresence>
                  {step >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", duration: 0.6 }}
                      className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-300 relative overflow-hidden"
                    >
                      {/* Shimmer effect */}
                      {step === 3 && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                          initial={{ x: '-100%' }}
                          animate={{ x: '200%' }}
                          transition={{ duration: 1, repeat: 1 }}
                        />
                      )}

                      <div className="relative">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{bookingData.service}</span>
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3 }}
                              className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full"
                            >
                              NEW
                            </motion.span>
                          </div>
                          <span className="text-xs text-gray-600">{bookingData.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-gray-500" />
                          <p className="text-xs text-gray-600">{bookingData.customer}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Another existing appointment */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium">Color Treatment</span>
                    <span className="text-xs text-gray-500">16:30</span>
                  </div>
                  <p className="text-xs text-gray-500">Emma Davis</p>
                </div>
              </div>
            </div>

            {/* Notification badge */}
            <AnimatePresence>
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-4 p-3 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-2 font-medium"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                  >
                    <Check className="w-5 h-5" />
                  </motion.div>
                  <span>New booking received!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>

      {/* Step indicator */}
      <div className="flex justify-center gap-2 mt-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <button
            key={i}
            onClick={() => {
              setStep(i)
              setIsPlaying(false)
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              step === i ? 'bg-indigo-600 w-8' : 'bg-gray-300'
            }`}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>

      {/* Labels for each step */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600 font-medium">
          {step === 0 && 'Customer browses available services'}
          {step === 1 && 'Customer fills out booking form'}
          {step === 2 && 'Booking confirmed for customer'}
          {step === 3 && 'Appointment appears in service provider calendar'}
          {step === 4 && 'Both parties receive notifications'}
        </p>
      </div>
    </div>
  )
}
