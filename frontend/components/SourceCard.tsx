import { BookOpenText } from "lucide-react";
import type { Source } from "@/lib/api";

export default function SourceCard({ source }: { source: Source }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <BookOpenText size={14} className="mt-0.5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-ink">{source.title}</p>
        <p className="truncate text-xs text-muted">{source.source}</p>
      </div>
    </div>
  );
}
