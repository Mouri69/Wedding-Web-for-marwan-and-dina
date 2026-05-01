import { NextResponse } from 'next/server'
import { addUploads, getApprovedUploads } from '@/lib/db'

const MAX_UPLOADS_PER_REQUEST = 10

function isDataImage(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.startsWith('data:image/') &&
    value.includes(';base64,')
  )
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
    const images = Array.isArray(body?.images) ? body.images : []

    if (!images.length) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 })
    }

    if (images.length > MAX_UPLOADS_PER_REQUEST) {
      return NextResponse.json(
        { error: `You can upload up to ${MAX_UPLOADS_PER_REQUEST} photos at a time` },
        { status: 400 }
      )
    }

    if (!images.every(isDataImage)) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 })
    }

    const saved = await addUploads(images)
    return NextResponse.json(saved, { status: 201 })
  } catch (err) {
    console.error('POST /api/uploads failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
