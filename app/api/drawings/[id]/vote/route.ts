import { NextResponse } from 'next/server'
import { voteDrawing } from '@/lib/db'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await voteDrawing(Number(id))
  return NextResponse.json({ ok: true })
}
