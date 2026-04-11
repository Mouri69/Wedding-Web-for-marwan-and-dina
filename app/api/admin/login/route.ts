import { NextResponse } from 'next/server'
import { checkAdminPassword } from '@/lib/db'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const password = typeof body.password === 'string' ? body.password : ''
  if (!checkAdminPassword(password)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ ok: true })
}
