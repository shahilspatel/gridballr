import { NextResponse } from 'next/server'

// This endpoint is called by Vercel Cron to check if prospect data is stale.
// Configure in vercel.json: crons: [{ path: "/api/cron/stale-check", schedule: "0 9 * * 1" }]
// Runs every Monday at 9am UTC.

const STALE_THRESHOLD_DAYS = 14

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check git log for last modification of seed data
  // In production, this could check a "last_updated" field in Supabase
  const now = new Date()
  const lastUpdate = new Date(process.env.PROSPECT_DATA_LAST_UPDATED ?? '2025-04-08')
  const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))

  const isStale = daysSinceUpdate >= STALE_THRESHOLD_DAYS

  if (isStale) {
    // Send notification — in production, wire this to email/Slack
    // For now, log it and return the status
    return NextResponse.json({
      status: 'stale',
      daysSinceUpdate,
      message: `Prospect data last updated ${daysSinceUpdate} days ago. Time to refresh rankings.`,
      lastUpdate: lastUpdate.toISOString(),
    })
  }

  return NextResponse.json({
    status: 'fresh',
    daysSinceUpdate,
    message: `Data is current (${daysSinceUpdate} days old).`,
    lastUpdate: lastUpdate.toISOString(),
  })
}
