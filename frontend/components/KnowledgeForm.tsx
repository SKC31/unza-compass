"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { KnowledgeInput, KnowledgeItem } from "@/lib/api";

const CATEGORIES = [
  "Academics",
  "Registration",
  "Student Services",
  "Campus",
  "Student Life",
];

export default function KnowledgeForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
  error,
}: {
  initial: KnowledgeItem | null;
  onSubmit: (payload: KnowledgeInput) => void;
  onCancel: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
  const [content, setContent] = useState(initial?.content ?? "");
  const [keywords, setKeywords] = useState(initial?.keywords?.join(", ") ?? "");
  const [source, setSource] = useState(initial?.source ?? "");

  useEffect(() => {
    setTitle(initial?.title ?? "");
    setCategory(initial?.category ?? CATEGORIES[0]);
    setContent(initial?.content ?? "");
    setKeywords(initial?.keywords?.join(", ") ?? "");
    setSource(initial?.source ?? "");
  }, [initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      title: title.trim(),
      category,
      content: content.trim(),
      keywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      source: source.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-ink">
            {initial ? "Edit knowledge entry" : "New knowledge entry"}
          </h2>
          <button
            onClick={onCancel}
            className="text-muted hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-ink">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. How to register for courses"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={5}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="The full answer content shown to students / passed to the AI as context…"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink">
              Keywords{" "}
              <span className="font-normal text-muted">
                (comma-separated)
              </span>
            </label>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="registration, courses, enrollment"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink">
              Source{" "}
              <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. UNZA Registry / general example information"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-ink hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {submitting ? "Saving…" : initial ? "Save changes" : "Create entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
