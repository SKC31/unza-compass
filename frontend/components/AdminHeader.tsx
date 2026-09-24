"use client";

import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { adminLogout } from "@/lib/api";
import { clearToken, getAdminEmail } from "@/lib/auth";

export default function AdminHeader({
  title,
  onMenuClick,
}: {
  title: string;
  onMenuClick?: () => void;
}) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await adminLogout();
    } catch {
      // even if the API call fails, clear the local session
    } finally {
      clearToken();
      router.push("/admin/login");
    }
  }

  const email = typeof window !== "undefined" ? getAdminEmail() : null;

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="text-muted hover:text-ink sm:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-ink">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {email && (
          <span className="hidden text-xs text-muted sm:inline">{email}</span>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-slate-50"
        >
          <LogOut size={13} />
          Logout
        </button>
      </div>
    </header>
  );
}
