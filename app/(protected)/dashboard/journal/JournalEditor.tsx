"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { marked } from "marked";
import TurndownService from "turndown";
import { Button } from "@/components/Button";
import {
  createJournalEntryAction,
  updateJournalEntryAction,
} from "@/app/actions/journal";

interface JournalEditorProps {
  date: string;
  entry?: {
    id: string;
    title: string | null;
    body: string;
  } | null;
  onDone: () => void;
}

const turndown = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});

export const JournalEditor = ({ date, entry, onDone }: JournalEditorProps) => {
  const [title, setTitle] = useState(entry?.title ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (entry?.body && editorRef.current && !initializedRef.current) {
      initializedRef.current = true;
      editorRef.current.innerHTML = marked.parse(entry.body) as string;
    }
  }, [entry?.body]);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) {
      document.execCommand("createLink", false, url);
    }
  }, []);

  const handleInlineCode = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;

    const code = document.createElement("code");
    code.className = "bg-gray-100 rounded px-1 text-sm font-mono";
    try {
      range.surroundContents(code);
    } catch {
      document.execCommand(
        "insertHTML",
        false,
        `<code>${range.toString()}</code>`,
      );
    }
    sel.removeAllRanges();
    sel.addRange(range);
  }, []);

  const toggleHeading = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const node = sel.anchorNode;
    if (!node) return;
    const block = node.nodeType === 3 ? node.parentElement : (node as HTMLElement);
    const parentBlock = block?.closest?.("h1,h2,h3,h4,h5,h6");
    if (parentBlock) {
      const p = document.createElement("p");
      p.innerHTML = parentBlock.innerHTML;
      parentBlock.replaceWith(p);
      const range = document.createRange();
      range.selectNodeContents(p);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      document.execCommand("formatBlock", false, "h3");
    }
    editorRef.current?.focus();
  }, []);

  const toggleBlockquote = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const node = sel.anchorNode;
    if (!node) return;
    const block = node.nodeType === 3 ? node.parentElement : (node as HTMLElement);
    const parentBlock = block?.closest?.("blockquote");
    if (parentBlock) {
      const p = document.createElement("p");
      p.innerHTML = parentBlock.innerHTML;
      parentBlock.replaceWith(p);
      const range = document.createRange();
      range.selectNodeContents(p);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      document.execCommand("formatBlock", false, "blockquote");
    }
    editorRef.current?.focus();
  }, []);

  const handleSave = async () => {
    if (!editorRef.current) return;
    setPending(true);
    setError(null);

    const markdown = turndown.turndown(editorRef.current.innerHTML);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("body", markdown);
    if (entry) formData.set("id", entry.id);
    else formData.set("date", date);

    const action = entry ? updateJournalEntryAction : createJournalEntryAction;
    const result = await action(null, formData);

    if (result) {
      setError(result);
      setPending(false);
    } else {
      onDone();
    }
  };

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

        <div className="flex items-center gap-1 mb-3 pb-3 border-b border-amber-200">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("bold");
            }}
            className="p-1.5 rounded transition-colors text-sm font-bold text-gray-600 hover:bg-amber-100 hover:text-gray-900"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("italic");
            }}
            className="p-1.5 rounded transition-colors text-sm italic text-gray-600 hover:bg-amber-100 hover:text-gray-900"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("strikeThrough");
            }}
            className="p-1.5 rounded transition-colors text-sm line-through text-gray-600 hover:bg-amber-100 hover:text-gray-900"
            title="Strikethrough"
          >
            S
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleInlineCode();
            }}
            className="p-1.5 rounded transition-colors text-xs font-mono text-gray-600 hover:bg-amber-100 hover:text-gray-900"
            title="Inline code"
          >
            {"<>"}
          </button>
          <span className="w-px h-4 bg-amber-200 mx-1" />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleHeading();
            }}
            className="p-1.5 rounded transition-colors text-xs font-bold text-gray-600 hover:bg-amber-100 hover:text-gray-900"
            title="Heading"
          >
            H
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("insertUnorderedList");
            }}
            className="p-1.5 rounded transition-colors text-sm text-gray-600 hover:bg-amber-100 hover:text-gray-900"
            title="Bullet list"
          >
            •≡
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("insertOrderedList");
            }}
            className="p-1.5 rounded transition-colors text-sm text-gray-600 hover:bg-amber-100 hover:text-gray-900"
            title="Numbered list"
          >
            1.
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlockquote();
            }}
            className="p-1.5 rounded transition-colors text-sm text-gray-600 hover:bg-amber-100 hover:text-gray-900"
            title="Blockquote"
          >
            "
          </button>
          <span className="w-px h-4 bg-amber-200 mx-1" />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleLink();
            }}
            className="p-1.5 rounded transition-colors text-sm text-gray-600 hover:bg-amber-100 hover:text-gray-900"
            title="Link"
          >
            L
          </button>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="prose prose-sm text-gray-700 max-w-none min-h-[200px] p-0 focus:outline-none [&>p]:my-0"
        />

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
            <Button
              type="button"
              onClick={handleSave}
              disabled={pending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {pending ? "Saving…" : entry ? "Update" : "Save"}
            </Button>
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
