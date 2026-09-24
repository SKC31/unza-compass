"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Trash2, Compass } from "lucide-react";
import MessageBubble, { type ChatMessage } from "./MessageBubble";
import SuggestedQuestions from "./SuggestedQuestions";
import { sendChatMessage, ApiError } from "@/lib/api";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
        <Compass size={16} />
      </span>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3.5 shadow-card">
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted [animation-delay:0s]" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted [animation-delay:0.15s]" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted [animation-delay:0.3s]" />
      </div>
    </div>
  );
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = { id: uid(), role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendChatMessage(text);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: response.answer,
          sources: response.sources,
          mode: response.mode,
          questionId: response.question_id,
        },
      ]);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something unexpected happened. Please try again.";
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", content: message, isError: true },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleClear() {
    setMessages([]);
  }

  return (
    <div className="flex h-[70vh] min-h-[480px] flex-col rounded-2xl border border-slate-200 bg-white shadow-card">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-ink">UNZA Compass Assistant</span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-slate-100 hover:text-ink"
          >
            <Trash2 size={13} />
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Compass size={22} />
            </span>
            <div>
              <p className="text-sm font-medium text-ink">
                Ask me anything about UNZA
              </p>
              <p className="mt-1 max-w-xs text-xs text-muted">
                Try one of these, or type your own question below.
              </p>
            </div>
            <div className="w-full max-w-md">
              <SuggestedQuestions onSelect={(q) => handleSend(q)} />
            </div>
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {loading && <TypingIndicator />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-3 sm:p-4">
        <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 focus-within:border-primary/50">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about registration, library hours, faculties..."
            rows={1}
            className="max-h-28 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-ink placeholder:text-muted focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-all hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="mt-2 px-1 text-[11px] text-muted">
          UNZA Compass is an independent student prototype. Always verify
          important academic or administrative information through official
          UNZA channels.
        </p>
      </div>
    </div>
  );
}
