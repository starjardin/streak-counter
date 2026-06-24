"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const DashboardTabs = () => {
  const pathname = usePathname();
  const isJournal = pathname === "/dashboard/journal";

  return (
    <div className="flex gap-1 border-b border-gray-200">
      <Link
        href="/dashboard"
        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
          !isJournal
            ? "text-blue-600 border-blue-600"
            : "text-gray-500 border-transparent hover:text-gray-700"
        }`}
      >
        Streaks
      </Link>
      <Link
        href="/dashboard/journal"
        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
          isJournal
            ? "text-blue-600 border-blue-600"
            : "text-gray-500 border-transparent hover:text-gray-700"
        }`}
      >
        Journal
      </Link>
    </div>
  );
};
