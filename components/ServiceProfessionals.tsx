import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Scissors, Stethoscope, Dumbbell, Sparkles, Briefcase, Users } from 'lucide-react'

const professionals = [
  {
    icon: Scissors,
    title: 'Barbers & Hair Salons',
    description: 'Let clients book haircuts, styling, and grooming services 24/7',
    image: 'https://images.unsplash.com/photo-1768363446104-b8a0c1716600?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJiZXIlMjBjdXR0aW5nJTIwaGFpciUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzIzODgwNzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Stethoscope,
    title: 'Dentists & Medical',
    description: 'Streamline patient appointments with automated reminders',
    image: 'https://images.unsplash.com/photo-1762625570087-6d98fca29531?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBjbGluaWMlMjBtb2Rlcm4lMjBvZmZpY2V8ZW58MXx8fHwxNzcyNDM3Mjk3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Dumbbell,
    title: 'Personal Trainers',
    description: 'Schedule training sessions and manage client workouts',
    image: 'https://images.unsplash.com/photo-1738523686787-7bdf0e63c8f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbCUyMHRyYWluZXIlMjB3b3Jrb3V0JTIwc2Vzc2lvbnxlbnwxfHx8fDE3NzI0MzcyOTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    color: 'from-green-500 to-teal-500',
  },
  {
    icon: Sparkles,
    title: 'Spas & Wellness',
    description: 'Book massages, treatments, and wellness appointments',
    image: 'https://images.unsplash.com/photo-1745327883508-b6cd32e5dde5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBtYXNzYWdlJTIwdGhlcmFweSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzI0MzcyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Briefcase,
    title: 'Consultants & Coaches',
    description: 'Manage client consultations and coaching sessions',
    image: 'https://images.unsplash.com/photo-1556745753-b2904692b3cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGN1c3RvbWVyJTIwc2VydmljZSUyMGV4cGVyaWVuY2V8ZW58MXx8fHwxNzcyNDM3Mjk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Users,
    title: 'And Many More',
    description: 'Tutors, photographers, therapists, and any service business',
    image: 'https://images.unsplash.com/photo-1556745753-b2904692b3cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGN1c3RvbWVyJTIwc2VydmljZSUyMGV4cGVyaWVuY2V8ZW58MXx8fHwxNzcyNDM3Mjk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    color: 'from-rose-500 to-red-500',
  },
]

export function ServiceProfessionals() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
            Built for service <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">professionals</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of professionals who trust us with their bookings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {professionals.map((professional, index) => {
            const Icon = professional.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={professional.image}
                      alt={professional.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${professional.color} mb-3`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      {professional.title}
                    </h3>
                    <p className="text-gray-200 text-sm">
                      {professional.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
