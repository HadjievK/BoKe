'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, Users, TrendingUp, Settings, LogOut, Share2,
  Sparkles, ArrowRight, CheckCircle, XCircle, AlertCircle, Plus,
  Eye, Copy, Check, Moon, Sun, Trash2, Edit2, Save, X
} from 'lucide-react'
import { getDashboardData, verifyAuth, signOut, getAppointments, updateAppointmentStatus, updateProviderProfile, updateProviderPassword } from '@/lib/api'
import type { DashboardData, AppointmentWithDetails, Service } from '@/lib/types'
import { AppointmentStatus } from '@/lib/types'
import { formatDate, formatTime, formatCurrency, getCalendarDateRange, formatDateShort } from '@/lib/utils'
import ThemeToggle from '@/components/ThemeToggle'
import AppointmentCalendar from '@/components/dashboard/AppointmentCalendar'
import AppointmentDetailsModal from '@/components/dashboard/AppointmentDetailsModal'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { View } from 'react-big-calendar'

export default function DashboardPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  // Calendar state
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [calendarView, setCalendarView] = useState<View>('week')
  const [currentDate, setCurrentDate] = useState(new Date())

  // Settings modal states
  const [showSettings, setShowSettings] = useState(false)
  const [settingsTab, setSettingsTab] = useState<'account' | 'calendar' | 'services'>('account')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [location, setLocation] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState<string>('')
  const [settingsError, setSettingsError] = useState('')
  const [settingsSaving, setSettingsSaving] = useState(false)

  // Calendar settings states
  const [calendarStartTime, setCalendarStartTime] = useState('09:00')
  const [calendarEndTime, setCalendarEndTime] = useState('17:00')
  const [slotDuration, setSlotDuration] = useState('30')
  const [bufferTime, setBufferTime] = useState('0')
  const [workingDays, setWorkingDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  })

  // Services settings states
  const [services, setServices] = useState<any[]>([])
  const [currency, setCurrency] = useState('EUR')
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null)
  const [isAddingService, setIsAddingService] = useState(false)
  const [serviceForm, setServiceForm] = useState({
    name: '',
    duration: 30,
    price: 0,
    description: '',
    icon: '',
    is_active: true
  })

  // Share modal state
  const [showShare, setShowShare] = useState(false)
  const [copied, setCopied] = useState(false)

  // Ref to track timeouts for cleanup
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const todayDate = useMemo(() => formatDateShort(new Date()), [])

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 19) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const auth = await verifyAuth()
      if (!auth.authenticated) {
        router.push('/signin')
        return
      }
      if (auth.slug !== slug) {
        router.push(`/dashboard/${auth.slug}`)
        return
      }
      setAuthenticated(true)
      await fetchDashboard()
    } catch (err: any) {
      console.error('Auth check failed:', err)
      router.push('/signin')
    } finally {
      setLoading(false)
    }
  }, [slug, router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!authenticated) return
    const interval = setInterval(() => {
      fetchDashboard(true)
    }, 60000)
    return () => clearInterval(interval)
  }, [authenticated, slug])

  useEffect(() => {
    if (showSettings && dashboardData) {
      const provider = dashboardData.provider
      setLocation(provider.location || '')
      setAvatarUrl(provider.avatar_url || '')
      setCoverPhotoUrl(provider.cover_photo_url || '')
      if (provider.calendar_start_time) {
        setCalendarStartTime(provider.calendar_start_time.slice(0, 5))
      }
      if (provider.calendar_end_time) {
        setCalendarEndTime(provider.calendar_end_time.slice(0, 5))
      }
      if (provider.slot_duration) {
        setSlotDuration(provider.slot_duration.toString())
      }
      if (provider.buffer_time !== undefined) {
        setBufferTime(provider.buffer_time.toString())
      }
      if (provider.working_days) {
        setWorkingDays(provider.working_days)
      }
      // Initialize services
      if (provider.services) {
        setServices(provider.services)
      }
      if (provider.currency) {
        setCurrency(provider.currency)
      }
    }
  }, [showSettings, dashboardData])

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const data = await getDashboardData(slug)
      setDashboardData(data)
      setAuthenticated(true)
    } catch (err: any) {
      setError(err.message)
      setAuthenticated(false)
      if (err.message.includes('Unauthorized')) {
        router.push('/signin')
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }, [slug, router])

  const fetchCalendarAppointments = useCallback(async () => {
    try {
      const { startDate, endDate } = getCalendarDateRange(calendarView, currentDate)
      const data = await getAppointments(slug, undefined, startDate, endDate)
      setAppointments(data.appointments || [])
    } catch (err) {
      console.error('Failed to fetch calendar appointments:', err)
    }
  }, [slug, calendarView, currentDate])

  useEffect(() => {
    if (authenticated) {
      fetchCalendarAppointments()
    }
  }, [authenticated, fetchCalendarAppointments])

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Sign out error:', err)
    }
    setAuthenticated(false)
    setDashboardData(null)
    router.push('/signin')
  }

  const handleSelectAppointment = useCallback((appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment)
    setShowAppointmentModal(true)
  }, [])

  const handleNavigate = useCallback((date: Date, view: View) => {
    setCurrentDate(date)
    setCalendarView(view)
  }, [])

  const handleViewChange = useCallback((view: View) => {
    setCalendarView(view)
  }, [])

  const handleUpdateAppointmentStatus = useCallback(async (
    appointmentId: string,
    status: string,
    successMessage: string
  ) => {
    try {
      await updateAppointmentStatus(slug, appointmentId, status)
      await Promise.all([
        fetchCalendarAppointments(),
        fetchDashboard(true)
      ])
      alert(successMessage)
    } catch (err) {
      console.error('Failed to update appointment:', err)
      alert('Failed to update appointment')
    }
  }, [slug, fetchCalendarAppointments, fetchDashboard])

  const handleCancelAppointment = useCallback((appointmentId: string) => {
    return handleUpdateAppointmentStatus(
      appointmentId,
      AppointmentStatus.CANCELLED,
      'Appointment cancelled successfully'
    )
  }, [handleUpdateAppointmentStatus])

  const handleCompleteAppointment = useCallback((appointmentId: string) => {
    return handleUpdateAppointmentStatus(
      appointmentId,
      AppointmentStatus.COMPLETED,
      'Appointment marked as complete'
    )
  }, [handleUpdateAppointmentStatus])

  const validateService = (formData: any): string | null => {
    if (!formData.name || formData.name.trim().length === 0) {
      return 'Service name is required'
    }
    if (formData.name.length > 100) {
      return 'Service name must be under 100 characters'
    }
    if (!formData.duration || formData.duration <= 0) {
      return 'Duration must be greater than 0'
    }
    if (formData.duration > 480) {
      return 'Duration cannot exceed 480 minutes (8 hours)'
    }
    if (formData.price === undefined || formData.price < 0) {
      return 'Price must be 0 or greater'
    }
    if (formData.description && formData.description.length > 500) {
      return 'Description must be under 500 characters'
    }

    // Check for duplicate names
    const duplicateName = services.some(
      (s, i) => s.name.toLowerCase() === formData.name.toLowerCase() && i !== editingServiceIndex
    )
    if (duplicateName) {
      return 'A service with this name already exists'
    }

    return null // Valid
  }

  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      duration: 30,
      price: 0,
      description: '',
      icon: '',
      is_active: true
    })
    setEditingServiceIndex(null)
    setIsAddingService(false)
  }

  const handleAddService = async () => {
    const error = validateService(serviceForm)
    if (error) {
      setSettingsError(error)
      return
    }

    const newServices = [
      ...services,
      {
        name: serviceForm.name,
        duration: serviceForm.duration,
        price: serviceForm.price,
        description: serviceForm.description || undefined,
        icon: serviceForm.icon || '⭐',
        is_active: serviceForm.is_active
      }
    ]

    await saveServices(newServices)
    resetServiceForm()
  }

  const handleEditService = async () => {
    if (editingServiceIndex === null) return

    const error = validateService(serviceForm)
    if (error) {
      setSettingsError(error)
      return
    }

    const updatedServices = services.map((service, i) =>
      i === editingServiceIndex
        ? {
            name: serviceForm.name,
            duration: serviceForm.duration,
            price: serviceForm.price,
            description: serviceForm.description || undefined,
            icon: serviceForm.icon || service.icon || '⭐',
            is_active: serviceForm.is_active
          }
        : service
    )

    await saveServices(updatedServices)
    resetServiceForm()
  }

  const handleDeleteService = async (index: number) => {
    if (services.length === 1) {
      setSettingsError('Cannot delete the last service. Add another service first.')
      return
    }

    const service = services[index]
    if (confirm(`Delete "${service.name}"? Past appointments will not be affected.`)) {
      const updatedServices = services.filter((_, i) => i !== index)
      await saveServices(updatedServices)
    }
  }

  const startEditingService = (index: number) => {
    const service = services[index]
    setServiceForm({
      name: service.name,
      duration: service.duration,
      price: service.price,
      description: service.description || '',
      icon: service.icon || '',
      is_active: service.is_active ?? true
    })
    setEditingServiceIndex(index)
    setIsAddingService(false)
  }

  const startAddingService = () => {
    resetServiceForm()
    setIsAddingService(true)
  }

  const saveServices = async (updatedServices: any[]) => {
    setSettingsSaving(true)
    setSettingsError('')
    setUploadSuccess('')

    try {
      // Remove runtime-generated fields before saving
      const servicesToSave = updatedServices.map(({ id, provider_id, created_at, ...rest }) => rest)

      await updateProviderProfile(slug, {
        services: servicesToSave
      })

      setServices(updatedServices)

      // Update dashboardData
      setDashboardData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          provider: {
            ...prev.provider,
            services: updatedServices
          }
        }
      })

      setUploadSuccess('✓ Services updated successfully')

      // Clear success message after 3 seconds
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }
      successTimeoutRef.current = setTimeout(() => {
        setUploadSuccess('')
        successTimeoutRef.current = null
      }, 3000)
    } catch (err: any) {
      console.error('Save services error:', err)
      setSettingsError(err.message || 'Failed to update services')
    } finally {
      setSettingsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setSettingsError('Please enter your password to confirm deletion')
      return
    }

    setSettingsSaving(true)
    setSettingsError('')

    try {
      const response = await fetch(`/api/dashboard/${slug}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ password: deletePassword })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to delete account')
      }

      // Clear auth token
      localStorage.removeItem('auth_token')

      // Redirect to home page with message
      alert('Your account has been permanently deleted.')
      router.push('/')
    } catch (err: any) {
      setSettingsError(err.message || 'Failed to delete account')
    } finally {
      setSettingsSaving(false)
    }
  }

  const handlePhotoUpload = async (file: File, type: 'avatar' | 'cover') => {
    if (type === 'avatar') setUploadingAvatar(true)
    else setUploadingCover(true)
    setSettingsError('')
    setUploadSuccess('')

    try {
      // Create FormData to upload the image
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      // Upload to our API endpoint
      const response = await fetch(`/api/dashboard/${slug}/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()

      // Update the local state with the new URL
      if (type === 'avatar') {
        setAvatarUrl(data.url)
        setUploadSuccess('✓ Avatar uploaded successfully')
      } else {
        setCoverPhotoUrl(data.url)
        setUploadSuccess('✓ Cover photo uploaded successfully')
      }

      // Clear previous timeout if exists
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }

      // Auto-hide success message after 3 seconds
      successTimeoutRef.current = setTimeout(() => {
        setUploadSuccess('')
        successTimeoutRef.current = null
      }, 3000)

      // Update dashboardData to reflect the new photo
      setDashboardData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          provider: {
            ...prev.provider,
            [type === 'avatar' ? 'avatar_url' : 'cover_photo_url']: data.url
          }
        }
      })
    } catch (err: any) {
      setSettingsError(err.message || 'Failed to upload photo')
    } finally {
      if (type === 'avatar') setUploadingAvatar(false)
      else setUploadingCover(false)
    }
  }

  const handleSaveSettings = async () => {
    setSettingsError('')
    setUploadSuccess('')
    setSettingsSaving(true)
    try {
      const updates: any = {}
      if (settingsTab === 'account' || !settingsTab) {
        updates.location = location
        updates.currency = currency
        // Note: avatar_url and cover_photo_url are already saved via handlePhotoUpload
        if (currentPassword && newPassword) {
          if (newPassword.length < 8) {
            throw new Error('New password must be at least 8 characters')
          }
          if (newPassword !== confirmPassword) {
            throw new Error('New passwords do not match')
          }
          await updateProviderPassword(slug, currentPassword, newPassword)
        }
      }
      if (settingsTab === 'calendar') {
        updates.calendar_start_time = calendarStartTime + ':00'
        updates.calendar_end_time = calendarEndTime + ':00'
        updates.slot_duration = parseInt(slotDuration)
        updates.buffer_time = parseInt(bufferTime)
        updates.working_days = workingDays
      }
      await updateProviderProfile(slug, updates)
      alert('Settings saved successfully!')
      setShowSettings(false)
      setSettingsTab('account')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setUploadSuccess('')
      await fetchDashboard(true)
    } catch (err: any) {
      setSettingsError(err.message)
    } finally {
      setSettingsSaving(false)
    }
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/${slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-purple-200 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>
        <motion.div
          className="text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">Loading Dashboard...</p>
        </motion.div>
      </div>
    )
  }

  if (!dashboardData) return null

  const provider = dashboardData.provider

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-purple-200 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-blue-200 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20"
          animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                Bo<span className="text-purple-600 dark:text-purple-400">Ke</span>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Button
                onClick={() => setShowShare(true)}
                variant="outline"
                className="border-2"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                className="border-2"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={handleLogout}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Greeting Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {getGreeting()}, {provider.name.split(' ')[0]}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {todayDate} · You have <span className="font-semibold text-purple-600 dark:text-purple-400">{dashboardData.appointments.length} appointments</span> today
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
              {dashboardData.stats.today_appointments}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Today&apos;s Appointments</div>
          </motion.div>

          <motion.div
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
              {dashboardData.stats.week_appointments}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">This Week</div>
          </motion.div>

          <motion.div
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
              {dashboardData.stats.total_customers}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Clients</div>
          </motion.div>
        </motion.div>

        {/* Calendar Section */}
        <motion.div
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Appointment Calendar
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click any appointment to view details or take actions
              </p>
            </div>
          </div>
          <AppointmentCalendar
            appointments={appointments}
            onSelectAppointment={handleSelectAppointment}
            onNavigate={handleNavigate}
            onViewChange={handleViewChange}
          />
        </motion.div>
      </main>

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={showAppointmentModal}
        onClose={() => {
          setShowAppointmentModal(false)
          setSelectedAppointment(null)
        }}
        onCancel={handleCancelAppointment}
        onComplete={handleCompleteAppointment}
      />

      {/* Share Modal */}
      <AnimatePresence>
        {showShare && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Share Your Booking Page</h2>
                  <button
                    onClick={() => setShowShare(false)}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Your Public Booking Page
                  </p>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/${slug}`}
                      className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 rounded-lg font-mono text-sm border-2 border-purple-200 dark:border-purple-800"
                    />
                    <Button
                      onClick={handleCopyLink}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <a
                    href={`/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full border-2">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Page
                    </Button>
                  </a>
                  <Button
                    onClick={handleCopyLink}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Settings</h2>
                  <button
                    onClick={() => {
                      setShowSettings(false)
                      setSettingsError('')
                      setUploadSuccess('')
                    }}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Tabs */}
                <div className="flex space-x-2 mb-6 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg">
                  <button
                    onClick={() => setSettingsTab('account')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                      settingsTab === 'account'
                        ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Account
                  </button>
                  <button
                    onClick={() => setSettingsTab('calendar')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                      settingsTab === 'calendar'
                        ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Calendar
                  </button>
                  <button
                    onClick={() => setSettingsTab('services')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                      settingsTab === 'services'
                        ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Services
                  </button>
                </div>

                {/* Error message */}
                {settingsError && (
                  <Alert variant="error" animated>
                    {settingsError}
                  </Alert>
                )}

                {/* Success message */}
                {uploadSuccess && (
                  <Alert variant="success" animated>
                    {uploadSuccess}
                  </Alert>
                )}

                {/* Account Settings */}
                {settingsTab === 'account' && (
                  <div className="space-y-6">
                    {/* Profile Photos Section */}
                    <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Profile Photos
                      </h3>
                      <div className="space-y-4">
                        {/* Avatar Photo */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Avatar Photo
                          </label>
                          <div className="flex items-center gap-4">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt="Avatar"
                                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold text-white">
                                {provider.name.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handlePhotoUpload(file, 'avatar')
                                }}
                                disabled={uploadingAvatar}
                                className="hidden"
                                id="avatar-upload"
                              />
                              <label
                                htmlFor="avatar-upload"
                                className={`inline-block px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition ${
                                  uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                              </label>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Recommended: Square image, at least 200x200px
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Cover Photo */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Cover Photo
                          </label>
                          <div className="space-y-3">
                            {coverPhotoUrl && (
                              <img
                                src={coverPhotoUrl}
                                alt="Cover"
                                className="w-full h-32 rounded-lg object-cover border-2 border-gray-300 dark:border-gray-600"
                              />
                            )}
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handlePhotoUpload(file, 'cover')
                                }}
                                disabled={uploadingCover}
                                className="hidden"
                                id="cover-upload"
                              />
                              <label
                                htmlFor="cover-upload"
                                className={`inline-block px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition ${
                                  uploadingCover ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {uploadingCover ? 'Uploading...' : 'Upload Cover Photo'}
                              </label>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Recommended: Wide image, at least 1200x400px
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Business Location
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="123 High Street, London"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="EUR">EUR – Euro (€)</option>
                        <option value="GBP">GBP – British Pound (£)</option>
                        <option value="CHF">CHF – Swiss Franc (CHF)</option>
                        <option value="SEK">SEK – Swedish Krona (kr)</option>
                        <option value="NOK">NOK – Norwegian Krone (kr)</option>
                        <option value="DKK">DKK – Danish Krone (kr)</option>
                        <option value="PLN">PLN – Polish Złoty (zł)</option>
                        <option value="CZK">CZK – Czech Koruna (Kč)</option>
                        <option value="HUF">HUF – Hungarian Forint (Ft)</option>
                        <option value="RON">RON – Romanian Leu (lei)</option>
                      </select>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Change Password
                      </h3>
                      <div className="space-y-4">
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Current Password"
                        />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="New Password"
                        />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Confirm New Password"
                        />
                      </div>
                    </div>

                    {/* Delete Account Section */}
                    <div className="pt-4 border-t border-red-200 dark:border-red-900">
                      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                        Delete Account
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button
                        onClick={() => setShowDeleteConfirmation(true)}
                        className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                )}

                {/* Calendar Settings */}
                {settingsTab === 'calendar' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={calendarStartTime}
                          onChange={(e) => setCalendarStartTime(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={calendarEndTime}
                          onChange={(e) => setCalendarEndTime(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Slot Duration (minutes)
                        </label>
                        <select
                          value={slotDuration}
                          onChange={(e) => setSlotDuration(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="45">45 minutes</option>
                          <option value="60">60 minutes</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Buffer Time (minutes)
                        </label>
                        <select
                          value={bufferTime}
                          onChange={(e) => setBufferTime(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                          <option value="0">No buffer</option>
                          <option value="5">5 minutes</option>
                          <option value="10">10 minutes</option>
                          <option value="15">15 minutes</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Working Days
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() =>
                              setWorkingDays((prev) => ({
                                ...prev,
                                [day]: !prev[day as keyof typeof prev],
                              }))
                            }
                            className={`px-4 py-2 rounded-lg border-2 transition font-medium ${
                              workingDays[day as keyof typeof workingDays]
                                ? 'bg-purple-600 border-purple-600 text-white'
                                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                            }`}
                          >
                            {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Services Settings */}
                {settingsTab === 'services' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Manage Your Services
                      </h3>
                      {!isAddingService && editingServiceIndex === null && (
                        <Button
                          onClick={startAddingService}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Service
                        </Button>
                      )}
                    </div>

                    {/* Service Form (Add or Edit) */}
                    {(isAddingService || editingServiceIndex !== null) && (
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800 mb-6">
                        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                          {isAddingService ? 'Add New Service' : 'Edit Service'}
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Service Name *
                            </label>
                            <input
                              type="text"
                              value={serviceForm.name}
                              onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              placeholder="e.g., Haircut, Massage, Consultation"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Duration (minutes) *
                              </label>
                              <input
                                type="number"
                                min="5"
                                max="480"
                                step="5"
                                value={serviceForm.duration}
                                onChange={(e) => setServiceForm({ ...serviceForm, duration: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="30"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Price ({currency}) *
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={serviceForm.price}
                                onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="50.00"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Description (optional)
                            </label>
                            <textarea
                              rows={3}
                              value={serviceForm.description}
                              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              placeholder="Describe what's included..."
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={serviceForm.is_active}
                              onChange={(e) => setServiceForm({ ...serviceForm, is_active: e.target.checked })}
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                            />
                            <label className="text-sm text-gray-700 dark:text-gray-300">
                              Active (visible to customers)
                            </label>
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button
                              onClick={isAddingService ? handleAddService : handleEditService}
                              disabled={settingsSaving}
                              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {settingsSaving ? 'Saving...' : 'Save Service'}
                            </Button>
                            <Button
                              onClick={resetServiceForm}
                              variant="outline"
                              disabled={settingsSaving}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Services List */}
                    {services.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          No services yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Add your first service to start accepting bookings
                        </p>
                        <Button
                          onClick={startAddingService}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Service
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((service, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-md transition"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{service.icon || '⭐'}</span>
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {service.name}
                                  </h4>
                                  {!service.is_active && (
                                    <span className="text-xs text-gray-400">Inactive</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => startEditingService(index)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                  title="Edit"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteService(index)}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {service.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {service.description}
                              </p>
                            )}

                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                {service.duration} minutes
                              </span>
                              <span className="font-semibold text-purple-600 dark:text-purple-400">
                                {formatCurrency(typeof service.price === 'number' ? service.price : parseFloat(service.price) || 0, currency)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                  <Button
                    onClick={() => {
                      setShowSettings(false)
                      setSettingsError('')
                      setUploadSuccess('')
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveSettings}
                    disabled={settingsSaving}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {settingsSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirmation && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowDeleteConfirmation(false)
              setDeletePassword('')
              setSettingsError('')
            }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <AlertCircle className="h-6 w-6" />
                    Delete Account
                  </h2>
                  <button
                    onClick={() => {
                      setShowDeleteConfirmation(false)
                      setDeletePassword('')
                      setSettingsError('')
                    }}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                      ⚠️ Warning: This action is permanent
                    </h4>
                    <ul className="text-sm text-red-700 dark:text-red-400 space-y-1 list-disc list-inside">
                      <li>All your appointments will be deleted</li>
                      <li>All customer data will be removed</li>
                      <li>Your public booking page will be deactivated</li>
                      <li>This action cannot be undone</li>
                    </ul>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    To confirm deletion, please enter your password:
                  </p>

                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {settingsError && (
                  <Alert variant="error" className="mb-4">
                    {settingsError}
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowDeleteConfirmation(false)
                      setDeletePassword('')
                      setSettingsError('')
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={!deletePassword || settingsSaving}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
                  >
                    {settingsSaving ? 'Deleting...' : 'Delete My Account'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
