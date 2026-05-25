import { formatLastChecked } from "@/app/utils";
import { Streak } from "./type";

interface StatusCheckInProps {
  streak: Streak;
}

export const StatusCheckIn = ({ streak }: StatusCheckInProps) => {
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

      <div className="sm:mb-3">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
          Last checked
        </p>
        <p className="text-lg font-semibold text-gray-900">
          {formatLastChecked(streak.last_checked_date)}
        </p>
      </div>
    </div>
  );
};
