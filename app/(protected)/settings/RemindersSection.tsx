"use client";

import { useActionState } from "react";
import toast from "react-hot-toast";
import { useEffect, useRef } from "react";
import { saveReminderPreferenceAction } from "@/app/actions/preferences";
import type { ReminderFrequency } from "@/lib/db/preferences";
import { Button } from "@/components/Button";

const OPTIONS: {
  value: ReminderFrequency;
  label: string;
  description: string;
}[] = [
  { value: "daily", label: "Daily", description: "Every day at 9 AM UTC" },
  {
    value: "three_per_week",
    label: "3× per week",
    description: "Monday, Wednesday & Friday",
  },
  { value: "weekly", label: "Weekly", description: "Every Monday" },
  { value: "none", label: "None", description: "No reminders" },
];

interface Props {
  current: ReminderFrequency;
}

export function RemindersSection({ current }: Props) {
  const [error, action, pending] = useActionState(
    saveReminderPreferenceAction,
    null,
  );
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      if (error) toast.error(error);
      else toast.success("Reminder preference saved!");
    }
    wasPending.current = pending;
  }, [pending, error]);

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">
        Email reminders
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        Get nudged when you havenou&apos;t checked in yet.
      </p>
      <form action={action} className="space-y-3">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 has-checked:border-blue-400 has-checked:bg-blue-50 transition-colors"
          >
            <input
              type="radio"
              name="frequency"
              value={opt.value}
              defaultChecked={opt.value === current}
              className="mt-0.5 accent-blue-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">{opt.label}</p>
              <p className="text-xs text-gray-500">{opt.description}</p>
            </div>
          </label>
        ))}
        <Button
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          type="submit"
          disabled={pending}
        >
          {pending && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {pending ? "Saving…" : "Save preference"}
        </Button>
      </form>
    </section>
  );
}
