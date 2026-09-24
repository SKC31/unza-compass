"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { Compass } from "lucide-react";

/**
 * Wraps every protected /admin/* page. Redirects to /admin/login if there's
 * no token in local storage. This is a convenience guard only — the real
 * protection is server-side, since every /api/admin/* endpoint (except
 * /login) requires a valid JWT via the get_current_admin dependency.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/admin/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Compass className="animate-pulse" size={28} />
          <span className="text-sm">Checking session…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
