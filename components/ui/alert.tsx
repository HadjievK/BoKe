import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'

type AlertVariant = 'error' | 'success' | 'info' | 'warning'

interface AlertProps {
  variant?: AlertVariant
  children: React.ReactNode
  className?: string
  animated?: boolean
  onClose?: () => void
}

const variantStyles: Record<AlertVariant, { container: string; icon: JSX.Element }> = {
  error: {
    container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400',
    icon: <XCircle className="w-5 h-5" />
  },
  success: {
    container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
    icon: <CheckCircle className="w-5 h-5" />
  },
  info: {
    container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    icon: <Info className="w-5 h-5" />
  },
  warning: {
    container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400',
    icon: <AlertCircle className="w-5 h-5" />
  }
}

export function Alert({
  variant = 'info',
  children,
  className = '',
  animated = true,
  onClose
}: AlertProps) {
  const { container, icon } = variantStyles[variant]

  const content = (
    <div className={`p-4 border rounded-lg text-sm font-medium flex items-start gap-3 ${container} ${className}`}>
      <div className="flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1">
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close alert"
        >
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  )

  if (animated && children) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.2 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    )
  }

  return content
}
