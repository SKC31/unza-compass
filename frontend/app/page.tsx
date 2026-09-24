import Header from "@/components/Header";
import ChatInterface from "@/components/ChatInterface";
import { Compass, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
        {/* Hero */}
        <div className="relative mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-10 shadow-card sm:px-10 sm:py-14">
          {/* subtle compass motif */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-primary/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full border border-accent/20"
          />

          <div className="relative">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Compass size={13} />
              Independent student-built prototype
            </span>
            <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Navigate university with confidence.
            </h1>
            <p className="mt-3 max-w-lg text-sm text-muted sm:text-base">
              Your AI-powered guide to university information and student
              resources — ask a question below and get an answer grounded in
              a curated knowledge base, with sources you can check.
            </p>

            <div className="mt-5 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 sm:max-w-lg">
              <ShieldCheck size={15} className="shrink-0" />
              This is a prototype, not an official UNZA service. Always
              verify important academic or administrative details through
              official UNZA channels.
            </div>
          </div>
        </div>

        {/* Chat */}
        <ChatInterface />
      </main>
    </div>
  );
}
