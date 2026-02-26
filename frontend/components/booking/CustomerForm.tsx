import { useState } from 'react'
import type { Customer } from '@/lib/types'
import { validateEmail, validatePhone } from '@/lib/utils'

interface CustomerFormProps {
  onSubmit: (customer: Customer) => void
  loading?: boolean
}

export default function CustomerForm({ onSubmit, loading }: CustomerFormProps) {
  const [formData, setFormData] = useState<Customer>({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  })
  const [errors, setErrors] = useState<Partial<Record<keyof Customer, string>>>({})

  const validate = () => {
    const newErrors: Partial<Record<keyof Customer, string>> = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Invalid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  const handleChange = (field: keyof Customer, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">First Name *</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
            className={`input-field ${errors.first_name ? 'border-red-500' : ''}`}
            placeholder="John"
          />
          {errors.first_name && (
            <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Last Name *</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => handleChange('last_name', e.target.value)}
            className={`input-field ${errors.last_name ? 'border-red-500' : ''}`}
            placeholder="Doe"
          />
          {errors.last_name && (
            <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={`input-field ${errors.email ? 'border-red-500' : ''}`}
          placeholder="john@example.com"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Phone *</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
          placeholder="+1 (555) 123-4567"
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? 'Booking...' : 'Confirm Booking'}
      </button>
    </form>
  )
}
