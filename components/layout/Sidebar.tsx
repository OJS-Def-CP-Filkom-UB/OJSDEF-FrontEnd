"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
        <path d="M0 1.5A1.5 1.5 0 011.5 0h2A1.5 1.5 0 015 1.5v2A1.5 1.5 0 013.5 5h-2A1.5 1.5 0 010 3.5v-2zm5.5 0A1.5 1.5 0 017 0h2a1.5 1.5 0 011.5 1.5v2A1.5 1.5 0 019 5H7a1.5 1.5 0 01-1.5-1.5v-2zm5.5 0A1.5 1.5 0 0112.5 0h2A1.5 1.5 0 0116 1.5v2A1.5 1.5 0 0114.5 5h-2A1.5 1.5 0 0111 3.5v-2zM0 7a1.5 1.5 0 011.5-1.5h2A1.5 1.5 0 015 7v2a1.5 1.5 0 01-1.5 1.5h-2A1.5 1.5 0 010 9V7zm5.5 0A1.5 1.5 0 017 5.5h2A1.5 1.5 0 0110.5 7v2A1.5 1.5 0 019 10.5H7A1.5 1.5 0 015.5 9V7zm5.5 0A1.5 1.5 0 0112.5 5.5h2A1.5 1.5 0 0116 7v2a1.5 1.5 0 01-1.5 1.5h-2A1.5 1.5 0 0111 9V7z" />
      </svg>
    ),
  },
  {
    href: "/add-target",
    label: "Add Target",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z" />
        <path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3v3a.5.5 0 01-1 0v-3h-3a.5.5 0 010-1h3v-3A.5.5 0 018 4z" />
      </svg>
    ),
  },
  {
    href: "#",
    label: "Scan Management",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a2 2 0 012 2v4H6V3a2 2 0 012-2zm3 6V3a3 3 0 00-6 0v4a2 2 0 00-2 2v5a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2z" />
      </svg>
    ),
  },
  {
    href: "#",
    label: "Vulnerabilities Report",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
        <path d="M14.5 3a.5.5 0 01.5.5v9a.5.5 0 01-.5.5h-13a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h13zm-13-1A1.5 1.5 0 000 3.5v9A1.5 1.5 0 001.5 14h13a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0014.5 2h-13z" />
        <path d="M3 5.5a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zM3 8a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9A.5.5 0 013 8zm0 2.5a.5.5 0 01.5-.5h6a.5.5 0 010 1h-6a.5.5 0 01-.5-.5z" />
      </svg>
    ),
  },
  {
    href: "/risk-scoring",
    label: "Risk Scoring",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
        <path d="M0 0h1v15h15v1H0V0zm14.817 3.113a.5.5 0 01.07.704l-4.5 5.5a.5.5 0 01-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 01-.808-.588l4-5.5a.5.5 0 01.758-.06l2.609 2.61 4.15-5.073a.5.5 0 01.704-.07z" />
      </svg>
    ),
  },
  {
    href: "#",
    label: "Export",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
        <path d="M.5 9.9a.5.5 0 01.5.5v2.5a1 1 0 001 1h12a1 1 0 001-1v-2.5a.5.5 0 011 0v2.5a2 2 0 01-2 2H2a2 2 0 01-2-2v-2.5a.5.5 0 01.5-.5z" />
        <path d="M7.646 11.854a.5.5 0 00.708 0l3-3a.5.5 0 00-.708-.708L8.5 10.293V1.5a.5.5 0 00-1 0v8.793L5.354 8.146a.5.5 0 10-.708.708l3 3z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 220, minWidth: 220,
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        padding: "24px 0",
        position: "fixed", top: 0, left: 0,
        height: "100vh", zIndex: 50,
      }}
    >
      <div style={{ padding: "0 20px 28px", fontSize: 16, fontWeight: 700, color: "var(--accent-cyan)", letterSpacing: "0.02em" }}>
        Security Core
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "0 12px", overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8, fontSize: 13.5,
                color: active ? "var(--accent-cyan)" : "var(--text-secondary)",
                background: active ? "rgba(0,229,204,0.08)" : "transparent",
                border: `1px solid ${active ? "rgba(0,229,204,0.2)" : "transparent"}`,
                textDecoration: "none", transition: "all 0.15s ease",
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "16px 12px 0", borderTop: "1px solid var(--border)" }}>
        <button style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13.5, color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer" }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M10 3.5a.5.5 0 00-.5-.5h-8a.5.5 0 00-.5.5v9a.5.5 0 00.5.5h8a.5.5 0 00.5-.5v-2a.5.5 0 011 0v2A1.5 1.5 0 019.5 14h-8A1.5 1.5 0 010 12.5v-9A1.5 1.5 0 011.5 2h8A1.5 1.5 0 0111 3.5v2a.5.5 0 01-1 0v-2z"/>
            <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 000-.708l-3-3a.5.5 0 10-.708.708L14.293 7.5H5.5a.5.5 0 000 1h8.793l-2.147 2.146a.5.5 0 00.708.708l3-3z"/>
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
