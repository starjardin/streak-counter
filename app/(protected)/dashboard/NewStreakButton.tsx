"use client";

import { useActionState, useState } from "react";
import { createStreakAction } from "@/app/actions/streaks";
import { Button } from "@/components/Button";

export function NewStreakButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, action, pending] = useActionState(createStreakAction, null);

  const handleClose = () => {
    if (pending) return;
    setIsOpen(false);
    setName("");
  };

  return (
    <>
      <Button
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        + New Streak
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                New Streak
              </h2>
              <Button
                type="button"
                onClick={handleClose}
                disabled={pending}
                aria-label="Close"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>

            <form action={action} className="space-y-4">
              <div>
                <label
                  htmlFor="streak-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Streak name <span className="text-red-500">*</span>
                </label>
                <input
                  id="streak-name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  placeholder="e.g. Daily exercise"
                  autoFocus
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">Required</span>
                  <span
                    className={`text-xs ${name.length >= 45 ? "text-orange-500" : "text-gray-400"}`}
                  >
                    {name.length}/50
                  </span>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  type="button"
                  onClick={handleClose}
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={pending || name.trim().length === 0}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {pending ? "Creating…" : "Create streak"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
