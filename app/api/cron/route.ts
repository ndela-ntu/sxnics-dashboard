import { NextResponse } from 'next/server'
import { deleteExpiredReleases } from '@/actions'

export async function GET() {
  await deleteExpiredReleases()
  return NextResponse.json({ success: true, message: 'Expired releases deleted' })
}

export const dynamic = 'force-dynamic'