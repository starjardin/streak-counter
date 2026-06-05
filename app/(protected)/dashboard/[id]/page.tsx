import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getStreak } from '@/lib/db/streaks'
import { getRecentStreakLogs } from '@/lib/db/streak-logs'

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

  let streak
  let logs
  try {
    ;[streak, logs] = await Promise.all([getStreak(id), getRecentStreakLogs(id, 30)])
  } catch {
    notFound()
  }

  const today = new Date().toISOString().split('T')[0]
  const checkedDates = logs.map((l) => l.date)
  const todayChecked = checkedDates.includes(today)

  const onTimeDates = logs
    .filter((l) => isOnTime(l.checked_at, l.date, streak.scheduled_hour, streak.scheduled_minute, streak.time_enforced))
    .map((l) => l.date)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <StreakDetail
          streak={streak}
          checkedDates={checkedDates}
          onTimeDates={onTimeDates}
          todayChecked={todayChecked}
        />
      </div>
    </main>
  )
}
