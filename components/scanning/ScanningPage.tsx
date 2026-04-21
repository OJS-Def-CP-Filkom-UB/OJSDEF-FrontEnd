"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const LOG_ENTRIES = [
  { type: "INFO", msg: "Initializing scanner environment..." },
  { type: "INFO", msg: "Connecting to target: api.sentinel-core.infra" },
  { type: "DONE", msg: "Connection established. Target is reachable." },
  { type: "TASK", msg: "Starting port scan on target host..." },
  { type: "DONE", msg: "Port scan complete. 8 open services found: 80, 443, 22, 3306, 6379, 8080, 8443, 9200" },
  { type: "TASK", msg: "Crawling web directories and endpoints..." },
  { type: "INFO", msg: "Discovered 1,240 endpoints across 14 routes" },
  { type: "TASK", msg: "Running OWASP Top 10 vulnerability checks..." },
  { type: "EXEC", msg: "Testing SQL injection on POST /v1/auth/login" },
  { type: "EXEC", msg: "Testing XSS payload on GET /v1/search?q=" },
  { type: "EXEC", msg: "Checking broken authentication on /admin/panel" },
  { type: "EXEC", msg: "Analyzing HTTP security headers configuration..." },
  { type: "WARN", msg: "Missing header: X-Content-Type-Options on /api/v1" },
  { type: "EXEC", msg: "Testing for insecure direct object references..." },
  { type: "EXEC", msg: "Fuzzing /v1/user/{id} parameter for IDOR..." },
  { type: "INFO", msg: "Checking TLS/SSL certificate and cipher suites..." },
  { type: "DONE", msg: "TLS 1.3 detected. Certificate valid until 2025-12-01" },
  { type: "EXEC", msg: "Scanning for known CVEs in detected service versions..." },
  { type: "INFO", msg: "Vulnerability scan phase complete. Generating report..." },
];

const LOG_COLOR: Record<string, string> = {
  INFO: "#58a6ff",
  DONE: "#3fb950",
  TASK: "#e3b341",
  EXEC: "#00e5cc",
  WARN: "#f85149",
};

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function getTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
}

function ScanRing({ value }: { value: number }) {
  const r = 90;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }} width="220" height="220" viewBox="0 0 220 220">
        <defs>
          <linearGradient id="scanG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00e5cc" />
            <stop offset="100%" stopColor="#58a6ff" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="110" cy="110" r={r} fill="none" stroke="rgba(0,229,204,0.06)" strokeWidth="16" />
        <circle cx="110" cy="110" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle
          cx="110" cy="110" r={r}
          fill="none" stroke="url(#scanG)" strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          filter="url(#glow)"
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em" }}>
          {value}
          <span style={{ fontSize: 20, fontWeight: 400, color: "var(--text-secondary)" }}>%</span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-cyan)", letterSpacing: "0.12em", marginTop: 8, textTransform: "uppercase", lineHeight: 1.6 }}>
          PHASE:<br />VULNERABILITY<br />SCANNING
        </div>
      </div>
    </div>
  );
}

