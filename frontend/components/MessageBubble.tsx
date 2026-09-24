"use client";

import { useState } from "react";
import {
  Compass,
  User,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  DatabaseZap,
  AlertTriangle,
} from "lucide-react";
import SourceCard from "./SourceCard";
import { sendFeedback, type Source } from "@/lib/api";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  mode?: "AI" | "FALLBACK";
  isError?: boolean;
  questionId?: string;
}

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [feedbackSending, setFeedbackSending] = useState(false);

  const isUser = message.role === "user";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard not available — silently ignore
    }
  }

  async function handleFeedback(helpful: boolean) {
    if (!message.questionId || feedbackSending) return;
    setFeedbackSending(true);
    try {
      await sendFeedback(message.questionId, helpful);
      setFeedback(helpful);
    } catch {
      // non-critical — fail silently, feedback is best-effort
    } finally {
      setFeedbackSending(false);
    }
  }

  if (isUser) {
    return (
      <div className="flex animate-fade-in-up items-start justify-end gap-3">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-white shadow-card sm:max-w-[70%]">
          {message.content}
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-muted">
          <User size={16} />
        </span>
      </div>
    );
  }

  return (
    <div className="flex animate-fade-in-up items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
        <Compass size={16} />
      </span>
      <div className="max-w-[85%] space-y-2 sm:max-w-[75%]">
        <div
          className={`rounded-2xl rounded-tl-sm border px-4 py-3 text-sm shadow-card ${
            message.isError
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-slate-200 bg-white text-ink"
          }`}
        >
          {message.isError && (
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
              <AlertTriangle size={13} />
              Something went wrong
            </div>
          )}
          <p className="whitespace-pre-line leading-relaxed">{message.content}</p>

          {message.mode && !message.isError && (
            <div className="mt-2.5 flex items-center gap-1.5">
              {message.mode === "AI" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  <Sparkles size={11} />
                  AI-generated
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                  <DatabaseZap size={11} />
                  Retrieved (fallback mode)
                </span>
              )}
            </div>
          )}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="space-y-1.5">
            <p className="px-1 text-xs font-medium text-muted">Sources</p>
            <div className="grid gap-1.5">
              {message.sources.map((s, i) => (
                <SourceCard key={i} source={s} />
              ))}
            </div>
          </div>
        )}

        {!message.isError && (
          <div className="flex items-center gap-3 px-1">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-ink"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>

            {message.questionId && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted">Helpful?</span>
                <button
                  onClick={() => handleFeedback(true)}
                  disabled={feedbackSending}
                  className={`rounded-full p-1 transition-colors ${
                    feedback === true
                      ? "bg-primary/10 text-primary"
                      : "text-muted hover:bg-slate-100 hover:text-ink"
                  }`}
                  aria-label="Mark as helpful"
                >
                  <ThumbsUp size={13} />
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  disabled={feedbackSending}
                  className={`rounded-full p-1 transition-colors ${
                    feedback === false
                      ? "bg-red-100 text-red-600"
                      : "text-muted hover:bg-slate-100 hover:text-ink"
                  }`}
                  aria-label="Mark as not helpful"
                >
                  <ThumbsDown size={13} />
                </button>
                {feedback !== null && (
                  <span className="text-xs text-muted">Thanks for the feedback!</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
