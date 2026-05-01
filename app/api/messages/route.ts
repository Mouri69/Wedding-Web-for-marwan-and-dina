import { NextResponse } from 'next/server'
import { addMessage, getApprovedMessages } from '@/lib/db'

export async function GET() {
  try {
    const messages = await getApprovedMessages()
    return NextResponse.json(messages)
  } catch (err) {
    console.error('GET /api/messages failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { name, message } = await req.json()
    if (!name || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const m = await addMessage(name, message)
    return NextResponse.json(m)
  } catch (err) {
    console.error('POST /api/messages failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}