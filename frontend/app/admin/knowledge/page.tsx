"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, AlertTriangle } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import KnowledgeTable from "@/components/KnowledgeTable";
import KnowledgeForm from "@/components/KnowledgeForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  listKnowledge,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
  ApiError,
  type KnowledgeItem,
  type KnowledgeInput,
} from "@/lib/api";

const CATEGORIES = [
  "All",
  "Academics",
  "Registration",
  "Student Services",
  "Campus",
  "Student Life",
];

export default function AdminKnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<KnowledgeItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<KnowledgeItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listKnowledge(search, category === "All" ? "" : category);
      setItems(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load knowledge base.");
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const timeout = setTimeout(load, 250); // debounce search
    return () => clearTimeout(timeout);
  }, [load]);

  function openCreate() {
    setEditing(null);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(item: KnowledgeItem) {
    setEditing(item);
    setFormError(null);
    setShowForm(true);
  }

  async function handleFormSubmit(payload: KnowledgeInput) {
    setSubmitting(true);
    setFormError(null);
    try {
      if (editing) {
        await updateKnowledge(editing.id, payload);
      } else {
        await createKnowledge(payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to save entry.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteKnowledge(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete entry.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AdminShell title="Knowledge Base">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or content…"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <Plus size={15} />
          New entry
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <KnowledgeTable
        items={items}
        loading={loading}
        onEdit={openEdit}
        onDelete={(item) => setDeleteTarget(item)}
      />

      {showForm && (
        <KnowledgeForm
          initial={editing}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
          submitting={submitting}
          error={formError}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete knowledge entry?"
          message={`"${deleteTarget.title}" will be permanently removed. This cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </AdminShell>
  );
}
