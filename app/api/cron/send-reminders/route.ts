import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'

webpush.setVapidDetails(
  'mailto:you@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

// Runs every ~5 min - see vercel.json, or an external pinger if your plan doesn't support it.
const HALF_WINDOW_MINUTES = 2.5

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()

  const sent24h = await sendForWindow(supabase, now, 24 * 60, 'notified_24h', '24h')
  const sent1h = await sendForWindow(supabase, now, 60, 'notified_1h', '1h')
  const sent5m = await sendForWindow(supabase, now, 5, 'notified_5m', '5m')

  return NextResponse.json({ ok: true, sent24h, sent1h, sent5m })
}

function describeTiming(label: '24h' | '1h' | '5m') {
  if (label === '24h') return 'tomorrow'
  if (label === '1h') return 'in about an hour'
  return 'in 5 minutes'
}

async function sendForWindow(
  supabase: ReturnType<typeof createAdminClient>,
  now: Date,
  targetMinutes: number,
  flagColumn: 'notified_24h' | 'notified_1h' | 'notified_5m',
  label: '24h' | '1h' | '5m'
) {
  const windowStart = new Date(now.getTime() + (targetMinutes - HALF_WINDOW_MINUTES) * 60 * 1000)
  const windowEnd = new Date(now.getTime() + (targetMinutes + HALF_WINDOW_MINUTES) * 60 * 1000)

  const { data: items } = await supabase
    .from('schedule_items')
    .select('id, title, item_type, due_at, course_id, courses(name)')
    .eq(flagColumn, false)
    .gte('due_at', windowStart.toISOString())
    .lte('due_at', windowEnd.toISOString())

  let sentCount = 0

  for (const item of items ?? []) {
    const { data: members } = await supabase
      .from('course_memberships')
      .select('user_id')
      .eq('course_id', item.course_id)

    for (const member of members ?? []) {
      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', member.user_id)

      for (const sub of subs ?? []) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify({
              title: `${(item as any).courses?.name}: ${item.title}`,
              body: `Due ${describeTiming(label)} - ${item.item_type}`,
            })
          )
          sentCount++
        } catch (err: any) {
          if (err?.statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id)
          } else {
            console.error('Push failed:', err)
          }
        }
      }
    }

    await supabase.from('schedule_items').update({ [flagColumn]: true }).eq('id', item.id)
  }

  return sentCount
}