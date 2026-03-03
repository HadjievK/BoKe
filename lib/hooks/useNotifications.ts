import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Hook for managing auto-hiding notifications with timeout cleanup
 *
 * @param duration - Duration in milliseconds before notification auto-hides (default: 3000)
 * @returns {message, showNotification, clearNotification}
 */
export function useAutoHideNotification(duration = 3000) {
  const [message, setMessage] = useState<string>('')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showNotification = useCallback((msg: string) => {
    // Clear previous timeout if exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setMessage(msg)

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setMessage('')
      timeoutRef.current = null
    }, duration)
  }, [duration])

  const clearNotification = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setMessage('')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { message, showNotification, clearNotification }
}

/**
 * Hook for clipboard operations with auto-hide feedback
 *
 * @param duration - Duration in milliseconds before "copied" state resets (default: 2000)
 * @returns {copied, copyToClipboard}
 */
export function useClipboard(duration = 2000) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const copyToClipboard = useCallback((text: string) => {
    // Clear previous timeout if exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    navigator.clipboard.writeText(text)
    setCopied(true)

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setCopied(false)
      timeoutRef.current = null
    }, duration)
  }, [duration])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { copied, copyToClipboard }
}

/**
 * Hook for managing success/error notification state
 * Consolidates success and error messages into a single state
 *
 * @param duration - Duration in milliseconds before notification auto-hides (default: 3000)
 * @returns {notification, showSuccess, showError, clearNotification}
 */
export function useNotification(duration = 3000) {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showSuccess = useCallback((message: string) => {
    // Clear previous timeout if exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setNotification({ type: 'success', message })

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setNotification({ type: null, message: '' })
      timeoutRef.current = null
    }, duration)
  }, [duration])

  const showError = useCallback((message: string) => {
    // Clear previous timeout if exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setNotification({ type: 'error', message })

    // Auto-hide error messages too (can be disabled by setting very large duration)
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        setNotification({ type: null, message: '' })
        timeoutRef.current = null
      }, duration)
    }
  }, [duration])

  const clearNotification = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setNotification({ type: null, message: '' })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { notification, showSuccess, showError, clearNotification }
}
