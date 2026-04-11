import type { Metadata } from 'next'
import './globals.css'

/** Used so Open Graph / Twitter image URLs are absolute when sharing links. Set in production, e.g. https://your-domain.vercel.app */
function getMetadataBase(): URL {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL
  if (fromEnv) {
    try {
      return new URL(fromEnv.endsWith('/') ? fromEnv.slice(0, -1) : fromEnv)
    } catch {
      /* ignore */
    }
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`)
  }
  return new URL('http://localhost:3000')
}

const shareTitle =
  'Invitation to our engagement · دعوة إلى خطوبتنا — Marwan & Dina'

const shareDescription =
  'March 17, 2027 · ١٧ مارس ٢٠٢٧ — You are warmly invited. Marwan & Dina.'

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: shareTitle,
  description: shareDescription,
  openGraph: {
    title: shareTitle,
    description: shareDescription,
    type: 'website',
    siteName: 'Marwan & Dina',
    locale: 'en_US',
    alternateLocale: ['ar_EG'],
    images: [
      {
        url: '/weddingmetadata.png',
        alt: 'Invitation to our engagement — دعوة إلى خطوبتنا — Marwan & Dina, March 17, 2027',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: shareTitle,
    description: shareDescription,
    images: ['/weddingmetadata.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
