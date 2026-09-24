"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, Eye, EyeOff, LogIn } from "lucide-react";
import { adminLogin, ApiError } from "@/lib/api";
import { setToken, isAuthenticated } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (typeof window !== "undefined" && isAuthenticated()) {
    router.replace("/admin/dashboard");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await adminLogin(email.trim(), password);
      setToken(res.access_token, res.email);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 401
            ? "Invalid email or password."
            : err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-card">
            <Compass size={22} />
          </span>
          <h1 className="text-lg font-semibold text-white">
            UNZA Compass Admin
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to manage the knowledge base and monitor activity.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
        >
          {error && (
            <div className="rounded-lg border border-red-900 bg-red-950/50 px-3 py-2 text-xs text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="admin@unzacompass.example"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            <LogIn size={15} />
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-slate-500">
          UNZA Compass — independent student prototype, not an official UNZA
          service.
        </p>
      </div>
    </div>
  );
}
