import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { SeverityLevel, ScanStatus, ScanType, UserRole } from '@/types/api'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  critical: 'Kritis',
  high: 'Berbahaya',
  medium: 'Perhatian',
  low: 'Aman',
}

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-green-400',
}

export const SEVERITY_BG_COLORS: Record<SeverityLevel, string> = {
  critical: 'bg-red-400/10 border-red-400/20',
  high: 'bg-orange-400/10 border-orange-400/20',
  medium: 'bg-yellow-400/10 border-yellow-400/20',
  low: 'bg-green-400/10 border-green-400/20',
}

export const SCAN_STATUS_LABELS: Record<ScanStatus, string> = {
  queued: 'Menunggu',
  running: 'Berjalan',
  completed: 'Selesai',
  failed: 'Gagal',
  cancelled: 'Dibatalkan',
}

export const SCAN_STATUS_COLORS: Record<ScanStatus, string> = {
  queued: 'text-yellow-400',
  running: 'text-cyan-400',
  completed: 'text-green-400',
  failed: 'text-red-400',
  cancelled: 'text-slate-400',
}

export const SCAN_TYPE_LABELS: Record<ScanType, string> = {
  internal: 'Internal',
  external: 'Eksternal',
  full: 'Audit Penuh',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  saas_admin: 'SaaS Administrator',
  admin_ojs: 'Admin OJS',
  viewer: 'Viewer',
}
