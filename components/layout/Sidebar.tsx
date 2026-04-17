"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  ShieldCheck,
  Bug,
  BarChart3,
  FileText,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Add Target", path: "/add-target", icon: PlusCircle },
    { name: "Scan Management", path: "/scan-management", icon: ShieldCheck },
    { name: "Vulnerabilities Report", path: "/vulnerability-report", icon: Bug },
    { name: "Risk Scoring", path: "/risk-scoring", icon: BarChart3 },
    { name: "Export", path: "/export", icon: FileText },
  ];

  return (
    <aside className="w-64 bg-[#0b1220] border-r border-white/10 flex flex-col justify-between h-screen">
      {/* TOP */}
      <div>
        <h1 className="text-lg font-bold px-6 py-6 text-cyan-400">
          Security Core
        </h1>

        <nav className="px-3 space-y-1">
          {menu.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all duration-200
                    ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <Icon size={18} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM (LOGOUT) */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => router.replace("/login")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-all duration-200 w-full"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}