"use client";

import { Info, Mail, Shield, Server } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import { getAdminEmail } from "@/lib/auth";

export default function AdminSettingsPage() {
  const email = typeof window !== "undefined" ? getAdminEmail() : null;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <AdminShell title="Settings">
      <div className="max-w-xl space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center gap-2 text-ink">
            <Mail size={15} />
            <h2 className="text-sm font-semibold">Admin account</h2>
          </div>
          <p className="mt-2 text-sm text-muted">
            Signed in as <span className="font-medium text-ink">{email ?? "—"}</span>
          </p>
          <p className="mt-3 text-xs text-muted">
            The MVP supports a single administrator account, configured via
            the <code className="rounded bg-slate-100 px-1 py-0.5">ADMIN_EMAIL</code> and{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5">ADMIN_PASSWORD</code>{" "}
            environment variables on the backend. To change the password,
            update the environment variable and re-run{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5">python seed.py</code>.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center gap-2 text-ink">
            <Server size={15} />
            <h2 className="text-sm font-semibold">Backend connection</h2>
          </div>
          <p className="mt-2 text-sm text-muted">
            API URL:{" "}
            <span className="font-mono text-xs text-ink">{apiUrl}</span>
          </p>
          <p className="mt-3 text-xs text-muted">
            Set via <code className="rounded bg-slate-100 px-1 py-0.5">NEXT_PUBLIC_API_URL</code>{" "}
            in the frontend environment.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center gap-2 text-ink">
            <Shield size={15} />
            <h2 className="text-sm font-semibold">Security notes</h2>
          </div>
          <ul className="mt-2 space-y-1.5 text-xs text-muted">
            <li>• Admin passwords are hashed with bcrypt, never stored in plain text.</li>
            <li>• Sessions use a signed JWT that expires automatically.</li>
            <li>• Every admin API route (except login) requires a valid token.</li>
            <li>• The AI provider API key is only ever used by the backend.</li>
          </ul>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-muted">
          <Info size={14} className="mt-0.5 shrink-0" />
          This is an MVP settings panel. Future versions could add
          multiple administrator roles, password change from the UI, and
          knowledge-base import/export.
        </div>
      </div>
    </AdminShell>
  );
}
