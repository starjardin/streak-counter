"use client";

import { useState } from "react";
import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { deleteJournalEntryAction } from "@/app/actions/journal";
import { JournalEditor } from "./JournalEditor";

interface Entry {
  id: string;
  title: string | null;
  body: string;
  created_at: string;
}

interface DayEntriesProps {
  date: string;
  entries: Entry[];
  onRefetch: () => void;
}

const EntryCard = ({
  entry,
  onEdit,
  onDelete,
}: {
  entry: Entry;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const time = dayjs(entry.created_at).format("h:mm A");

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-xs text-gray-400">{time}</span>
          {entry.title && (
            <h3 className="text-lg font-serif font-bold text-gray-900 mt-0.5">
              {entry.title}
            </h3>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-gray-700">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {entry.body}
        </ReactMarkdown>
      </div>

      {showConfirm && (
        <ConfirmModal
          message="Are you sure you want to delete this entry?"
          onConfirm={async () => {
            setDeleting(true);
            await deleteJournalEntryAction(entry.id);
            setShowConfirm(false);
            onDelete();
          }}
          onCancel={() => setShowConfirm(false)}
          deleting={deleting}
        />
      )}
    </div>
  );
};

export const DayEntries = ({ date, entries, onRefetch }: DayEntriesProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const today = dayjs().format("YYYY-MM-DD");
  const isToday = date === today;
  const dayLabel = isToday
    ? "Today"
    : dayjs(date).format("MMM D, YYYY");

  if (editingId) {
    const entry = entries.find((e) => e.id === editingId);
    if (entry) {
      return (
        <JournalEditor
          date={date}
          entry={entry}
          onDone={() => {
            setEditingId(null);
            onRefetch();
          }}
        />
      );
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {dayLabel}
        </h3>
        {isToday && (
          <Button
            type="button"
            onClick={() => onRefetch()}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Refresh
          </Button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-2">📝</div>
          <p className="text-sm">No entries for this day</p>
          <p className="text-xs mt-1">Click the button below to write</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onEdit={() => setEditingId(entry.id)}
              onDelete={onRefetch}
            />
          ))}
        </div>
      )}
    </div>
  );
};
