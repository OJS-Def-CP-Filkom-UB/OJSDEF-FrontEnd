# Backend API Integration — Part 1: New Files

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create all new files needed for backend API integration — types, API client, auth layer, hooks, components, and new pages.

**Architecture:** Infrastructure-first. Foundation (Phase 0) is strictly sequential. Once complete, Agent A and Agent B execute Phase 1 in parallel — Agent A creates data hooks, Agent B creates RoleGuard and the new targets detail page.

**Tech Stack:** Next.js 16, TypeScript, Axios v1, TanStack Query v5, React Context

**Spec:** `docs/superpowers/specs/2026-05-27-backend-api-integration-design.md`

---

## PHASE 0 — Foundation (Sequential, Must Complete Before Phase 1)

---

### Task 0.1: Create `types/api.ts`

**Files:**
- Create: `types/api.ts`

- [ ] **Write the file**

```ts
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
```

- [ ] **Type-check**

```bash
cd OJSDEF-FrontEnd && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors from `types/api.ts`

- [ ] **Commit**

```bash
git add OJSDEF-FrontEnd/types/api.ts
git commit -m "feat: add backend-aligned API types (types/api.ts)"
```

---

### Task 0.2: Create `lib/api.ts`

**Files:**
- Create: `lib/api.ts`

- [ ] **Write the file**

```ts
import axios from 'axios'

let _accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  _accessToken = token
}

export function getAccessToken(): string | null {
  return _accessToken
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      try {
        const { data } = await axios.post<{ access_token: string }>('/api/auth/refresh')
        setAccessToken(data.access_token)
        error.config.headers.Authorization = `Bearer ${data.access_token}`
        return api(error.config)
      } catch {
        setAccessToken(null)
        if (typeof window !== 'undefined') window.location.href = '/login'
      }
    }
    const detail = error.response?.data?.detail
    return Promise.reject(new Error(detail ?? 'Terjadi kesalahan'))
  }
)
```

- [ ] **Type-check**

```bash
cd OJSDEF-FrontEnd && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add OJSDEF-FrontEnd/lib/api.ts
git commit -m "feat: add Axios API client with interceptors (lib/api.ts)"
```

---

### Task 0.3: Create `lib/auth-context.tsx`

**Files:**
- Create: `lib/auth-context.tsx`

- [ ] **Write the file**

```tsx
'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import axios from 'axios'
import type { UserProfile } from '@/types/api'
import { setAccessToken } from '@/lib/api'

