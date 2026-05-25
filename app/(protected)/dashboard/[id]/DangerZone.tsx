import { Button } from "@/components/Button";
import { Streak } from "./type";

interface DangerZoneProps {
  confirmDelete: boolean;
  setConfirmDelete: (value: boolean) => void;
  deletePending: boolean;
  streak: Streak;
  deleteFormAction: (payload: FormData) => void;
}

export const DangerZone = ({
  confirmDelete,
  setConfirmDelete,
  deletePending,
  streak,
  deleteFormAction,
}: DangerZoneProps) => {
  return (
    <div className="bg-white rounded-xl border border-red-200 p-6">
      <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-3">
        Danger zone
      </h2>
      {confirmDelete ? (
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-700 flex-1">
            Delete <span className="font-semibold">{streak.name}</span>? This
            cannot be undone.
          </p>
          <Button
            type="button"
            onClick={() => setConfirmDelete(false)}
            disabled={deletePending}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </Button>
          <form action={deleteFormAction}>
            <Button
              type="submit"
              disabled={deletePending}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {deletePending && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {deletePending ? "Deleting…" : "Yes, delete"}
            </Button>
          </form>
        </div>
      ) : (
        <Button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
        >
          Delete this streak
        </Button>
      )}
    </div>
  );
};
