import { useAuth } from "@/context/AuthProvider";
import dayjs from "dayjs";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface CalendarProps {
  checkedDates: Set<string>;
  lateDates: Set<string>;
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

export const Calendar = ({ checkedDates, lateDates }: CalendarProps) => {
  const { user, loading } = useAuth();
  const today = dayjs();
  const todayStr = today.format("YYYY-MM-DD");
  const days = Array.from({ length: 30 }, (_, i) =>
    today.subtract(29 - i, "day"),
  );
  const firstDayOfWeek = days[0].day();

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <button
          type="button"
          className="inline-flex items-center text-body bg-neutral-primary-soft border border-default hover:bg-neutral-secondary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary-soft shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none"
        >
          <svg
            aria-hidden="true"
            className="w-4 h-4 text-neutral-tertiary animate-spin fill-brand me-2"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          Loading...
        </button>
      </div>
    );
  }

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
          const missed = day.isAfter(user?.created_at, "day");
          const missedAndNotToday = missed && !isToday;
          return (
            <div
              key={dateStr}
              title={day.format("MMM D, YYYY")}
              className={[
                "aspect-square bg-gray-100 text-gray-400 rounded-md flex items-center justify-center text-xs font-medium transition-colors",
                getDayClass(isChecked, isLate, missedAndNotToday),
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
