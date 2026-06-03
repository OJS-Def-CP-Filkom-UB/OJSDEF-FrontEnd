"use client";

import { useState } from "react";

type RiskLevel = "critical" | "high" | "medium" | "low";

interface Vuln {
  name: string;
  asset: string;
  risk: RiskLevel;
  impact: string;
  dots: number;
  likelihood: string;
  priority: "P1" | "P2" | "P3";
}

const VULNS: Vuln[] = [
  { name: "Log4j RCE (CVE-2021-44228)", asset: "ASSET: PRODUCTION CLUSTER ALPHA", risk: "critical", impact: "Extreme",  dots: 3, likelihood: "Highly Likely", priority: "P1" },
  { name: "SQL Injection on Login",      asset: "ASSET: API-CUSTOMER-PORTAL V1",  risk: "high",     impact: "High",     dots: 2, likelihood: "Likely",       priority: "P1" },
  { name: "Outdated SSH Version",        asset: "ASSET: STAGING-VM-04",            risk: "medium",   impact: "Moderate", dots: 2, likelihood: "Possible",     priority: "P2" },
  { name: "Exposed Admin Panel",         asset: "ASSET: PRODUCTION CLUSTER BETA",  risk: "high",     impact: "High",     dots: 2, likelihood: "Likely",       priority: "P1" },
  { name: "Weak TLS Configuration",      asset: "ASSET: API-GATEWAY-V2",           risk: "medium",   impact: "Moderate", dots: 2, likelihood: "Possible",     priority: "P2" },
  { name: "Unpatched OpenSSL",           asset: "ASSET: LOAD-BALANCER-01",         risk: "low",      impact: "Low",      dots: 1, likelihood: "Unlikely",     priority: "P3" },
];

const RISK_COLOR: Record<RiskLevel, string> = {
  critical: "var(--critical)",
  high:     "var(--high)",
  medium:   "var(--medium)",
  low:      "var(--low)",
};

const BADGE_STYLE: Record<RiskLevel, { bg: string; border: string }> = {
  critical: { bg: "rgba(248,81,73,.15)",  border: "rgba(248,81,73,.3)"  },
  high:     { bg: "rgba(227,179,65,.15)", border: "rgba(227,179,65,.3)" },
  medium:   { bg: "rgba(88,166,255,.15)", border: "rgba(88,166,255,.3)" },
  low:      { bg: "rgba(63,185,80,.15)",  border: "rgba(63,185,80,.3)"  },
};

function Badge({ level }: { level: RiskLevel }) {
  const s = BADGE_STYLE[level];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", background: s.bg, border: `1px solid ${s.border}`, color: RISK_COLOR[level] }}>
      {level}
    </span>
  );
}

function ImpactDots({ count, level }: { count: number; level: RiskLevel }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: i <= count ? RISK_COLOR[level] : "var(--border)" }} />
      ))}
    </div>
  );
}

function ScoreRing({ value }: { value: number }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div style={{ position: "relative", width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }} width="180" height="180" viewBox="0 0 180 180">
        <defs>
          <linearGradient id="sRing" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00e5cc" />
            <stop offset="60%" stopColor="#58a6ff" />
            <stop offset="100%" stopColor="#667eea" />
          </linearGradient>
        </defs>
        <circle cx="90" cy="90" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle cx="90" cy="90" r={r} fill="none" stroke="url(#sRing)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`} />
      </svg>
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--critical)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          HIGH RISK
        </div>
      </div>
    </div>
  );
}

function SevBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.04em" }}>{count} ITEMS</span>
      </div>
      <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(count / max) * 100}%`, background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}

export default function RiskScoringPage() {
  const [filter, setFilter] = useState("");
  const [view, setView] = useState<"day" | "week">("week");
  const [page, setPage] = useState(1);

  const filtered = VULNS.filter(
    (v) => !filter || v.name.toLowerCase().includes(filter.toLowerCase()) || v.asset.toLowerCase().includes(filter.toLowerCase())
  );

  const card = { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Risk Scoring Dashboard</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 14px", fontSize: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)" }} />
          <span style={{ color: "var(--text-muted)" }}>LAST SYNC</span>
          <span style={{ fontWeight: 600 }}>2 mins ago</span>
        </div>
      </div>

      {/* top row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>

        {/* Posture */}
        <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 28 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, alignSelf: "flex-start" }}>
            SECURITY POSTURE SCORE
          </div>
          <ScoreRing value={78} />
          <div style={{ display: "flex", justifyContent: "space-around", width: "100%", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>RISK REDUCTION</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--accent-cyan)" }}>+12.4%</div>
            </div>
            <div style={{ width: 1, background: "var(--border)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>THREAT LEVEL</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--accent-green)" }}>LOW</div>
            </div>
          </div>
        </div>

        {/* Severity bars */}
        <div style={{ ...card, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Vulnerabilities per Severity</div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["Day", "Week"] as const).map((v) => {
                const active = view === v.toLowerCase();
                return (
                  <button
                    key={v}
                    onClick={() => setView(v.toLowerCase() as "day" | "week")}
                    style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", border: "1px solid", fontWeight: 500, background: active ? "var(--accent-cyan)" : "var(--bg-secondary)", color: active ? "#0d1117" : "var(--text-secondary)", borderColor: active ? "var(--accent-cyan)" : "var(--border)" }}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
          <SevBar label="CRITICAL" count={14}  max={256} color="var(--critical)" />
          <SevBar label="HIGH"     count={42}  max={256} color="var(--high)"     />
          <SevBar label="MEDIUM"   count={128} max={256} color="var(--medium)"   />
          <SevBar label="LOW"      count={256} max={256} color="var(--low)"      />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Aggregated data from 1,402 active endpoints.</span>
            <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--accent-cyan)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, letterSpacing: "0.05em" }}>
              VIEW FULL BREAKDOWN
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M4 8a.5.5 0 01.5-.5h5.793L8.146 5.354a.5.5 0 11.708-.708l3 3a.5.5 0 010 .708l-3 3a.5.5 0 01-.708-.708L10.293 8.5H4.5A.5.5 0 014 8z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Risk Priority List */}
      <div style={{ ...card, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Risk Priority List</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 12px" }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="var(--text-muted)">
                <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.099zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z" />
              </svg>
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter vulnerabilities..."
                style={{ background: "none", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 13, width: 160 }}
              />
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "var(--accent-cyan-dim)", border: "1px solid rgba(0,229,204,.3)", borderRadius: 8, color: "var(--accent-cyan)", fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: "0.03em" }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.5 1.5A.5.5 0 012 1h12a.5.5 0 01.5.5v2a.5.5 0 01-.128.334L10 8.692V13.5a.5.5 0 01-.342.474l-3 1A.5.5 0 016 14.5V8.692L1.628 3.834A.5.5 0 011.5 3.5v-2z" />
              </svg>
              EXPORT CSV
            </button>
          </div>
        </div>

        {/* table header */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 0.8fr 1.2fr 1.2fr 0.8fr 0.8fr", padding: "8px 16px", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
          <span>VULNERABILITY</span><span>RISK LEVEL</span><span>IMPACT</span><span>LIKELIHOOD</span><span>PRIORITY</span><span>ACTION</span>
        </div>

        {filtered.map((v, i) => {
          const pColor = v.priority === "P1" ? "var(--critical)" : v.priority === "P2" ? "var(--high)" : "var(--low)";
          const pBg    = v.priority === "P1" ? "rgba(248,81,73,.12)" : v.priority === "P2" ? "rgba(227,179,65,.12)" : "rgba(63,185,80,.12)";
          const pBd    = v.priority === "P1" ? "rgba(248,81,73,.3)"  : v.priority === "P2" ? "rgba(227,179,65,.3)"  : "rgba(63,185,80,.3)";
          return (
            <div
              key={i}
              style={{ display: "grid", gridTemplateColumns: "2fr 0.8fr 1.2fr 1.2fr 0.8fr 0.8fr", padding: 16, borderBottom: i < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none", alignItems: "center", transition: "background 0.15s", cursor: "default", borderRadius: 6 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 3 }}>{v.name}</div>
                <div style={{ fontSize: 10.5, color: "var(--text-muted)", letterSpacing: "0.05em" }}>{v.asset}</div>
              </div>
              <div><Badge level={v.risk} /></div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ImpactDots count={v.dots} level={v.risk} />
                <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{v.impact}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{v.likelihood}</div>
              <div>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 24, background: pBg, border: `1px solid ${pBd}`, borderRadius: 4, fontSize: 11, fontWeight: 700, color: pColor }}>
                  {v.priority}
                </span>
              </div>
              <div>
                <button style={{ padding: "5px 12px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-secondary)", fontSize: 11, cursor: "pointer" }}>
                  View
                </button>
              </div>
            </div>
          );
        })}

        {/* pagination */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Showing 1-10 of 1,402 items</span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {["‹", "1", "2", "3", "›"].map((btn) => {
              const isNum = !isNaN(Number(btn));
              const active = isNum && Number(btn) === page;
              return (
                <button
                  key={btn}
                  onClick={() => isNum && setPage(Number(btn))}
                  style={{ width: 28, height: 28, borderRadius: 6, fontSize: 12, cursor: "pointer", border: "1px solid", fontWeight: active ? 700 : 400, background: active ? "var(--accent-cyan)" : "var(--bg-secondary)", color: active ? "#0d1117" : "var(--text-secondary)", borderColor: active ? "var(--accent-cyan)" : "var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {btn}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
