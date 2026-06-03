# Backend API Integration — Part 2: File Updates

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove legacy NextAuth + mock data, update all existing files to use new auth context and backend hooks from Part 1.

**Architecture:** Phase 0 is sequential cleanup + utility updates that both agents depend on. Phase 2A (Agent A) updates auth pages and data-heavy dashboard pages. Phase 2B (Agent B) updates Sidebar, export/admin pages, and all targets pages — they can run fully in parallel once Phase 0 is complete.

**Prerequisites:** Part 1 (new files) must be fully complete before starting this plan. Confirm these files exist:
- `types/api.ts`
- `lib/api.ts`
- `lib/auth-context.tsx`
- `hooks/use-auth.ts`
- `hooks/use-targets.ts`
- `hooks/use-scans.ts`
- `hooks/use-findings.ts`
- `hooks/use-dashboard.ts`
- `hooks/use-reports.ts`
- `hooks/use-admin.ts`
- `components/shared/RoleGuard.tsx`
- `app/api/auth/login/route.ts`
- `app/api/auth/refresh/route.ts`
- `app/api/auth/logout/route.ts`
- `proxy.ts`

**Tech Stack:** Next.js 16, TypeScript, TanStack Query v5, Axios v1

**Spec:** `docs/superpowers/specs/2026-05-27-backend-api-integration-design.md`

---

## PHASE 0 — Cleanup & Shared Updates (Sequential)

These tasks must complete before Phase 2A/2B begin.

---

### Task 0.1: Delete Legacy Auth Files

**Files:**
- Delete: `lib/auth.ts`
- Delete: `lib/auth.config.ts`
- Delete: `app/api/auth/[...nextauth]/route.ts`
- Delete: `middleware.ts` (if exists — replaced by `proxy.ts` from Part 1)

- [ ] **Delete files**

```bash
cd OJSDEF-FrontEnd
rm lib/auth.ts lib/auth.config.ts middleware.ts 2>/dev/null
rm -rf app/api/auth/\[...nextauth\]
```

- [ ] **Confirm deletion**

```bash
ls lib/auth.ts lib/auth.config.ts middleware.ts 2>&1
```

Expected: "No such file or directory" for each.

- [ ] **Commit**

```bash
git add -u
git commit -m "feat: remove NextAuth — replaced by custom JWT auth"
```

---

### Task 0.2: Delete Legacy Type and Mock Data Files

**Files:**
- Delete: `types/ojsdef.ts`
- Delete: `lib/mock-data.ts`

- [ ] **Check which files still import these**

```bash
grep -r "from.*types/ojsdef" app/ components/ hooks/ lib/ --include="*.ts" --include="*.tsx" -l
grep -r "from.*mock-data" app/ components/ hooks/ lib/ --include="*.ts" --include="*.tsx" -l
```

Note all files listed — they will be updated in Phase 2A and 2B. Do NOT delete yet if any files still import them; that causes immediate build failure. The deletion happens AFTER Phase 2A and 2B finish (or delete now if you know Phase 2 will run immediately after Phase 0).

> **Safe order:** If running Phase 2A/2B in parallel immediately after Phase 0, delete now and let subagents fix import errors as they go. If running sequentially, delete after Phase 2A/2B finish.

- [ ] **Delete files**

```bash
rm types/ojsdef.ts lib/mock-data.ts
```

- [ ] **Commit**

```bash
git add -u
git commit -m "feat: remove mock data and legacy ojsdef types"
```

---

### Task 0.3: Update `lib/utils.ts` — Add Label Mapping Constants

**Files:**
- Modify: `lib/utils.ts`

Current state: only has `cn()` function. Add severity, scan status, scan type, and role label constants.

- [ ] **Read current file**

```bash
cat lib/utils.ts
```

- [ ] **Replace file content**

```ts
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
}

export const SCAN_STATUS_COLORS: Record<ScanStatus, string> = {
  queued: 'text-yellow-400',
  running: 'text-cyan-400',
  completed: 'text-green-400',
  failed: 'text-red-400',
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
```

- [ ] **Type-check**

```bash
cd OJSDEF-FrontEnd && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors from `lib/utils.ts`

- [ ] **Commit**

```bash
git add lib/utils.ts
git commit -m "feat: add label mapping constants to lib/utils.ts"
```

---

### Task 0.4: Update `components/providers/Providers.tsx` — Replace SessionProvider with AuthProvider

**Files:**
- Modify: `components/providers/Providers.tsx`

- [ ] **Read current file**

```bash
cat components/providers/Providers.tsx
```

- [ ] **Replace file content**

```tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/auth-context'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}
```

- [ ] **Type-check**

```bash
cd OJSDEF-FrontEnd && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add components/providers/Providers.tsx
git commit -m "feat: replace SessionProvider with AuthProvider in Providers.tsx"
```

---

### Task 0.5: Add `.env.local`

**Files:**
- Create: `.env.local` (in `OJSDEF-FrontEnd/`)

- [ ] **Create file**

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://api-ojsdef.zentaza.online
EOF
```

- [ ] **Verify**

```bash
cat .env.local
```

Expected output:
```
NEXT_PUBLIC_API_URL=https://api-ojsdef.zentaza.online
```

> Note: `.env.local` is git-ignored by default. Do NOT commit this file.

---

## PHASE 2A — Agent A: Auth Page + Dashboard Pages

Agent A handles: login page, dashboard, scanning, vulnerability report, risk scoring.

---

### Task 2A.1: Update `app/(auth)/login/page.tsx` — Replace NextAuth signIn

**Files:**
- Modify: `app/(auth)/login/page.tsx`

- [ ] **Read current file**

```bash
cat app/\(auth\)/login/page.tsx
```

