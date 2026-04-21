"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  Search,
  BarChart3,
  Settings,
  LogOut,
  Target,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Active Scans", href: "/scanning", icon: Search },
  { name: "Threat Reports", href: "/vulnerability-report", icon: ShieldAlert },
  { name: "Risk Scoring", href: "/risk-scoring", icon: BarChart3 },
  { name: "Scan Management", href: "/scan-management", icon: Target },
  { name: "Export Data", href: "/export", icon: Download },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 border-r border-border bg-slate-900/40 backdrop-blur-xl flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="p-8">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <ShieldAlert size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">OJSDef</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                isActive
                  ? "bg-primary text-black"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon
                size={20}
                className={cn(
                  "transition-colors",
                  isActive ? "text-black" : "text-primary/60 group-hover:text-primary"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-border bg-background/20">
        <div className="space-y-1">
          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-white/5 hover:text-white transition-all group"
          >
            <Settings size={20} className="text-muted-foreground group-hover:text-white" />
            System Settings
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all group"
          >
            <LogOut size={20} className="text-red-400" />
            Sign Out
          </button>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
              AD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">Administrator</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Enterprise Plan</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
