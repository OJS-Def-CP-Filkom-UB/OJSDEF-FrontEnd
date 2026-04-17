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
import Header from "./Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const menu = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Add Target", path: "/add-target", icon: PlusCircle },
    { name: "Scan Management", path: "/scan-management", icon: ShieldCheck },
    { name: "Vulnerabilities Report", path: "/vulnerability-report", icon: Bug },
    { name: "Risk Scoring", path: "/risk-scoring", icon: BarChart3 },
    { name: "Export", path: "/export", icon: FileText },
  ];

  return (
    <div className="min-h-screen flex text-white">

      {/* SIDEBAR */}
      <aside
        className="w-64 border-r border-slate-800 flex flex-col justify-between"
        style={{ backgroundColor: "var(--color-secondary)" }}
      >
        {/* TOP */}
        <div>
          <h1
            className="text-lg font-bold px-6 py-6"
            style={{ color: "var(--color-primary)" }}
          >
            Security Core
          </h1>

          <nav className="px-3 space-y-1">
            {menu.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;

              return (
                <Link key={item.path} href={item.path}>
                  <div
                    className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all duration-200 cursor-pointer
                      ${
                        isActive
                          ? "bg-white/5"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    style={
                      isActive
                        ? {
                            color: "var(--color-primary)",
                            borderLeft: "4px solid var(--color-primary)",
                          }
                        : {}
                    }
                  >
                    <Icon size={18} />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => router.replace("/login")}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE (HEADER + CONTENT) */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <Header />

        {/* MAIN CONTENT */}
        <main
          className="flex-1 p-6"
          style={{
            background: "linear-gradient(to bottom right, #020617, #0e1731)",
          }}
        >
          {children}
        </main>

      </div>
    </div>
  );
}