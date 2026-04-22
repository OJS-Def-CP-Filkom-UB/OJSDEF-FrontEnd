"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-slate-200">
      {/* SIDEBAR */}
      <Sidebar />
      
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col pl-[260px] min-h-screen">
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
            <span>v4.2.0-STABLE</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
