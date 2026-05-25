import { Button } from "@/components/Button";
import { RefObject } from "react";

interface CardNameProps {
  streakName: string;
  isEditing: boolean;
  nameFormAction: (payload: FormData) => void;
  nameInput: string;
  setNameInput: (value: string) => void;
  nameInputRef: RefObject<HTMLInputElement | null>;
  nameError: string | null;
  namePending: boolean;
  handleEditCancel: () => void;
  handleEditOpen: () => void;
}

export const CardName = ({
  streakName,
  isEditing,
  nameFormAction,
  nameInput,
  setNameInput,
  nameInputRef,
  nameError,
  namePending,
  handleEditCancel,
  handleEditOpen,
}: CardNameProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {isEditing ? (
        <form action={nameFormAction} className="space-y-3">
          <div>
            <label
              htmlFor="streak-name-edit"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Streak name
            </label>
            <input
              id="streak-name-edit"
              ref={nameInputRef}
              name="name"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={50}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-end mt-1">
              <span
                className={`text-xs ${nameInput.length >= 45 ? "text-orange-500" : "text-gray-400"}`}
              >
                {nameInput.length}/50
              </span>
            </div>
          </div>
          {nameError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {nameError}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleEditCancel}
              disabled={namePending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={namePending || nameInput.trim().length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {namePending && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {namePending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 flex-1">
            {streakName}
          </h1>
          <Button
            onClick={handleEditOpen}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            aria-label="Edit streak name"
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
};
