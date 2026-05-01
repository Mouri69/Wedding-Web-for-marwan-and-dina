import { NextResponse } from 'next/server'
import { checkAdminPassword, getUploads } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const pw = new URL(req.url).searchParams.get('password') || ''
    if (!checkAdminPassword(pw)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const uploads = await getUploads()
    return NextResponse.json(uploads)
  } catch (e) {
    console.error('Error in /api/admin/uploads:', e)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    )
  }
}
