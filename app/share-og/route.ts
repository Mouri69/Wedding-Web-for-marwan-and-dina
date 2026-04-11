import { NextResponse } from 'next/server'
import { getShareOgUpstreamUrl } from '@/lib/shareOgSource'

export async function GET() {
  const url = getShareOgUpstreamUrl()
  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) {
    return new NextResponse('Failed to load share image', { status: 502 })
  }
  const buf = Buffer.from(await res.arrayBuffer())
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
