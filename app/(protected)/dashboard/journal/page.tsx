import { logout } from "@/app/actions/auth";
import Link from "next/link";
import { UserAvatar } from "../UserAvatar";
import { Button } from "@/components/Button";
import { DashboardTabs } from "../DashboardTabs";
import { isCurrentUserAdmin } from "@/lib/db/users";
import { createClient } from "@/lib/supabase/server";
import { getJournalEntries, getDatesWithEntries } from "@/lib/db/journal-entries";
import { JournalPage } from "./JournalPage";

export default async function JournalPageServer() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const admin = await isCurrentUserAdmin();

  let displayName = authUser?.email ?? "Unknown user";
  if (authUser) {
    const { data: profile } = await supabase
      .from("users")
      .select("username")
      .eq("id", authUser.id)
      .single();
    if (profile?.username) {
      displayName = profile.username;
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const [datesWithEntries, todayEntries] = await Promise.all([
    getDatesWithEntries(),
    getJournalEntries(today),
  ]);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Streak Counter
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Track your daily habits
              </p>
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="/stats"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Stats
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Leaderboard
              </Link>
              <Link
                href="/friends"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Friends
              </Link>
              <Link
                href="/billing"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Billing
              </Link>
              <Link
                href="/settings"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Settings
              </Link>
              {admin && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                >
                  Admin
                </Link>
              )}
              <UserAvatar displayName={displayName} />
              <form action={logout}>
                <Button
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  type="submit"
                >
                  Log out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <DashboardTabs />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <JournalPage
          datesWithEntries={datesWithEntries}
          todayEntries={todayEntries}
        />
      </div>
    </main>
  );
}
