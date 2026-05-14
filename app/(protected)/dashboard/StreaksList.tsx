"use client";

import { Button } from "@/components/Button";
import { useStreaks } from "@/hooks/useStreaks";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { useState } from "react";

dayjs.extend(relativeTime);

export function StreaksList() {
  const { streaks, loading, error, deleting, deleteStreak } = useStreaks();
  const [deletionError, setDeletionError] = useState<string | null>(null);

  const handleDelete = async (streakId: string) => {
    if (!confirm("Are you sure you want to delete this streak?")) return;
    setDeletionError(null);
    const { error } = await deleteStreak(streakId);
    if (error) setDeletionError(error);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading streaks: {error}</p>
      </div>
    );
  }

  // Empty state
  if (streaks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m0 0h6"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No streaks yet
        </h3>
        <p className="text-gray-500">Create your first streak to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {deletionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{deletionError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {streaks.map((streak) => (
          <div
            key={streak.id}
            className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <Link
                href={`/dashboard/${streak.id}`}
                className="flex-1 min-w-0 p-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                  {streak.name}
                </h3>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Current Count</p>
                    <p className="text-2xl font-bold text-blue-600 mt-0.5">
                      {streak.count}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Last Checked</p>
                    <p className="text-gray-900 font-medium mt-0.5">
                      {streak.last_checked_date
                        ? dayjs(streak.last_checked_date).fromNow()
                        : "Never"}
                    </p>
                  </div>
                </div>
              </Link>

              <Button
                onClick={() => handleDelete(streak.id)}
                disabled={deleting === streak.id}
                className="ml-4 mr-4 mt-4 inline-flex items-center justify-center p-2 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Delete streak"
              >
                {deleting === streak.id ? (
                  <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
