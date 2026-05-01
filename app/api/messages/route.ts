import { NextResponse } from 'next/server'
import { addMessage, getApprovedMessages } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await getApprovedMessages())
}

export async function POST(req: Request) {
  const { name, message } = await req.json()
  if (!name || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const m = await addMessage(name, message)
  return NextResponse.json(m)
}
