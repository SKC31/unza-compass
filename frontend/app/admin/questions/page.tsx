"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  X,
  Sparkles,
  DatabaseZap,
  ThumbsUp,
  ThumbsDown,
  MessagesSquare,
} from "lucide-react";
import AdminShell from "@/components/AdminShell";
import { listQuestions, ApiError, type QuestionItem } from "@/lib/api";

function ModeBadge({ mode }: { mode: "AI" | "FALLBACK" }) {
  return mode === "AI" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
      <Sparkles size={11} />
      AI
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
      <DatabaseZap size={11} />
      Fallback
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (isYesterday) return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString();
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<QuestionItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listQuestions(100);
        if (!cancelled) setQuestions(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load questions.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminShell title="Recent Questions">
      <p className="mb-5 text-sm text-muted">
        Every question students have asked, with the response mode and
        timestamp. Click a row to inspect the full answer and sources.
      </p>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-card">
          <p className="text-sm text-muted">Loading questions…</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-card">
          <MessagesSquare size={24} className="text-slate-300" />
          <p className="text-sm font-medium text-ink">No questions yet</p>
          <p className="text-xs text-muted">
            Questions will appear here as soon as students start chatting.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Question</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() => setSelected(q)}
                    className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="max-w-sm truncate px-4 py-3 font-medium text-ink">
                      {q.question}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                      {formatDate(q.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <ModeBadge mode={q.mode} />
                    </td>
                    <td className="px-4 py-3">
                      {q.feedback === true && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <ThumbsUp size={12} /> Helpful
                        </span>
                      )}
                      {q.feedback === false && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                          <ThumbsDown size={12} /> Not helpful
                        </span>
                      )}
                      {q.feedback === null && (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-ink">Question detail</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-muted hover:text-ink"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div>
                <p className="mb-1 text-xs font-medium text-muted">Question</p>
                <p className="text-sm text-ink">{selected.question}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-muted">Answer</p>
                <p className="whitespace-pre-line text-sm text-ink">{selected.answer}</p>
              </div>
              {selected.sources.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted">Sources</p>
                  <div className="space-y-1.5">
                    {selected.sources.map((s, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <p className="text-xs font-medium text-ink">{s.title}</p>
                        <p className="text-xs text-muted">{s.source}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-xs text-muted">
                <span>{formatDate(selected.created_at)}</span>
                <ModeBadge mode={selected.mode} />
                {selected.response_time_ms != null && (
                  <span>{selected.response_time_ms} ms</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