interface AuthContextValue {
  user: UserProfile | null
  login: (email: string, password: string) => Promise<{ must_change_password: boolean }>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session silently on mount using httpOnly cookie
  useEffect(() => {
    axios
      .post<{ access_token: string; user: UserProfile }>('/api/auth/refresh')
      .then(({ data }) => {
        setAccessToken(data.access_token)
        setUser(data.user)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await axios.post<{
      access_token: string
      user: UserProfile
      must_change_password: boolean
    }>('/api/auth/login', { email, password })
    setAccessToken(data.access_token)
    setUser(data.user)
    return { must_change_password: data.must_change_password }
  }, [])

  const logout = useCallback(async () => {
    await axios.post('/api/auth/logout').catch(() => {})
    setAccessToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
```

- [ ] **Type-check**

```bash
cd OJSDEF-FrontEnd && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add OJSDEF-FrontEnd/lib/auth-context.tsx
git commit -m "feat: add React AuthContext with silent session restore"
```

---

### Task 0.4: Create `hooks/use-auth.ts`

**Files:**
- Create: `hooks/use-auth.ts`

- [ ] **Write the file**

```ts
import { useAuthContext } from '@/lib/auth-context'

export function useAuth() {
  return useAuthContext()
}
```

- [ ] **Commit**

```bash
git add OJSDEF-FrontEnd/hooks/use-auth.ts
git commit -m "feat: add useAuth hook"
```

---

### Task 0.5: Create `app/api/auth/login/route.ts`

**Files:**
- Create: `app/api/auth/login/route.ts`

Note: Proxies to backend, sets httpOnly cookie, returns `{ access_token, user, must_change_password }` to client.

- [ ] **Write the file**

```ts
import { NextRequest, NextResponse } from 'next/server'

const API = process.env.NEXT_PUBLIC_API_URL!

export async function POST(req: NextRequest) {
  const body = await req.json()

  const backendRes = await fetch(`${API}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: body.email, password: body.password }),
  })

  if (!backendRes.ok) {
    const err = await backendRes.json()
    return NextResponse.json(err, { status: backendRes.status })
  }

  const data = await backendRes.json()

  // Fetch user profile using the new access_token
  const meRes = await fetch(`${API}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${data.access_token}` },
  })
  const user = meRes.ok ? await meRes.json() : null

  const res = NextResponse.json({
    access_token: data.access_token,
    user,
    must_change_password: data.must_change_password ?? false,
  })

  res.cookies.set('ojsdef_refresh', data.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return res
}
```

- [ ] **Commit**

```bash
git add "OJSDEF-FrontEnd/app/api/auth/login/route.ts"
git commit -m "feat: add Next.js login API route (httpOnly cookie)"
```

---

### Task 0.6: Create `app/api/auth/refresh/route.ts`

**Files:**
- Create: `app/api/auth/refresh/route.ts`

- [ ] **Write the file**

```ts
import { NextRequest, NextResponse } from 'next/server'

const API = process.env.NEXT_PUBLIC_API_URL!

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('ojsdef_refresh')?.value

  if (!refreshToken) {
    return NextResponse.json({ detail: 'No refresh token' }, { status: 401 })
  }

  const backendRes = await fetch(`${API}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!backendRes.ok) {
    const res = NextResponse.json({ detail: 'Refresh failed' }, { status: 401 })
    res.cookies.delete('ojsdef_refresh')
    return res
  }

  const data = await backendRes.json()

  const meRes = await fetch(`${API}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${data.access_token}` },
  })
  const user = meRes.ok ? await meRes.json() : null

  const res = NextResponse.json({ access_token: data.access_token, user })

  if (data.refresh_token) {
    res.cookies.set('ojsdef_refresh', data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
  }

  return res
}
```

- [ ] **Commit**

```bash
git add "OJSDEF-FrontEnd/app/api/auth/refresh/route.ts"
git commit -m "feat: add Next.js refresh API route (reads httpOnly cookie)"
```

---

### Task 0.7: Create `app/api/auth/logout/route.ts`

**Files:**
- Create: `app/api/auth/logout/route.ts`

- [ ] **Write the file**

```ts
import { NextRequest, NextResponse } from 'next/server'

const API = process.env.NEXT_PUBLIC_API_URL!

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('ojsdef_refresh')?.value

  if (refreshToken) {
    await fetch(`${API}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).catch(() => {})
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.delete('ojsdef_refresh')
  return res
}
```

- [ ] **Commit**

```bash
git add "OJSDEF-FrontEnd/app/api/auth/logout/route.ts"
git commit -m "feat: add Next.js logout API route (clears cookie)"
```

---

### Task 0.8: Create `proxy.ts`

**Files:**
- Create: `proxy.ts` (project root — Next.js 16 replacement for middleware.ts)

Important: Next.js 16 uses `proxy.ts` with `export function proxy` (not `middleware`). Runtime must be nodejs, not edge.

- [ ] **Write the file**

```ts
import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_ROUTES = [
  '/dashboard',
  '/targets',
  '/scanning',
  '/vulnerability-report',
  '/risk-scoring',
  '/export',
  '/scan-management',
  '/users',
]

export function proxy(request: NextRequest) {
  const hasRefreshCookie = request.cookies.has('ojsdef_refresh')
  const isProtected = PROTECTED_ROUTES.some((r) =>
    request.nextUrl.pathname.startsWith(r)
  )
  if (isProtected && !hasRefreshCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/targets/:path*',
    '/scanning/:path*',
    '/vulnerability-report/:path*',
    '/risk-scoring/:path*',
    '/export/:path*',
    '/scan-management/:path*',
    '/users/:path*',
  ],
}
```

- [ ] **Build check**

```bash
cd OJSDEF-FrontEnd && npm run build 2>&1 | tail -20
```

Expected: proxy.ts picked up by Next.js 16 build.

- [ ] **Commit**

```bash
git add OJSDEF-FrontEnd/proxy.ts
git commit -m "feat: add proxy.ts route guard (Next.js 16 replacement for middleware)"
```

---

**Phase 0 Complete. Launch Agent A and Agent B in parallel now.**

---

## PHASE 1A — Agent A: Data Hooks

Agent A creates all TanStack Query hooks. Each hook imports `api` from `lib/api.ts` and types from `types/api.ts`.

---

### Task 1A.1: Create `hooks/use-targets.ts`

**Files:**
- Create: `hooks/use-targets.ts`

- [ ] **Write the file**

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { OJSTarget, CreateTargetRequest, VerifyTargetResponse, PluginGuideResponse } from '@/types/api'

export function useTargets() {
  return useQuery({
    queryKey: ['targets'],
    queryFn: () => api.get<OJSTarget[]>('/api/v1/targets').then((r) => r.data),
  })
}

export function useTarget(id: string) {
  return useQuery({
    queryKey: ['targets', id],
    queryFn: () => api.get<OJSTarget>(`/api/v1/targets/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateTarget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTargetRequest) =>
      api.post<OJSTarget>('/api/v1/targets', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['targets'] }),
  })
}

export function useDeleteTarget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/targets/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['targets'] }),
  })
}

export function useVerifyTarget(targetId: string) {
  return useMutation({
    mutationFn: (method: 'file' | 'dns') =>
      api
        .post<VerifyTargetResponse>(`/api/v1/targets/${targetId}/verify`, { method })
        .then((r) => r.data),
  })
}

export function usePluginGuide(targetId: string) {
  return useQuery({
    queryKey: ['targets', targetId, 'plugin-guide'],
    queryFn: () =>
      api
        .get<PluginGuideResponse>(`/api/v1/targets/${targetId}/plugin-guide`)
        .then((r) => r.data),
    enabled: !!targetId,
  })
}

export function useRegenerateApiKey(targetId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      api
        .post<PluginGuideResponse>(
          `/api/v1/targets/${targetId}/plugin-guide/regenerate-key`
        )
        .then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['targets', targetId, 'plugin-guide'] }),
  })
}
```

- [ ] **Type-check**

```bash
cd OJSDEF-FrontEnd && npx tsc --noEmit 2>&1 | grep "use-targets" | head -10
```

Expected: no errors

- [ ] **Commit**

```bash
git add OJSDEF-FrontEnd/hooks/use-targets.ts
git commit -m "feat: add useTargets hooks (CRUD + verify + plugin-guide)"
```

---

### Task 1A.2: Create `hooks/use-scans.ts`

**Files:**
- Create: `hooks/use-scans.ts`

- [ ] **Write the file**

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ScanJob, ScanType } from '@/types/api'

export function useScans() {
  return useQuery({
    queryKey: ['scans'],
    queryFn: () => api.get<ScanJob[]>('/api/v1/scans').then((r) => r.data),
  })
}

export function useScanJob(jobId: string) {
  return useQuery({
    queryKey: ['scans', jobId],
    queryFn: () => api.get<ScanJob>(`/api/v1/scans/${jobId}`).then((r) => r.data),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'running' || status === 'queued' ? 4000 : false
    },
  })
}

export function useStartScan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ targetId, scanType }: { targetId: string; scanType: ScanType }) =>
      api
        .post<ScanJob>(`/api/v1/targets/${targetId}/scans`, { scan_type: scanType })
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scans'] }),
  })
}
```

- [ ] **Type-check**

```bash
cd OJSDEF-FrontEnd && npx tsc --noEmit 2>&1 | grep "use-scans" | head -10
```

- [ ] **Commit**

```bash
git add OJSDEF-FrontEnd/hooks/use-scans.ts
git commit -m "feat: add useScans + useScanJob (auto-polling 4s) + useStartScan"
```

---

### Task 1A.3: Create `hooks/use-findings.ts`

**Files:**
- Create: `hooks/use-findings.ts`

- [ ] **Write the file**

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ScanFinding } from '@/types/api'

export function useFindings(jobId: string) {
  return useQuery({
    queryKey: ['findings', jobId],
    queryFn: () =>
      api.get<ScanFinding[]>(`/api/v1/scans/${jobId}/findings`).then((r) => r.data),
    enabled: !!jobId,
  })
}

export function useToggleFalsePositive(jobId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      findingId,
      isFalsePositive,
    }: {
      findingId: string
      isFalsePositive: boolean
    }) =>
      api.patch(`/api/v1/scans/${jobId}/findings/${findingId}`, {
        is_false_positive: isFalsePositive,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['findings', jobId] }),
  })
}
```

- [ ] **Commit**

```bash
git add OJSDEF-FrontEnd/hooks/use-findings.ts
git commit -m "feat: add useFindings + useToggleFalsePositive"
```

---

### Task 1A.4: Create `hooks/use-dashboard.ts`

**Files:**
- Create: `hooks/use-dashboard.ts`

- [ ] **Write the file**

```ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DashboardStats } from '@/types/api'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardStats>('/api/v1/dashboard').then((r) => r.data),
  })
}
```

- [ ] **Commit**

```bash
git add OJSDEF-FrontEnd/hooks/use-dashboard.ts
git commit -m "feat: add useDashboardStats hook"
```

---

### Task 1A.5: Create `hooks/use-reports.ts`

**Files:**
- Create: `hooks/use-reports.ts`

- [ ] **Write the file**

```ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Report } from '@/types/api'

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: () => api.get<Report[]>('/api/v1/reports').then((r) => r.data),
  })
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: async (reportId: string) => {
      const res = await api.get(`/api/v1/reports/${reportId}/download`, {
        responseType: 'blob',
      })
      const url = URL.createObjectURL(res.data as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ojsdef-report-${reportId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    },
  })
}
```

- [ ] **Commit**

```bash
git add OJSDEF-FrontEnd/hooks/use-reports.ts
git commit -m "feat: add useReports + useDownloadReport hooks"
```

---

### Task 1A.6: Create `hooks/use-admin.ts`

**Files:**
- Create: `hooks/use-admin.ts`

- [ ] **Write the file**

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  AdminUserListItem,
  CreateUserRequest,
  UpdateUserRequest,
  Tenant,
  CreateTenantRequest,
} from '@/types/api'

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () =>
      api.get<AdminUserListItem[]>('/api/v1/admin/users').then((r) => r.data),
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserRequest) =>
      api.post<AdminUserListItem>('/api/v1/admin/users', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      api
        .patch<AdminUserListItem>(`/api/v1/admin/users/${id}`, data)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useAdminTenants() {
  return useQuery({
    queryKey: ['admin', 'tenants'],
    queryFn: () => api.get<Tenant[]>('/api/v1/admin/tenants').then((r) => r.data),
  })
}

export function useCreateTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTenantRequest) =>
      api.post<Tenant>('/api/v1/admin/tenants', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'tenants'] }),
  })
}
```

- [ ] **Type-check (all hooks)**

```bash
cd OJSDEF-FrontEnd && npx tsc --noEmit 2>&1 | head -30
```

Expected: 0 errors

- [ ] **Commit**

```bash
git add OJSDEF-FrontEnd/hooks/use-admin.ts
git commit -m "feat: add useAdminUsers + useAdminTenants hooks (saas_admin only)"
```

---

## PHASE 1B — Agent B: Components + New Page

Agent B runs in parallel with Agent A. Creates RoleGuard and the new target detail page. Both depend only on Phase 0 outputs.

---

### Task 1B.1: Create `components/shared/RoleGuard.tsx`

**Files:**
- Create: `components/shared/RoleGuard.tsx`

- [ ] **Write the file**

```tsx
'use client'

