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
    <aside className="w-[260px] border-r border-white/5 bg-neutral-950 flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="p-8">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
            <ShieldAlert size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white uppercase italic">
            OJS<span className="text-secondary">Def</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all group relative",
                isActive
                  ? "text-secondary font-bold"
                  : "text-muted-foreground hover:text-white hover:bg-white/2"
              )}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-5 bg-secondary rounded-r-full shadow-[0_0_10px_rgba(0,230,153,0.5)]" />
              )}
              <item.icon
                size={18}
                className={cn(
                  "transition-colors",
                  isActive ? "text-secondary" : "text-muted-foreground group-hover:text-white"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="space-y-1">
          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-white transition-all group"
          >
            <Settings size={18} />
            Settings
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all group text-left"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-[10px] font-bold text-secondary border border-secondary/30">
              AD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Administrator</p>
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Enterprise</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
