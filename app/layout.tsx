import type { Metadata } from 'next'
import './globals.css'

/**
 * Crawlers need a public HTTPS URL. If NEXT_PUBLIC_SITE_URL is still localhost
 * but the app runs on Vercel, use VERCEL_URL so og:image is not localhost.
 */
function getMetadataBase(): URL {
  const vercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (raw) {
    try {
      const url = new URL(raw.endsWith('/') ? raw.slice(0, -1) : raw)
      const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
      if (local && vercel) return new URL(vercel)
      return url
    } catch {
      /* fall through */
    }
  }
  if (vercel) return new URL(vercel)
  return new URL('http://localhost:3000')
}

const shareTitle =
  'Invitation to our engagement · دعوة إلى خطوبتنا — Marwan & Dina'

const shareDescription =
  'March 17, 2027 · ١٧ مارس ٢٠٢٧ — You are warmly invited. Marwan & Dina.'

const base = getMetadataBase()
/** WhatsApp / Facebook need a direct PNG URL with image/* — use Next’s static OG route, not a stale /weddingmetadata.png cache. */
const ogImageAbsolute = new URL('/opengraph-image.png', base).toString()

export const metadata: Metadata = {
  metadataBase: base,
  title: shareTitle,
  description: shareDescription,
  openGraph: {
    title: shareTitle,
    description: shareDescription,
    type: 'website',
    url:
      base.hostname === 'localhost' || base.hostname === '127.0.0.1'
        ? undefined
        : `${base.origin}/`,
    siteName: 'Marwan & Dina',
    locale: 'en_US',
    alternateLocale: ['ar_EG'],
    images: [
      {
        url: ogImageAbsolute,
        type: 'image/png',
        alt: 'Invitation to our engagement — دعوة إلى خطوبتنا — Marwan & Dina',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: shareTitle,
    description: shareDescription,
    images: [ogImageAbsolute],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
