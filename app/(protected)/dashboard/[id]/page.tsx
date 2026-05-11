import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getStreak } from '@/lib/db/streaks'
import { getRecentStreakLogs } from '@/lib/db/streak-logs'

const StreakDetail = dynamic(
  () => import('./StreakDetail').then((m) => ({ default: m.StreakDetail }))
)

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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <StreakDetail streak={streak} checkedDates={checkedDates} todayChecked={todayChecked} />
      </div>
    </main>
  )
}
