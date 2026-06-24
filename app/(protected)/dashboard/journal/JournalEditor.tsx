"use client";

import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { defaultMarkdownSerializer } from "prosemirror-markdown";
import { Button } from "@/components/Button";
import {
  createJournalEntryAction,
  updateJournalEntryAction,
} from "@/app/actions/journal";
import { useActionState } from "react";

interface JournalEditorProps {
  date: string;
  entry?: {
    id: string;
    title: string | null;
    body: string;
  } | null;
  onDone: () => void;
}

export const JournalEditor = ({ date, entry, onDone }: JournalEditorProps) => {
  const [title, setTitle] = useState(entry?.title ?? "");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: "What's on your mind?…",
      }),
    ],
    content: entry?.body || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none font-serif text-gray-800 leading-relaxed outline-none min-h-[200px]",
      },
    },
  });

  const action = entry
    ? updateJournalEntryAction
    : createJournalEntryAction;

  const [error, formAction, pending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      const body = editor
        ? defaultMarkdownSerializer.serialize(editor.schema.nodeFromJSON(editor.getJSON()))
        : "";
      formData.set("title", title);
      formData.set("body", body);
      if (entry) formData.set("id", entry.id);
      else formData.set("date", date);
      const result = await action(_prev, formData);
      if (!result) onDone();
      return result;
    },
    null,
  );

  const toggleBold = useCallback(
    () => editor?.chain().focus().toggleBold().run(),
    [editor],
  );
  const toggleItalic = useCallback(
    () => editor?.chain().focus().toggleItalic().run(),
    [editor],
  );
  const toggleUnderline = useCallback(
    () => editor?.chain().focus().toggleUnderline().run(),
    [editor],
  );
  const toggleHeading = useCallback(
    () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    [editor],
  );
  const toggleBulletList = useCallback(
    () => editor?.chain().focus().toggleBulletList().run(),
    [editor],
  );
  const toggleOrderedList = useCallback(
    () => editor?.chain().focus().toggleOrderedList().run(),
    [editor],
  );

  if (!editor) return null;

  return (
    <div className="bg-gradient-to-b from-amber-50 to-white rounded-xl border border-amber-200 shadow-sm p-6">
      <div className="max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-serif font-bold text-gray-900 placeholder-gray-300 bg-transparent border-none outline-none mb-4"
        />

        <div className="flex items-center gap-1 mb-4 pb-3 border-b border-amber-200">
          <button
            type="button"
            onClick={toggleBold}
            className={`p-1.5 rounded transition-colors text-sm font-bold ${
              editor.isActive("bold")
                ? "bg-amber-200 text-gray-900"
                : "text-gray-600 hover:bg-amber-100 hover:text-gray-900"
            }`}
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={toggleItalic}
            className={`p-1.5 rounded transition-colors text-sm italic ${
              editor.isActive("italic")
                ? "bg-amber-200 text-gray-900"
                : "text-gray-600 hover:bg-amber-100 hover:text-gray-900"
            }`}
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={toggleUnderline}
            className={`p-1.5 rounded transition-colors text-sm underline ${
              editor.isActive("underline")
                ? "bg-amber-200 text-gray-900"
                : "text-gray-600 hover:bg-amber-100 hover:text-gray-900"
            }`}
            title="Underline"
          >
            U
          </button>
          <span className="w-px h-4 bg-amber-200 mx-1" />
          <button
            type="button"
            onClick={toggleHeading}
            className={`p-1.5 rounded transition-colors text-xs font-bold ${
              editor.isActive("heading", { level: 3 })
                ? "bg-amber-200 text-gray-900"
                : "text-gray-600 hover:bg-amber-100 hover:text-gray-900"
            }`}
            title="Heading"
          >
            H
          </button>
          <button
            type="button"
            onClick={toggleBulletList}
            className={`p-1.5 rounded transition-colors text-sm ${
              editor.isActive("bulletList")
                ? "bg-amber-200 text-gray-900"
                : "text-gray-600 hover:bg-amber-100 hover:text-gray-900"
            }`}
            title="Bullet list"
          >
            •≡
          </button>
          <button
            type="button"
            onClick={toggleOrderedList}
            className={`p-1.5 rounded transition-colors text-sm ${
              editor.isActive("orderedList")
                ? "bg-amber-200 text-gray-900"
                : "text-gray-600 hover:bg-amber-100 hover:text-gray-900"
            }`}
            title="Numbered list"
          >
            1.
          </button>
        </div>

        <EditorContent editor={editor} />

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-amber-200">
          <p className="text-xs text-gray-400">
            {entry ? "Edit your entry" : "Write your entry"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={onDone}
              className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <form action={formAction}>
              <Button
                type="submit"
                disabled={pending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {pending ? "Saving…" : entry ? "Update" : "Save"}
              </Button>
            </form>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
