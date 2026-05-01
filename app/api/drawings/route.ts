import { NextResponse } from 'next/server'
import { addDrawing, getApprovedDrawings } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await getApprovedDrawings())
}

export async function POST(req: Request) {
  const { name, image_data } = await req.json()
  if (!name || !image_data) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const d = await addDrawing(name, image_data)
  return NextResponse.json(d)
}
