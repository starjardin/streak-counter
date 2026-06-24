import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/db/subscriptions";
import { FREE_TIER_JOURNAL_ENTRY_LIMIT } from "@/lib/stripe";

export async function getJournalEntries(date: string) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", date)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getJournalEntry(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getJournalEntryCount() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Not authenticated");

  const { count, error } = await supabase
    .from("journal_entries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (error) throw error;
  return count ?? 0;
}

export async function getDatesWithEntries() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("journal_entries")
    .select("date")
    .eq("user_id", user.id);

  if (error) throw error;
  return [...new Set(data.map((e) => e.date))];
}

export async function canCreateEntry() {
  const subscription = await getSubscription();
  const isPro =
    subscription?.plan === "pro" && subscription?.status === "active";
  if (isPro) return true;

  const count = await getJournalEntryCount();
  return count < FREE_TIER_JOURNAL_ENTRY_LIMIT;
}

export async function createJournalEntry(
  date: string,
  title: string | null,
  body: string,
) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({ user_id: user.id, date, title, body })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateJournalEntry(
  id: string,
  values: { title?: string | null; body?: string },
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteJournalEntry(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
