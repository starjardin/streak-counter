import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";

export type StreakFreeze = Tables<"streak_freezes">;

const FREEZES_PER_MONTH = 5;

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function getFreezesUsedInMonth(userId: string): Promise<number> {
  try {
    const supabase = createAdminClient();
    const month = currentMonth();
    const start = `${month}-01`;
    const endDate = new Date();
    const next = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1);
    const end = next.toISOString().split("T")[0];

    const { count, error } = await supabase
      .from("streak_freezes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("date", start)
      .lt("date", end);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function useFreeze(
  userId: string,
  streakId: string,
  date: string,
): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("streak_freezes").insert({
      user_id: userId,
      streak_id: streakId,
      date,
    });
    if (error) return false;
    return true;
  } catch {
    return false;
  }
}

export async function getRemainingFreezes(userId: string): Promise<number> {
  const used = await getFreezesUsedInMonth(userId);
  return Math.max(0, FREEZES_PER_MONTH - used);
}

export { FREEZES_PER_MONTH };
