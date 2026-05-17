import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";

export type Subscription = Tables<"subscriptions">;

/** Get the current user's subscription row (server, uses auth cookie). */
export async function getSubscription(): Promise<Subscription | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

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
  const { data } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return data?.user_id ?? null;
}
