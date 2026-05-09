'use client'

import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'

dayjs.extend(dayOfYear)

interface Props {
  /** All checked-in dates for the year, as 'YYYY-MM-DD' strings. */
  checkedDates: string[]
  year: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

/** Returns a shade class based on how many check-ins fell on a date.
 *  (Dates are deduplicated across streaks before being passed in, so this is 0 or 1.)
 */
function cellColor(count: number): string {
  if (count === 0) return 'bg-gray-100'
  return 'bg-green-500'
}

export function YearHeatmap({ checkedDates, year }: Props) {
  const checkedSet = new Set(checkedDates)

  const jan1 = dayjs(`${year}-01-01`)
  // Week starts on Sunday (0). Number of leading empty cells before Jan 1.
  const startPad = jan1.day()

  // Build an array of every day in the year
  const daysInYear = jan1.isLeapYear() ? 366 : 365
  const days = Array.from({ length: daysInYear }, (_, i) => jan1.add(i, 'day'))

  // Group into weeks (columns)
  const totalCells = startPad + daysInYear
  const numWeeks = Math.ceil(totalCells / 7)

  // Month label positions: find the first day of each month, map to week column index
  const monthLabels: { col: number; label: string }[] = []
  for (let m = 0; m < 12; m++) {
    const firstOfMonth = dayjs(`${year}-${String(m + 1).padStart(2, '0')}-01`)
    const col = Math.floor((startPad + firstOfMonth.dayOfYear() - 1) / 7)
    monthLabels.push({ col, label: MONTHS[m] })
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="inline-grid gap-x-0 gap-y-0"
        style={{ gridTemplateColumns: `28px repeat(${numWeeks}, minmax(0, 1fr))` }}
      >
        {/* Day-of-week labels column */}
        <div className="col-start-1 row-start-2 grid grid-rows-7 gap-0.75 pr-1 pt-px">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-2.75 text-[10px] text-gray-400 leading-none text-right">
              {label}
            </div>
          ))}
        </div>

        {/* Month header row */}
        {monthLabels.map(({ col, label }) => (
          <div
            key={label}
            className="text-[10px] text-gray-400 col-span-1 row-start-1 pb-1"
            style={{ gridColumnStart: col + 2 /* +1 for day-label col, +1 for 1-based */ }}
          >
            {label}
          </div>
        ))}

        {/* Heatmap cells */}
        {Array.from({ length: numWeeks }, (_, week) =>
          Array.from({ length: 7 }, (_, dow) => {
            const cellIndex = week * 7 + dow
            const dayIndex = cellIndex - startPad
            const day = dayIndex >= 0 && dayIndex < daysInYear ? days[dayIndex] : null
            const dateStr = day ? day.format('YYYY-MM-DD') : null
            const count = dateStr && checkedSet.has(dateStr) ? 1 : 0

            return (
              <div
                key={`${week}-${dow}`}
                title={dateStr ? `${dateStr}${count ? ' ✓' : ''}` : undefined}
                className={[
                  'w-2.75 h-2.75 rounded-xs m-[1.5px] row-start-2',
                  day ? cellColor(count) : 'bg-transparent',
                ].join(' ')}
                style={{ gridColumnStart: week + 2, gridRowStart: dow + 1 }}
              />
            )
          })
        )}
      </div>

      <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-400">
        <span>Less</span>
        {[0, 1].map((v) => (
          <span key={v} className={`w-2.75 h-2.75 rounded-xs inline-block ${cellColor(v)}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
