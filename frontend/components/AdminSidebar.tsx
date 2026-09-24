"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  MessagesSquare,
  ThumbsUp,
  Settings,
  Compass,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/admin/questions", label: "Questions", icon: MessagesSquare },
  { href: "/admin/feedback", label: "Feedback", icon: ThumbsUp },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Compass size={16} />
          </span>
          <span className="text-sm font-semibold text-white">
            UNZA Compass Admin
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white sm:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 text-[11px] text-slate-500">
        UNZA Compass — independent student prototype
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-slate-900 sm:block">
        {content}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-slate-900 shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
