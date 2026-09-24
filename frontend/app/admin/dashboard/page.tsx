"use client";

import { useEffect, useState } from "react";
import {
  MessagesSquare,
  CalendarDays,
  CalendarRange,
  BookOpen,
  Sparkles,
  DatabaseZap,
  Timer,
  AlertTriangle,
} from "lucide-react";
import AdminShell from "@/components/AdminShell";
import StatCard from "@/components/StatCard";
import { getStats, ApiError, type Stats } from "@/lib/api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getStats();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load stats.");
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
    <AdminShell title="Dashboard">
      <p className="mb-6 text-sm text-muted">
        Overview of UNZA Compass activity. Numbers reflect real usage — a
        fresh install starts at zero.
      </p>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-[104px] animate-pulse rounded-xl border border-slate-200 bg-white shadow-card"
            />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Questions" value={stats.total_questions} icon={MessagesSquare} />
          <StatCard label="Questions Today" value={stats.questions_today} icon={CalendarDays} />
          <StatCard label="Questions This Week" value={stats.questions_this_week} icon={CalendarRange} />
          <StatCard label="Knowledge Items" value={stats.knowledge_items} icon={BookOpen} accent="slate" />
          <StatCard label="AI Responses" value={stats.ai_responses} icon={Sparkles} />
          <StatCard label="Fallback Responses" value={stats.fallback_responses} icon={DatabaseZap} accent="amber" />
          <StatCard
            label="Avg Response Time"
            value={stats.avg_response_time_ms ? `${stats.avg_response_time_ms} ms` : "—"}
            icon={Timer}
            accent="slate"
          />
        </div>
      ) : null}
    </AdminShell>
  );
}
