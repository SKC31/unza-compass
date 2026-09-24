/**
 * Thin fetch wrapper for the UNZA Compass backend API.
 * Every function here returns parsed JSON or throws an ApiError.
 */
import { getToken, clearToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth: boolean = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (err) {
    throw new ApiError(
      "Could not reach the UNZA Compass server. Please check your connection and try again.",
      0
    );
  }

  if (res.status === 401 && auth) {
    clearToken();
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) {
        detail = Array.isArray(body.detail)
          ? body.detail.map((d: any) => d.msg).join(", ")
          : String(body.detail);
      }
    } catch {
      // ignore JSON parse errors on error bodies
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return res.json() as Promise<T>;
}

// ---------- Types ----------

export interface Source {
  title: string;
  source: string;
}

export interface ChatResponse {
  question_id: string;
  answer: string;
  sources: Source[];
  mode: "AI" | "FALLBACK";
}

export interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
  source: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeInput {
  title: string;
  category: string;
  content: string;
  keywords: string[];
  source: string;
}

export interface QuestionItem {
  id: string;
  question: string;
  answer: string;
  sources: Source[];
  mode: "AI" | "FALLBACK";
  response_time_ms: number | null;
  created_at: string;
  feedback: boolean | null;
}

export interface FeedbackItem {
  id: string;
  question_id: string;
  question: string;
  helpful: boolean;
  created_at: string;
}

export interface Stats {
  total_questions: number;
  questions_today: number;
  questions_this_week: number;
  knowledge_items: number;
  ai_responses: number;
  fallback_responses: number;
  avg_response_time_ms: number | null;
}

// ---------- Public (student) endpoints ----------

export function checkHealth() {
  return request<{ status: string; service: string }>("/health");
}

export function sendChatMessage(message: string) {
  return request<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export function sendFeedback(question_id: string, helpful: boolean) {
  return request<{ message: string }>("/api/feedback", {
    method: "POST",
    body: JSON.stringify({ question_id, helpful }),
  });
}

// ---------- Admin endpoints ----------

export function adminLogin(email: string, password: string) {
  return request<{ access_token: string; token_type: string; email: string }>(
    "/api/admin/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );
}

export function adminLogout() {
  return request<{ message: string }>(
    "/api/admin/logout",
    { method: "POST" },
    true
  );
}

export function getStats() {
  return request<Stats>("/api/admin/stats", {}, true);
}

export function listKnowledge(search: string = "", category: string = "") {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  const qs = params.toString();
  return request<KnowledgeItem[]>(
    `/api/admin/knowledge${qs ? `?${qs}` : ""}`,
    {},
    true
  );
}

export function createKnowledge(payload: KnowledgeInput) {
  return request<KnowledgeItem>(
    "/api/admin/knowledge",
    { method: "POST", body: JSON.stringify(payload) },
    true
  );
}

export function updateKnowledge(id: string, payload: KnowledgeInput) {
  return request<KnowledgeItem>(
    `/api/admin/knowledge/${id}`,
    { method: "PUT", body: JSON.stringify(payload) },
    true
  );
}

export function deleteKnowledge(id: string) {
  return request<void>(
    `/api/admin/knowledge/${id}`,
    { method: "DELETE" },
    true
  );
}

export function listQuestions(limit: number = 100) {
  return request<QuestionItem[]>(
    `/api/admin/questions?limit=${limit}`,
    {},
    true
  );
}

export function listFeedback() {
  return request<FeedbackItem[]>("/api/admin/feedback", {}, true);
}
