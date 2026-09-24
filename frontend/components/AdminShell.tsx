"use client";

import { useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";

export default function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-bg">
        <AdminSidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
        <div className="flex min-h-screen flex-1 flex-col">
          <AdminHeader title={title} onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
