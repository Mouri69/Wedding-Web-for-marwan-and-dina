import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Marwan & Dina - Wedding',
  description: 'Join us to celebrate our engagment on May 26, 2026',
  openGraph: {
    title: 'Marwan & Dina - Wedding',
    description: 'Join us to celebrate our engagment on May 26, 2026',
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Marwan & Dina Wedding',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marwan & Dina - Wedding',
    description: 'Join us to celebrate our engagment on May 26, 2026',
    images: ['/og.jpg'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflowX: 'hidden' }}>{children}</body>
    </html>
  )
}
