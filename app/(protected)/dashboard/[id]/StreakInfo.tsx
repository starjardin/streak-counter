"use client";

import { Button } from "@/components/Button";
import { Streak } from "./type";
import { useState, useRef, useEffect, useActionState, startTransition } from "react";
import { updateStreakInfoAction } from "@/app/actions/streaks";
import toast from "react-hot-toast";

function formatTime(hour: number | null, minute: number | null) {
  if (hour === null) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute ?? 0).padStart(2, "0")}`;
}

function formatRange(streak: Streak) {
  const from = formatTime(streak.scheduled_hour, streak.scheduled_minute);
  if (!from) return null;
  const to = formatTime(streak.end_hour, streak.end_minute);
  return to ? `${from} – ${to}` : from;
}

interface StreakInfoProps {
  streak: Streak;
}

export function StreakInfo({ streak }: StreakInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(streak.name);

  const [hasTime, setHasTime] = useState(streak.scheduled_hour !== null);
  const [schedHour, setSchedHour] = useState(streak.scheduled_hour ?? 7);
  const [schedMinute, setSchedMinute] = useState(streak.scheduled_minute ?? 30);
  const [schedEndHour, setSchedEndHour] = useState(streak.end_hour ?? 8);
  const [schedEndMinute, setSchedEndMinute] = useState(streak.end_minute ?? 0);
  const [schedEnforced, setSchedEnforced] = useState(streak.time_enforced);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const boundUpdate = updateStreakInfoAction.bind(null, streak.id);
  const [error, formAction, pending] = useActionState(boundUpdate, null);
  const wasUpdating = useRef(false);

  useEffect(() => {
    if (wasUpdating.current && !pending) {
      if (error === null) {
        startTransition(() => setIsEditing(false));
        toast.success("Streak updated!");
      }
    }
    wasUpdating.current = pending;
  }, [pending, error]);

  const handleEditOpen = () => {
    setIsEditing(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNameInput(streak.name);
    setHasTime(streak.scheduled_hour !== null);
    setSchedHour(streak.scheduled_hour ?? 7);
    setSchedMinute(streak.scheduled_minute ?? 30);
    setSchedEndHour(streak.end_hour ?? 8);
    setSchedEndMinute(streak.end_minute ?? 0);
    setSchedEnforced(streak.time_enforced);
  };

  const range = formatRange(streak);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {isEditing ? (
        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="streak-name-edit"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Streak name <span className="text-red-500">*</span>
            </label>
            <input
              id="streak-name-edit"
              ref={nameInputRef}
              name="name"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={50}
              placeholder="e.g. Daily exercise"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">Required</span>
              <span
                className={`text-xs ${nameInput.length >= 45 ? "text-orange-500" : "text-gray-400"}`}
              >
                {nameInput.length}/50
              </span>
            </div>
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

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleCancel}
              disabled={pending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending || nameInput.trim().length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {pending && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              {streak.name}
            </h1>
            {range && (
              <p className="text-sm text-gray-500 mt-1">
                {range}
                {streak.time_enforced && (
                  <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Enforced
                  </span>
                )}
              </p>
            )}
          </div>
          <Button
            onClick={handleEditOpen}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors shrink-0"
            aria-label="Edit streak"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.93l-3.414.656.656-3.414a4 4 0 01.93-1.414z"
              />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
}
