# Design Spec: Backend API Integration
**Date:** 2026-05-27  
**Project:** OJSDEF-FrontEnd  
**Status:** Approved  

---

## 1. Konteks & Tujuan

Integrasi penuh semua endpoint backend OJSDef (`https://api-ojsdef.zentaza.online`) ke project frontend Next.js 16. Saat ini frontend menggunakan mock data hardcoded dan NextAuth dengan 3 user statis. Tujuan: semua data berasal dari backend FastAPI, autentikasi menggunakan JWT dari backend, tidak ada mock data yang tersisa.

**Pendekatan:** Infrastructure First (Bottom-Up) — bangun fondasi (auth, API client, types, hooks) sebelum menyentuh halaman.

---

## 2. Auth Architecture

### Hapus NextAuth Sepenuhnya

File yang dihapus:
- `lib/auth.ts`
- `lib/auth.config.ts`
- `app/api/auth/[...nextauth]/route.ts`

### File Baru

| File | Fungsi |
|---|---|
| `app/api/auth/login/route.ts` | Proxy ke `POST /api/v1/auth/login`, set httpOnly cookie `ojsdef_refresh` |
| `app/api/auth/refresh/route.ts` | Baca cookie `ojsdef_refresh`, forward ke backend, return `access_token` baru |
| `app/api/auth/logout/route.ts` | Clear cookie `ojsdef_refresh` + call `POST /api/v1/auth/logout` |
| `lib/auth-context.tsx` | React Context: `accessToken`, `user: UserProfile`, `login()`, `logout()` |
| `hooks/use-auth.ts` | Consumer hook untuk `AuthContext` |
| `proxy.ts` | Route protection (Next.js 16 — pengganti `middleware.ts`) |

### Token Storage

- `refresh_token` → httpOnly cookie `ojsdef_refresh` (diset oleh `/api/auth/login` Next.js route)
- `access_token` → React Context in-memory (tidak pernah menyentuh localStorage)
- Cookie tidak dapat diakses JavaScript — aman dari XSS

### Token Flow

```
Login Form
  → POST /api/auth/login (Next.js API route)
    → forward ke backend POST /api/v1/auth/login
    → set-cookie: ojsdef_refresh (httpOnly, Secure)
    → return { access_token, user } ke client
  → AuthContext simpan access_token di memory
  → setiap request: Authorization: Bearer <access_token>
  → 401 → Axios interceptor call POST /api/auth/refresh
    → backend return access_token baru
    → retry original request
  → refresh gagal → redirect ke /login
```

### proxy.ts (Next.js 16)

Pengganti `middleware.ts`. File bernama `proxy.ts` di root project, export function `proxy` (bukan `middleware`). Runtime: nodejs (edge runtime tidak didukung di proxy Next.js 16).

```ts
// proxy.ts
export function proxy(request: NextRequest) {
  const hasRefreshCookie = request.cookies.has('ojsdef_refresh')
  const isProtected = PROTECTED_ROUTES.some(r => request.nextUrl.pathname.startsWith(r))
  if (isProtected && !hasRefreshCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/targets/:path*', '/scanning/:path*',
            '/vulnerability-report/:path*', '/risk-scoring/:path*',
            '/export/:path*', '/scan-management/:path*', '/users/:path*'],
}
```

### `must_change_password` Handling

Jika backend return `must_change_password: true` saat login, redirect ke halaman ganti password sebelum mengizinkan akses fitur lain.

---

## 3. API Client Layer

### Axios Instance (`lib/api.ts`)

Single Axios instance yang dipakai oleh semua hooks:

```ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})
```

### Request Interceptor

Inject `access_token` dari auth context ke setiap request:

