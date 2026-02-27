'use client'

import { useTheme } from './ThemeProvider'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-[120px] h-10 rounded-full bg-card border border-border" />
    )
  }

  return (
    <div className="relative inline-flex items-center rounded-full bg-card border border-border p-1 shadow-sm">
      {/* Background slider */}
      <div
        className="absolute top-1 bottom-1 w-[36px] bg-gold rounded-full transition-all duration-300 ease-out"
        style={{
          left: theme === 'light' ? '4px' : theme === 'dark' ? '44px' : '84px',
        }}
      />

      {/* Buttons */}
      <button
        onClick={() => setTheme('light')}
        className={`relative z-10 flex items-center justify-center w-9 h-8 rounded-full transition-colors duration-200 ${
          theme === 'light'
            ? 'text-background'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Light theme"
        title="Light theme"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`relative z-10 flex items-center justify-center w-9 h-8 rounded-full transition-colors duration-200 ${
          theme === 'dark'
            ? 'text-background'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Dark theme"
        title="Dark theme"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`relative z-10 flex items-center justify-center w-9 h-8 rounded-full transition-colors duration-200 ${
          theme === 'system'
            ? 'text-background'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="System theme"
        title="System theme"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      </button>
    </div>
  )
}
