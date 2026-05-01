import { NextResponse } from 'next/server'
import { checkAdminPassword, getCurrentTimelineEvent, setCurrentTimelineEvent } from '@/lib/db'

function getPassword(req: Request) {
  return new URL(req.url).searchParams.get('password') || ''
}

export async function GET(req: Request) {
  try {
    const pw = getPassword(req)
    if (!checkAdminPassword(pw)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const currentEvent = await getCurrentTimelineEvent()
    return NextResponse.json({ currentEvent })
  } catch (err) {
    console.error('GET /api/admin/timeline/current failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const pw = getPassword(req)
    if (!checkAdminPassword(pw)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const currentEvent = typeof body.currentEvent === 'string' ? body.currentEvent : null
    const saved = await setCurrentTimelineEvent(currentEvent)
    return NextResponse.json({ currentEvent: saved })
  } catch (err) {
    console.error('PATCH /api/admin/timeline/current failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
