"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      pathname === href
        ? "text-primary"
        : "text-muted hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-card">
            <Compass size={18} strokeWidth={2.25} />
          </span>
          <span className="text-base font-semibold tracking-tight text-ink">
            UNZA Compass
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/" className={linkClass("/")}>
            Home
          </Link>
          <Link href="/about" className={linkClass("/about")}>
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
