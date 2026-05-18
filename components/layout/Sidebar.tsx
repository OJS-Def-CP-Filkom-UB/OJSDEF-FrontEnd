"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard, ShieldAlert, Search, BarChart3,
  LogOut, Download, Terminal, Users, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import type { UserRole } from "@/types/ojsdef";

type NavItem = { name: string; href: string; icon: React.ElementType }

const BASE_NAV: NavItem[] = [
  { name: "Beranda",        href: "/dashboard",            icon: LayoutDashboard },
  { name: "Scan Aktif",     href: "/scanning",             icon: Search },
  { name: "Laporan Temuan", href: "/vulnerability-report", icon: ShieldAlert },
  { name: "Risk Scoring",   href: "/risk-scoring",         icon: BarChart3 },
  { name: "Target OJS",     href: "/targets",              icon: Globe },
  { name: "Ekspor",         href: "/export",               icon: Download },
]

const IT_ADMIN_NAV: NavItem[] = [...BASE_NAV, { name: "Log Teknis", href: "/scan-management", icon: Terminal }]
const SAAS_ADMIN_NAV: NavItem[] = [...IT_ADMIN_NAV, { name: "Kelola Pengguna", href: "/users", icon: Users }]

const ROLE_LABEL: Record<UserRole, string> = {
  admin_ojs:  "Admin OJS",
  it_admin:   "IT Admin",
  saas_admin: "SaaS Admin",
}

function getNavItems(role?: string): NavItem[] {
  if (role === "saas_admin") return SAAS_ADMIN_NAV
  if (role === "it_admin")   return IT_ADMIN_NAV
  return BASE_NAV
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const navigation = getNavItems(role)

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
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all group relative",
                isActive ? "text-secondary font-bold" : "text-muted-foreground hover:text-white hover:bg-white/2"
              )}
            >
              {isActive && <div className="absolute left-0 w-1 h-5 bg-secondary rounded-r-full shadow-[0_0_10px_rgba(0,230,153,0.5)]" />}
              <item.icon size={18} className={cn("transition-colors", isActive ? "text-secondary" : "text-muted-foreground group-hover:text-white")} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 mt-auto">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all text-left"
        >
          <LogOut size={18} />
          Sign Out
        </button>

        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-[10px] font-bold text-secondary border border-secondary/30">
              {session?.user?.name?.slice(0, 2).toUpperCase() ?? "AD"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{session?.user?.name ?? "Administrator"}</p>
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">
                {role ? ROLE_LABEL[role] : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