import type { UserRole } from '@/types/api'
import { useAuth } from '@/hooks/use-auth'

interface Props {
  allowedRoles: UserRole[]
  children: React.ReactNode
}

export function RoleGuard({ allowedRoles, children }: Props) {
  const { user } = useAuth()
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <p className="text-sm text-muted-foreground/60 p-8">Akses Ditolak</p>
    )
  }
  return <>{children}</>
}
```

- [ ] **Commit**

```bash
git add "OJSDEF-FrontEnd/components/shared/RoleGuard.tsx"
git commit -m "feat: add RoleGuard component for RBAC"
```

---

### Task 1B.2: Create `app/(dashboard)/targets/[id]/page.tsx`

**Files:**
- Create: `app/(dashboard)/targets/[id]/page.tsx`

This page does NOT yet exist (verify + plugin-guide pages exist, but not the base detail page). Shows target info, plugin status, and recent scan history.

- [ ] **Write the file**

```tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Wifi,
  Plus,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTarget } from '@/hooks/use-targets'
import { useScans, useStartScan } from '@/hooks/use-scans'
import { cn } from '@/lib/utils'
import type { ScanJob } from '@/types/api'

const SCAN_STATUS_LABELS: Record<string, string> = {
  queued: 'Menunggu',
  running: 'Berjalan',
  completed: 'Selesai',
  failed: 'Gagal',
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-green-400',
}

