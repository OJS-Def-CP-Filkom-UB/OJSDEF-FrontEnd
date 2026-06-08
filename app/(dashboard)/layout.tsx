"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import { TenantProvider } from "@/lib/tenant-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantProvider>
      <AppShell>
        {children}
      </AppShell>
    </TenantProvider>
  );
}
