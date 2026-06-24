"use server";

import { revalidatePath } from "next/cache";
import {
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  canCreateEntry,
  getJournalEntry,
  getJournalEntries,
} from "@/lib/db/journal-entries";

export async function createJournalEntryAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const date = (formData.get("date") as string | null) ?? "";
  const title = (formData.get("title") as string | null) ?? "";
  const body = (formData.get("body") as string | null) ?? "";

  if (!date) return "Date is required";
  if (!body.trim()) return "Entry body is required";

  const allowed = await canCreateEntry();
  if (!allowed) {
    return "You've reached the free tier limit of 10 journal entries. Upgrade to Pro for unlimited entries.";
  }

  try {
    await createJournalEntry(
      date,
      title.trim() || null,
      body,
    );
    revalidatePath("/dashboard/journal");
    return null;
  } catch {
    return "Failed to create entry";
  }
}

export async function updateJournalEntryAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const id = (formData.get("id") as string | null) ?? "";
  const title = (formData.get("title") as string | null) ?? "";
  const body = (formData.get("body") as string | null) ?? "";

  if (!id) return "Entry ID is required";
  if (!body.trim()) return "Entry body is required";

  try {
    await updateJournalEntry(id, {
      title: title.trim() || null,
      body,
    });
    revalidatePath("/dashboard/journal");
    return null;
  } catch {
    return "Failed to update entry";
  }
}

export async function deleteJournalEntryAction(
  id: string,
): Promise<string | null> {
  if (!id) return "Entry ID is required";

  try {
    await deleteJournalEntry(id);
    revalidatePath("/dashboard/journal");
    return null;
  } catch {
    return "Failed to delete entry";
  }
}

import type { Tables } from "@/types/database.types";

export async function getEntriesForDateAction(date: string): Promise<Tables<"journal_entries">[]> {
  if (!date) return [];
  try {
    return await getJournalEntries(date);
  } catch {
    return [];
  }
}
