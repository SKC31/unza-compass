"use client";

import { Pencil, Trash2, BookOpen } from "lucide-react";
import type { KnowledgeItem } from "@/lib/api";

export default function KnowledgeTable({
  items,
  loading,
  onEdit,
  onDelete,
}: {
  items: KnowledgeItem[];
  loading: boolean;
  onEdit: (item: KnowledgeItem) => void;
  onDelete: (item: KnowledgeItem) => void;
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-card">
        <p className="text-sm text-muted">Loading knowledge base…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-card">
        <BookOpen size={24} className="text-slate-300" />
        <p className="text-sm font-medium text-ink">No knowledge entries found</p>
        <p className="text-xs text-muted">
          Try a different search, or add a new entry to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
              >
                <td className="max-w-xs truncate px-4 py-3 font-medium text-ink">
                  {item.title}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {item.category}
                  </span>
                </td>
                <td className="max-w-[160px] truncate px-4 py-3 text-xs text-muted">
                  {item.source || "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                  {new Date(item.updated_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => onEdit(item)}
                      className="rounded-lg p-1.5 text-muted transition-colors hover:bg-slate-100 hover:text-primary"
                      aria-label={`Edit ${item.title}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="rounded-lg p-1.5 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${item.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
