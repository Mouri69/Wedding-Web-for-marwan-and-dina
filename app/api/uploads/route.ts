import { NextResponse } from 'next/server'
import { addUploads, getApprovedUploads } from '@/lib/db'

const MAX_UPLOADS_PER_REQUEST = 10
const MAX_VIDEO_BYTES = 3 * 1024 * 1024 // 3 MB (due to serverless function body limit)

function isValidMedia(value: unknown): value is string {
  if (typeof value !== 'string') return false
  
  // Allow Base64 images/videos
  if (
    (value.startsWith('data:image/') || value.startsWith('data:video/')) &&
    value.includes(';base64,')
  ) {
    return true
  }

  // Allow http/https URLs (e.g. Supabase Storage public URLs)
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return true
  }

  return false
}

function getDataUriBytes(dataUri: string) {
  const base64Part = dataUri.split(';base64,')[1] || ''
  const padding = base64Part.endsWith('==') ? 2 : base64Part.endsWith('=') ? 1 : 0
  return Math.max(0, (base64Part.length * 3) / 4 - padding)
}

export async function GET() {
  try {
    const uploads = await getApprovedUploads()
    return NextResponse.json(uploads)
  } catch (err) {
    console.error('GET /api/uploads failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const media = Array.isArray(body?.media)
      ? body.media
      : Array.isArray(body?.images)
        ? body.images
        : []

    if (!media.length) {
      return NextResponse.json({ error: 'No media provided' }, { status: 400 })
    }

    if (media.length > MAX_UPLOADS_PER_REQUEST) {
      return NextResponse.json(
        { error: `You can upload up to ${MAX_UPLOADS_PER_REQUEST} files at a time` },
        { status: 400 }
      )
    }

    if (!media.every(isValidMedia)) {
      return NextResponse.json(
        { error: 'Only images and videos are allowed' },
        { status: 400 }
      )
    }

    for (const item of media) {
      if (item.startsWith('data:video/') && getDataUriBytes(item) > MAX_VIDEO_BYTES) {
        return NextResponse.json(
          { error: 'Max file size reached. Video limit is 3 MB.' },
          { status: 400 }
        )
      }
    }

    const saved = await addUploads(media)
    return NextResponse.json(saved, { status: 201 })
  } catch (err) {
    console.error('POST /api/uploads failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
