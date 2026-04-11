import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Marwan & Dina — Wedding Invitation',
  description: 'You are warmly invited to celebrate the wedding of Marwan & Dina',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
