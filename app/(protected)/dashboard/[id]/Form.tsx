"use client";

import { RefObject, useState } from "react";
import { Button } from "@/components/Button";

interface FormProps {
  checkInFormAction: (payload: FormData) => void;
  todayChecked: boolean;
  checkInPending: boolean;
  checkInButtonRef: RefObject<HTMLButtonElement | null>;
}

export const Form = ({
  checkInFormAction,
  todayChecked,
  checkInPending,
  checkInButtonRef,
}: FormProps) => {
  const [note, setNote] = useState("");

  const handleSubmit = (formData: FormData) => {
    formData.set("note", note);
    checkInFormAction(formData);
  };

  return (
    <form action={handleSubmit}>
      {todayChecked ? (
        <div className="flex items-center gap-3 px-6 py-4 bg-green-50 border border-green-200 rounded-xl">
          <svg
            className="w-6 h-6 text-green-600 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <div>
            <p className="font-semibold text-green-800">Checked in today!</p>
            <p className="text-sm text-green-600">
              Come back tomorrow to keep your streak going.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            name="note"
            placeholder="What did you do today? (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
          />
          <Button
            ref={checkInButtonRef}
            type="submit"
            disabled={checkInPending}
            className="w-full py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {checkInPending ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Checking in…
              </span>
            ) : (
              "Check In Today"
            )}
          </Button>
          <p className="text-center text-xs text-gray-400">
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-500 font-mono">
              Space
            </kbd>{" "}
            to check in
          </p>
        </div>
      )}
    </form>
  );
};
