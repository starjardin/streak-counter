import dayjs from "dayjs";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface CalendarProps {
  checkedDates: string[];
}

export const Calendar = ({ checkedDates }: CalendarProps) => {
  const today = dayjs();
  const todayStr = today.format("YYYY-MM-DD");
  const checkedSet = new Set(checkedDates);
  const days = Array.from({ length: 30 }, (_, i) =>
    today.subtract(29 - i, "day"),
  );
  const firstDayOfWeek = days[0].day();
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
          const isChecked = checkedSet.has(dateStr);
          const isToday = dateStr === todayStr;
          return (
            <div
              key={dateStr}
              title={day.format("MMM D, YYYY")}
              className={[
                "aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-colors",
                isChecked
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-400",
                isToday ? "ring-2 ring-blue-500 ring-offset-1" : "",
              ].join(" ")}
            >
              {day.format("D")}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />
          Checked in
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gray-100 inline-block" />
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
