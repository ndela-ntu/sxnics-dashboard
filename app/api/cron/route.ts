import { deleteExpiredReleases, deletePastEvents } from '@/app/actions'
import { NextResponse } from 'next/server'


export async function GET() {
  await deleteExpiredReleases();
  await deletePastEvents();
  return NextResponse.json({ success: true, message: 'Expired releases deleted' })
}

export const dynamic = 'force-dynamic'