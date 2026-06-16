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
  isPro: boolean;
  isTrialing: boolean;
  freezesRemaining: number;
  trialEnds: string | null;
}

export const StatusCheckIn = ({ streak, isPro, isTrialing, freezesRemaining, trialEnds }: StatusCheckInProps) => {
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
        {(isPro || isTrialing) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {isTrialing && trialEnds && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pro trial ends {new Date(trialEnds).toLocaleDateString()}
              </span>
            )}
            {isPro && !isTrialing && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Pro
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {freezesRemaining} freeze{freezesRemaining !== 1 ? "s" : ""} left this month
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
