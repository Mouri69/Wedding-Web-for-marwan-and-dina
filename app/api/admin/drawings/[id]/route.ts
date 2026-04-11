import { NextResponse } from 'next/server'
import { deleteDrawing, approveDrawing, checkAdminPassword } from '@/lib/db'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pw = new URL(req.url).searchParams.get('password') || ''
  if (!checkAdminPassword(pw)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  deleteDrawing(Number(id))
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pw = new URL(req.url).searchParams.get('password') || ''
  if (!checkAdminPassword(pw)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { approved, rank } = await req.json()
  approveDrawing(Number(id), approved, rank ?? null)
  return NextResponse.json({ ok: true })
}
