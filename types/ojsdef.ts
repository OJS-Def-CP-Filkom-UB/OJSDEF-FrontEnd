export type OJSScanType = "internal" | "external" | "full_audit"
export type PluginStatus = "connected" | "disconnected" | "error" | "never_connected"
export type RiskLevel = "critical" | "high" | "medium" | "low"
export type UserRole = "admin_ojs" | "it_admin" | "saas_admin"

export interface OJSTarget {
  id: string
  url: string
  institutionName: string
  ojsVersion: string | null
  pluginStatus: PluginStatus
  isVerified: boolean
  lastScanAt: string | null
  lastRiskScore: number | null
}

export interface ActionPlanStep {
  step: number
  description: string
  estimatedTime: string
  difficulty: "mudah" | "menengah" | "sulit"
}

export interface ScanFinding {
  id: string
  targetId: string
  title: string
  description: string
  cvssScore: number
  severity: RiskLevel
  sourceType: "internal" | "external"
  actionPlan: ActionPlanStep[]
  detectedAt: string
  status: "open" | "resolved"
  cveId?: string
}

export interface ScanSession {
  id: string
  targetId: string
  targetUrl: string
  institutionName: string
  scanType: OJSScanType
  riskLevel: RiskLevel | null
  findingsCount: number
  status: "in-progress" | "finalizing" | "queued" | "completed" | "failed"
  startTime: string
  duration?: string
  progress: number
}
