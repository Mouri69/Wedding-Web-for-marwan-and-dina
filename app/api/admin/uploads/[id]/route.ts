import { NextResponse } from 'next/server'
import { approveUpload, checkAdminPassword, deleteUpload } from '@/lib/db'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const pw = new URL(req.url).searchParams.get('password') || ''
  if (!checkAdminPassword(pw)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await deleteUpload(Number(id))
  return NextResponse.json({ ok: true })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const pw = new URL(req.url).searchParams.get('password') || ''
  if (!checkAdminPassword(pw)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { approved } = await req.json()
  await approveUpload(Number(id), Boolean(approved))
  return NextResponse.json({ ok: true })
}
