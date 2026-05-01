import { NextResponse } from 'next/server'
import { getCurrentTimelineEvent } from '@/lib/db'

export async function GET() {
  try {
    const currentEvent = await getCurrentTimelineEvent()
    return NextResponse.json({ currentEvent })
  } catch (err) {
    console.error('GET /api/timeline/current failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
