"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

function normalizeAppUrl(value: string | undefined | null) {
  if (!value) return null;

  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function isLocalhostUrl(value: string) {
  try {
    const { hostname } = new URL(value);
    return ["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"].includes(
      hostname,
    );
  } catch {
    return false;
  }
}

async function getAppUrl() {
  const envCandidates = [
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of envCandidates) {
    const normalized = normalizeAppUrl(candidate);
    if (!normalized) continue;
    if (process.env.VERCEL && isLocalhostUrl(normalized)) continue;
    return normalized;
  }

  const headersList = await headers();

  const origin = normalizeAppUrl(headersList.get("origin"));
  if (origin && !(process.env.VERCEL && isLocalhostUrl(origin))) return origin;

  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") ?? "https";
  const derived = host ? normalizeAppUrl(`${proto}://${host}`) : null;
  if (derived && !(process.env.VERCEL && isLocalhostUrl(derived))) {
    return derived;
  }

  return "";
}

export async function signup(_prevState: string | null, formData: FormData) {
  const supabase = await createClient();
  const appUrl = await getAppUrl();

  if (!appUrl) return "App URL is not configured. Set APP_URL.";

  const { data, error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      emailRedirectTo: `${appUrl}/login`,
    },
  });

  if (error) return error.message;

  // Email confirmation required — session is null until user confirms
  if (!data.session) redirect("/signup/confirm");

  redirect("/dashboard");
}

export async function login(_prevState: string | null, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) return error.message;

  redirect("/dashboard");
}

export async function forgotPassword(
  _prevState: string | null,
  formData: FormData,
): Promise<string> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  if (!email) return "Enter your email address.";

  const supabase = await createClient();
  const appUrl = await getAppUrl();

  if (!appUrl) return "App URL is not configured. Set APP_URL.";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/reset-password`,
  });

  // Avoid email enumeration: always return the same response to the UI.
  if (error) {
  }

  return "If an account exists for that email, we sent a password reset link.";
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function changePasswordAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const newPassword = (formData.get("new_password") as string | null) ?? "";
  const confirm = (formData.get("confirm_password") as string | null) ?? "";

  if (newPassword.length < 6) return "Password must be at least 6 characters";
  if (newPassword !== confirm) return "Passwords do not match";

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return error.message;

  revalidatePath("/settings");
  return "PASSWORD_CHANGED";
}

export async function deleteAccountAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const confirm = (formData.get("confirm") as string | null) ?? "";
  if (confirm !== "DELETE") return "Type DELETE to confirm";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Not authenticated";

  // Delete from public.users — cascades to streaks, streak_logs, preferences
  const { error: dbError } = await supabase
    .from("users")
    .delete()
    .eq("id", user.id);
  if (dbError) return dbError.message;

  // Delete the auth user via admin API (requires service-role key)
  const adminClient = await import("@/lib/supabase/admin").then((m) =>
    m.createAdminClient(),
  );
  const { error: authError } = await adminClient.auth.admin.deleteUser(user.id);
  if (authError) return authError.message;

  await supabase.auth.signOut();
  redirect("/login");
}
