import type { Metadata } from 'next'
import './globals.css'

/**
 * Social previews must use a URL crawlers can fetch. `VERCEL_URL` is the
 * specific deployment host (e.g. *.vercel.app with a hash) which may be behind
 * Vercel Deployment Protection → HTML/401 instead of the image. Prefer the
 * stable production hostname (`VERCEL_PROJECT_PRODUCTION_URL`) or
 * `NEXT_PUBLIC_SITE_URL` so og:image matches the public site.
 */
function getMetadataBase(): URL {
  const deploymentUrl = process.env.VERCEL_URL
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : null

  const productionRaw = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  const productionUrl =
    productionRaw != null && productionRaw.length > 0
      ? new URL(productionRaw.includes('://') ? productionRaw : `https://${productionRaw}`)
      : null

  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (raw) {
    try {
      const url = new URL(raw.endsWith('/') ? raw.slice(0, -1) : raw)
      const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
      if (local && deploymentUrl) return deploymentUrl
      return url
    } catch {
      /* fall through */
    }
  }

  if (productionUrl) return productionUrl
  if (deploymentUrl) return deploymentUrl
  return new URL('http://localhost:3000')
}

const shareTitle =
  'Invitation to our engagement · دعوة إلى خطوبتنا — Marwan & Dina'

const shareDescription =
  'March 17, 2027 · ١٧ مارس ٢٠٢٧ — You are warmly invited. Marwan & Dina.'

const base = getMetadataBase()
/** Static path in /public; must match `scripts/build-og.mjs` OG_W / OG_H. */
const OG_IMAGE_W = 1200
const OG_IMAGE_H = 630
const ogImageAbsolute = new URL('/og2.png', base).toString()

/** Sharing Debugger wants `fb:app_id` for domain insights; create an app at developers.facebook.com and set this in Vercel. */
const fbAppId =
  process.env.FACEBOOK_APP_ID?.trim() || process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim()

export const metadata: Metadata = {
  metadataBase: base,
  title: shareTitle,
  description: shareDescription,
  ...(fbAppId ? { facebook: { appId: fbAppId } } : {}),
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
        width: OG_IMAGE_W,
        height: OG_IMAGE_H,
        type: 'image/png',
        alt: 'Invitation to our engagement — دعوة إلى خطوبتنا — Marwan & Dina',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: shareTitle,
    description: shareDescription,
    images: [
      {
        url: ogImageAbsolute,
        width: OG_IMAGE_W,
        height: OG_IMAGE_H,
      },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
