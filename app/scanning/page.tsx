"use client";

import dynamic from "next/dynamic";
import AppShell from "@/components/layout/AppShell";

const ScanningPage = dynamic(
  () => import("@/components/scanning/ScanningPage"),
  { ssr: false }
);

export default function Scanning() {
  return (
    <AppShell>
      <ScanningPage />
    </AppShell>
  );
}