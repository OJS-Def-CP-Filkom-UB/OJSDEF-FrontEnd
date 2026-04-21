export type RiskLevel = "critical" | "high" | "medium" | "low";
export type ScanStatus = "Completed" | "In Progress" | "Failed";

export interface ScanRow {
  id: string;
  url: string;
  node: string;
  type: string;
  risk: RiskLevel;
  date: string;
  status: ScanStatus;
  vulnerabilities: number;
}

export const MOCK_SCANS: ScanRow[] = [
  {
    id: "sc_01",
    url: "api.production.internal",
    node: "Node #144-39",
    type: "Full Infrastructure",
    risk: "critical",
    date: "2024-04-21 14:22",
    status: "Completed",
    vulnerabilities: 12,
  },
  {
    id: "sc_02",
    url: "auth-v3.customer-portal.io",
    node: "Node #144-32",
    type: "Endpoint Fuzzing",
    risk: "high",
    date: "2024-04-21 13:45",
    status: "In Progress",
    vulnerabilities: 8,
  },
  {
    id: "sc_03",
    url: "dev-stage-02.aws.local",
    node: "Node #144-95",
    type: "SQL Injection Audit",
    risk: "low",
    date: "2024-04-21 11:18",
    status: "Completed",
    vulnerabilities: 2,
  },
  {
    id: "sc_04",
    url: "billing.gateway.secure",
    node: "Node #144-12",
    type: "XSS Vulnerability Scan",
    risk: "medium",
    date: "2024-04-20 22:10",
    status: "Completed",
    vulnerabilities: 5,
  },
];

export const VULN_STATS = [
  { label: "Critical", value: 12, color: "var(--critical)", percentage: 2 },
  { label: "High", value: 48, color: "var(--high)", percentage: 8 },
  { label: "Medium", value: 156, color: "var(--medium)", percentage: 25 },
  { label: "Low", value: 366, color: "var(--low)", percentage: 65 },
];

export const SYSTEM_HEALTH = {
  score: 82,
  status: "Degraded",
  lastUpdate: "2 minutes ago",
  vulnerabilitiesTotal: 582,
};

export interface Vulnerability {
  id: string;
  name: string;
  severity: RiskLevel;
  score: number;
  component: string;
  status: "Open" | "Resolved";
  recommendation: string;
  detectedAt: string;
}

export const MOCK_VULNERABILITIES: Vulnerability[] = [
  {
    id: "vuln_01",
    name: "SQL Injection on Login",
    severity: "critical",
    score: 9.8,
    component: "auth-gateway-service:v2.1",
    status: "Open",
    recommendation: "Implement prepared statements and strict input validation.",
    detectedAt: "2024-04-21 14:22",
  },
  {
    id: "vuln_02",
    name: "Outdated OpenSSL Version",
    severity: "high",
    score: 8.2,
    component: "proxy-ingress-01",
    status: "Open",
    recommendation: "Upgrade to OpenSSL 3.0.x or higher immediately.",
    detectedAt: "2024-04-21 13:45",
  },
  {
    id: "vuln_03",
    name: "Insecure CORS Policy",
    severity: "medium",
    score: 5.4,
    component: "public-api-v1",
    status: "Resolved",
    recommendation: "Restrict Access-Control-Allow-Origin to specific domains.",
    detectedAt: "2024-04-21 11:18",
  },
  {
    id: "vuln_04",
    name: "Missing HTTP Strict Transport",
    severity: "low",
    score: 3.1,
    component: "static-assets-cdn",
    status: "Open",
    recommendation: "Enable HSTS header in the CDN configuration.",
    detectedAt: "2024-04-20 22:10",
  },
];

export interface RiskPriorityItem {
  id: string;
  name: string;
  asset: string;
  risk: RiskLevel;
  impact: string;
  impactDots: number;
  likelihood: string;
  priority: "P1" | "P2" | "P3";
}

export const MOCK_RISK_ITEMS: RiskPriorityItem[] = [
  { id: "risk_01", name: "Log4j RCE (CVE-2021-44228)", asset: "PRODUCTION CLUSTER ALPHA", risk: "critical", impact: "Extreme", impactDots: 3, likelihood: "Highly Likely", priority: "P1" },
  { id: "risk_02", name: "SQL Injection on Login", asset: "API-CUSTOMER-PORTAL V1", risk: "high", impact: "High", impactDots: 2, likelihood: "Likely", priority: "P1" },
  { id: "risk_03", name: "Outdated SSH Version", asset: "STAGING-VM-04", risk: "medium", impact: "Moderate", impactDots: 2, likelihood: "Possible", priority: "P2" },
  { id: "risk_04", name: "Exposed Admin Panel", asset: "PRODUCTION CLUSTER BETA", risk: "high", impact: "High", impactDots: 2, likelihood: "Likely", priority: "P1" },
  { id: "risk_05", name: "Weak TLS Configuration", asset: "API-GATEWAY-V2", risk: "medium", impact: "Moderate", impactDots: 2, likelihood: "Possible", priority: "P2" },
  { id: "risk_06", name: "Unpatched OpenSSL", asset: "LOAD-BALANCER-01", risk: "low", impact: "Low", impactDots: 1, likelihood: "Unlikely", priority: "P3" },
];

export const MOCK_SCAN_LOGS = [
  { type: "INFO", msg: "Initializing scanner environment..." },
  { type: "INFO", msg: "Connecting to target: api.sentinel-core.infra" },
  { type: "DONE", msg: "Connection established. Target is reachable." },
  { type: "TASK", msg: "Starting port scan on target host..." },
  { type: "DONE", msg: "Port scan complete. 8 open services found." },
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
  { type: "EXEC", msg: "Scanning for known CVEs detected in services..." },
  { type: "INFO", msg: "Vulnerability scan phase complete. Generating report..." },
];

export interface ScanSession {
  id: string;
  title: string;
  target: string;
  progress: number;
  status: "in-progress" | "finalizing" | "queued" | "completed" | "failed";
  startTime: string;
  duration?: string;
  threatsFound: number;
}

export const MOCK_ACTIVE_SCANS: ScanSession[] = [
  {
    id: "SCAN-77291-B",
    title: "External Perimeter Audit",
    target: "api.sentinel-core.io",
    progress: 65,
    status: "in-progress",
    startTime: "2024-04-21 14:20",
    threatsFound: 4,
  },
  {
    id: "SCAN-88310-X",
    title: "Internal Database Cluster",
    target: "db-cluster-alpha.internal",
    progress: 92,
    status: "finalizing",
    startTime: "2024-04-21 15:05",
    threatsFound: 0,
  },
];

export const MOCK_SCAN_HISTORY: ScanSession[] = [
  {
    id: "SCAN-66120-P",
    title: "Compliance Check Q1",
    target: "vault.production-internal.net",
    progress: 100,
    status: "completed",
    startTime: "2024-04-20 09:00",
    duration: "45m 12s",
    threatsFound: 1,
  },
  {
    id: "SCAN-55902-L",
    title: "Legacy Gateway Probe",
    target: "legacy-gateway.corp",
    progress: 100,
    status: "completed",
    startTime: "2024-04-19 22:30",
    duration: "08m 22s",
    threatsFound: 12,
  },
  {
    id: "SCAN-44321-F",
    title: "Staging Stress Test",
    target: "staging-env-04.cloud",
    progress: 100,
    status: "failed",
    startTime: "2024-04-19 14:10",
    duration: "02m 10s",
    threatsFound: 0,
  },
];