function ScanRow({ scan }: { scan: ScanJob }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all">
      <div className="space-y-0.5">
        <p className="text-xs font-black text-white uppercase tracking-tight">
          {scan.scan_type}
        </p>
        <p className="text-[10px] font-mono text-muted-foreground/40 uppercase">
          {new Date(scan.created_at).toLocaleDateString('id-ID')}
        </p>
      </div>
      <div className="flex items-center gap-4">
        {scan.overall_score !== null && (
          <span
            className={cn(
              'text-sm font-black',
              SEVERITY_COLORS[scan.risk_level ?? 'low']
            )}
          >
            {scan.overall_score.toFixed(1)}
          </span>
        )}
        <Badge
          variant="outline"
          className="text-[9px] font-black uppercase tracking-widest border-white/10"
        >
          {SCAN_STATUS_LABELS[scan.status] ?? scan.status}
        </Badge>
      </div>
    </div>
  )
}

export default function TargetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: target, isLoading } = useTarget(id)
  const { data: allScans } = useScans()
  const startScan = useStartScan()

  const targetScans =
    allScans?.filter((s) => s.target_id === id).slice(0, 5) ?? []

  if (isLoading) {
    return (
      <div className="p-8 text-muted-foreground/40 text-sm font-mono uppercase tracking-widest animate-pulse">
        Memuat target...
      </div>
    )
  }

  if (!target) {
    return (
      <div className="p-8 text-destructive/60 text-sm">
        Target tidak ditemukan.
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl border border-white/5"
          onClick={() => router.push('/targets')}
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
            {target.name}
          </h1>
          <p className="text-muted-foreground/60 text-sm font-mono">
            {target.url}
          </p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-dark border-none">
          <CardContent className="p-4 space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
              Verifikasi
            </p>
            <div className="flex items-center gap-2">
              {target.is_verified ? (
                <CheckCircle2 size={16} className="text-secondary" />
              ) : (
                <XCircle size={16} className="text-destructive" />
              )}
              <p className="text-xs font-black text-white">
                {target.is_verified ? 'Terverifikasi' : 'Belum'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-dark border-none">
          <CardContent className="p-4 space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
              Plugin
            </p>
            <div className="flex items-center gap-2">
              <Wifi
                size={16}
                className={
                  target.plugin_connected ? 'text-secondary' : 'text-muted-foreground/30'
                }
              />
              <p className="text-xs font-black text-white">
                {target.plugin_connected ? 'Terhubung' : 'Terputus'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-dark border-none">
          <CardContent className="p-4 space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
              Versi OJS
            </p>
            <p className="text-xs font-black text-white font-mono">
              {target.ojs_version ?? '—'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-dark border-none">
          <CardContent className="p-4 space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
              Terdaftar
            </p>
            <p className="text-xs font-black text-white">
              {new Date(target.created_at).toLocaleDateString('id-ID')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {!target.is_verified && (
          <Link href={`/targets/${id}/verify`}>
            <Button
              variant="outline"
              className="h-10 px-5 rounded-xl font-black uppercase text-xs tracking-widest border-primary/20 bg-primary/5 text-primary gap-2"
            >
              <CheckCircle2 size={14} /> Verifikasi Domain
            </Button>
          </Link>
        )}
        <Link href={`/targets/${id}/plugin-guide`}>
          <Button
            variant="outline"
            className="h-10 px-5 rounded-xl font-black uppercase text-xs tracking-widest border-white/5 gap-2"
          >
            <RefreshCw size={14} /> Panduan Plugin
          </Button>
        </Link>
        <Button
          className="h-10 px-5 rounded-2xl bg-primary font-black uppercase text-xs tracking-widest gap-2"
          disabled={startScan.isPending}
          onClick={() =>
            startScan.mutate(
              { targetId: id, scanType: 'full' },
              { onSuccess: (scan) => router.push(`/scanning?jobId=${scan.id}`) }
            )
          }
        >
          <Plus size={14} /> Mulai Scan
        </Button>
        <a href={`https://${target.url}`} target="_blank" rel="noreferrer">
          <Button
            variant="ghost"
            className="h-10 px-4 rounded-xl border border-white/5 gap-2 text-muted-foreground hover:text-white"
          >
            <ExternalLink size={14} /> Buka OJS
          </Button>
        </a>
      </div>

      {/* Recent Scans */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/60">
          Riwayat Scan
        </h3>
        {targetScans.length === 0 ? (
          <p className="text-muted-foreground/40 text-sm">
            Belum ada scan untuk target ini.
          </p>
        ) : (
          <div className="space-y-2">
            {targetScans.map((scan, i) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ScanRow scan={scan} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Type-check**

```bash
cd OJSDEF-FrontEnd && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add "OJSDEF-FrontEnd/app/(dashboard)/targets/[id]/page.tsx"
git commit -m "feat: add target detail page with scan history"
```

---

## Final Verification (After Both Phase 1A + 1B Complete)

- [ ] **Full type-check**

```bash
cd OJSDEF-FrontEnd && npx tsc --noEmit 2>&1
```

Expected: 0 errors from newly created files.

- [ ] **Confirm all new files exist**

```bash
ls OJSDEF-FrontEnd/hooks/
# Expected: use-auth.ts use-targets.ts use-scans.ts use-findings.ts use-dashboard.ts use-reports.ts use-admin.ts

ls OJSDEF-FrontEnd/types/api.ts OJSDEF-FrontEnd/lib/api.ts OJSDEF-FrontEnd/lib/auth-context.tsx OJSDEF-FrontEnd/proxy.ts
ls "OJSDEF-FrontEnd/components/shared/RoleGuard.tsx"
```

**Part 1 complete. Proceed to Part 2 (updates/deletions).**
