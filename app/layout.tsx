import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Marwan & Dina - Wedding',
  description: 'Join us to celebrate our wedding on May 26, 2026',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
