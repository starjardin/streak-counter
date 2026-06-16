import dayjs from "dayjs";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface CalendarProps {
  checkedDates: Set<string>;
  lateDates: Set<string>;
  streakCreatedAt: string;
  notesByDate: Record<string, string>;
}

function getDayClass(
  isChecked: boolean,
  isLate: boolean,
  missedAndNotToday: boolean,
): string {
  if (isLate) return "bg-amber-400 text-white";
  if (isChecked) return "bg-green-500 text-white";
  if (missedAndNotToday) return "bg-red-300 text-white";
  return "";
}

export const Calendar = ({ checkedDates, lateDates, streakCreatedAt, notesByDate }: CalendarProps) => {
  const today = dayjs();
  const todayStr = today.format("YYYY-MM-DD");
  const days = Array.from({ length: 30 }, (_, i) =>
    today.subtract(29 - i, "day"),
  );
  const firstDayOfWeek = days[0].day();

  const entries = Object.entries(notesByDate).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
        Last 30 days
      </h2>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-gray-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }, (_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = day.format("YYYY-MM-DD");
          const isChecked = checkedDates.has(dateStr);
          const isLate = lateDates.has(dateStr);
          const isToday = dateStr === todayStr;
          const missed = day.isAfter(streakCreatedAt, "day");
          const missedAndNotToday = missed && !isToday;
          const note = notesByDate[dateStr];
          const title = note
            ? `${day.format("MMM D, YYYY")} — ${note}`
            : day.format("MMM D, YYYY");
          return (
            <div
              key={dateStr}
              title={title}
              className={[
                "aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-colors relative",
                getDayClass(isChecked, isLate, missedAndNotToday),
                isToday ? "ring-2 ring-blue-500 ring-offset-1" : "",
              ].join(" ")}
            >
              {day.format("D")}
              {note && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-white border border-current" />
              )}
            </div>
          );
        })}
      </div>

      {entries.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Journal
          </h3>
          <div className="space-y-2">
            {entries.slice(0, 5).map(([date, note]) => (
              <div key={date} className="text-sm">
                <span className="font-medium text-gray-700">
                  {dayjs(date).format("MMM D")}
                </span>
                <span className="text-gray-500 ml-2">{note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />
          On time
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
          Late
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-300 inline-block" />
          Missed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gray-100 ring-2 ring-blue-500 ring-offset-0.5 inline-block" />
          Today
        </span>
      </div>
    </div>
  );
};
