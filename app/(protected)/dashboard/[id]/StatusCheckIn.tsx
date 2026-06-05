import { formatLastChecked } from "@/app/utils";
import { Streak } from "./type";

function formatTime(hour: number | null, minute: number | null) {
  if (hour === null) return null;
  const h = String(hour).padStart(2, "0");
  const m = String(minute ?? 0).padStart(2, "0");
  return `${h}:${m}`;
}

function formatRange(streak: Streak) {
  const from = formatTime(streak.scheduled_hour, streak.scheduled_minute);
  if (!from) return null;
  const to = formatTime(streak.end_hour, streak.end_minute);
  return to ? `${from} – ${to}` : from;
}

interface StatusCheckInProps {
  streak: Streak;
}

export const StatusCheckIn = ({ streak }: StatusCheckInProps) => {
  const range = formatRange(streak);

  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-8">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
          Current streak
        </p>
        <p className="text-8xl font-black text-blue-600 leading-none tabular-nums">
          {streak.count}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {streak.count === 1 ? "day" : "days"}
        </p>
      </div>

      <div className="sm:mb-3 space-y-1">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
            Last checked
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {formatLastChecked(streak.last_checked_date)}
          </p>
        </div>
        {range && (
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
              Scheduled
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {range}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
