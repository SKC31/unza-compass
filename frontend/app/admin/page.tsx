"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { Compass } from "lucide-react";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isAuthenticated() ? "/admin/dashboard" : "/admin/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <Compass className="animate-pulse" size={28} />
        <span className="text-sm">Loading…</span>
      </div>
    </div>
  );
}