export default function ScanningPage() {
  const router = useRouter();

  // ── mulai dari 0 ──
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed]   = useState(0);
  const [threats, setThreats]   = useState(0);

  const [visibleLogs, setVisibleLogs] = useState<{ time: string; type: string; msg: string }[]>([]);
  const logRef      = useRef<HTMLDivElement>(null);
  const logIndexRef = useRef(0);

  // timer progress & elapsed
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((e) => e + 1);
      setProgress((p) => {
        if (p >= 99) return 99;
        const inc = p < 30 ? 0.8 : p < 60 ? 0.4 : p < 85 ? 0.2 : 0.05;
        return Math.min(99, parseFloat((p + inc).toFixed(2)));
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // log muncul bertahap setiap ~2 detik
  useEffect(() => {
    const id = setInterval(() => {
      const idx = logIndexRef.current;
      if (idx < LOG_ENTRIES.length) {
        setVisibleLogs((prev) => [...prev, { ...LOG_ENTRIES[idx], time: getTime() }]);
        logIndexRef.current = idx + 1;
      }
    }, 2200);
    return () => clearInterval(id);
  }, []);

  // auto scroll
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [visibleLogs]);

  const ESTIMATED_TOTAL = 180;
  const remaining = Math.max(0, ESTIMATED_TOTAL - elapsed);
  const card = { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-cyan)", animation: "pulse-dot 1.5s infinite" }} />
          <span style={{ fontSize: 11, color: "var(--accent-cyan)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
            LIVE OPERATION
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Scanning in Progress</h1>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Target:{" "}
              <code style={{ background: "var(--bg-secondary)", padding: "2px 8px", borderRadius: 4, color: "var(--accent-cyan)", fontSize: 12 }}>
                api.sentinel-core.infra
              </code>
              {" "}— Analyzing 1,240 endpoints for OWASP Top 10 vulnerabilities.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", background: "rgba(248,81,73,.1)", border: "1px solid rgba(248,81,73,.4)", borderRadius: 8, color: "var(--critical)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(248,81,73,.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(248,81,73,.1)")}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
            </svg>
            Cancel Scan
          </button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Left: ring + stats */}
        <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", gap: 32, padding: "36px 28px" }}>
          <ScanRing value={Math.round(progress)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, width: "100%", paddingTop: 20, borderTop: "1px solid var(--border)" }}>
            {[
              { label: "Time Elapsed",   val: fmt(elapsed),                                    color: "var(--text-primary)",                          sub: "sec"     },
              { label: "Threats Found",  val: String(threats).padStart(2, "0"),                color: threats > 0 ? "var(--critical)" : "var(--accent-green)", sub: undefined },
              { label: "Est. Remaining", val: elapsed < ESTIMATED_TOTAL ? `~${fmt(remaining)}` : "—", color: "var(--text-primary)", sub: undefined },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center", borderLeft: i > 0 ? "1px solid var(--border)" : "none" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {stat.label}
                </div>
                <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 20, fontWeight: 700, color: stat.color }}>
                  {stat.val}
                </div>
                {stat.sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{stat.sub}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Right: log feed */}
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="var(--accent-cyan)">
                <path d="M0 3a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H2a2 2 0 01-2-2V3zm5.5 8.5a.5.5 0 000 1h5a.5.5 0 000-1h-5zm-1-3a.5.5 0 000 1h7a.5.5 0 000-1h-7zm-1-3a.5.5 0 000 1h3a.5.5 0 000-1h-3z" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Active Engine Feed</span>
            </div>
            <span style={{ padding: "3px 10px", background: "rgba(0,229,204,.12)", border: "1px solid rgba(0,229,204,.3)", borderRadius: 4, fontSize: 11, color: "var(--accent-cyan)", fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}>
              DEBUG_MODE
            </span>
          </div>

          {/* legend */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {Object.entries(LOG_COLOR).map(([type, color]) => (
              <div key={type} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "var(--text-muted)" }}>
                <div style={{ width: 6, height: 6, borderRadius: 1, background: color }} />
                {type}
              </div>
            ))}
          </div>

          {/* log window */}
          <div
            ref={logRef}
            style={{ flex: 1, background: "#0a0f1a", borderRadius: 8, border: "1px solid var(--border)", padding: "12px 14px", overflowY: "auto", fontFamily: "var(--font-geist-mono)", fontSize: 11.5, lineHeight: 1.8, minHeight: 230, maxHeight: 270 }}
          >
            {visibleLogs.length === 0 && (
              <span style={{ color: "var(--text-muted)", fontSize: 11 }}>Waiting for scanner to initialize...</span>
            )}
            {visibleLogs.map((log, i) => (
              <div
                key={i}
                style={{ padding: "2px 0 2px 8px", borderLeft: i === visibleLogs.length - 1 ? "2px solid var(--accent-cyan)" : "2px solid transparent", background: i === visibleLogs.length - 1 ? "rgba(0,229,204,.04)" : "transparent", borderRadius: 2, animation: "fadeInUp 0.3s ease" }}
              >
                <span style={{ color: "#4a5568", marginRight: 6 }}>[{log.time}]</span>
                <span style={{ color: LOG_COLOR[log.type] ?? "#8b949e", fontWeight: 700, marginRight: 4 }}>{log.type}</span>
                <span style={{ color: "#c9d1d9" }}>{log.msg}</span>
              </div>
            ))}
            <span style={{ display: "inline-block", width: 8, height: 14, background: "var(--accent-cyan)", verticalAlign: "text-bottom", animation: "blink 1s infinite", borderRadius: 1, marginLeft: 2 }} />
          </div>

          {/* status bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-secondary)", borderRadius: 6, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-cyan)", animation: "pulse-dot 1s infinite" }} />
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Processing scan data</span>
            </div>
            <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 12, color: "var(--accent-cyan)", fontWeight: 700 }}>1.2 MB/s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