- [ ] **Replace file content**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { AlertCircle } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginForm) {
    setError(null)
    try {
      const result = await login(data.email, data.password)
      if (result.must_change_password) {
        router.push('/change-password')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <div className="w-full max-w-md glass-dark rounded-xl p-8 border border-white/5">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">OJSDef</h1>
          <p className="text-slate-400 mt-1 text-sm">Masuk ke dashboard keamanan OJS Anda</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="admin@universitas.ac.id"
                      className="bg-slate-900/60 border-white/10 text-white placeholder:text-slate-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-slate-900/60 border-white/10 text-white placeholder:text-slate-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
        </Form>
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
git add app/\(auth\)/login/page.tsx
git commit -m "feat: update login page — replace NextAuth signIn with useAuth().login()"
```

---

### Task 2A.2: Update `app/(dashboard)/dashboard/page.tsx`

**Files:**
- Modify: `app/(dashboard)/dashboard/page.tsx`

- [ ] **Read current file**

```bash
cat app/\(dashboard\)/dashboard/page.tsx
```

- [ ] **Replace file content**

```tsx
'use client'

import { useDashboardStats } from '@/hooks/use-dashboard'
import { useScans } from '@/hooks/use-scans'
import { SCAN_STATUS_LABELS, SCAN_STATUS_COLORS, SCAN_TYPE_LABELS, SEVERITY_LABELS, SEVERITY_COLORS } from '@/lib/utils'
import { ShieldCheck, Target, ScanLine, AlertTriangle } from 'lucide-react'

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: recentScans, isLoading: scansLoading } = useScans({ limit: 5 })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Beranda</h1>
        <p className="text-slate-400 mt-1 text-sm">Ringkasan postur keamanan instalasi OJS Anda</p>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-dark rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-cyan-400/10">
              <Target className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="text-slate-400 text-sm">Total Target</span>
          </div>
          {statsLoading ? (
            <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-white">{stats?.targets.total ?? 0}</p>
          )}
        </div>

        <div className="glass-dark rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-400/10">
              <ScanLine className="h-5 w-5 text-green-400" />
            </div>
            <span className="text-slate-400 text-sm">Scan (30 Hari)</span>
          </div>
          {statsLoading ? (
            <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-white">{stats?.scans.last_30_days ?? 0}</p>
          )}
        </div>

        <div className="glass-dark rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-400/10">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-slate-400 text-sm">Skor Rata-rata</span>
          </div>
          {statsLoading ? (
            <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-white">
              {stats?.security_posture.average_score != null
                ? stats.security_posture.average_score.toFixed(1)
                : '—'}
            </p>
          )}
        </div>

        <div className="glass-dark rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-red-400/10">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <span className="text-slate-400 text-sm">Temuan Kritis</span>
          </div>
          {statsLoading ? (
            <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-white">{stats?.findings_summary.critical ?? 0}</p>
          )}
        </div>
      </div>

      {/* Recent Scans */}
      <div className="glass-dark rounded-xl border border-white/5">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold">Scan Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          {scansLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : !recentScans?.length ? (
            <div className="p-8 text-center text-slate-500">Belum ada scan. Mulai scan pertama Anda.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs uppercase">
                  <th className="px-6 py-3 text-left">Target</th>
                  <th className="px-6 py-3 text-left">Tipe</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Skor</th>
                  <th className="px-6 py-3 text-left">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4 text-slate-300">{scan.target_id}</td>
                    <td className="px-6 py-4 text-slate-400">{SCAN_TYPE_LABELS[scan.scan_type]}</td>
                    <td className="px-6 py-4">
                      <span className={SCAN_STATUS_COLORS[scan.status]}>
                        {SCAN_STATUS_LABELS[scan.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {scan.overall_score != null ? (
                        <span className={
                          scan.risk_level ? SEVERITY_COLORS[scan.risk_level] : 'text-slate-400'
                        }>
                          {scan.overall_score.toFixed(1)}
                          {scan.risk_level && ` — ${SEVERITY_LABELS[scan.risk_level]}`}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(scan.created_at).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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
git add app/\(dashboard\)/dashboard/page.tsx
git commit -m "feat: update dashboard page — use useDashboardStats() + useScans() from backend"
```

---

### Task 2A.3: Update `app/(dashboard)/scanning/page.tsx`

**Files:**
- Modify: `app/(dashboard)/scanning/page.tsx`

Current state: pure simulation with fake `setInterval`. New version: reads `?jobId=xxx` from URL, falls back to most recent running/queued scan, uses `useScanJob()` with auto-polling.

- [ ] **Replace file content**

```tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useScans, useScanJob, useStartScan } from '@/hooks/use-scans'
import { useTargets } from '@/hooks/use-targets'
import { SCAN_STATUS_LABELS, SCAN_STATUS_COLORS, SCAN_TYPE_LABELS } from '@/lib/utils'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import type { ScanType } from '@/types/api'

function StartScanForm() {
  const { data: targets } = useTargets()
  const startScan = useStartScan()
  const [targetId, setTargetId] = useState('')
  const [scanType, setScanType] = useState<ScanType>('external')
  const [error, setError] = useState<string | null>(null)

  async function handleStart() {
    if (!targetId) { setError('Pilih target terlebih dahulu'); return }
    setError(null)
    try {
      await startScan.mutateAsync({ target_id: targetId, scan_type: scanType })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memulai scan')
    }
  }

  return (
    <div className="glass-dark rounded-xl border border-white/5 p-6 space-y-4">
      <h2 className="text-white font-semibold">Mulai Scan Baru</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-slate-400 text-sm">Target OJS</label>
          <Select value={targetId} onValueChange={setTargetId}>
            <SelectTrigger className="bg-slate-900/60 border-white/10 text-white">
              <SelectValue placeholder="Pilih target..." />
            </SelectTrigger>
            <SelectContent>
              {targets?.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-slate-400 text-sm">Tipe Scan</label>
          <Select value={scanType} onValueChange={(v) => setScanType(v as ScanType)}>
            <SelectTrigger className="bg-slate-900/60 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="external">Eksternal</SelectItem>
              <SelectItem value="full">Audit Penuh</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <Button
        onClick={handleStart}
        disabled={startScan.isPending}
        className="bg-primary hover:bg-primary/90"
      >
        {startScan.isPending ? 'Memulai...' : 'Mulai Scan'}
      </Button>
    </div>
  )
}

function ScanJobMonitor({ jobId }: { jobId: string }) {
  const { data: job, isLoading } = useScanJob(jobId)

  if (isLoading) return <div className="glass-dark rounded-xl border border-white/5 p-6 animate-pulse h-40" />
  if (!job) return null

  const progress = job.progress
  const progressPct = progress
    ? Math.round((progress.current_step / progress.total_steps) * 100)
    : job.status === 'completed' ? 100 : 0

  return (
    <div className="glass-dark rounded-xl border border-white/5 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">Scan ID: {job.id.slice(0, 8)}…</h2>
          <p className="text-slate-400 text-sm">{SCAN_TYPE_LABELS[job.scan_type]}</p>
        </div>
        <span className={`text-sm font-medium ${SCAN_STATUS_COLORS[job.status]}`}>
          {SCAN_STATUS_LABELS[job.status]}
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-500">
          <span>{progress?.stage ?? (job.status === 'completed' ? 'Selesai' : 'Menunggu')}</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Counts — shown when completed */}
      {job.status === 'completed' && (
        <div className="grid grid-cols-4 gap-3 pt-2 border-t border-white/5">
          <div className="text-center">
            <p className="text-red-400 text-xl font-bold">{job.critical_count}</p>
            <p className="text-slate-500 text-xs">Kritis</p>
          </div>
          <div className="text-center">
            <p className="text-orange-400 text-xl font-bold">{job.high_count}</p>
            <p className="text-slate-500 text-xs">Berbahaya</p>
          </div>
          <div className="text-center">
            <p className="text-yellow-400 text-xl font-bold">{job.medium_count}</p>
            <p className="text-slate-500 text-xs">Perhatian</p>
          </div>
          <div className="text-center">
            <p className="text-green-400 text-xl font-bold">{job.low_count}</p>
            <p className="text-slate-500 text-xs">Aman</p>
          </div>
        </div>
      )}
    </div>
  )
}

function RecentJobsList() {
  const { data: scans } = useScans({ limit: 10 })
  const activeJob = scans?.find(
    (s) => s.status === 'running' || s.status === 'queued'
  )

  if (!activeJob) return null
  return <ScanJobMonitor jobId={activeJob.id} />
}

export default function ScanningPage() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get('jobId')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mulai Scan</h1>
        <p className="text-slate-400 mt-1 text-sm">Jalankan pemindaian keamanan terhadap instalasi OJS Anda</p>
      </div>

      <RoleGuard allowedRoles={['saas_admin', 'admin_ojs']}>
        <StartScanForm />
      </RoleGuard>

      {jobId ? <ScanJobMonitor jobId={jobId} /> : <RecentJobsList />}
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
git add app/\(dashboard\)/scanning/page.tsx
git commit -m "feat: update scanning page — real useScanJob() polling, RoleGuard for start scan"
```

---

### Task 2A.4: Update `app/(dashboard)/vulnerability-report/page.tsx`

**Files:**
- Modify: `app/(dashboard)/vulnerability-report/page.tsx`

Current state: uses `MOCK_VULNERABILITIES` with `actionPlan[]` accordion. New version: reads `?jobId=xxx` from URL, uses `useFindings()` with severity filter + `useToggleFalsePositive()`.

- [ ] **Replace file content**

```tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useScans } from '@/hooks/use-scans'
import { useFindings, useToggleFalsePositive } from '@/hooks/use-findings'
import { SEVERITY_LABELS, SEVERITY_COLORS, SEVERITY_BG_COLORS } from '@/lib/utils'
import { ChevronDown, ChevronUp, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ScanFinding, SeverityLevel } from '@/types/api'

const SEVERITY_ORDER: SeverityLevel[] = ['critical', 'high', 'medium', 'low']

function FindingCard({ finding, jobId }: { finding: ScanFinding; jobId: string }) {
  const [expanded, setExpanded] = useState(false)
  const toggleFP = useToggleFalsePositive(jobId)

  return (
    <div className={`glass-dark rounded-xl border ${SEVERITY_BG_COLORS[finding.severity]} transition-all`}>
      <button
        className="w-full flex items-start gap-4 p-5 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`mt-0.5 flex-shrink-0 ${SEVERITY_COLORS[finding.severity]}`}>
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SEVERITY_BG_COLORS[finding.severity]} ${SEVERITY_COLORS[finding.severity]}`}>
              {SEVERITY_LABELS[finding.severity]}
            </span>
            {finding.is_false_positive && (
              <span className="text-xs text-slate-500 italic">False Positive</span>
            )}
            {finding.cve_id && (
              <span className="text-xs text-slate-500">{finding.cve_id}</span>
            )}
          </div>
          <p className="text-white font-medium mt-1">{finding.title}</p>
          <p className="text-slate-400 text-sm mt-1 truncate">{finding.description}</p>
        </div>
        <div className="flex-shrink-0 text-slate-500">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
          {finding.affected_path && (
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Path Terpengaruh</p>
              <p className="text-slate-300 text-sm font-mono bg-slate-900/60 px-3 py-2 rounded-lg">
                {finding.affected_path}
              </p>
            </div>
          )}
          {finding.evidence && (
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Bukti</p>
              <p className="text-slate-300 text-sm">{finding.evidence}</p>
            </div>
          )}
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wide mb-2">Langkah Perbaikan</p>
            <p className="text-slate-300 text-sm whitespace-pre-wrap">{finding.remediation}</p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <span className="text-slate-500 text-xs">CVSS: {finding.cvss_score.toFixed(1)}</span>
            {finding.owasp_category && (
              <span className="text-slate-500 text-xs">OWASP: {finding.owasp_category}</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-xs text-slate-500 hover:text-slate-300"
              onClick={() =>
                toggleFP.mutate({
                  findingId: finding.id,
                  is_false_positive: !finding.is_false_positive,
                })
              }
              disabled={toggleFP.isPending}
            >
              {finding.is_false_positive ? 'Tandai Aktif' : 'Tandai False Positive'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function FindingsList({ jobId }: { jobId: string }) {
  const { data: findings, isLoading } = useFindings(jobId)
  const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | 'all'>('all')

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!findings?.length) {
    return (
      <div className="glass-dark rounded-xl border border-white/5 p-8 text-center text-slate-500">
        <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Tidak ada temuan untuk scan ini.</p>
      </div>
    )
  }

  const visible = filterSeverity === 'all'
    ? findings
    : findings.filter((f) => f.severity === filterSeverity)

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterSeverity('all')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filterSeverity === 'all' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Semua ({findings.length})
        </button>
        {SEVERITY_ORDER.map((sev) => {
          const count = findings.filter((f) => f.severity === sev).length
          if (!count) return null
          return (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filterSeverity === sev
                  ? 'bg-primary text-white'
                  : `${SEVERITY_COLORS[sev]} hover:opacity-80`
              }`}
            >
              {SEVERITY_LABELS[sev]} ({count})
            </button>
          )
        })}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {visible.map((finding) => (
          <FindingCard key={finding.id} finding={finding} jobId={jobId} />
        ))}
      </div>
    </div>
  )
}

