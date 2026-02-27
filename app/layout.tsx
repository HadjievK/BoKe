import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BuKe - Simple Booking for Service Providers',
  description: 'Book appointments with local service providers easily',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
