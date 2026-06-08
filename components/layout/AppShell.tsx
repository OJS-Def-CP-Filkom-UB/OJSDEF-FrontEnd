"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useAuth } from "@/hooks/use-auth";

const TELEGRAM_EXEMPT_PATHS = ['/setup/telegram', '/change-password']

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    } else if (!isLoading && user?.role === 'admin_ojs' && !user.telegram_chat_id) {
      if (!TELEGRAM_EXEMPT_PATHS.includes(pathname)) {
        router.replace('/setup/telegram')
      }
    }
  }, [isLoading, user, router, pathname])

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Memuat sesi...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-background text-slate-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
        <footer className="h-10 border-t border-white/5 bg-black/20 px-8 flex items-center justify-between pointer-events-none text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground/30">
          <span>&copy; 2026 OJSDEF INTEGRATED SECURITY</span>
          <div className="flex items-center gap-4 tracking-widest text-muted-foreground/20">
            <span className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-secondary animate-pulse" />
              Engine: Active
            </span>
            <span>v1.0.0-STABLE</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
