"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ThumbsUp, ThumbsDown, MessageCircleHeart } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import { listFeedback, ApiError, type FeedbackItem } from "@/lib/api";

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listFeedback();
        if (!cancelled) setFeedback(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load feedback.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const helpfulCount = feedback.filter((f) => f.helpful).length;
  const notHelpfulCount = feedback.length - helpfulCount;

  return (
    <AdminShell title="Feedback">
      <p className="mb-5 text-sm text-muted">
        Helpful / not helpful feedback students have left on answers. Use
        this to spot weak spots in the knowledge base.
      </p>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {!loading && feedback.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-4 sm:max-w-sm">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <ThumbsUp size={14} />
              <span className="text-xs font-medium text-muted">Helpful</span>
            </div>
            <p className="mt-2 text-xl font-semibold text-ink">{helpfulCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="flex items-center gap-1.5 text-red-600">
              <ThumbsDown size={14} />
              <span className="text-xs font-medium text-muted">Not helpful</span>
            </div>
            <p className="mt-2 text-xl font-semibold text-ink">{notHelpfulCount}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-card">
          <p className="text-sm text-muted">Loading feedback…</p>
        </div>
      ) : feedback.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-card">
          <MessageCircleHeart size={24} className="text-slate-300" />
          <p className="text-sm font-medium text-ink">No feedback yet</p>
          <p className="text-xs text-muted">
            Feedback will appear here once students rate an answer.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Question</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100 last:border-0">
                    <td className="max-w-sm truncate px-4 py-3 font-medium text-ink">
                      {f.question}
                    </td>
                    <td className="px-4 py-3">
                      {f.helpful ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <ThumbsUp size={12} /> Helpful
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                          <ThumbsDown size={12} /> Not helpful
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                      {new Date(f.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
