import { NextResponse } from 'next/server'
import { getRSVPs, checkAdminPassword } from '@/lib/db'

export async function GET(req: Request) {
  const pw = new URL(req.url).searchParams.get('password') || ''
  if (!checkAdminPassword(pw)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(getRSVPs())
}
