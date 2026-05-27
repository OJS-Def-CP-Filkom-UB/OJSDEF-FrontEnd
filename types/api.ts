// Auth
export type UserRole = 'saas_admin' | 'admin_ojs' | 'viewer'
export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  must_change_password: boolean
  notif_email: boolean
  notif_telegram: boolean
  telegram_chat_id: string | null
}
export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: 'bearer'
  must_change_password: boolean
}

// Targets
export interface OJSTarget {
  id: string
  name: string
  url: string
  is_verified: boolean
  plugin_connected: boolean
  ojs_version: string | null
  created_at: string
}
export interface CreateTargetRequest { name: string; url: string }
export interface VerifyTargetResponse { verified: boolean; method: 'file' | 'dns' | null }
export interface PluginGuideResponse {
  target_id: string
  api_key: string
  endpoint: string
  instructions: string
}

// Scans
export type ScanType = 'internal' | 'external' | 'full'
export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed'
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low'
export interface ScanProgress { stage: string; current_step: number; total_steps: number }
export interface ScanJob {
  id: string
  target_id: string
  scan_type: ScanType
  status: ScanStatus
  overall_score: number | null
  risk_level: SeverityLevel | null
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  progress: ScanProgress | null
  created_at: string
}
export interface ScanFinding {
  id: string
  finding_type: string
  category: string
  title: string
  description: string
  affected_path: string
  evidence: string
  remediation: string
  severity: SeverityLevel
  cvss_score: number
  cve_id: string | null
  owasp_category: string | null
  is_false_positive: boolean
}

// Dashboard
export interface DashboardStats {
  targets: { total: number }
  scans: { last_30_days: number; completed: number; failed: number }
  security_posture: { average_score: number | null }
  findings_summary: { critical: number; high: number }
}

// Reports
export interface Report {
  id: string
  job_id: string
  format: 'pdf' | 'json'
  file_size_bytes: number | null
  created_at: string
}

// Admin
export interface AdminUserListItem { id: string; email: string; role: UserRole; is_active: boolean }
export interface CreateUserRequest { email: string; full_name: string; role: UserRole; tenant_id?: string }
export interface UpdateUserRequest { is_active?: boolean; role?: UserRole }
export interface Tenant { id: string; name: string; slug: string; is_active: boolean }
export interface CreateTenantRequest { name: string; slug: string }

// Error
export interface ApiError { detail: string }
