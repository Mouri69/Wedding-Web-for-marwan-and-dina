import { NextResponse } from 'next/server'
import { checkAdminPassword } from '@/lib/db'

export async function POST(req: Request) {
  const { password } = await req.json()
  if (!checkAdminPassword(password)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ ok: true })
}
