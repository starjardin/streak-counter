import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function getCheckInLabel(dateString: string) {
  const checkIn = dayjs.utc(dateString).tz(userTimezone);
  const today = dayjs().tz(userTimezone);

  const diffDays = today.startOf("day").diff(checkIn.startOf("day"), "day");

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return ` ${checkIn.format("MMMM D, YYYY")}`;
}

export function formatLastChecked(date: string | null) {
  if (!date) return "Never";

  const daysAgo = dayjs()
    .startOf("day")
    .diff(dayjs(date).startOf("day"), "day");
  if (daysAgo <= 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo} days ago`;
}