function AutoSelectJob() {
  const { data: scans } = useScans({ limit: 20 })
  const latestCompleted = scans?.find((s) => s.status === 'completed')

  if (!latestCompleted) {
    return (
      <div className="glass-dark rounded-xl border border-white/5 p-8 text-center text-slate-500">
        <p>Belum ada scan selesai. Jalankan scan terlebih dahulu.</p>
      </div>
    )
  }

  return <FindingsList jobId={latestCompleted.id} />
}

export default function VulnerabilityReportPage() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get('jobId')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Laporan Keamanan</h1>
        <p className="text-slate-400 mt-1 text-sm">Temuan kerentanan dan rencana perbaikan</p>
      </div>

      {jobId ? <FindingsList jobId={jobId} /> : <AutoSelectJob />}
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
git add app/\(dashboard\)/vulnerability-report/page.tsx
git commit -m "feat: update vulnerability report — real findings from useFindings() + false positive toggle"
```

---

### Task 2A.5: Update `app/(dashboard)/risk-scoring/page.tsx`

**Files:**
- Modify: `app/(dashboard)/risk-scoring/page.tsx`

- [ ] **Read current file**

```bash
cat app/\(dashboard\)/risk-scoring/page.tsx
```

- [ ] **Replace file content**

```tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useScans, useScanJob } from '@/hooks/use-scans'
import { SEVERITY_LABELS, SEVERITY_COLORS, SEVERITY_BG_COLORS } from '@/lib/utils'
import { ShieldAlert, ShieldCheck, Shield, ShieldOff } from 'lucide-react'

