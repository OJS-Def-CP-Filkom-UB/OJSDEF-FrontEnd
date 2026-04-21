"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200">
      {/* SIDEBAR */}
      <Sidebar />
      
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col pl-72 min-h-screen">
        <Topbar />
        
        <main className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-slate-950 to-slate-900/50">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>

        <footer className="h-12 border-t border-white/5 bg-slate-950/20 px-8 flex items-center justify-between pointer-events-none">
          <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground/40">
            &copy; 2026 OJSDEF Autonomous Systems
          </span>
          <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/30">
            <span>Latency: 42ms</span>
            <span>Region: EU-WEST-1</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
