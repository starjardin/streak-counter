"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createStreak,
  checkInStreak,
  updateStreak,
  deleteStreak,
  getStreaks,
  getStreakBySchedule,
} from "@/lib/db/streaks";
import { getSubscription } from "@/lib/db/subscriptions";
import { FREE_TIER_STREAK_LIMIT } from "@/lib/stripe";

function parseSchedule(formData: FormData) {
  const hasTime = formData.get("has_scheduled_time") === "on";
  if (!hasTime) return {};

  const hour = parseInt(formData.get("scheduled_hour") as string, 10);
  const minute = parseInt(formData.get("scheduled_minute") as string, 10);
  const endHour = parseInt(formData.get("end_hour") as string, 10);
  const endMinute = parseInt(formData.get("end_minute") as string, 10);
  const enforced = formData.get("time_enforced") === "on";

  if (isNaN(hour) || isNaN(minute) || isNaN(endHour) || isNaN(endMinute)) return {};
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return {};
  if (endHour < 0 || endHour > 23 || endMinute < 0 || endMinute > 59) return {};

  const start = hour * 60 + minute;
  const end = endHour * 60 + endMinute;
  if (end <= start) return {};

  return {
    scheduled_hour: hour,
    scheduled_minute: minute,
    end_hour: endHour,
    end_minute: endMinute,
    time_enforced: enforced,
  };
}

export async function createStreakAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const name = ((formData.get("name") as string | null) ?? "").trim();

  if (!name) return "Streak name is required";
  if (name.length > 50) return "Streak name must be 50 characters or less";

  const schedule = parseSchedule(formData);

  // Check for conflicting time ranges
  if (schedule.scheduled_hour !== undefined) {
    const conflict = await getStreakBySchedule(
      schedule.scheduled_hour,
      schedule.scheduled_minute,
      schedule.end_hour!,
      schedule.end_minute!,
    );
    if (conflict) {
      const t = `${String(conflict.scheduled_hour).padStart(2, "0")}:${String(conflict.scheduled_minute).padStart(2, "0")}`;
      const tEnd = conflict.end_hour !== null
        ? `${String(conflict.end_hour).padStart(2, "0")}:${String(conflict.end_minute).padStart(2, "0")}`
        : null;
      const range = tEnd ? `${t} – ${tEnd}` : t;
      return `"${conflict.name}" already scheduled at ${range}`;
    }
  }

  let streakId: string;
  try {
    const subscription = await getSubscription();

    const isPro =
      subscription?.plan === "pro" && subscription?.status === "active";
    if (!isPro) {
      const existing = await getStreaks();
      if (existing.length >= FREE_TIER_STREAK_LIMIT) {
        return `Free plan is limited to ${FREE_TIER_STREAK_LIMIT} streaks. Upgrade to Pro for unlimited streaks.`;
      }
    }

    const streak = await createStreak({ name, ...schedule });
    streakId = streak.id;
  } catch (err) {
    if (err instanceof Error) return err.message;
    return "Failed to create streak";
  }

  redirect(`/dashboard/${streakId}`);
}

export async function updateStreakScheduleAction(
  streakId: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const hasTime = formData.get("has_scheduled_time") === "on";

  if (!hasTime) {
    try {
      await updateStreak(streakId, {
        scheduled_hour: null,
        scheduled_minute: null,
        end_hour: null,
        end_minute: null,
        time_enforced: false,
      });
    } catch (err) {
      if (err instanceof Error) return err.message;
      return "Failed to clear schedule";
    }
    revalidatePath(`/dashboard/${streakId}`);
    return null;
  }

  const schedule = parseSchedule(formData);

  if (schedule.scheduled_hour !== undefined) {
    const conflict = await getStreakBySchedule(
      schedule.scheduled_hour,
      schedule.scheduled_minute,
      schedule.end_hour!,
      schedule.end_minute!,
      streakId,
    );
    if (conflict) {
      const t = `${String(conflict.scheduled_hour).padStart(2, "0")}:${String(conflict.scheduled_minute).padStart(2, "0")}`;
      const tEnd = conflict.end_hour !== null
        ? `${String(conflict.end_hour).padStart(2, "0")}:${String(conflict.end_minute).padStart(2, "0")}`
        : null;
      const range = tEnd ? `${t} – ${tEnd}` : t;
      return `"${conflict.name}" already scheduled at ${range}`;
    }
  }

  try {
    await updateStreak(streakId, schedule);
  } catch (err) {
    if (err instanceof Error) return err.message;
    return "Failed to update schedule";
  }

  revalidatePath(`/dashboard/${streakId}`);
  return null;
}

export async function checkInAction(
  streakId: string,
  _prevState: string | null,
  _formData: FormData,
): Promise<string | null> {
  try {
    await checkInStreak(streakId);
  } catch (err) {
    if (err instanceof Error) return err.message;
    return "Failed to check in";
  }
  revalidatePath(`/dashboard/${streakId}`);
  return null;
}

export async function updateStreakInfoAction(
  streakId: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const name = ((formData.get("name") as string | null) ?? "").trim();

  if (!name) return "Streak name is required";
  if (name.length > 50) return "Streak name must be 50 characters or less";

  const hasTime = formData.get("has_scheduled_time") === "on";

  if (!hasTime) {
    try {
      await updateStreak(streakId, {
        name,
        scheduled_hour: null,
        scheduled_minute: null,
        end_hour: null,
        end_minute: null,
        time_enforced: false,
      });
    } catch (err) {
      if (err instanceof Error) return err.message;
      return "Failed to update streak";
    }
    revalidatePath(`/dashboard/${streakId}`);
    return null;
  }

  const schedule = parseSchedule(formData);

  if (schedule.scheduled_hour !== undefined) {
    const conflict = await getStreakBySchedule(
      schedule.scheduled_hour,
      schedule.scheduled_minute,
      schedule.end_hour!,
      schedule.end_minute!,
      streakId,
    );
    if (conflict) {
      const t = `${String(conflict.scheduled_hour).padStart(2, "0")}:${String(conflict.scheduled_minute).padStart(2, "0")}`;
      const tEnd = conflict.end_hour !== null
        ? `${String(conflict.end_hour).padStart(2, "0")}:${String(conflict.end_minute).padStart(2, "0")}`
        : null;
      const range = tEnd ? `${t} – ${tEnd}` : t;
      return `"${conflict.name}" already scheduled at ${range}`;
    }
  }

  try {
    await updateStreak(streakId, { name, ...schedule });
  } catch (err) {
    if (err instanceof Error) return err.message;
    return "Failed to update streak";
  }

  revalidatePath(`/dashboard/${streakId}`);
  return null;
}

export async function updateStreakNameAction(
  streakId: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const name = ((formData.get("name") as string | null) ?? "").trim();

  if (!name) return "Name is required";
  if (name.length > 50) return "Name must be 50 characters or less";

  try {
    await updateStreak(streakId, { name });
  } catch (err) {
    if (err instanceof Error) return err.message;
    return "Failed to update name";
  }
  revalidatePath(`/dashboard/${streakId}`);
  return null;
}

export async function deleteStreakAction(
  streakId: string,
  _prevState: string | null,
  _formData: FormData,
): Promise<string | null> {
  try {
    await deleteStreak(streakId);
  } catch (err) {
    if (err instanceof Error) return err.message;
    return "Failed to delete streak";
  }
  redirect("/dashboard");
}
