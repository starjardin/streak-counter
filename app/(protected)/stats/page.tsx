import { Suspense } from 'react'
import Link from 'next/link'
import { connection } from 'next/server'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import { getStreaks } from '@/lib/db/streaks'
import { getAllCheckedLogs } from '@/lib/db/streak-logs'
import { WeeklyBarChart } from './WeeklyBarChart'
import { YearHeatmap } from './YearHeatmap'

dayjs.extend(isoWeek)

export default function StatsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stats</h1>
            <p className="text-sm text-gray-500 mt-1">Your streak activity overview</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
        </div>
      </header>

      <Suspense fallback={<StatsContentSkeleton />}>
        <StatsContent />
      </Suspense>
    </main>
  )
}

async function StatsContent() {
  await connection()

  const [streaksResult, allDatesResult] = await Promise.allSettled([
    getStreaks(),
    getAllCheckedLogs(),
  ])

  const streaks = streaksResult.status === 'fulfilled' ? streaksResult.value : []
  const allDates = allDatesResult.status === 'fulfilled' ? allDatesResult.value : []

  if (streaksResult.status === 'rejected') {
    console.error('Failed to load streaks for stats page', streaksResult.reason)
  }
  if (allDatesResult.status === 'rejected') {
    console.error('Failed to load check-ins for stats page', allDatesResult.reason)
  }

  // ── Stat cards ───────────────────────────────────────────────────────────────
  const totalStreaks = streaks.length
  const longestActive = streaks.reduce((max, s) => Math.max(max, s.count), 0)
  const totalCheckIns = allDates.length

  // Average check-in rate: unique checked days / days since earliest check-in
  let avgRate = 0
  if (allDates.length > 0) {
    const earliest = dayjs(allDates[0])
    const daysSince = dayjs().diff(earliest, 'day') + 1
    const uniqueDays = new Set(allDates).size
    avgRate = Math.round((uniqueDays / daysSince) * 100)
  }

  // ── Weekly bar chart data (last 8 weeks) ─────────────────────────────────────
  const today = dayjs()
  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = today.subtract(7 - i, 'week').startOf('isoWeek')
    const weekEnd = weekStart.endOf('isoWeek')
    const label = weekStart.format('MMM D')
    const count = allDates.filter((d) => {
      const day = dayjs(d)
      return (day.isAfter(weekStart) || day.isSame(weekStart, 'day')) &&
        (day.isBefore(weekEnd) || day.isSame(weekEnd, 'day'))
    }).length
    return { label, count }
  })

  // ── Year heatmap ─────────────────────────────────────────────────────────────
  const currentYear = today.year()
  const yearDates = allDates.filter((d) => d.startsWith(`${currentYear}-`))
  // Deduplicate dates (multiple streaks can share a date)
  const uniqueYearDates = [...new Set(yearDates)]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total streaks', value: totalStreaks },
            { label: 'Longest active', value: `${longestActive}d` },
            { label: 'Avg check-in rate', value: `${avgRate}%` },
            { label: 'Total check-ins', value: totalCheckIns },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
              <p className="text-3xl font-black text-gray-900 mt-2 tabular-nums">{value}</p>
            </div>
          ))}
        </div>

        {/* Weekly check-ins chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Check-ins — last 8 weeks
          </h2>
          <WeeklyBarChart data={weeklyData} />
        </div>

        {/* Per-streak count chart */}
        {streaks.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Current count per streak
            </h2>
            <WeeklyBarChart
              data={streaks.map((s) => ({ label: s.name, count: s.count }))}
            />
          </div>
        )}

        {/* Year heatmap */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            {currentYear} contributions
          </h2>
          {uniqueYearDates.length === 0 ? (
            <p className="text-sm text-gray-400">No check-ins yet this year.</p>
          ) : (
            <YearHeatmap checkedDates={uniqueYearDates} year={currentYear} />
          )}
        </div>

        {/* Per-streak breakdown */}
        {streaks.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Streak breakdown
            </h2>
            <div className="divide-y divide-gray-100">
              {streaks.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <Link
                    href={`/dashboard/${s.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {s.name}
                  </Link>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>
                      <span className="font-semibold text-gray-900">{s.count}</span> days
                    </span>
                    <span>
                      Last:{' '}
                      <span className="font-medium text-gray-700">
                        {s.last_checked_date
                          ? dayjs(s.last_checked_date).format('MMM D')
                          : 'never'}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  )
}

function StatsContentSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-16 bg-gray-100 rounded mt-3" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-4 w-48 bg-gray-200 rounded mb-4" />
        <div className="h-[200px] bg-gray-100 rounded-lg" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
        <div className="h-32 bg-gray-100 rounded-lg" />
      </div>
    </div>
  )
}
