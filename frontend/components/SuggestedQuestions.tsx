"use client";

const SUGGESTIONS = [
  "How do I register for courses?",
  "What academic resources are available?",
  "Where can I find student services?",
  "Tell me about campus resources.",
];

export default function SuggestedQuestions({
  onSelect,
}: {
  onSelect: (question: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {SUGGESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-ink shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-cardHover"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
