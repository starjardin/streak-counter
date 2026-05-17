"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createStreak,
  checkInStreak,
  updateStreak,
  deleteStreak,
  getStreaks,
} from "@/lib/db/streaks";
import { getSubscription } from "@/lib/db/subscriptions";
import { FREE_TIER_STREAK_LIMIT } from "@/lib/stripe";

export async function createStreakAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const name = ((formData.get("name") as string | null) ?? "").trim();

  if (!name) return "Streak name is required";
  if (name.length > 50) return "Streak name must be 50 characters or less";

  // Enforce free-tier limit
  const subscription = await getSubscription();

  console.log("Subscription in createStreakAction", subscription); // Debug log
  const isPro =
    subscription?.plan === "pro" && subscription?.status === "active";
  if (!isPro) {
    const existing = await getStreaks();
    if (existing.length >= FREE_TIER_STREAK_LIMIT) {
      return `Free plan is limited to ${FREE_TIER_STREAK_LIMIT} streaks. Upgrade to Pro for unlimited streaks.`;
    }
  }

  let streakId: string;
  try {
    const streak = await createStreak({ name });
    streakId = streak.id;
  } catch (err) {
    if (err instanceof Error) return err.message;
    return "Failed to create streak";
  }

  redirect(`/dashboard/${streakId}`);
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
