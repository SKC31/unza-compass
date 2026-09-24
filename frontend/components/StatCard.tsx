import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "primary" | "amber" | "slate";
}) {
  const accentClasses =
    accent === "amber"
      ? "bg-amber-100 text-amber-700"
      : accent === "slate"
      ? "bg-slate-100 text-slate-600"
      : "bg-primary/10 text-primary";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentClasses}`}>
          <Icon size={15} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-ink">{value}</p>
    </div>
  );
}