```ts
api.interceptors.request.use((config) => {
  const token = getAccessToken() // module-level getter dari auth-context
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

### Response Interceptor

Auto-refresh + error normalization:

```ts
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // Auto-refresh sekali jika 401
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      const { access_token } = await axios.post('/api/auth/refresh')
      setAccessToken(access_token)
      error.config.headers.Authorization = `Bearer ${access_token}`
      return api(error.config)
    }
    // Normalize error: { detail: "..." } → Error(detail)
    const detail = error.response?.data?.detail
    return Promise.reject(new Error(detail ?? 'Terjadi kesalahan'))
  }
)
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api-ojsdef.zentaza.online
```

---

## 4. Type System

### Perubahan File

| File | Status |
|---|---|
| `types/ojsdef.ts` | **Dihapus** |
| `lib/mock-data.ts` | **Dihapus** |
| `types/api.ts` | **Dibuat baru** — 100% aligned ke backend response shapes |

### Perbedaan Kritis (lama → baru)

| Aspek | ojsdef.ts (lama) | api.ts (baru) |
|---|---|---|
| Scan type | `"full_audit"` | `"full"` |
| Scan status | `"in-progress"`, `"finalizing"` | `"running"` |
| User role | `"it_admin"` | `"viewer"` |
| Plugin status | `PluginStatus` enum | `plugin_connected: boolean` |
| Target field | `institutionName` | `name` |

### `types/api.ts` — Struktur Lengkap

```ts
// Auth
export type UserRole = 'saas_admin' | 'admin_ojs' | 'viewer'
export interface UserProfile {
  id: string; email: string; full_name: string; role: UserRole
  must_change_password: boolean; notif_email: boolean
  notif_telegram: boolean; telegram_chat_id: string | null
}
export interface TokenResponse {
  access_token: string; refresh_token: string
  token_type: 'bearer'; must_change_password: boolean
}

// Targets
export interface OJSTarget {
  id: string; name: string; url: string
  is_verified: boolean; plugin_connected: boolean
  ojs_version: string | null; created_at: string
}
export interface CreateTargetRequest { name: string; url: string }
export interface VerifyTargetResponse { verified: boolean; method: 'file' | 'dns' | null }
export interface PluginGuideResponse {
  target_id: string; api_key: string; endpoint: string; instructions: string
}

