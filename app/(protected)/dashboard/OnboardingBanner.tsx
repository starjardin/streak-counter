"use client";

import { useState } from "react";
import Link from "next/link";

interface OnboardingBannerProps {
  streakCount: number;
}

export function OnboardingBanner({ streakCount }: OnboardingBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || streakCount > 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-md mb-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-lg font-bold">Welcome to Streak Counter! 🎉</h2>
          <p className="text-blue-100 text-sm leading-relaxed max-w-lg">
            Track your daily habits by creating streaks. Check in every day to
            grow your count — don&apos;t break the chain!
          </p>
          <ol className="text-sm text-blue-100 space-y-1 mt-3">
            <li className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs font-bold">1</span>
              Click <strong>&ldquo;+ New Streak&rdquo;</strong> above to create your first habit
            </li>
            <li className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs font-bold">2</span>
              Come back daily and press <strong>Check In</strong>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs font-bold">3</span>
              Watch your streak grow and unlock Pro features with a <Link href="/pricing" className="underline font-medium">free 7-day trial</Link>
            </li>
          </ol>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/60 hover:text-white transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
