"use client";

import { useState } from "react";

/* ─── types ─────────────────────────────────────── */
type RiskLevel = "critical" | "high" | "medium" | "low";
type ScanStatus = "Completed" | "In Progress";

interface ScanRow {
  url: string;
  node: string;
  type: string;
  risk: RiskLevel;
  date: string;
  status: ScanStatus;
}

/* ─── data ───────────────────────────────────────── */
const SCANS: ScanRow[] = [
  {
    url: "api.production.internal",
    node: "Node #144-39",
    type: "Full Infrastructure",
    risk: "critical",
    date: "2023-10-24 14:22",
    status: "Completed",
  },
  {
    url: "auth-v3.customer-portal.io",
    node: "Node #144-32",
    type: "Endpoint Fuzzing",
    risk: "high",
    date: "2023-10-24 13:45",
    status: "In Progress",
  },
  {
    url: "dev-stage-02.aws.local",
    node: "Node #144-95",
    type: "SQL Injection Audit",
    risk: "low",
    date: "2023-10-24 11:18",
    status: "Completed",
  },
];

const VULN_COUNTS = [
  { label: "Critical", value: 12, color: "var(--critical)" },
  { label: "High",     value: 48, color: "var(--high)"     },
  { label: "Medium",   value: 156, color: "var(--medium)"  },
  { label: "Low",      value: 366, color: "var(--low)"     },
];

/* ─── helpers ────────────────────────────────────── */
const RISK_COLOR: Record<RiskLevel, string> = {
  critical: "var(--critical)",
  high:     "var(--high)",
  medium:   "var(--medium)",
  low:      "var(--low)",
};

function Badge({ level }: { level: RiskLevel }) {
  const colors: Record<RiskLevel, { bg: string; border: string; text: string }> = {
    critical: { bg: "rgba(248,81,73,.15)",  border: "rgba(248,81,73,.3)",  text: "var(--critical)" },
    high:     { bg: "rgba(227,179,65,.15)", border: "rgba(227,179,65,.3)", text: "var(--high)"     },
    medium:   { bg: "rgba(88,166,255,.15)", border: "rgba(88,166,255,.3)", text: "var(--medium)"   },
    low:      { bg: "rgba(63,185,80,.15)",  border: "rgba(63,185,80,.3)",  text: "var(--low)"      },
  };
  const c = colors[level];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 8px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
      }}
    >
      {level}
    </span>
  );
}

/* ─── Ring ───────────────────────────────────────── */
function Ring({ value }: { value: number }) {
  const r = 64;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div style={{ position: "relative", width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }} width="160" height="160" viewBox="0 0 160 160">
        <defs>
          <linearGradient id="dRing" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00e5cc" />
            <stop offset="100%" stopColor="#58a6ff" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle cx="80" cy="80" r={r} fill="none" stroke="url(#dRing)" strokeWidth="8"
          strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`} />
      </svg>
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>
          {value}
          <span style={{ fontSize: 15, fontWeight: 400, color: "var(--text-secondary)" }}>/100</span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--critical)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          HIGH RISK
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────── */
export default function DashboardPage() {
  const [filter, setFilter] = useState("");

  const card = {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 24,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* title */}
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Risk Scoring Dashboard</h1>

      {/* top row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 20 }}>

        {/* Security Overview */}
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
                SECURITY OVERVIEW
              </div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Global Risk Exposure</div>
            </div>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <Ring value={0} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Health Status</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--critical)" }}>Degraded</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Last Update</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>2m ago</div>
            </div>
          </div>
        </div>

        {/* Vulnerability Summary */}
        <div style={card}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
            VULNERABILITY SUMMARY
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Total: 582</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {VULN_COUNTS.map((v) => (
              <div
                key={v.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  background: "var(--bg-secondary)",
                  borderRadius: 8,
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ width: 3, height: 36, borderRadius: 2, background: v.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>{v.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: v.color }}>{v.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Scan Results */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Recent Scan Results</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 12px" }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="var(--text-muted)">
                <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.099zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z" />
              </svg>
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter targets..."
                style={{ background: "none", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 13, width: 130 }}
              />
            </div>
            <button style={{ padding: "7px 10px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-secondary)", cursor: "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.5 1.5A.5.5 0 012 1h12a.5.5 0 01.5.5v2a.5.5 0 01-.128.334L10 8.692V13.5a.5.5 0 01-.342.474l-3 1A.5.5 0 016 14.5V8.692L1.628 3.834A.5.5 0 011.5 3.5v-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.5fr 1fr 1.5fr 1fr",
          padding: "8px 12px",
          fontSize: 11,
          color: "var(--text-muted)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          borderBottom: "1px solid var(--border)",
          marginBottom: 4,
        }}>
          <span>TARGET URL</span>
          <span>SCAN TYPE</span>
          <span>RISK LEVEL</span>
          <span>SCAN DATE</span>
          <span>STATUS</span>
        </div>

        {SCANS.filter(
          (s) =>
            !filter ||
            s.url.toLowerCase().includes(filter.toLowerCase()) ||
            s.node.toLowerCase().includes(filter.toLowerCase())
        ).map((scan, i, arr) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.5fr 1fr 1.5fr 1fr",
              padding: "14px 12px",
              borderBottom: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none",
              alignItems: "center",
              transition: "background 0.15s",
              cursor: "default",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{scan.url}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{scan.node}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="var(--accent-cyan)">
                <path d="M8 1a2 2 0 012 2v4H6V3a2 2 0 012-2zm3 6V3a3 3 0 00-6 0v4a2 2 0 00-2 2v5a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2z" />
              </svg>
              {scan.type}
            </div>
            <div><Badge level={scan.risk} /></div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-geist-mono)" }}>
              {scan.date}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: scan.status === "Completed" ? "var(--accent-green)" : "var(--accent-blue)",
                animation: scan.status === "In Progress" ? "pulse-dot 1.5s infinite" : "none",
              }} />
              <span style={{
                fontSize: 12, fontWeight: 500, padding: "3px 8px", borderRadius: 4,
                color: scan.status === "Completed" ? "var(--accent-green)" : "var(--accent-blue)",
                background: scan.status === "Completed" ? "rgba(63,185,80,.1)" : "rgba(88,166,255,.1)",
              }}>
                {scan.status}
              </span>
            </div>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Showing 3 of 582 discovered vulnerabilities</span>
          <div style={{ display: "flex", gap: 8 }}>
            {["Previous", "Next"].map((btn) => (
              <button key={btn} style={{ padding: "6px 14px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-secondary)", fontSize: 12, cursor: "pointer" }}>
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {[
          { icon: "🔄", title: "Scan Velocity",               meta: "+12.4%",      desc: "Average time to complete full site crawl: 18m 42s" },
          { icon: "☁️", title: "Database Vulnerability (CVE)", meta: "99.9% Uptime", desc: "Database sinkron dan up-to-date" },
          { icon: "🕐", title: "Remediation Rate",             meta: "Weekly Audit", desc: "42 issues resolved in the last 72 hours." },
        ].map((s) => (
          <div key={s.title} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.meta}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