function ScoreDisplay({ score, label }: { score: number | null; label: string }) {
  const normalized = score != null ? Math.max(0, Math.min(10, score)) : null
  const color =
    normalized == null ? 'text-slate-400'
    : normalized >= 9 ? 'text-red-400'
    : normalized >= 7 ? 'text-orange-400'
    : normalized >= 4 ? 'text-yellow-400'
    : 'text-green-400'

  return (
    <div className="glass-dark rounded-xl border border-white/5 p-8 text-center">
      <p className={`text-7xl font-black ${color}`}>
        {normalized != null ? normalized.toFixed(1) : '—'}
      </p>
      <p className="text-slate-400 mt-3 text-sm">{label}</p>
    </div>
  )
}

function RiskMatrix({ jobId }: { jobId: string }) {
  const { data: job, isLoading } = useScanJob(jobId)

  if (isLoading) return <div className="h-64 bg-slate-800 rounded-xl animate-pulse" />
  if (!job) return <p className="text-slate-500">Data scan tidak ditemukan.</p>

  const counts = [
    { label: 'Kritis', count: job.critical_count, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', Icon: ShieldOff },
    { label: 'Berbahaya', count: job.high_count, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20', Icon: ShieldAlert },
    { label: 'Perhatian', count: job.medium_count, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', Icon: Shield },
    { label: 'Aman', count: job.low_count, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20', Icon: ShieldCheck },
  ]

  return (
    <div className="space-y-6">
      <ScoreDisplay score={job.overall_score} label="Skor Risiko Keseluruhan (CVSS)" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {counts.map(({ label, count, color, bg, Icon }) => (
          <div key={label} className={`glass-dark rounded-xl border p-5 text-center ${bg}`}>
            <Icon className={`h-6 w-6 mx-auto mb-2 ${color}`} />
            <p className={`text-3xl font-bold ${color}`}>{count}</p>
            <p className="text-slate-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {job.risk_level && (
        <div className={`glass-dark rounded-xl border p-5 ${SEVERITY_BG_COLORS[job.risk_level]}`}>
          <p className="text-slate-400 text-sm mb-1">Level Risiko Keseluruhan</p>
          <p className={`text-2xl font-bold ${SEVERITY_COLORS[job.risk_level]}`}>
            {SEVERITY_LABELS[job.risk_level]}
          </p>
        </div>
      )}
    </div>
  )
}

function AutoSelectJob() {
  const { data: scans } = useScans({ limit: 20 })
  const latest = scans?.find((s) => s.status === 'completed')

  if (!latest) {
    return (
      <div className="glass-dark rounded-xl border border-white/5 p-8 text-center text-slate-500">
        <p>Belum ada scan selesai. Jalankan scan terlebih dahulu.</p>
      </div>
    )
  }

  return <RiskMatrix jobId={latest.id} />
}

export default function RiskScoringPage() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get('jobId')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Risk Scoring</h1>
        <p className="text-slate-400 mt-1 text-sm">Skor risiko CVSS berdasarkan hasil pemindaian</p>
      </div>

      {jobId ? <RiskMatrix jobId={jobId} /> : <AutoSelectJob />}
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
git add app/\(dashboard\)/risk-scoring/page.tsx
git commit -m "feat: update risk scoring page — real CVSS data from useScanJob()"
```

---

## PHASE 2B — Agent B: Sidebar + Remaining Pages

Agent B handles: Sidebar, export, scan-management, users, and all targets pages. Run fully parallel with Agent A once Phase 0 is complete.

---

### Task 2B.1: Update `components/layout/Sidebar.tsx` — Replace NextAuth with useAuth, Fix RBAC

**Files:**
- Modify: `components/layout/Sidebar.tsx`

Current state: uses `useSession`, `signOut` from next-auth/react; has `it_admin` role. New: uses `useAuth()`, new roles (`saas_admin`, `admin_ojs`, `viewer`).

- [ ] **Read current file**

```bash
cat components/layout/Sidebar.tsx
```

- [ ] **Replace file content**

```tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import {
  LayoutDashboard, Target, ScanLine, ShieldAlert, BarChart2,
  Download, FileText, Users, LogOut, ChevronRight,
} from 'lucide-react'
import type { UserRole } from '@/types/api'

type NavItem = { label: string; href: string; icon: React.ElementType }

const BASE_NAV: NavItem[] = [
  { label: 'Beranda', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Target OJS', href: '/targets', icon: Target },
  { label: 'Laporan Keamanan', href: '/vulnerability-report', icon: ShieldAlert },
  { label: 'Risk Scoring', href: '/risk-scoring', icon: BarChart2 },
  { label: 'Export Laporan', href: '/export', icon: Download },
]

const SCAN_NAV: NavItem = { label: 'Mulai Scan', href: '/scanning', icon: ScanLine }
const LOG_NAV: NavItem = { label: 'Log Teknis', href: '/scan-management', icon: FileText }
const USERS_NAV: NavItem = { label: 'Kelola Pengguna', href: '/users', icon: Users }

function getNavItems(role: UserRole): NavItem[] {
  if (role === 'viewer') return BASE_NAV
  if (role === 'admin_ojs') return [...BASE_NAV, SCAN_NAV]
  // saas_admin
  return [...BASE_NAV, SCAN_NAV, LOG_NAV, USERS_NAV]
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  if (!user) return null

  const navItems = getNavItems(user.role)

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <aside className="w-64 flex-shrink-0 h-screen flex flex-col bg-slate-950 border-r border-white/5">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">OJSDef</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${active ? 'text-primary' : 'text-slate-500 group-hover:text-white'}`} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-3 w-3 text-primary" />}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        <div className="px-3 py-2">
          <p className="text-white text-sm font-medium truncate">{user.full_name}</p>
          <p className="text-slate-500 text-xs truncate">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="h-4 w-4 text-slate-500" />
          Keluar
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Type-check**

```bash
cd OJSDEF-FrontEnd && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add components/layout/Sidebar.tsx
git commit -m "feat: update Sidebar — useAuth(), new RBAC roles (viewer/admin_ojs/saas_admin)"
```

---

### Task 2B.2: Update `app/(dashboard)/export/page.tsx`

**Files:**
- Modify: `app/(dashboard)/export/page.tsx`

- [ ] **Replace file content**

```tsx
'use client'

import { useReports, useDownloadReport } from '@/hooks/use-reports'
import { Download, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ExportPage() {
  const { data: reports, isLoading, error } = useReports()
  const downloadReport = useDownloadReport()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Export Laporan</h1>
        <p className="text-slate-400 mt-1 text-sm">Unduh laporan PDF hasil pemindaian keamanan</p>
      </div>

      <div className="glass-dark rounded-xl border border-white/5">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold">Laporan Tersedia</h2>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-800 rounded animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 flex items-center gap-2 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Gagal memuat laporan</span>
          </div>
        ) : !reports?.length ? (
          <div className="p-8 text-center text-slate-500">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p>Belum ada laporan. Selesaikan scan untuk membuat laporan.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center gap-4 px-6 py-4">
                <div className="p-2 rounded-lg bg-slate-800">
                  <FileText className="h-5 w-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">
                    Laporan {report.format.toUpperCase()} — {report.job_id.slice(0, 8)}…
                  </p>
                  <p className="text-slate-500 text-xs">
                    {new Date(report.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                    {report.file_size_bytes && (
                      <> · {(report.file_size_bytes / 1024).toFixed(0)} KB</>
                    )}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-slate-300 hover:text-white"
                  onClick={() => downloadReport.mutate(report.id)}
                  disabled={downloadReport.isPending}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Unduh
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Type-check and commit**

```bash
cd OJSDEF-FrontEnd && npx tsc --noEmit 2>&1 | head -20
git add app/\(dashboard\)/export/page.tsx
git commit -m "feat: update export page — real useReports() + PDF download"
```

---

### Task 2B.3: Update `app/(dashboard)/scan-management/page.tsx`

**Files:**
- Modify: `app/(dashboard)/scan-management/page.tsx`

- [ ] **Replace file content**

```tsx
'use client'

import { useScans } from '@/hooks/use-scans'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { SCAN_STATUS_LABELS, SCAN_STATUS_COLORS, SCAN_TYPE_LABELS } from '@/lib/utils'

function ScanManagementContent() {
  const { data: scans, isLoading } = useScans()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Log Teknis</h1>
        <p className="text-slate-400 mt-1 text-sm">Riwayat lengkap semua job scan</p>
      </div>

      <div className="glass-dark rounded-xl border border-white/5">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : !scans?.length ? (
            <div className="p-8 text-center text-slate-500">Belum ada riwayat scan.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs uppercase border-b border-white/5">
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Target</th>
                  <th className="px-6 py-3 text-left">Tipe</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Skor</th>
                  <th className="px-6 py-3 text-left">Dibuat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">
                      {scan.id.slice(0, 8)}…
                    </td>
                    <td className="px-6 py-3 text-slate-300 font-mono text-xs">
                      {scan.target_id.slice(0, 8)}…
                    </td>
                    <td className="px-6 py-3 text-slate-400">
                      {SCAN_TYPE_LABELS[scan.scan_type]}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-sm ${SCAN_STATUS_COLORS[scan.status]}`}>
                        {SCAN_STATUS_LABELS[scan.status]}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-400">
                      {scan.overall_score != null ? scan.overall_score.toFixed(1) : '—'}
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs">
                      {new Date(scan.created_at).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ScanManagementPage() {
  return (
    <RoleGuard allowedRoles={['saas_admin']}>
      <ScanManagementContent />
    </RoleGuard>
  )
}
```

- [ ] **Type-check and commit**

```bash
cd OJSDEF-FrontEnd && npx tsc --noEmit 2>&1 | head -20
git add app/\(dashboard\)/scan-management/page.tsx
git commit -m "feat: update scan-management — real useScans(), saas_admin RoleGuard"
```

---

### Task 2B.4: Update `app/(dashboard)/users/page.tsx`

**Files:**
- Modify: `app/(dashboard)/users/page.tsx`

Current state: placeholder "Fitur ini akan tersedia di Fase 2". Replace with real user management.

- [ ] **Replace file content**

```tsx
'use client'

import { useAdminUsers, useCreateUser, useUpdateUser } from '@/hooks/use-admin'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { ROLE_LABELS } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import type { UserRole } from '@/types/api'

const createUserSchema = z.object({
  email: z.string().email('Email tidak valid'),
  full_name: z.string().min(2, 'Nama minimal 2 karakter'),
  role: z.enum(['saas_admin', 'admin_ojs', 'viewer']),
})
type CreateUserForm = z.infer<typeof createUserSchema>

function CreateUserForm({ onSuccess }: { onSuccess: () => void }) {
  const createUser = useCreateUser()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: '', full_name: '', role: 'admin_ojs' },
  })

  async function onSubmit(data: CreateUserForm) {
    setError(null)
    try {
      await createUser.mutateAsync(data)
      form.reset()
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat pengguna')
    }
  }

  return (
    <div className="glass-dark rounded-xl border border-white/5 p-6 space-y-4">
      <h2 className="text-white font-semibold">Tambah Pengguna</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Email</FormLabel>
                <FormControl>
                  <Input className="bg-slate-900/60 border-white/10 text-white" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Nama Lengkap</FormLabel>
                <FormControl>
                  <Input className="bg-slate-900/60 border-white/10 text-white" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-slate-900/60 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin_ojs">Admin OJS</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="saas_admin">SaaS Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="sm:col-span-3 flex items-center gap-3">
            {error && <p className="text-red-400 text-sm flex-1">{error}</p>}
            <Button
              type="submit"
              disabled={createUser.isPending}
              className="bg-primary hover:bg-primary/90 ml-auto"
            >
              {createUser.isPending ? 'Menyimpan...' : 'Tambah Pengguna'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

function UsersContent() {
  const { data: users, isLoading } = useAdminUsers()
  const updateUser = useUpdateUser()
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Kelola Pengguna</h1>
          <p className="text-slate-400 mt-1 text-sm">Manajemen akun pengguna platform OJSDef</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90"
        >
          {showForm ? 'Tutup Form' : 'Tambah Pengguna'}
        </Button>
      </div>

      {showForm && <CreateUserForm onSuccess={() => setShowForm(false)} />}

      <div className="glass-dark rounded-xl border border-white/5">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : !users?.length ? (
            <div className="p-8 text-center text-slate-500">Belum ada pengguna terdaftar.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs uppercase border-b border-white/5">
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3 text-slate-300">{user.email}</td>
                    <td className="px-6 py-3 text-slate-400">{ROLE_LABELS[user.role as UserRole]}</td>
                    <td className="px-6 py-3">
                      <Badge
                        variant={user.is_active ? 'default' : 'secondary'}
                        className={user.is_active ? 'bg-green-400/10 text-green-400 border-green-400/20' : 'bg-slate-700 text-slate-400'}
                      >
                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-400 hover:text-white"
                        onClick={() => updateUser.mutate({ userId: user.id, data: { is_active: !user.is_active } })}
                        disabled={updateUser.isPending}
                      >
                        {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  return (
    <RoleGuard allowedRoles={['saas_admin']}>
      <UsersContent />
    </RoleGuard>
  )
}
```

- [ ] **Type-check and commit**

```bash
cd OJSDEF-FrontEnd && npx tsc --noEmit 2>&1 | head -20
git add app/\(dashboard\)/users/page.tsx
git commit -m "feat: update users page — real useAdminUsers() + create/toggle user, saas_admin guard"
```

---

### Task 2B.5: Update `app/(dashboard)/targets/page.tsx`

**Files:**
- Modify: `app/(dashboard)/targets/page.tsx`

Current state: uses `MOCK_OJS_TARGETS`, fields `institutionName`, `pluginStatus`, `lastRiskScore`. New: uses `useTargets()`, fields `name`, `plugin_connected`, `is_verified`, `ojs_version`.

- [ ] **Replace file content**

```tsx
'use client'

import { useTargets, useDeleteTarget } from '@/hooks/use-targets'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, CheckCircle, XCircle, Wifi, WifiOff, ExternalLink, Trash2 } from 'lucide-react'

export default function TargetsPage() {
  const { data: targets, isLoading } = useTargets()
  const deleteTarget = useDeleteTarget()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Target OJS</h1>
          <p className="text-slate-400 mt-1 text-sm">Daftar instalasi OJS yang dipantau</p>
        </div>
        <Link href="/targets/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Target
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !targets?.length ? (
        <div className="glass-dark rounded-xl border border-white/5 p-12 text-center">
          <p className="text-slate-500 mb-4">Belum ada target OJS terdaftar.</p>
          <Link href="/targets/new">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Target Pertama
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {targets.map((target) => (
            <div key={target.id} className="glass-dark rounded-xl border border-white/5 p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-white font-semibold truncate">{target.name}</h3>
                  <a
                    href={target.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 text-xs hover:text-cyan-400 flex items-center gap-1 mt-0.5"
                  >
                    {target.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-600 hover:text-red-400 flex-shrink-0"
                  onClick={() => {
                    if (confirm(`Hapus target "${target.name}"?`)) {
                      deleteTarget.mutate(target.id)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                  target.is_verified
                    ? 'bg-green-400/10 text-green-400 border border-green-400/20'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {target.is_verified
                    ? <CheckCircle className="h-3 w-3" />
                    : <XCircle className="h-3 w-3" />}
                  {target.is_verified ? 'Terverifikasi' : 'Belum Verifikasi'}
                </div>
                <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                  target.plugin_connected
                    ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {target.plugin_connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {target.plugin_connected ? 'Plugin Terhubung' : 'Plugin Tidak Aktif'}
                </div>
              </div>

              {target.ojs_version && (
                <p className="text-slate-500 text-xs">OJS {target.ojs_version}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-white/5">
                <Link href={`/targets/${target.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full border-white/10 text-slate-300 hover:text-white text-xs">
                    Detail
                  </Button>
                </Link>
                {!target.is_verified && (
                  <Link href={`/targets/${target.id}/verify`} className="flex-1">
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-xs">
                      Verifikasi
                    </Button>
                  </Link>
                )}
                {target.is_verified && !target.plugin_connected && (
                  <Link href={`/targets/${target.id}/plugin-guide`} className="flex-1">
                    <Button size="sm" className="w-full bg-cyan-500 hover:bg-cyan-600 text-xs">
                      Pasang Plugin
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Type-check and commit**

```bash
cd OJSDEF-FrontEnd && npx tsc --noEmit 2>&1 | head -20
git add app/\(dashboard\)/targets/page.tsx
git commit -m "feat: update targets list — real useTargets(), correct field names, delete action"
```

---

### Task 2B.6: Update `app/(dashboard)/targets/new/page.tsx`

**Files:**
- Modify: `app/(dashboard)/targets/new/page.tsx`

Current state: wrong field names (`institutionName` → `name`, `ojsUrl` → `url`, `full_audit` → removed). New: `useCreateTarget()` with correct fields.

- [ ] **Replace file content**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTarget } from '@/hooks/use-targets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  name: z.string().min(2, 'Nama institusi minimal 2 karakter'),
  url: z.string().url('URL tidak valid — contoh: https://jurnal.universitas.ac.id'),
})
type FormData = z.infer<typeof schema>

export default function NewTargetPage() {
  const router = useRouter()
  const createTarget = useCreateTarget()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', url: '' },
  })

  async function onSubmit(data: FormData) {
    setError(null)
    try {
      const target = await createTarget.mutateAsync(data)
      router.push(`/targets/${target.id}/verify`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambah target')
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/targets" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Target
        </Link>
        <h1 className="text-2xl font-bold text-white">Tambah Target OJS</h1>
        <p className="text-slate-400 mt-1 text-sm">Daftarkan instalasi OJS baru untuk dipantau</p>
      </div>

      <div className="glass-dark rounded-xl border border-white/5 p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Nama Institusi</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Universitas Brawijaya"
                      className="bg-slate-900/60 border-white/10 text-white placeholder:text-slate-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">URL OJS</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://jurnal.universitas.ac.id"
                      className="bg-slate-900/60 border-white/10 text-white placeholder:text-slate-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={createTarget.isPending}
            >
              {createTarget.isPending ? 'Mendaftarkan...' : 'Daftarkan Target'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
```

- [ ] **Type-check and commit**

```bash
cd OJSDEF-FrontEnd && npx tsc --noEmit 2>&1 | head -20
git add app/\(dashboard\)/targets/new/page.tsx
git commit -m "feat: update targets/new — correct field names (name/url), useCreateTarget()"
```

---

### Task 2B.7: Update `app/(dashboard)/targets/[id]/verify/page.tsx`

**Files:**
- Modify: `app/(dashboard)/targets/[id]/verify/page.tsx`

Current state: uses `MOCK_OJS_TARGETS.find(id)`, fake `handleCheck`. New: uses `useTarget(id)` + `useVerifyTarget(id)`.

- [ ] **Replace file content**

```tsx
'use client'

import { use } from 'react'
import { useTarget, useVerifyTarget } from '@/hooks/use-targets'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, ArrowLeft, FileText, Globe } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

type Method = 'file' | 'dns'

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: target, isLoading } = useTarget(id)
  const verifyTarget = useVerifyTarget(id)
  const [method, setMethod] = useState<Method>('file')
  const [verifyResult, setVerifyResult] = useState<{ verified: boolean; method: string | null } | null>(null)

  async function handleVerify() {
    try {
      const result = await verifyTarget.mutateAsync(method)
      setVerifyResult(result)
    } catch {
      setVerifyResult({ verified: false, method: null })
    }
  }

  if (isLoading) return <div className="h-64 bg-slate-800 rounded-xl animate-pulse" />

  if (!target) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Target tidak ditemukan.</p>
        <Link href="/targets"><Button variant="ghost" className="mt-4">Kembali</Button></Link>
      </div>
    )
  }

  if (target.is_verified) {
    return (
      <div className="max-w-lg space-y-6">
        <Link href={`/targets/${id}`} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Detail Target
        </Link>
        <div className="glass-dark rounded-xl border border-green-400/20 bg-green-400/5 p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <h2 className="text-white text-xl font-bold">Target Sudah Terverifikasi</h2>
          <p className="text-slate-400 mt-2 text-sm">{target.name} sudah berhasil diverifikasi.</p>
          <Link href={`/targets/${id}/plugin-guide`}>
            <Button className="mt-6 bg-primary hover:bg-primary/90">Lanjut ke Panduan Plugin</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href={`/targets/${id}`} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Detail Target
        </Link>
        <h1 className="text-2xl font-bold text-white">Verifikasi Domain</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Buktikan kepemilikan domain <span className="text-cyan-400">{target.url}</span>
        </p>
      </div>

      {/* Method selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setMethod('file')}
          className={`glass-dark rounded-xl border p-4 text-left transition-all ${
            method === 'file' ? 'border-primary bg-primary/10' : 'border-white/5 hover:border-white/10'
          }`}
        >
          <FileText className={`h-5 w-5 mb-2 ${method === 'file' ? 'text-primary' : 'text-slate-500'}`} />
          <p className="text-white text-sm font-medium">Upload File</p>
          <p className="text-slate-500 text-xs mt-0.5">Unggah file verifikasi ke server OJS</p>
        </button>
        <button
          onClick={() => setMethod('dns')}
          className={`glass-dark rounded-xl border p-4 text-left transition-all ${
            method === 'dns' ? 'border-primary bg-primary/10' : 'border-white/5 hover:border-white/10'
          }`}
        >
          <Globe className={`h-5 w-5 mb-2 ${method === 'dns' ? 'text-primary' : 'text-slate-500'}`} />
          <p className="text-white text-sm font-medium">DNS TXT Record</p>
          <p className="text-slate-500 text-xs mt-0.5">Tambahkan TXT record ke DNS domain</p>
        </button>
      </div>

      {/* Instructions */}
      <div className="glass-dark rounded-xl border border-white/5 p-5 space-y-3">
        {method === 'file' ? (
          <>
            <h3 className="text-white font-medium">Langkah Verifikasi File</h3>
            <ol className="space-y-2 text-sm text-slate-400 list-decimal list-inside">
              <li>Unduh file verifikasi dari backend (akan diberikan setelah klik Verifikasi)</li>
              <li>Upload ke direktori root OJS: <code className="text-cyan-400 bg-slate-800 px-1 rounded">public/ojsdef-verify.txt</code></li>
              <li>Pastikan file dapat diakses di <code className="text-cyan-400">{target.url}/ojsdef-verify.txt</code></li>
              <li>Klik tombol Periksa Verifikasi</li>
            </ol>
          </>
        ) : (
          <>
            <h3 className="text-white font-medium">Langkah Verifikasi DNS</h3>
            <ol className="space-y-2 text-sm text-slate-400 list-decimal list-inside">
              <li>Login ke panel DNS domain Anda</li>
              <li>Tambahkan TXT record baru untuk domain root</li>
              <li>Isi nilai record dengan token yang diberikan backend</li>
              <li>Tunggu propagasi DNS (5–30 menit), lalu klik Periksa Verifikasi</li>
            </ol>
          </>
        )}
      </div>

      {/* Result */}
      {verifyResult && (
        <div className={`rounded-xl border p-4 flex items-center gap-3 ${
          verifyResult.verified
            ? 'bg-green-400/10 border-green-400/20'
            : 'bg-red-400/10 border-red-400/20'
        }`}>
          {verifyResult.verified
            ? <CheckCircle className="h-5 w-5 text-green-400" />
            : <XCircle className="h-5 w-5 text-red-400" />}
          <p className={`text-sm ${verifyResult.verified ? 'text-green-400' : 'text-red-400'}`}>
            {verifyResult.verified
              ? 'Domain berhasil diverifikasi!'
              : 'Verifikasi gagal. Pastikan file/record sudah dipasang dengan benar.'}
          </p>
        </div>
      )}

      <Button
        onClick={handleVerify}
        disabled={verifyTarget.isPending}
        className="bg-primary hover:bg-primary/90"
      >
        {verifyTarget.isPending ? 'Memeriksa...' : 'Periksa Verifikasi'}
      </Button>

      {verifyResult?.verified && (
        <Link href={`/targets/${id}/plugin-guide`}>
          <Button variant="outline" className="border-white/10 text-slate-300 hover:text-white">
            Lanjut ke Panduan Plugin →
          </Button>
        </Link>
      )}
    </div>
  )
}
```

- [ ] **Type-check and commit**

```bash
cd OJSDEF-FrontEnd && npx tsc --noEmit 2>&1 | head -20
git add app/\(dashboard\)/targets/\[id\]/verify/page.tsx
git commit -m "feat: update verify page — real useTarget() + useVerifyTarget(), method selector"
```

---

### Task 2B.8: Update `app/(dashboard)/targets/[id]/plugin-guide/page.tsx`

**Files:**
- Modify: `app/(dashboard)/targets/[id]/plugin-guide/page.tsx`

Current state: uses `MOCK_OJS_TARGETS`, hardcoded `API_KEY_MOCK`. New: uses `useTarget(id)` + `usePluginGuide(id)` + `useRegenerateApiKey(id)`.

- [ ] **Replace file content**

```tsx
'use client'

import { use, useState } from 'react'
import { useTarget, usePluginGuide, useRegenerateApiKey } from '@/hooks/use-targets'
import { Button } from '@/components/ui/button'
import { Copy, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
    >
      {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}

const STEPS = [
  {
    num: 1,
    title: 'Unduh Plugin',
    desc: 'Download plugin OJSDef dari repositori resmi dan ekstrak ke direktori plugins OJS.',
  },
  {
    num: 2,
    title: 'Instalasi',
    desc: 'Login ke panel admin OJS, buka Settings → Website → Plugins → Upload Plugin. Upload file ZIP plugin.',
  },
  {
    num: 3,
    title: 'Konfigurasi API Key',
    desc: 'Di halaman pengaturan plugin, masukkan API Key dan Endpoint di bawah ini.',
  },
  {
    num: 4,
    title: 'Aktifkan Plugin',
    desc: 'Aktifkan plugin dan klik "Test Koneksi" untuk memverifikasi bahwa plugin terhubung ke OJSDef.',
  },
]

export default function PluginGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: target, isLoading: targetLoading } = useTarget(id)
  const { data: guide, isLoading: guideLoading } = usePluginGuide(id)
  const regenerateKey = useRegenerateApiKey(id)

  const isLoading = targetLoading || guideLoading

  if (isLoading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-800 rounded-xl animate-pulse" />)}</div>

  if (!target) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Target tidak ditemukan.</p>
        <Link href="/targets"><Button variant="ghost" className="mt-4">Kembali</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href={`/targets/${id}`} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Detail Target
        </Link>
        <h1 className="text-2xl font-bold text-white">Panduan Instalasi Plugin</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Pasang plugin OJSDef di <span className="text-cyan-400">{target.name}</span>
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step) => (
          <div key={step.num} className="glass-dark rounded-xl border border-white/5 p-5 flex gap-4">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {step.num}
            </div>
            <div>
              <h3 className="text-white font-medium">{step.title}</h3>
              <p className="text-slate-400 text-sm mt-1">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* API Credentials */}
      {guide && (
        <div className="glass-dark rounded-xl border border-white/5 p-6 space-y-4">
          <h2 className="text-white font-semibold">Kredensial Plugin</h2>

          <div className="space-y-3">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">API Key</p>
              <div className="flex items-center gap-2 bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2">
                <code className="text-cyan-400 text-sm flex-1 font-mono break-all">{guide.api_key}</code>
                <CopyButton text={guide.api_key} />
              </div>
            </div>

            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Endpoint</p>
              <div className="flex items-center gap-2 bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2">
                <code className="text-slate-300 text-sm flex-1 font-mono break-all">{guide.endpoint}</code>
                <CopyButton text={guide.endpoint} />
              </div>
            </div>

            {guide.instructions && (
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Catatan Tambahan</p>
                <p className="text-slate-400 text-sm whitespace-pre-wrap">{guide.instructions}</p>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-white/5">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-slate-400 hover:text-white"
              onClick={() => {
                if (confirm('Regenerasi API key? Key lama akan tidak berlaku.')) {
                  regenerateKey.mutate()
                }
              }}
              disabled={regenerateKey.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${regenerateKey.isPending ? 'animate-spin' : ''}`} />
              {regenerateKey.isPending ? 'Memperbarui...' : 'Regenerasi API Key'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Type-check and commit**

```bash
cd OJSDEF-FrontEnd && npx tsc --noEmit 2>&1 | head -20
git add app/\(dashboard\)/targets/\[id\]/plugin-guide/page.tsx
git commit -m "feat: update plugin-guide — real usePluginGuide() + useRegenerateApiKey(), copy buttons"
```

---

## Final Verification

After all Phase 0, 2A, and 2B tasks are complete:

- [ ] **Full type-check**

```bash
cd OJSDEF-FrontEnd && npx tsc --noEmit 2>&1 | head -50
```

Expected: 0 errors

- [ ] **Check no imports remain from deleted files**

```bash
grep -r "from.*types/ojsdef" app/ components/ hooks/ lib/ --include="*.ts" --include="*.tsx"
grep -r "from.*mock-data" app/ components/ hooks/ lib/ --include="*.ts" --include="*.tsx"
grep -r "from.*next-auth" app/ components/ hooks/ lib/ --include="*.ts" --include="*.tsx"
grep -r "from.*lib/auth\"" app/ components/ hooks/ lib/ --include="*.ts" --include="*.tsx"
grep -r "from.*lib/auth.config" app/ components/ hooks/ lib/ --include="*.ts" --include="*.tsx"
```

Expected: 0 matches for all commands

- [ ] **Build check**

```bash
cd OJSDEF-FrontEnd && npm run build 2>&1 | tail -30
```

Expected: successful build, no type errors

- [ ] **Final commit**

```bash
git add -u
git commit -m "chore: backend API integration complete — all pages connected to real backend"
```
