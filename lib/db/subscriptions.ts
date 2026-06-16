import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";

export type Subscription = Tables<"subscriptions">;

async function expireTrialIfNeeded(userId: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("free_trial_end, plan, status")
      .eq("user_id", userId)
      .maybeSingle();

    if (!sub) return;
    if (sub.plan !== "pro" || sub.status !== "trialing") return;
    if (!sub.free_trial_end) return;

    if (new Date(sub.free_trial_end) < new Date()) {
      await supabase
        .from("subscriptions")
        .update({ plan: "free", status: "active", free_trial_end: null })
        .eq("user_id", userId);
    }
  } catch {
    // Admin client may not be available (missing SUPABASE_SECRET_KEY).
    // The trial expiry check is best-effort.
  }
}

/** Get the current user's subscription row (server, uses auth cookie). */
export async function getSubscription(): Promise<Subscription | null> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) return null;

  await expireTrialIfNeeded(user.id);

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return data ?? null;
}

/** Upsert a subscription row via the admin client (used in webhook handler). */
export async function upsertSubscription(
  userId: string,
  values: Partial<Omit<Subscription, "user_id" | "created_at">>,
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("subscriptions")
    .upsert({ user_id: userId, ...values }, { onConflict: "user_id" });

  if (error) throw error;
}

/** Look up a user_id by their Stripe customer ID (used in webhook handler). */
export async function getUserIdByCustomer(
  customerId: string,
): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (error) throw error;
  return data?.user_id ?? null;
}
