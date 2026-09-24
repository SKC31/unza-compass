import Header from "@/components/Header";
import {
  MessageCircleQuestion,
  Database,
  Sparkles,
  FileCheck2,
  ArrowDown,
  AlertTriangle,
} from "lucide-react";

const STEPS = [
  { icon: MessageCircleQuestion, label: "Question" },
  { icon: Database, label: "Knowledge retrieval" },
  { icon: FileCheck2, label: "Relevant context" },
  { icon: Sparkles, label: "AI generation" },
  { icon: MessageCircleQuestion, label: "Answer + sources" },
];

const TECH = [
  "Python",
  "FastAPI",
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "PostgreSQL / SQLite",
  "Claude API (LLM)",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          About UNZA Compass
        </h1>
        <p className="mt-2 text-sm text-muted">
          Navigate university with confidence.
        </p>

        {/* What is it */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-ink">
            What is UNZA Compass?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            UNZA Compass is an independent, student-built AI prototype
            designed to help University of Zambia students navigate common
            university information — things like course registration,
            academic resources, student services, and campus life. It was
            built as a portfolio project to demonstrate practical, full-stack
            AI application development: a retrieval-grounded chat assistant
            with a real admin dashboard behind it.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            It is <span className="font-medium text-ink">not</span> an
            official UNZA service, and it is not affiliated with or endorsed
            by the University of Zambia.
          </p>
        </section>

        {/* How it works */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-ink">How it works</h2>
          <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            {STEPS.map((step, i) => (
              <div key={i} className="flex w-full flex-col items-center">
                <div className="flex w-full max-w-xs items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <step.icon size={15} />
                  </span>
                  <span className="text-sm font-medium text-ink">
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowDown size={16} className="my-1 text-slate-300" />
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">
            Every question is matched against a curated knowledge base first.
            The most relevant entries are passed to the AI model as context,
            so answers are grounded rather than invented — and every answer
            is labeled as either <span className="font-medium">AI-generated</span> or,
            if the AI is unavailable, a direct <span className="font-medium">retrieved fallback</span> from
            the knowledge base.
          </p>
        </section>

        {/* Technology */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-ink">Technology</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {TECH.map((t) => (
              <span
                key={t}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-ink shadow-card"
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* Limitations */}
        <section className="mt-10 mb-4">
          <h2 className="text-lg font-semibold text-ink">Limitations</h2>
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-sm leading-relaxed text-amber-800">
              UNZA Compass is a prototype with a small, example knowledge
              base. It can be incomplete, outdated, or occasionally wrong.
              Always verify deadlines, fees, requirements, and other
              important academic or administrative information through
              official UNZA channels before acting on it.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
