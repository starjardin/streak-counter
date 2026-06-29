import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import { getStreak } from '@/lib/db/streaks'
import { getRecentStreakLogs } from '@/lib/db/streak-logs'
import { getSubscription } from '@/lib/db/subscriptions'
import { getRemainingFreezes } from '@/lib/db/streak-freezes'

const StreakDetail = dynamic(
  () => import('./StreakDetail').then((m) => ({ default: m.StreakDetail }))
)

function isOnTime(
  checkedAt: string | null,
  date: string,
  scheduledHour: number | null,
  scheduledMinute: number | null,
  timeEnforced: boolean,
): boolean {
  if (!timeEnforced || scheduledHour === null) return true
  if (!checkedAt) return true

  const checked = new Date(checkedAt).getTime()
  const scheduled = new Date(
    `${date}T${String(scheduledHour).padStart(2, '0')}:${String(scheduledMinute ?? 0).padStart(2, '0')}:00Z`,
  ).getTime()

  return Math.abs(checked - scheduled) <= 60 * 60 * 1000
}

export default async function StreakDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("id", authUser!.id)
    .single()
  const username = profile?.username ?? authUser!.id

  let streak
  let logs
  let subscription
  let freezesRemaining
  try {
    ;[streak, logs, subscription] = await Promise.all([
      getStreak(id),
      getRecentStreakLogs(id, 30),
      getSubscription(),
    ])
    freezesRemaining = subscription?.plan === 'pro' && (subscription?.status === 'active' || subscription?.status === 'trialing')
      ? await getRemainingFreezes(streak.user_id)
      : 0
  } catch {
    notFound()
  }

  const isTrialing = subscription?.status === 'trialing'
  const isPro = subscription?.plan === 'pro' && (subscription?.status === 'active' || isTrialing)
  const trialEnds = subscription?.free_trial_end ?? null

  const today = new Date().toISOString().split('T')[0]
  const checkedDates = logs.map((l) => l.date)
  const todayChecked = checkedDates.includes(today)
  const notesByDate: Record<string, string> = {}
  for (const l of logs) {
    if (l.note) notesByDate[l.date] = l.note
  }

  const onTimeDates = logs
    .filter((l) => isOnTime(l.checked_at, l.date, streak.scheduled_hour, streak.scheduled_minute, streak.time_enforced))
    .map((l) => l.date)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <StreakDetail
        streak={streak}
        username={username}
        checkedDates={checkedDates}
        onTimeDates={onTimeDates}
        todayChecked={todayChecked}
        isPro={isPro}
        isTrialing={isTrialing}
        freezesRemaining={freezesRemaining}
        trialEnds={trialEnds}
        notesByDate={notesByDate}
      />
    </div>
  )
}
