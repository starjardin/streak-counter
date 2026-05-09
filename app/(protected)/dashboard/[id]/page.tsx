import { notFound } from 'next/navigation'
import { getStreak } from '@/lib/db/streaks'
import { getStreakLogs } from '@/lib/db/streak-logs'
import { StreakDetail } from './StreakDetail'

export default async function StreakDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let streak
  let logs
  try {
    ;[streak, logs] = await Promise.all([getStreak(id), getStreakLogs(id)])
  } catch {
    notFound()
  }

  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const checkedDates = logs
    .filter((l) => l.is_checked && l.date >= thirtyDaysAgo && l.date <= today)
    .map((l) => l.date)

  const todayChecked = checkedDates.includes(today)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <StreakDetail streak={streak} checkedDates={checkedDates} todayChecked={todayChecked} />
      </div>
    </main>
  )
}
