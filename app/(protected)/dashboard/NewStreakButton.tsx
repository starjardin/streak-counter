"use client";

import { useActionState, useEffect, useState } from "react";
import { createStreakAction } from "@/app/actions/streaks";
import { getCategoriesAction } from "@/app/actions/categories";
import { Button } from "@/components/Button";

export function NewStreakButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string; color: string }[]>([]);
  const [hasTime, setHasTime] = useState(false);
  const [schedHour, setSchedHour] = useState(7);
  const [schedMinute, setSchedMinute] = useState(30);
  const [schedEndHour, setSchedEndHour] = useState(8);
  const [schedEndMinute, setSchedEndMinute] = useState(0);
  const [schedEnforced, setSchedEnforced] = useState(false);
  const [error, action, pending] = useActionState(createStreakAction, null);

  useEffect(() => {
    getCategoriesAction().then(setCategories);
  }, []);

  const handleClose = () => {
    if (pending) return;
    setIsOpen(false);
    setName("");
    setHasTime(false);
    setSchedHour(7);
    setSchedMinute(30);
    setSchedEndHour(8);
    setSchedEndMinute(0);
    setSchedEnforced(false);
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

              <div>
                <label
                  htmlFor="streak-category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category <span className="text-gray-400">(optional)</span>
                </label>
                <select
                  id="streak-category"
                  name="category_id"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <label className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                  <input
                    type="checkbox"
                    name="has_scheduled_time"
                    checked={hasTime}
                    onChange={(e) => setHasTime(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Set a scheduled time
                </label>

                {hasTime && (
                  <div className="mt-3 space-y-3 pl-6">
                    <fieldset>
                      <legend className="text-xs font-medium text-gray-700 mb-2">From</legend>
                      <div className="flex gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Hour</label>
                          <select
                            name="scheduled_hour"
                            value={schedHour}
                            onChange={(e) => setSchedHour(Number(e.target.value))}
                            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Minute</label>
                          <select
                            name="scheduled_minute"
                            value={schedMinute}
                            onChange={(e) => setSchedMinute(Number(e.target.value))}
                            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                          >
                            {Array.from({ length: 60 }, (_, i) => (
                              <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </fieldset>

                    <fieldset>
                      <legend className="text-xs font-medium text-gray-700 mb-2">To</legend>
                      <div className="flex gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Hour</label>
                          <select
                            name="end_hour"
                            value={schedEndHour}
                            onChange={(e) => setSchedEndHour(Number(e.target.value))}
                            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Minute</label>
                          <select
                            name="end_minute"
                            value={schedEndMinute}
                            onChange={(e) => setSchedEndMinute(Number(e.target.value))}
                            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                          >
                            {Array.from({ length: 60 }, (_, i) => (
                              <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </fieldset>

                    <label className="flex items-center gap-2 text-sm text-gray-900">
                      <input
                        type="checkbox"
                        name="time_enforced"
                        checked={schedEnforced}
                        onChange={(e) => setSchedEnforced(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      Enforce exact time (±1 hour window)
                    </label>
                  </div>
                )}
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
