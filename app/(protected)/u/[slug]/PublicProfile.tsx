"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface StreakLog {
  streak_id: string;
  date: string;
  is_checked: boolean;
  checked_at: string | null;
  note: string | null;
}

interface PublicStreak {
  id: string;
  name: string;
  count: number;
  last_checked_date: string | null;
  created_at: string;
  category_id: string | null;
  logs: StreakLog[];
}

interface PublicProfileProps {
  ownerId: string;
  ownerName: string;
  streaks: PublicStreak[];
  initialRelationship: string | null;
}

function Calendar({ logs }: { logs: StreakLog[] }) {
  const today = dayjs();
  const days = Array.from({ length: 30 }, (_, i) =>
    today.subtract(29 - i, "day"),
  );
  const firstDayOfWeek = days[0].day();
  const checkedDates = new Set(logs.filter((l) => l.is_checked).map((l) => l.date));

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs font-medium text-gray-400 py-1">
            {label}
          </div>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = day.format("YYYY-MM-DD");
          const isToday = dateStr === today.format("YYYY-MM-DD");
          return (
            <div
              key={dateStr}
              className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium ${checkedDates.has(dateStr) ? "bg-green-500 text-white" : ""} ${isToday ? "ring-2 ring-blue-400" : ""}`}
            >
              {day.format("D")}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PublicProfile({ ownerId, ownerName, streaks, initialRelationship }: PublicProfileProps) {
  const [relationship, setRelationship] = useState<string | null>(initialRelationship);
  const [loading, setLoading] = useState(false);

  const handleAction = useCallback(async (action: () => Promise<{ error: string | null }>, newStatus: string | null) => {
    setLoading(true);
    try {
      const { error } = await action();
      if (error) {
        toast.error(error);
        return;
      }
      setRelationship(newStatus);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{ownerName}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {streaks.length} public {streaks.length === 1 ? "streak" : "streaks"}
              </p>
            </div>
            <div className="flex gap-2">
              {relationship === null && (
                <>
                  <button
                    onClick={() => handleAction(
                      () => fetch("/api/follow", { method: "POST", body: JSON.stringify({ targetUserId: ownerId, action: "follow" }) }).then(r => r.json()),
                      "following",
                    )}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Follow
                  </button>
                  <button
                    onClick={() => handleAction(
                      () => fetch("/api/follow", { method: "POST", body: JSON.stringify({ targetUserId: ownerId, action: "friend-request" }) }).then(r => r.json()),
                      "pending",
                    )}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
                  >
                    Add Friend
                  </button>
                </>
              )}
              {relationship === "following" && (
                <>
                  <button
                    onClick={() => handleAction(
                      () => fetch("/api/follow", { method: "POST", body: JSON.stringify({ targetUserId: ownerId, action: "friend-request" }) }).then(r => r.json()),
                      "pending",
                    )}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
                  >
                    Send Friend Request
                  </button>
                  <button
                    onClick={() => handleAction(
                      () => fetch("/api/follow", { method: "POST", body: JSON.stringify({ targetUserId: ownerId, action: "unfollow" }) }).then(r => r.json()),
                      null,
                    )}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Unfollow
                  </button>
                </>
              )}
              {relationship === "pending" && (
                <span className="px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-lg">
                  Request Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {streaks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No public streaks yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {streaks.map((streak) => {
              const today = new Date().toISOString().split("T")[0];
              return (
                <div key={streak.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{streak.name}</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {streak.count} day{streak.count !== 1 ? "s" : ""}
                        {streak.logs.some((l) => l.date === today && l.is_checked) && (
                          <span className="ml-2 text-green-600 font-medium">✓ Checked in today</span>
                        )}
                      </p>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">{streak.count}</div>
                  </div>
                  <Calendar logs={streak.logs} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