// Scans
export type ScanType = 'internal' | 'external' | 'full'
export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed'
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low'
export interface ScanProgress { stage: string; current_step: number; total_steps: number }
export interface ScanJob {
  id: string; target_id: string; scan_type: ScanType; status: ScanStatus
  overall_score: number | null; risk_level: SeverityLevel | null
  critical_count: number; high_count: number; medium_count: number; low_count: number
  progress: ScanProgress | null; created_at: string
}
export interface ScanFinding {
  id: string; finding_type: string; category: string; title: string
  description: string; affected_path: string; evidence: string; remediation: string
  severity: SeverityLevel; cvss_score: number; cve_id: string | null
  owasp_category: string | null; is_false_positive: boolean
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
  id: string; job_id: string; format: 'pdf' | 'json'
  file_size_bytes: number | null; created_at: string
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

### Label Mapping (`lib/utils.ts`)

```ts
export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  critical: 'Kritis', high: 'Berbahaya', medium: 'Perhatian', low: 'Aman',
}
export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  critical: 'text-red-400', high: 'text-orange-400',
  medium: 'text-yellow-400', low: 'text-green-400',
}
export const SCAN_STATUS_LABELS: Record<ScanStatus, string> = {
  queued: 'Menunggu', running: 'Berjalan', completed: 'Selesai', failed: 'Gagal',
}
export const ROLE_LABELS: Record<UserRole, string> = {
  saas_admin: 'SaaS Administrator', admin_ojs: 'Admin OJS', viewer: 'Viewer',
}
```

---

## 5. Hooks Layer

### Struktur File

```
hooks/
├── use-auth.ts          # Auth state + login/logout
├── use-targets.ts       # Target CRUD + verify + plugin-guide + regenerate-key
├── use-scans.ts         # Scan jobs + start scan + polling
├── use-findings.ts      # Findings list + toggle false positive
├── use-dashboard.ts     # Dashboard stats
├── use-reports.ts       # List reports + download PDF
└── use-admin.ts         # Users CRUD + Tenants CRUD (saas_admin only)
```

### Query Keys

| Key | Hook |
|---|---|
| `['targets']` | useTargets, useCreateTarget, useDeleteTarget |
| `['targets', id]` | useTarget(id) |
| `['targets', id, 'plugin-guide']` | usePluginGuide(id) |
| `['scans']` | useScans |
| `['scans', jobId]` | useScanJob(jobId) — auto-polling |
| `['findings', jobId]` | useFindings(jobId) |
| `['dashboard']` | useDashboardStats |
| `['reports']` | useReports |
| `['admin', 'users']` | useAdminUsers |
| `['admin', 'tenants']` | useAdminTenants |

### Polling Pattern (Scan Job)

```ts
export function useScanJob(jobId: string) {
  return useQuery({
    queryKey: ['scans', jobId],
    queryFn: () => api.get<ScanJob>(`/api/v1/scans/${jobId}`).then(r => r.data),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'running' || status === 'queued' ? 4000 : false
    },
  })
}
```

Polling otomatis berhenti saat status `completed` atau `failed`.

---

## 6. Pages Overview

### RBAC Roles

Backend roles: `saas_admin`, `admin_ojs`, `viewer`. Role `it_admin` dihapus dari frontend.  
Log Teknis eksklusif `saas_admin`. Kelola Pengguna eksklusif `saas_admin`.

### Sidebar Menu per Role

| Menu | saas_admin | admin_ojs | viewer |
|---|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ |
| Target OJS | ✅ | ✅ | ✅ |
| Mulai Scan | ✅ | ✅ | ❌ |
| Laporan Keamanan | ✅ | ✅ | ✅ |
| Risk Scoring | ✅ | ✅ | ✅ |
| Export Laporan | ✅ | ✅ | ✅ |
| Log Teknis | ✅ | ❌ | ❌ |
| Kelola Pengguna | ✅ | ❌ | ❌ |

### Guard Komponen

```tsx
// components/shared/RoleGuard.tsx
export function RoleGuard({ allowedRoles, children }: Props) {
  const { user } = useAuth()
  if (!allowedRoles.includes(user?.role)) {
    return <p>Akses Ditolak</p>
  }
  return <>{children}</>
}
```

### Pages — Update (Sudah Ada)

| Page | Perubahan |
|---|---|
| `login/page.tsx` | Hapus `signIn()` NextAuth → `login()` dari `useAuth` |
| `dashboard/page.tsx` | Ganti mock → `useDashboardStats()` + `useScans({ limit: 5 })` |
| `scanning/page.tsx` | Ganti mock → `useScans()` + polling via `useScanJob()` |
| `vulnerability-report/page.tsx` | Ganti mock → `useFindings(jobId)` dengan filter + pagination |
| `risk-scoring/page.tsx` | Ganti mock → `useScanJob()` (overall_score, risk_level, counts) |
| `export/page.tsx` | Ganti mock → `useReports()` + redirect PDF download |
| `scan-management/page.tsx` | Ganti mock → `useScans()` full list, guard saas_admin |
| `users/page.tsx` | Ganti mock → `useAdminUsers()` + `useAdminTenants()`, guard saas_admin |

### Pages — Build Baru

| Page | Fungsi |
|---|---|
| `targets/page.tsx` | Grid semua target OJS — status plugin, is_verified, tombol scan |
| `targets/new/page.tsx` | Form tambah target (name + url) → `useCreateTarget()` |
| `targets/[id]/page.tsx` | Detail target — info + riwayat scan + tombol aksi |
| `targets/[id]/verify/page.tsx` | Verifikasi domain: file upload / DNS TXT (2 metode) |
| `targets/[id]/plugin-guide/page.tsx` | Panduan instalasi plugin 4 langkah + API key + regenerate |

---

## 7. Urutan Implementasi

1. **Hapus:** `lib/auth.ts`, `lib/auth.config.ts`, `app/api/auth/[...nextauth]/route.ts`, `types/ojsdef.ts`, `lib/mock-data.ts`, `middleware.ts`
2. **Buat:** `types/api.ts`, update `lib/utils.ts`
3. **Buat:** `lib/api.ts` (Axios instance + interceptors)
4. **Buat:** `lib/auth-context.tsx`, `hooks/use-auth.ts`
5. **Buat:** `app/api/auth/login/route.ts`, `refresh/route.ts`, `logout/route.ts`
6. **Buat:** `proxy.ts` (ganti `middleware.ts`)
7. **Update:** `app/(auth)/login/page.tsx`
8. **Buat:** semua hooks (`hooks/use-*.ts`)
9. **Update:** semua dashboard pages (pakai hooks)
10. **Build:** semua targets pages baru
11. **Update:** `components/layout/Sidebar.tsx` (hapus it_admin, tambah viewer)
12. **Buat:** `components/shared/RoleGuard.tsx`

---

## 8. Batasan & Di Luar Scope

- Tidak ada self-register (MVP — akun dibuat oleh saas_admin)
- Tidak ada forgot-password mandiri (MVP — reset oleh saas_admin)
- Tidak ada scan scheduling UI (deferred ke Fase 2)
- Halaman `add-target` lama di-redirect ke `/targets/new`
- `register/page.tsx` dan `forgot-password/page.tsx` tetap info-only (tidak dihapus, tidak diubah)
