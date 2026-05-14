"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { deleteAccountAction } from "@/app/actions/auth";
import { Button } from "@/components/Button";

export function DangerSection() {
  const [showDelete, setShowDelete] = useState(false);
  const [deleteResult, deleteAction, deletePending] = useActionState(
    deleteAccountAction,
    null,
  );
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !deletePending && deleteResult) {
      toast.error(deleteResult);
    }
    wasPending.current = deletePending;
  }, [deletePending, deleteResult]);

  return (
    <section className="bg-white rounded-xl border border-red-200 p-6">
      <h2 className="text-base font-semibold text-red-700 mb-1">Danger zone</h2>
      <p className="text-sm text-gray-500 mb-5">
        These actions are permanent and cannot be undone.
      </p>

      <div className="space-y-4">
        {/* Export */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Export your data
            </p>
            <p className="text-xs text-gray-500">
              Download all your streaks as a CSV file.
            </p>
          </div>
          <a
            href="/api/export"
            download
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            Download CSV
          </a>
        </div>

        {/* Delete account */}
        <div>
          {showDelete ? (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 space-y-3">
              <p className="text-sm font-medium text-red-800">
                This will permanently delete your account, all streaks, and all
                history. Type{" "}
                <span className="font-mono font-bold">DELETE</span> to confirm.
              </p>
              <form
                action={deleteAction}
                className="flex items-center gap-3 flex-wrap"
              >
                <input
                  name="confirm"
                  type="text"
                  placeholder="DELETE"
                  autoComplete="off"
                  className="rounded-lg border border-red-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent w-36"
                />
                <Button
                  type="submit"
                  disabled={deletePending}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deletePending && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {deletePending ? "Deleting…" : "Delete my account"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowDelete(false)}
                  disabled={deletePending}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </Button>
              </form>
              {deleteResult && (
                <p className="text-sm text-red-700">{deleteResult}</p>
              )}
            </div>
          ) : (
            <Button
              type="button"
              onClick={() => setShowDelete(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete my account
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
