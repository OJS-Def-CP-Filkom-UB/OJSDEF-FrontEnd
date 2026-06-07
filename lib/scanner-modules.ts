import type { ScanFinding, ScanType } from '@/types/api'

export interface ScannerModule {
  key: string
  label: string
  scan_types: ScanType[]
}

export const INTERNAL_MODULES: ScannerModule[] = [
  { key: 'fingerprint',    label: 'Fingerprint OJS',    scan_types: ['internal', 'full'] },
  { key: 'config',         label: 'Konfigurasi',        scan_types: ['internal', 'full'] },
  { key: 'plugins',        label: 'Audit Plugin',       scan_types: ['internal', 'full'] },
  { key: 'rbac',           label: 'Akses & Hak Akun',   scan_types: ['internal', 'full'] },
  { key: 'file_integrity', label: 'Integritas File',    scan_types: ['internal', 'full'] },
  { key: 'content',        label: 'Konten Injeksi',     scan_types: ['internal', 'full'] },
]

export const EXTERNAL_MODULES: ScannerModule[] = [
  { key: 'fingerprint_ext', label: 'Fingerprint Eksternal', scan_types: ['external', 'full'] },
  { key: 'ssl',             label: 'SSL / TLS',             scan_types: ['external', 'full'] },
  { key: 'headers',         label: 'HTTP Headers',          scan_types: ['external', 'full'] },
  { key: 'cookies',         label: 'Cookie Keamanan',       scan_types: ['external', 'full'] },
  { key: 'vulnerabilities', label: 'Kerentanan Aktif',      scan_types: ['external', 'full'] },
  { key: 'open_dirs',       label: 'Direktori Sensitif',    scan_types: ['external', 'full'] },
  { key: 'cve',             label: 'CVE Database',          scan_types: ['external', 'full'] },
  { key: 'endpoints',       label: 'Endpoint Publik',       scan_types: ['external', 'full'] },
]

export const MODULE_FINDING_TYPES: Record<string, string[]> = {
  fingerprint:     [],
  config:          ['debug_mode_active', 'force_ssl_disabled', 'smtp_no_auth', 'db_password_empty', 'api_key_too_short'],
  plugins:         ['disabled_plugins_installed', 'excessive_active_plugins'],
  rbac:            ['multiple_superadmin', 'inactive_high_priv_account'],
  file_integrity:  ['modified_core_file', 'modified_plugin_file', 'missing_core_file'],
  content:         ['gambling_content', 'eval_base64_injection', 'hidden_iframe_injection', 'phishing_tld_link', 'js_redirect_injection'],
  fingerprint_ext: ['ojs_version_exposed', 'outdated_ojs_version'],
  ssl:             ['ssl_expired', 'ssl_expiring_soon', 'weak_tls', 'http_no_https_redirect'],
  headers:         ['missing_csp', 'missing_hsts', 'missing_x_frame', 'missing_referrer_policy', 'missing_permissions_policy', 'missing_x_content_type_options'],
  cookies:         ['cookie_missing_secure_flag', 'cookie_missing_httponly_flag', 'cookie_missing_samesite'],
  vulnerabilities: ['reflected_xss', 'sql_error_exposed', 'path_traversal'],
  open_dirs:       ['exposed_git', 'exposed_env_file', 'phpinfo_exposed', 'open_directory'],
  cve:             ['cve_ojs'],
  endpoints:       ['ojs_admin_endpoint_exposed', 'ojs_oai_accessible'],
}

export type ModuleStatus = 'found_critical' | 'found_high' | 'found_medium' | 'found_low' | 'clean' | 'error' | 'info' | 'skipped'

export function getModuleStatus(
  moduleKey: string,
  findings: ScanFinding[],
  moduleErrors: Record<string, string>,
  scanType: ScanType,
  module: ScannerModule,
): ModuleStatus {
  if (!module.scan_types.includes(scanType)) return 'skipped'
  if (moduleErrors[moduleKey]) return 'error'
  // Modul fingerprint: selalu info (tidak ada finding, hanya data)
  if (moduleKey === 'fingerprint' || moduleKey === 'fingerprint_ext') return 'info'
  const relevantTypes = MODULE_FINDING_TYPES[moduleKey] ?? []
  const active = findings.filter(f => relevantTypes.includes(f.finding_type) && !f.is_false_positive)
  if (active.length === 0) return 'clean'
  const worst = active.reduce((a, b) => a.cvss_score >= b.cvss_score ? a : b)
  if (worst.severity === 'critical') return 'found_critical'
  if (worst.severity === 'high')     return 'found_high'
  if (worst.severity === 'medium')   return 'found_medium'
  return 'found_low'
}
