import { NextResponse } from 'next/server'
import { addDrawing, getApprovedDrawings } from '@/lib/db'

export async function GET() {
  try {
    const drawings = await getApprovedDrawings()
    return NextResponse.json(drawings)
  } catch (err) {
    console.error('GET /api/drawings failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { name, image_data } = await req.json()
    if (!name || !image_data) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const d = await addDrawing(name, image_data)
    return NextResponse.json(d)
  } catch (err) {
    console.error('POST /api/drawings failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}