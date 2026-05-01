import { NextResponse } from 'next/server'
import { getRSVPs, checkAdminPassword } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const pw = new URL(req.url).searchParams.get('password') || ''
    if (!checkAdminPassword(pw)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const rsvps = await getRSVPs()
    return NextResponse.json(rsvps)
  } catch (e) {
    console.error('Error in /api/admin/rsvps:', e)
    return NextResponse.json({ error: 'Internal server error', details: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
