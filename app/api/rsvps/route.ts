import { NextResponse } from 'next/server'
import { addRSVP } from '@/lib/db'

export async function POST(req: Request) {
  const { name, answer } = await req.json()
  if (!name || !answer) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const rsvp = await addRSVP(name, answer)
  return NextResponse.json(rsvp)
}
