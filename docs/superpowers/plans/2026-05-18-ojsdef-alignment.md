# OJSDef Frontend Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the OJSDef frontend with PRD v1.2 and SRS v1.2 — correct MVP scope violations, replace all generic cybersecurity mock data with OJS-domain data in Bahasa Indonesia, and implement missing P1 features (Domain Verification, Plugin Guide, Action Plan, RBAC sidebar).

**Architecture:** Foundation-first order — TypeScript types and mock data are rebuilt first (Tasks 1–2) because all subsequent pages depend on them. Auth fixes are isolated (Tasks 3–4). Page rebuilds follow dependency order: dashboard → add-target → landing → new pages → enhancements.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, ShadCN UI, Framer Motion, NextAuth v5, Zod + React Hook Form, lucide-react.

---

## File Map

### New Files
| File | Purpose |
|------|---------|
| `types/ojsdef.ts` | OJS-domain TypeScript types |
| `app/(dashboard)/targets/page.tsx` | Daftar Target OJS |
| `app/(dashboard)/targets/new/page.tsx` | Tambah Target OJS (menggantikan add-target) |
| `app/(dashboard)/targets/[id]/verify/page.tsx` | Domain Verification 3-step |
| `app/(dashboard)/targets/[id]/plugin-guide/page.tsx` | Plugin Installation Guide 4-step |
| `app/(dashboard)/users/page.tsx` | Kelola Pengguna placeholder (saas_admin only) |

### Modified Files
| File | Change |
|------|--------|
| `lib/mock-data.ts` | Complete rebuild with OJS data and Bahasa Indonesia |
| `lib/auth.ts` | Add 2 hardcoded users (admin_ojs, it_admin) |
| `lib/auth.config.ts` | Add /targets to protected routes |
| `app/(auth)/login/page.tsx` | Remove register + forgot-pw links |
| `app/(auth)/register/page.tsx` | Replace form with informational message |
| `app/(auth)/forgot-password/page.tsx` | Replace form with informational message |
| `app/(dashboard)/dashboard/page.tsx` | Rebuild widgets, table headers, Indonesian labels |
| `app/(dashboard)/add-target/page.tsx` | Replace with redirect to /targets/new |
| `app/(dashboard)/vulnerability-report/page.tsx` | Add expandable Action Plan accordion |
| `app/page.tsx` | Fix pricing bug + OJS-domain hero and features copy |
| `components/layout/Sidebar.tsx` | RBAC conditional nav + update links |

---

## Task 1: TypeScript Types

**Files:**
- Create: `types/ojsdef.ts`

- [ ] **Step 1: Create the types file**

```typescript
// types/ojsdef.ts
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors on the new file.

- [ ] **Step 3: Commit**

```bash
git add types/ojsdef.ts
git commit -m "feat: add OJS-domain TypeScript types"
```

---

## Task 2: Rebuild Mock Data

**Files:**
- Modify: `lib/mock-data.ts`

- [ ] **Step 1: Replace the entire file contents**

```typescript
// lib/mock-data.ts
import type { OJSTarget, ScanFinding, ScanSession, RiskLevel, OJSScanType } from "@/types/ojsdef"

export type { RiskLevel, OJSScanType }

// ─── OJS Targets ────────────────────────────────────────────────────────────

export const MOCK_OJS_TARGETS: OJSTarget[] = [
  {
    id: "target_01",
    url: "journal.ub.ac.id",
    institutionName: "Universitas Brawijaya",
    ojsVersion: "3.3.0-16",
    pluginStatus: "connected",
    isVerified: true,
    lastScanAt: "2026-05-16 14:30",
    lastRiskScore: 72,
  },
  {
    id: "target_02",
    url: "ojs.fk.ui.ac.id",
    institutionName: "FKUI Jakarta",
    ojsVersion: "3.4.0-3",
    pluginStatus: "connected",
    isVerified: true,
    lastScanAt: "2026-05-17 09:15",
    lastRiskScore: 45,
  },
  {
    id: "target_03",
    url: "jurnal.its.ac.id",
    institutionName: "Institut Teknologi Sepuluh Nopember",
    ojsVersion: "3.3.0-15",
    pluginStatus: "disconnected",
    isVerified: true,
    lastScanAt: "2026-05-10 11:00",
    lastRiskScore: 88,
  },
]

// ─── Findings / Vulnerabilities ──────────────────────────────────────────────

export const MOCK_FINDINGS: ScanFinding[] = [
  {
    id: "vuln_01",
    targetId: "target_01",
    title: "Konten judi online terdeteksi di 2 artikel",
    description:
      "Dua artikel pada jurnal mengandung tautan dan konten yang mengarah ke situs perjudian online. Ini merupakan indikasi kuat adanya kompromi atau injeksi konten oleh pihak tidak bertanggung jawab.",
    cvssScore: 9.8,
    severity: "critical",
    sourceType: "internal",
    detectedAt: "2026-05-16 14:30",
    status: "open",
    actionPlan: [
      { step: 1, description: "Login ke panel admin OJS sebagai Administrator", estimatedTime: "2 menit", difficulty: "mudah" },
      { step: 2, description: "Buka Submissions → All Submissions, cari artikel ID yang dicurigai", estimatedTime: "5 menit", difficulty: "mudah" },
      { step: 3, description: "Hapus atau unpublish artikel yang terkontaminasi", estimatedTime: "10 menit", difficulty: "mudah" },
      { step: 4, description: "Ubah password semua akun admin dan author terkait", estimatedTime: "15 menit", difficulty: "mudah" },
      { step: 5, description: "Aktifkan Two-Factor Authentication di pengaturan OJS", estimatedTime: "10 menit", difficulty: "menengah" },
    ],
  },
  {
    id: "vuln_02",
    targetId: "target_01",
    title: "Sertifikat SSL kedaluwarsa dalam 3 hari",
    description:
      "Sertifikat SSL/TLS untuk domain journal.ub.ac.id akan kedaluwarsa dalam 3 hari. Pengunjung akan mendapat peringatan keamanan dari browser setelah tanggal kedaluwarsa.",
    cvssScore: 8.6,
    severity: "high",
    sourceType: "external",
    detectedAt: "2026-05-16 14:31",
    status: "open",
    actionPlan: [
      { step: 1, description: "Hubungi tim IT/hosting untuk perpanjangan sertifikat SSL segera", estimatedTime: "5 menit", difficulty: "mudah" },
      { step: 2, description: "Jika menggunakan Let's Encrypt, jalankan: sudo certbot renew di server", estimatedTime: "10 menit", difficulty: "menengah" },
      { step: 3, description: "Verifikasi pembaruan dengan membuka URL di browser", estimatedTime: "5 menit", difficulty: "mudah" },
      { step: 4, description: "Atur notifikasi otomatis pembaruan sertifikat 30 hari sebelum kedaluwarsa", estimatedTime: "15 menit", difficulty: "menengah" },
    ],
  },
  {
    id: "vuln_03",
    targetId: "target_03",
    title: "Plugin Antivirus OJS versi lama (CVE-2023-4891)",
    description:
      "Plugin Antivirus OJS yang terpasang adalah versi 1.0.1, rentan terhadap CVE-2023-4891 yang memungkinkan bypass pemindaian file berbahaya saat upload submission.",
    cvssScore: 8.1,
    severity: "high",
    sourceType: "internal",
    detectedAt: "2026-05-10 11:02",
    status: "open",
    cveId: "CVE-2023-4891",
    actionPlan: [
      { step: 1, description: "Login ke panel admin OJS → Settings → Plugins → Plugin Gallery", estimatedTime: "2 menit", difficulty: "mudah" },
      { step: 2, description: "Cari plugin 'Anti-Virus Plugin' dan klik Update ke versi terbaru", estimatedTime: "5 menit", difficulty: "mudah" },
      { step: 3, description: "Verifikasi versi plugin sudah ≥ 1.0.2 setelah pembaruan", estimatedTime: "3 menit", difficulty: "mudah" },
      { step: 4, description: "Uji fungsionalitas upload submission setelah pembaruan", estimatedTime: "10 menit", difficulty: "mudah" },
    ],
  },
  {
    id: "vuln_04",
    targetId: "target_01",
    title: "3 akun admin menggunakan password default",
    description:
      "Pemindaian internal menemukan 3 akun administrator masih menggunakan password default. Password default sangat mudah ditebak oleh penyerang.",
    cvssScore: 7.2,
    severity: "high",
    sourceType: "internal",
    detectedAt: "2026-05-16 14:32",
    status: "open",
    actionPlan: [
      { step: 1, description: "Login sebagai super-admin OJS, buka Users → All Users", estimatedTime: "2 menit", difficulty: "mudah" },
      { step: 2, description: "Filter pengguna berperan 'Journal Manager' dan 'Administrator'", estimatedTime: "3 menit", difficulty: "mudah" },
      { step: 3, description: "Kirim email reset password ke semua akun admin yang teridentifikasi", estimatedTime: "10 menit", difficulty: "mudah" },
      { step: 4, description: "Aktifkan kebijakan password minimum 12 karakter di pengaturan OJS", estimatedTime: "5 menit", difficulty: "mudah" },
    ],
  },
  {
    id: "vuln_05",
    targetId: "target_03",
    title: "Direktori /backup/ dapat diakses publik",
    description:
      "URL https://jurnal.its.ac.id/backup/ dapat diakses tanpa autentikasi, menampilkan file backup yang berisi konfigurasi database dan data sensitif.",
    cvssScore: 7.5,
    severity: "high",
    sourceType: "external",
    detectedAt: "2026-05-10 11:05",
    status: "open",
    actionPlan: [
      { step: 1, description: "Hubungi admin server untuk menutup akses direktori /backup/ via konfigurasi web server", estimatedTime: "5 menit", difficulty: "mudah" },
      { step: 2, description: "Tambahkan rule di .htaccess: 'Deny from all' di dalam folder /backup/", estimatedTime: "10 menit", difficulty: "menengah" },
      { step: 3, description: "Pindahkan file backup ke direktori di luar document root server", estimatedTime: "20 menit", difficulty: "sulit" },
      { step: 4, description: "Verifikasi dengan membuka URL di browser — harus mendapat 403 Forbidden", estimatedTime: "5 menit", difficulty: "mudah" },
    ],
  },
  {
    id: "vuln_06",
    targetId: "target_02",
    title: "Debug mode aktif di config.inc.php",
    description:
      "File konfigurasi OJS menunjukkan debug mode masih aktif (show_stacktrace = On). Ini dapat mengekspos informasi teknis sensitif kepada pengguna tidak sah.",
    cvssScore: 5.3,
    severity: "medium",
    sourceType: "internal",
    detectedAt: "2026-05-17 09:17",
    status: "open",
    actionPlan: [
      { step: 1, description: "Akses file config.inc.php di server melalui SSH atau panel hosting", estimatedTime: "5 menit", difficulty: "menengah" },
      { step: 2, description: "Ubah baris 'show_stacktrace = On' menjadi 'show_stacktrace = Off'", estimatedTime: "5 menit", difficulty: "mudah" },
      { step: 3, description: "Ubah 'display_errors_on = On' menjadi 'display_errors_on = Off' jika ada", estimatedTime: "3 menit", difficulty: "mudah" },
      { step: 4, description: "Restart web server untuk menerapkan perubahan", estimatedTime: "5 menit", difficulty: "menengah" },
    ],
  },
  {
    id: "vuln_07",
    targetId: "target_03",
    title: "OJS versi 3.3.0-15 (tersedia pembaruan 3.4.0-7)",
    description:
      "Instalasi OJS menggunakan versi 3.3.0-15 yang sudah tertinggal. Versi terbaru 3.4.0-7 mencakup perbaikan keamanan kritis.",
    cvssScore: 4.2,
    severity: "medium",
    sourceType: "internal",
    detectedAt: "2026-05-10 11:10",
    status: "open",
    actionPlan: [
      { step: 1, description: "Buat backup lengkap database dan file OJS sebelum melakukan pembaruan", estimatedTime: "30 menit", difficulty: "menengah" },
      { step: 2, description: "Unduh paket pembaruan OJS 3.4.0-7 dari situs resmi PKP", estimatedTime: "10 menit", difficulty: "mudah" },
      { step: 3, description: "Ikuti panduan upgrade resmi OJS di docs.pkp.sfu.ca/admin-guide/en/upgrading-ojs", estimatedTime: "60 menit", difficulty: "sulit" },
      { step: 4, description: "Verifikasi semua plugin masih berfungsi setelah upgrade", estimatedTime: "30 menit", difficulty: "menengah" },
    ],
  },
]

// ─── Legacy-compatible types for existing pages ──────────────────────────────

export type ScanStatus = "Completed" | "In Progress" | "Failed"

export interface ScanRow {
  id: string
  url: string
  institutionName: string
  scanType: string
  risk: RiskLevel
  date: string
  status: ScanStatus
  vulnerabilities: number
}

export const MOCK_SCANS: ScanRow[] = [
  { id: "sc_01", url: "journal.ub.ac.id", institutionName: "Universitas Brawijaya", scanType: "Audit Lengkap", risk: "critical", date: "2026-05-16 14:22", status: "Completed", vulnerabilities: 4 },
  { id: "sc_02", url: "ojs.fk.ui.ac.id", institutionName: "FKUI Jakarta", scanType: "Audit Eksternal", risk: "medium", date: "2026-05-17 09:15", status: "Completed", vulnerabilities: 1 },
  { id: "sc_03", url: "jurnal.its.ac.id", institutionName: "ITS Surabaya", scanType: "Audit Internal", risk: "high", date: "2026-05-10 11:00", status: "Completed", vulnerabilities: 3 },
  { id: "sc_04", url: "journal.ub.ac.id", institutionName: "Universitas Brawijaya", scanType: "Audit Eksternal", risk: "high", date: "2026-05-14 08:30", status: "In Progress", vulnerabilities: 2 },
]

export const VULN_STATS = [
  { label: "Kritis", value: 1, color: "var(--critical)", percentage: 14 },
  { label: "Berbahaya", value: 4, color: "var(--high)", percentage: 57 },
  { label: "Perhatian", value: 2, color: "var(--medium)", percentage: 29 },
  { label: "Aman", value: 0, color: "var(--low)", percentage: 0 },
]

export const SYSTEM_HEALTH = {
  score: 68,
  status: "Perlu Perhatian",
  lastUpdate: "2 jam lalu",
  vulnerabilitiesTotal: 7,
}

// Flattened view used by vulnerability-report page
export const MOCK_VULNERABILITIES = MOCK_FINDINGS.map((f) => ({
  id: f.id,
  name: f.title,
  severity: f.severity,
  score: f.cvssScore,
  component: f.targetId,
  status: f.status === "open" ? ("Open" as const) : ("Resolved" as const),
  recommendation: f.actionPlan[0]?.description ?? "",
  detectedAt: f.detectedAt,
  cveId: f.cveId,
  actionPlan: f.actionPlan,
  description: f.description,
  sourceType: f.sourceType,
  targetId: f.targetId,
}))

export interface RiskPriorityItem {
  id: string
  name: string
  asset: string
  risk: RiskLevel
  impact: string
  impactDots: number
  likelihood: string
  priority: "P1" | "P2" | "P3"
}

export const MOCK_RISK_ITEMS: RiskPriorityItem[] = [
  { id: "risk_01", name: "Konten judi online di artikel", asset: "JOURNAL.UB.AC.ID", risk: "critical", impact: "Ekstrem", impactDots: 3, likelihood: "Terkonfirmasi", priority: "P1" },
  { id: "risk_02", name: "SSL kedaluwarsa 3 hari lagi", asset: "JOURNAL.UB.AC.ID", risk: "high", impact: "Tinggi", impactDots: 2, likelihood: "Pasti Terjadi", priority: "P1" },
  { id: "risk_03", name: "Plugin Antivirus versi lama (CVE-2023-4891)", asset: "JURNAL.ITS.AC.ID", risk: "high", impact: "Tinggi", impactDots: 2, likelihood: "Kemungkinan Besar", priority: "P1" },
  { id: "risk_04", name: "Direktori /backup/ terbuka publik", asset: "JURNAL.ITS.AC.ID", risk: "high", impact: "Tinggi", impactDots: 2, likelihood: "Kemungkinan Besar", priority: "P1" },
  { id: "risk_05", name: "Debug mode aktif di config.inc.php", asset: "OJS.FK.UI.AC.ID", risk: "medium", impact: "Menengah", impactDots: 2, likelihood: "Mungkin", priority: "P2" },
  { id: "risk_06", name: "OJS versi 3.3.0-15 — perlu update", asset: "JURNAL.ITS.AC.ID", risk: "medium", impact: "Menengah", impactDots: 2, likelihood: "Mungkin", priority: "P2" },
]

export const MOCK_SCAN_LOGS = [
  { type: "INFO", msg: "Menginisialisasi lingkungan pemindai OJSDef..." },
  { type: "INFO", msg: "Menghubungkan ke target: journal.ub.ac.id" },
  { type: "DONE", msg: "Koneksi berhasil. Target dapat dijangkau." },
  { type: "TASK", msg: "Menjalankan pemindaian internal via Plugin OJSDef..." },
  { type: "DONE", msg: "Koneksi plugin berhasil. Menginisialisasi audit internal." },
  { type: "TASK", msg: "Memindai konten artikel dari injeksi konten ilegal..." },
  { type: "EXEC", msg: "Menganalisis 148 artikel yang dipublikasikan..." },
  { type: "WARN", msg: "Konten mencurigakan terdeteksi di artikel ID 0142 dan ID 0276" },
  { type: "EXEC", msg: "Memeriksa versi OJS dan plugin yang terinstal..." },
  { type: "EXEC", msg: "Memverifikasi konfigurasi keamanan di config.inc.php..." },
  { type: "INFO", msg: "Menjalankan pemindaian eksternal via OJSDef Bot..." },
  { type: "EXEC", msg: "Memeriksa sertifikat SSL/TLS..." },
  { type: "WARN", msg: "Sertifikat SSL kedaluwarsa dalam 3 hari!" },
  { type: "EXEC", msg: "Memindai direktori publik yang tidak seharusnya terbuka..." },
  { type: "INFO", msg: "Pemindaian selesai. Membuat laporan keamanan..." },
]

export const MOCK_ACTIVE_SCANS: ScanSession[] = [
  {
    id: "SCAN-77291-B",
    targetId: "target_01",
    targetUrl: "journal.ub.ac.id",
    institutionName: "Universitas Brawijaya",
    scanType: "full_audit",
    riskLevel: null,
    findingsCount: 0,
    progress: 65,
    status: "in-progress",
    startTime: "2026-05-18 14:20",
  },
]

export const MOCK_SCAN_HISTORY: ScanSession[] = [
  {
    id: "SCAN-66120-P",
    targetId: "target_01",
    targetUrl: "journal.ub.ac.id",
    institutionName: "Universitas Brawijaya",
    scanType: "full_audit",
    riskLevel: "critical",
    findingsCount: 4,
    progress: 100,
    status: "completed",
    startTime: "2026-05-16 14:00",
    duration: "32m 18s",
  },
  {
    id: "SCAN-55902-L",
    targetId: "target_02",
    targetUrl: "ojs.fk.ui.ac.id",
    institutionName: "FKUI Jakarta",
    scanType: "external",
    riskLevel: "medium",
    findingsCount: 1,
    progress: 100,
    status: "completed",
    startTime: "2026-05-17 09:00",
    duration: "12m 45s",
  },
  {
    id: "SCAN-44321-F",
    targetId: "target_03",
    targetUrl: "jurnal.its.ac.id",
    institutionName: "ITS Surabaya",
    scanType: "internal",
    riskLevel: "high",
    findingsCount: 3,
    progress: 100,
    status: "completed",
    startTime: "2026-05-10 10:45",
    duration: "18m 10s",
  },
]
```

- [ ] **Step 2: Run type check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/mock-data.ts
git commit -m "feat: rebuild mock data with OJS-domain data in Bahasa Indonesia"
```

---

## Task 3: Fix Auth Pages (Scope Violations)

**Files:**
- Modify: `app/(auth)/login/page.tsx`
- Modify: `app/(auth)/register/page.tsx`
- Modify: `app/(auth)/forgot-password/page.tsx`

### 3a — Login page: remove the two out-of-scope links

- [ ] **Step 1: Remove the "forgot password?" link from the password FormField**

In `app/(auth)/login/page.tsx`, find the password `FormItem` and replace the label wrapper:

```tsx
// BEFORE (inside password FormField):
<div className="flex items-center justify-between">
  <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Password</FormLabel>
  <Link href="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors">
    forgot password?
  </Link>
</div>
```

```tsx
// AFTER:
<FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Password</FormLabel>
```

- [ ] **Step 2: Remove the "Register Here" paragraph below the card**

Find and delete this block entirely (it is after the closing `</Card>` tag):

```tsx
<p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
  Don't have an account? <Link href="/register" className="text-primary hover:text-white hover:underline transition-colors">Register Here</Link>
</p>
```

### 3b — Register page: replace form with informational message

- [ ] **Step 3: Overwrite register/page.tsx**

```tsx
// app/(auth)/register/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] space-y-10 relative z-10"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/10 flex items-center justify-center text-primary shadow-[0_0_40px_rgba(6,182,212,0.15)] mb-8">
            <UserPlus size={32} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="cyber" className="text-[9px] font-black uppercase tracking-[0.3em] h-5 px-3">Pendaftaran Akun</Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">OJS<span className="text-primary not-italic">DEF</span></h1>
          </div>
        </div>

        <Card className="glass-dark border-none overflow-hidden shadow-2xl">
          <div className="h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-50" />
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Informasi Akses</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            <p className="text-sm text-white/80 leading-relaxed">
              Pembuatan akun dilakukan oleh{" "}
              <span className="text-primary font-bold">Administrator OJSDef</span>.
            </p>
            <p className="text-sm text-muted-foreground/60 leading-relaxed">
              Hubungi admin institusi atau admin OJSDef untuk mendapatkan akses ke platform ini.
            </p>
          </CardContent>
        </Card>

        <Link
          href="/login"
          className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 hover:text-white transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-2 transition-transform" />
          Kembali ke Login
        </Link>
      </motion.div>
    </div>
  );
}
```

### 3c — Forgot-password page: replace form with informational message

- [ ] **Step 4: Overwrite forgot-password/page.tsx**

```tsx
// app/(auth)/forgot-password/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] space-y-10 relative z-10"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/10 flex items-center justify-center text-primary shadow-[0_0_40px_rgba(6,182,212,0.15)] mb-8">
            <KeyRound size={32} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="cyber" className="text-[9px] font-black uppercase tracking-[0.3em] h-5 px-3">Reset Password</Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">OJS<span className="text-primary not-italic">DEF</span></h1>
          </div>
        </div>

        <Card className="glass-dark border-none overflow-hidden shadow-2xl">
          <div className="h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-50" />
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Informasi Reset Password</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            <p className="text-sm text-white/80 leading-relaxed">
              Untuk reset password, hubungi{" "}
              <span className="text-primary font-bold">SaaS Administrator OJSDef</span> Anda.
            </p>
            <p className="text-sm text-muted-foreground/60 leading-relaxed">
              Administrator akan membantu proses reset password akun Anda secara manual.
            </p>
          </CardContent>
        </Card>

        <Link
          href="/login"
          className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 hover:text-white transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-2 transition-transform" />
          Kembali ke Login
        </Link>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 5: Verify visually**

Run `npm run dev`, navigate to:
- `/login` — confirm no "Register Here" and no "forgot password?" link
- `/register` — confirm info message, no form
- `/forgot-password` — confirm info message, no form

- [ ] **Step 6: Commit**

```bash
git add "app/(auth)/login/page.tsx" "app/(auth)/register/page.tsx" "app/(auth)/forgot-password/page.tsx"
git commit -m "fix: remove out-of-scope register/forgot-password per PRD MVP scope"
```

---

## Task 4: Add Hardcoded Users + Protect New Routes

**Files:**
- Modify: `lib/auth.ts`
- Modify: `lib/auth.config.ts`

- [ ] **Step 1: Add 2 hardcoded users to lib/auth.ts**

In the `authorize` function, replace the single `if` block:

```typescript
// BEFORE:
if (email === "admin@ojsdef.com" && password === "password123") {
  return {
    id: "saas-admin-01",
    name: "OJSDef Security Admin",
    email: "admin@ojsdef.com",
    role: "saas_admin",
  };
}
return null;
```

```typescript
// AFTER:
const MOCK_USERS = [
  { id: "admin-ojs-01", name: "Admin Universitas Brawijaya", email: "admin@ub.ac.id", password: "admin123", role: "admin_ojs" },
  { id: "it-admin-01", name: "Tim IT Universitas Brawijaya", email: "it@ub.ac.id", password: "admin123", role: "it_admin" },
  { id: "saas-admin-01", name: "OJSDef Administrator", email: "admin@ojsdef.com", password: "password123", role: "saas_admin" },
]

const found = MOCK_USERS.find((u) => u.email === email && u.password === password)
if (found) {
  return { id: found.id, name: found.name, email: found.email, role: found.role }
}
return null
```

- [ ] **Step 2: Add /targets to protected routes in lib/auth.config.ts**

Find `isInternalRoute` and add `/targets`:

```typescript
// Add one line to the existing isInternalRoute assignment:
const isInternalRoute = 
  nextUrl.pathname.startsWith("/dashboard") || 
  nextUrl.pathname.startsWith("/scanning") ||
  nextUrl.pathname.startsWith("/scan-management") ||
  nextUrl.pathname.startsWith("/add-target") ||
  nextUrl.pathname.startsWith("/targets") ||      // ADD THIS LINE
  nextUrl.pathname.startsWith("/risk-scoring") ||
  nextUrl.pathname.startsWith("/export") ||
  nextUrl.pathname.startsWith("/vulnerability-report");
```

- [ ] **Step 3: Verify login with each user**

Run `npm run dev`:
- `admin@ub.ac.id` / `admin123` → redirects to `/dashboard`
- `it@ub.ac.id` / `admin123` → redirects to `/dashboard`
- `admin@ojsdef.com` / `password123` → redirects to `/dashboard`

- [ ] **Step 4: Commit**

```bash
git add lib/auth.ts lib/auth.config.ts
git commit -m "feat: add 3 hardcoded prototype users (admin_ojs, it_admin, saas_admin)"
```

---

## Task 5: Rebuild Dashboard Page

**Files:**
- Modify: `app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Update table heading from "Live Engine Operations" to "Scan Terbaru"**

```tsx
// BEFORE:
<h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
  Live Engine Operations
```
```tsx
// AFTER:
<h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
  Scan Terbaru
```

Also update the subtitle:
```tsx
// BEFORE:
<p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Real-time scan intelligence feed</p>
// AFTER:
<p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Riwayat pemindaian OJS terbaru</p>
```

- [ ] **Step 2: Update table header columns**

```tsx
// BEFORE:
<th ...>Target Instance</th>
<th ...>Protocol</th>
<th ...>Risk Level</th>
<th ...>Threats</th>
<th ...>Status</th>
```
```tsx
// AFTER:
<th ...>URL OJS</th>
<th ...>Jenis Audit</th>
<th ...>Tingkat Risiko</th>
<th ...>Temuan</th>
<th ...>Status</th>
```

- [ ] **Step 3: Update table row data bindings**

In the first `<td>` of each row, replace `scan.node` with `scan.institutionName`:
```tsx
// BEFORE:
<span className="text-[9px] text-muted-foreground mt-1 font-mono uppercase tracking-widest">{scan.node}</span>
// AFTER:
<span className="text-[9px] text-muted-foreground mt-1 font-mono uppercase tracking-widest">{scan.institutionName}</span>
```

In the scan type `<td>`, remove the `.split(" ")[0]`:
```tsx
// BEFORE:
{scan.type.split(" ")[0]}
// AFTER:
{scan.scanType}
```

Add a status label map above the return statement and use it in the status `<td>`:
```tsx
// Add before the return:
const SCAN_STATUS_LABEL: Record<string, string> = {
  Completed: "Selesai",
  "In Progress": "Berjalan",
  Failed: "Gagal",
}

// In the status <td>, replace {scan.status} with:
{SCAN_STATUS_LABEL[scan.status] ?? scan.status}
```

- [ ] **Step 4: Replace the 3 Quick Insights widgets**

Find the "QUICK INSIGHTS SECTION" and replace the array:

```tsx
// BEFORE:
{ title: "Engine Throughput", value: "18.4 MS", sub: "+2.4% Optimal", icon: Zap, color: "text-secondary" },
{ title: "Vulnerability Database", value: "STABLE", sub: "Last Synced: 2m ago", icon: ShieldCheck, color: "text-primary" },
{ title: "Network Latency", value: "42 MS", sub: "EU-WEST-1 Active", icon: GlobeIcon, color: "text-cyan-400" },
```
```tsx
// AFTER:
{ title: "Status Plugin", value: "2 / 3", sub: "Target terhubung ke plugin", icon: Zap, color: "text-secondary" },
{ title: "Database CVE", value: "Terbaru", sub: "Diperbarui 2 jam lalu", icon: ShieldCheck, color: "text-primary" },
{ title: "Target OJS", value: "3 Aktif", sub: "1 target perlu perhatian", icon: ShieldAlert, color: "text-cyan-400" },
```

Add `ShieldAlert` to the lucide-react import if missing. Delete the `GlobeIcon` function at the bottom of the file.

- [ ] **Step 5: Verify visually**

Run `npm run dev`, navigate to `/dashboard`:
- Table header: URL OJS / Jenis Audit / Tingkat Risiko / Temuan / Status
- Rows: Indonesian institution names, "Audit Lengkap", status "Selesai"/"Berjalan"
- Bottom 3 cards: Status Plugin / Database CVE / Target OJS

- [ ] **Step 6: Commit**

```bash
git add "app/(dashboard)/dashboard/page.tsx"
git commit -m "feat: rebuild dashboard with OJS labels and Bahasa Indonesia"
```

---

## Task 6: Rebuild Add Target → /targets/new + Redirect

**Files:**
- Create: `app/(dashboard)/targets/new/page.tsx`
- Modify: `app/(dashboard)/add-target/page.tsx`

### 6a — New Add Target page

- [ ] **Step 1: Create app/(dashboard)/targets/new/page.tsx**

```tsx
"use client";

import { Globe, Server, Cpu, ArrowRight, CheckCircle2, Link2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  institutionName: z.string().min(2, "Nama institusi wajib diisi"),
  ojsUrl: z.string().url("Masukkan URL yang valid (contoh: https://journal.example.ac.id)"),
  scanType: z.enum(["internal", "external", "full_audit"]),
})

type FormValues = z.infer<typeof formSchema>

const SCAN_TYPES = [
  { id: "internal" as const, title: "Audit Internal", desc: "Pemindaian dari dalam via plugin PHP", time: "5–10 menit", icon: Server },
  { id: "external" as const, title: "Audit Eksternal", desc: "Pemindaian dari luar via bot OJSDef", time: "10–15 menit", icon: Globe },
  { id: "full_audit" as const, title: "Audit Lengkap", desc: "Internal + Eksternal bersamaan", time: "15–20 menit", icon: Cpu },
]

export default function NewTargetPage() {
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { institutionName: "", ojsUrl: "", scanType: "internal" },
  })

  const onSubmit = (_values: FormValues) => {
    // Mock: redirect to domain verification for demo target
    router.push("/targets/target_01/verify")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
          <Badge variant="cyber" className="h-6 px-3 tracking-[0.2em] uppercase text-[9px] font-black">Tambah Target</Badge>
        </motion.div>

        <motion.h1
          className="text-5xl font-black tracking-tighter text-white"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          Tambah Target <span className="text-secondary">OJS</span>
        </motion.h1>

        <motion.p
          className="text-muted-foreground text-lg font-medium max-w-xl"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          Daftarkan instalasi OJS baru untuk dipantau dan diaudit secara berkala.
        </motion.p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="glass border-none h-full">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Link2 size={18} className="text-primary" /> Identifikasi Target
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="institutionName"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/50 px-1">Nama Institusi / Label</FormLabel>
                          <FormControl>
                            <Input placeholder="Universitas Brawijaya" className="h-12 bg-white/3 border-white/5 rounded-2xl px-5 text-sm font-mono focus:border-secondary/30 focus:ring-0 placeholder:text-muted-foreground/30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ojsUrl"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/50 px-1">URL Instalasi OJS</FormLabel>
                          <FormControl>
                            <div className="relative group/input">
                              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-secondary transition-colors" />
                              <Input placeholder="https://journal.example.ac.id" className="h-12 bg-white/3 border-white/5 rounded-2xl pl-12 pr-5 text-sm font-mono focus:border-secondary/30 focus:ring-0 placeholder:text-muted-foreground/30" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="glass-dark border-none h-full flex flex-col justify-between">
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Langkah Selanjutnya</h3>
                  <div className="space-y-6">
                    {["Verifikasi kepemilikan domain OJS", "Instalasi plugin OJSDef ke server", "Mulai pemindaian pertama"].map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0 text-xs font-black">{i + 1}</div>
                        <div className="flex items-center"><p className="text-xs font-bold text-white">{step}</p></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <div className="p-8 border-t border-white/5 bg-secondary/5">
                  <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-[0_0_30px_rgba(0,230,153,0.15)] group">
                    <span className="flex items-center gap-3">
                      Lanjut ke Verifikasi Domain <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>

          <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <CheckCircle2 size={20} className="text-secondary" /> Pilih Jenis Audit
            </h3>
            <FormField
              control={form.control}
              name="scanType"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {SCAN_TYPES.map((type) => (
                        <FormItem key={type.id} className="space-y-0">
                          <FormControl>
                            <RadioGroupItem value={type.id} className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col h-full glass-dark rounded-2xl p-6 cursor-pointer border border-transparent peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-secondary/5 hover:border-white/10 transition-all">
                            <div className="flex justify-between items-start mb-6">
                              <div className="w-10 h-10 rounded-xl bg-white/3 flex items-center justify-center text-muted-foreground">
                                <type.icon size={20} />
                              </div>
                              <span className="text-[10px] font-black font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded">{type.time}</span>
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white mb-2 block">{type.title}</span>
                            <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold uppercase tracking-wider">{type.desc}</p>
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
          </motion.div>
        </form>
      </Form>
    </div>
  )
}
```

### 6b — Redirect old /add-target

- [ ] **Step 2: Replace add-target/page.tsx with a redirect**

```tsx
// app/(dashboard)/add-target/page.tsx
import { redirect } from "next/navigation";

export default function AddTargetRedirectPage() {
  redirect("/targets/new");
}
```

- [ ] **Step 3: Verify visually**

- `/targets/new` → "Tambah Target OJS" heading, 3 scan type cards (Audit Internal, Audit Eksternal, Audit Lengkap)
- `/add-target` → immediately redirects to `/targets/new`
- Submit form → redirects to `/targets/target_01/verify`

- [ ] **Step 4: Commit**

```bash
git add "app/(dashboard)/targets/new/page.tsx" "app/(dashboard)/add-target/page.tsx"
git commit -m "feat: /targets/new with OJS scan types, redirect from /add-target"
```

---

## Task 7: Fix Landing Page

**Files:**
- Modify: `app/page.tsx`

Two issues: (1) `PricingCard` is called but never defined; `FeatureCard` is used in its place. (2) Copy references generic enterprise/CI-CD concepts.

- [ ] **Step 1: Fix the FeatureCard function signature**

The current `FeatureCard` at the bottom of `app/page.tsx` has a broken type annotation that includes pricing-related props, plus it references `onHover` and `isActive` in JSX without destructuring them. Replace the entire `FeatureCard` function:

```tsx
// REPLACE existing FeatureCard function with:
function FeatureCard({
  icon,
  title,
  desc,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="p-10 rounded-[40px] glass-dark border border-white/5 relative overflow-hidden flex flex-col h-full hover:-translate-y-2 transition-all duration-500"
    >
      <div className="w-16 h-16 rounded-[24px] bg-primary/10 text-primary flex items-center justify-center mb-12 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-6 uppercase tracking-tight text-white italic">{title}</h3>
      <p className="text-lg text-muted-foreground/60 leading-relaxed font-medium">{desc}</p>
    </motion.div>
  );
}
```

- [ ] **Step 2: Add PricingCard function after FeatureCard**

```tsx
// ADD after FeatureCard:
function PricingCard({
  title, price, period, desc, features, isActive, onHover, delay,
}: {
  title: string; price: string; period: string; desc: string;
  features: string[]; isActive?: boolean; onHover: () => void; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      onMouseEnter={onHover}
      className={`p-10 rounded-[40px] glass-dark border cursor-pointer ${isActive ? "border-primary/50 shadow-[0_0_40px_rgba(6,182,212,0.15)] bg-slate-900/60" : "border-white/5"} relative overflow-hidden flex flex-col h-full hover:-translate-y-2 transition-all duration-500`}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-4">{title}</p>
      <div className="flex items-end gap-1 mb-2">
        <span className="text-5xl font-black text-white">{price}</span>
        <span className="text-sm text-muted-foreground/60 mb-2 font-black uppercase">{period}</span>
      </div>
      <p className="text-muted-foreground/60 text-sm mb-8">{desc}</p>
      <ul className="space-y-3 mt-auto">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-sm text-white/70">
            <CheckCircle2 size={14} className="text-primary shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
```

Add `CheckCircle2` to the lucide-react import at the top if not already there.

- [ ] **Step 3: Fix the pricing grid — replace the 2 FeatureCard usages with PricingCard**

Find the pricing grid (the two `FeatureCard` blocks after the first `PricingCard`) and replace them:

```tsx
// REPLACE both FeatureCard blocks in the pricing grid with:
<PricingCard
  title="Cyber_Pro"
  price="$49"
  period="/MONTH"
  desc="Untuk institusi dengan beberapa jurnal OJS aktif."
  features={[
    "Semua fitur Starter",
    "Audit Internal + Eksternal",
    "Risk Scoring berbasis CVSS v3",
    "Laporan PDF Bahasa Indonesia",
  ]}
  isActive={hoveredPricing === "Cyber_Pro"}
  onHover={() => setHoveredPricing("Cyber_Pro")}
  delay={0.2}
/>

<PricingCard
  title="Enterprise"
  price="Custom"
  period="/YEAR"
  desc="Untuk perguruan tinggi dengan puluhan instalasi OJS."
  features={[
    "Semua fitur Cyber_Pro",
    "Multi-target tak terbatas",
    "Notifikasi Telegram & Email",
    "Dukungan teknis prioritas",
  ]}
  isActive={hoveredPricing === "Enterprise"}
  onHover={() => setHoveredPricing("Enterprise")}
  delay={0.3}
/>
```

- [ ] **Step 4: Update hero paragraph**

```tsx
// BEFORE:
<p className="text-xl text-muted-foreground/60 leading-relaxed max-w-[600px] mb-12 font-medium">
  Automated vulnerability detection, real-time risk scoring, and
  comprehensive security reports for enterprise-grade protection.
</p>
```
```tsx
// AFTER:
<p className="text-xl text-muted-foreground/60 leading-relaxed max-w-[600px] mb-12 font-medium">
  Lindungi instalasi OJS Anda dari penyusupan konten ilegal, defacement, dan
  eksploitasi kerentanan dengan audit dua arah berbasis CVSS v3.
</p>
```

- [ ] **Step 5: Update 3 feature cards**

```tsx
// BEFORE:
<FeatureCard icon={<Shield size={24} />} title="Enterprise_Stability" desc="Ensure continuous protection with our 99.9% uptime SLA, designed for mission-critical infrastructure." delay={0.1} />
<FeatureCard icon={<Zap size={24} />} title="Rapid_Triage" desc="Speed up your security response with actionable insights and automated patching recommendations." delay={0.2} />
<FeatureCard icon={<Puzzle size={24} />} title="Neural_Integration" desc="Easy to set up and scale. Integrates effortlessly with existing CI/CD pipelines and deployment workflows." delay={0.3} />
```
```tsx
// AFTER:
<FeatureCard icon={<Shield size={24} />} title="Audit Dua Arah" desc="Pemindaian internal via plugin PHP sekaligus audit eksternal via bot OJSDef untuk deteksi komprehensif." delay={0.1} />
<FeatureCard icon={<Zap size={24} />} title="Risk Scoring CVSS v3" desc="Setiap temuan dinilai dengan standar CVSS v3 untuk prioritas perbaikan yang akurat dan terstruktur." delay={0.2} />
<FeatureCard icon={<Activity size={24} />} title="Laporan PDF Bahasa Indonesia" desc="Laporan audit lengkap dan panduan perbaikan dalam Bahasa Indonesia, siap dibagikan ke manajemen." delay={0.3} />
```

Add `Activity` to the lucide-react import and remove `Puzzle`.

- [ ] **Step 6: Verify visually**

Navigate to `http://localhost:3000`:
- Pricing grid: 3 matching cards with hover interaction — Starter_Node, Cyber_Pro, Enterprise
- Hero: text "Lindungi instalasi OJS Anda..."
- Features: 3 OJS-domain cards

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx
git commit -m "fix: pricing section bug + update landing page copy to OJS domain"
```

---

## Task 8: Create Targets List Page

**Files:**
- Create: `app/(dashboard)/targets/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
"use client";

import Link from "next/link";
import { Plus, ExternalLink, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_OJS_TARGETS } from "@/lib/mock-data";
import type { PluginStatus } from "@/types/ojsdef";
import { cn } from "@/lib/utils";

const PLUGIN_STATUS_CONFIG: Record<PluginStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  connected:       { label: "Terhubung",         color: "text-secondary",           icon: CheckCircle2 },
  disconnected:    { label: "Terputus",           color: "text-destructive",          icon: XCircle },
  error:           { label: "Error",              color: "text-warning",              icon: XCircle },
  never_connected: { label: "Belum Diverifikasi", color: "text-muted-foreground",     icon: Clock },
}

function getRiskColor(score: number | null): string {
  if (score === null) return "text-muted-foreground"
  if (score >= 80) return "text-destructive"
  if (score >= 60) return "text-orange-400"
  if (score >= 40) return "text-warning"
  return "text-secondary"
}

export default function TargetsPage() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
            Daftar Target <span className="text-primary">OJS</span>
          </h1>
          <p className="text-muted-foreground/60 text-sm mt-1">{MOCK_OJS_TARGETS.length} instalasi OJS terdaftar</p>
        </div>
        <Link href="/targets/new">
          <Button className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:scale-105 transition-transform gap-2">
            <Plus size={16} /> Tambah Target
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {MOCK_OJS_TARGETS.map((target, i) => {
          const statusCfg = PLUGIN_STATUS_CONFIG[target.pluginStatus]
          const StatusIcon = statusCfg.icon

          return (
            <motion.div key={target.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-dark border border-transparent hover:border-white/10 transition-all h-full">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{target.institutionName}</p>
                      <p className="text-[10px] font-mono text-muted-foreground/50 mt-0.5">{target.url}</p>
                    </div>
                    <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest border-white/10", statusCfg.color)}>
                      <StatusIcon size={10} className="mr-1" />
                      {statusCfg.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/3 rounded-xl p-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Skor Risiko</p>
                      <p className={cn("text-xl font-black", getRiskColor(target.lastRiskScore))}>
                        {target.lastRiskScore ?? "—"}
                      </p>
                    </div>
                    <div className="bg-white/3 rounded-xl p-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Versi OJS</p>
                      <p className="text-xs font-mono text-white/80">{target.ojsVersion ?? "?"}</p>
                    </div>
                  </div>

                  <p className="text-[9px] text-muted-foreground/30 font-mono">
                    Scan terakhir: {target.lastScanAt ?? "Belum pernah"}
                  </p>

                  <div className="flex gap-2 mt-auto pt-2 border-t border-white/5">
                    <Link href={`/targets/${target.id}/verify`} className="flex-1">
                      <Button variant="outline" className="w-full h-9 text-[9px] font-black uppercase tracking-widest border-white/5 rounded-xl hover:bg-white/5">
                        Detail
                      </Button>
                    </Link>
                    <Button variant="outline" className="h-9 px-3 border-white/5 rounded-xl hover:bg-white/5 text-muted-foreground">
                      <RefreshCw size={14} />
                    </Button>
                    <a href={`https://${target.url}`} target="_blank" rel="noreferrer">
                      <Button variant="outline" className="h-9 px-3 border-white/5 rounded-xl hover:bg-white/5 text-muted-foreground">
                        <ExternalLink size={14} />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify visually**

Navigate to `/targets`:
- 3 cards: UB (Terhubung, score 72), FKUI (Terhubung, score 45), ITS (Terputus, score 88)
- "Tambah Target" button links to `/targets/new`

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/targets/page.tsx"
git commit -m "feat: Daftar Target OJS page at /targets"
```

---

## Task 9: Create Domain Verification Page

**Files:**
- Create: `app/(dashboard)/targets/[id]/verify/page.tsx`

- [ ] **Step 1: Create the verify page**

```tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, FileText, Globe, ArrowRight, Loader2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_OJS_TARGETS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type VerifyMethod = "file" | "dns"
type VerifyStep = 1 | 2 | 3
type VerifyResult = "success" | "fail" | null

const STEPS = ["Pilih Metode", "Instruksi", "Verifikasi"]

export default function VerifyPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const target = MOCK_OJS_TARGETS.find((t) => t.id === id) ?? MOCK_OJS_TARGETS[0]

  const [step, setStep] = useState<VerifyStep>(1)
  const [method, setMethod] = useState<VerifyMethod | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<VerifyResult>(null)

  const handleCheck = async () => {
    setIsChecking(true)
    setResult(null)
    await new Promise((r) => setTimeout(r, 2000))
    setIsChecking(false)
    setResult("success")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <div>
        <Badge variant="cyber" className="h-6 px-3 tracking-[0.2em] uppercase text-[9px] font-black mb-4">Domain Verification</Badge>
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
          Verifikasi <span className="text-primary">Domain</span>
        </h1>
        <p className="text-muted-foreground/60 text-sm mt-1 font-mono">{target.url}</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center">
        {STEPS.map((label, i) => {
          const stepNum = (i + 1) as VerifyStep
          const isDone = step > stepNum
          const isActive = step === stepNum
          return (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all", isDone ? "bg-secondary text-black" : isActive ? "bg-primary text-black" : "bg-white/5 text-muted-foreground")}>
                  {isDone ? <CheckCircle2 size={14} /> : stepNum}
                </div>
                <span className={cn("text-[9px] font-black uppercase tracking-widest text-center", isActive ? "text-primary" : "text-muted-foreground/40")}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={cn("h-px flex-1 mx-2 mb-5", step > stepNum ? "bg-secondary" : "bg-white/5")} />}
            </div>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="glass-dark border-none">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Pilih Metode Verifikasi</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: "file" as VerifyMethod, icon: FileText, title: "Upload File Token", desc: "Upload file token ke direktori root OJS Anda" },
                    { id: "dns" as VerifyMethod, icon: Globe, title: "DNS TXT Record", desc: "Tambahkan TXT record ke konfigurasi DNS domain" },
                  ].map((m) => (
                    <button key={m.id} onClick={() => setMethod(m.id)} className={cn("p-5 rounded-2xl border text-left transition-all", method === m.id ? "border-primary/50 bg-primary/5" : "border-white/5 bg-white/2 hover:border-white/10")}>
                      <m.icon size={20} className={cn("mb-3", method === m.id ? "text-primary" : "text-muted-foreground/40")} />
                      <p className="text-xs font-black text-white uppercase tracking-wide">{m.title}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1">{m.desc}</p>
                    </button>
                  ))}
                </div>
                <Button className="w-full h-12 rounded-2xl font-black uppercase text-xs tracking-widest gap-2" disabled={!method} onClick={() => setStep(2)}>
                  Lanjut <ArrowRight size={16} />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="glass-dark border-none">
              <CardContent className="p-6 space-y-5">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/60">
                  Instruksi — {method === "file" ? "Upload File Token" : "DNS TXT Record"}
                </h3>
                <ol className="space-y-4">
                  {(method === "file"
                    ? [
                        `Unduh file token verifikasi: ojsdef-verify-${target.id}.txt`,
                        `Upload file tersebut ke direktori root OJS Anda`,
                        `Pastikan file dapat diakses di: https://${target.url}/ojsdef-verify-${target.id}.txt`,
                        `Klik "Periksa Sekarang" setelah file berhasil diupload`,
                      ]
                    : [
                        `Buka panel manajemen DNS domain ${target.url}`,
                        `Tambahkan TXT record baru dengan nilai: ojsdef-verify=${target.id}-abc123`,
                        `Propagasi DNS memerlukan waktu 5–30 menit`,
                        `Klik "Periksa Sekarang" setelah TXT record aktif`,
                      ]
                  ).map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                      <p className="text-sm text-white/70">{s}</p>
                    </li>
                  ))}
                </ol>
                <Button className="w-full h-12 rounded-2xl font-black uppercase text-xs tracking-widest gap-2" onClick={() => setStep(3)}>
                  Saya Sudah Selesai <ArrowRight size={16} />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="glass-dark border-none">
              <CardContent className="p-6 space-y-5">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Verifikasi Domain</h3>
                <p className="text-sm text-white/70">
                  Klik tombol di bawah untuk memverifikasi kepemilikan domain <span className="text-primary font-mono">{target.url}</span>.
                </p>

                {result === "success" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/10 border border-secondary/20">
                    <CheckCircle2 size={18} className="text-secondary" />
                    <div>
                      <p className="text-xs font-black text-secondary uppercase tracking-wide">Verifikasi Berhasil</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">Domain berhasil diverifikasi. Lanjutkan ke instalasi plugin.</p>
                    </div>
                  </motion.div>
                )}

                {result === "fail" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
                    <XCircle size={18} className="text-destructive" />
                    <div>
                      <p className="text-xs font-black text-destructive uppercase tracking-wide">Verifikasi Gagal</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">Token tidak ditemukan. Periksa kembali langkah instruksi.</p>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 h-12 rounded-2xl font-black uppercase text-xs tracking-widest border-white/5" onClick={() => setStep(2)} disabled={isChecking}>Kembali</Button>
                  <Button className="flex-1 h-12 rounded-2xl font-black uppercase text-xs tracking-widest gap-2" onClick={handleCheck} disabled={isChecking}>
                    {isChecking ? <><Loader2 size={16} className="animate-spin" /> Memeriksa...</> : "Periksa Sekarang"}
                  </Button>
                </div>

                {result === "success" && (
                  <Button className="w-full h-12 rounded-2xl bg-secondary text-black font-black uppercase text-xs tracking-widest gap-2" onClick={() => router.push(`/targets/${target.id}/plugin-guide`)}>
                    Lanjut ke Instalasi Plugin <ArrowRight size={16} />
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 2: Verify visually**

Navigate to `/targets/target_01/verify`:
- Step 1: 2 method cards, "Lanjut" disabled until selection
- Step 2: numbered instructions for chosen method
- Step 3: button → 2s loading → success → "Lanjut ke Instalasi Plugin" button

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/targets/[id]/verify/page.tsx"
git commit -m "feat: Domain Verification page (3-step flow)"
```

---

## Task 10: Create Plugin Installation Guide

**Files:**
- Create: `app/(dashboard)/targets/[id]/plugin-guide/page.tsx`

- [ ] **Step 1: Create the plugin guide page**

```tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Upload, Key, Wifi, CheckCircle2, Loader2, XCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_OJS_TARGETS } from "@/lib/mock-data";

const API_KEY_MOCK = "ojsdef-ak-7f3a91bc2e4d5f6a8b0c"

export default function PluginGuidePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const target = MOCK_OJS_TARGETS.find((t) => t.id === id) ?? MOCK_OJS_TARGETS[0]

  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<"connected" | "disconnected" | null>(null)

  const handleCheck = async () => {
    setIsChecking(true)
    setResult(null)
    await new Promise((r) => setTimeout(r, 2000))
    setIsChecking(false)
    setResult("connected")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <div>
        <Badge variant="cyber" className="h-6 px-3 tracking-[0.2em] uppercase text-[9px] font-black mb-4">Plugin Guide</Badge>
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
          Instalasi <span className="text-primary">Plugin OJSDef</span>
        </h1>
        <p className="text-muted-foreground/60 text-sm mt-1 font-mono">{target.url}</p>
      </div>

      <div className="space-y-4">
        {[
          {
            num: 1, icon: Download, title: "Unduh Plugin",
            content: (
              <div className="space-y-3">
                <p className="text-sm text-white/70">Unduh file plugin OJSDef untuk versi OJS Anda.</p>
                <Button variant="outline" className="h-10 px-5 rounded-xl font-black uppercase text-xs tracking-widest border-white/10 gap-2">
                  <Download size={14} /> Unduh ojsdef-plugin-v1.2.zip
                </Button>
              </div>
            ),
          },
          {
            num: 2, icon: Upload, title: "Upload ke OJS",
            content: (
              <ol className="space-y-3">
                {["Login ke panel admin OJS Anda", "Buka Settings → Website → Plugins", "Klik tombol Upload Plugin", "Pilih file ojsdef-plugin-v1.2.zip", "Klik Install dan tunggu selesai", "Aktifkan plugin dengan klik Enable"].map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-white/70">
                    <span className="w-5 h-5 rounded-full bg-white/5 text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            ),
          },
          {
            num: 3, icon: Key, title: "Aktivasi & API Key",
            content: (
              <div className="space-y-4">
                <p className="text-sm text-white/70">Masukkan API Key berikut di halaman konfigurasi plugin OJSDef:</p>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-black/40 border border-white/5">
                  <code className="text-primary font-mono text-xs flex-1 break-all">{API_KEY_MOCK}</code>
                </div>
                <ol className="space-y-2">
                  {["Di panel admin OJS, buka Settings → Website → Plugins", "Klik Settings di samping plugin OJSDef", "Tempelkan API Key di atas ke kolom yang tersedia", "Klik Save"].map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm text-white/70">
                      <span className="w-5 h-5 rounded-full bg-white/5 text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            ),
          },
        ].map((s, i) => (
          <motion.div key={s.num} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-dark border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><s.icon size={18} /></div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Langkah {s.num}</p>
                    <h3 className="text-sm font-black text-white">{s.title}</h3>
                  </div>
                </div>
                {s.content}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Step 4: Verify Connection */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-dark border-none">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary"><Wifi size={18} /></div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Langkah 4</p>
                  <h3 className="text-sm font-black text-white">Verifikasi Koneksi</h3>
                </div>
              </div>

              <p className="text-sm text-white/70">Setelah mengisi API Key, klik tombol di bawah untuk memverifikasi koneksi antara OJSDef dan instalasi OJS Anda.</p>

              {result === "connected" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/10 border border-secondary/20">
                  <CheckCircle2 size={18} className="text-secondary" />
                  <div>
                    <p className="text-xs font-black text-secondary uppercase tracking-wide">Plugin Terhubung</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">Plugin OJSDef berhasil terhubung ke instalasi OJS Anda.</p>
                  </div>
                </motion.div>
              )}

              {result === "disconnected" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
                  <XCircle size={18} className="text-destructive" />
                  <div>
                    <p className="text-xs font-black text-destructive uppercase tracking-wide">Tidak Terhubung</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">Periksa kembali API Key dan pastikan plugin sudah aktif.</p>
                  </div>
                </motion.div>
              )}

              <Button className="w-full h-12 rounded-2xl font-black uppercase text-xs tracking-widest gap-2" onClick={handleCheck} disabled={isChecking}>
                {isChecking ? <><Loader2 size={16} className="animate-spin" /> Memeriksa...</> : <><Wifi size={16} /> Periksa Koneksi</>}
              </Button>

              {result === "connected" && (
                <Button className="w-full h-12 rounded-2xl bg-secondary text-black font-black uppercase text-xs tracking-widest gap-2" onClick={() => router.push("/targets")}>
                  Selesai — Kembali ke Daftar Target <ArrowRight size={16} />
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify visually**

Navigate to `/targets/target_01/plugin-guide`:
- 4 cards in order with step numbers
- API key displayed in step 3
- "Periksa Koneksi" → 2s loading → success → "Selesai" button → `/targets`

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/targets/[id]/plugin-guide/page.tsx"
git commit -m "feat: Plugin Installation Guide page (4-step)"
```

---

## Task 11: Add Action Plan Accordion to Vulnerability Report

**Files:**
- Modify: `app/(dashboard)/vulnerability-report/page.tsx`

- [ ] **Step 1: Add imports and state**

Add to the top of the file:
```tsx
import { useState } from "react";
import { ChevronDown, Clock, Wrench } from "lucide-react";
import React from "react";
```

Add state inside the component (before the return):
```tsx
const [expandedId, setExpandedId] = useState<string | null>(null)
```

- [ ] **Step 2: Replace the entire tbody content**

Replace the existing `{MOCK_VULNERABILITIES.map(...)}` in the tbody with:

```tsx
{MOCK_VULNERABILITIES.map((vuln, i) => (
  <React.Fragment key={vuln.id}>
    <motion.tr
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      className="border-b border-white/5 hover:bg-white/2 transition-colors group cursor-pointer"
      onClick={() => setExpandedId(expandedId === vuln.id ? null : vuln.id)}
    >
      <td className="py-7 px-6">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight">{vuln.name}</span>
          <div className="flex items-center gap-2">
            {vuln.cveId && <span className="text-[10px] font-mono text-muted-foreground/30 uppercase">{vuln.cveId}</span>}
            {vuln.cveId && <span className="w-1 h-1 rounded-full bg-white/10" />}
            <span className="text-[10px] font-mono text-muted-foreground/30 uppercase">
              {vuln.sourceType === "internal" ? "Audit Internal" : "Audit Eksternal"}
            </span>
          </div>
        </div>
      </td>
      <td className="py-7 px-6">
        <Badge
          variant={vuln.severity === "critical" ? "destructive" : vuln.severity === "high" ? "warning" : "cyber"}
          className="text-[9px] font-black uppercase tracking-widest h-6 px-3 rounded-lg border-none"
        >
          {vuln.severity === "critical" ? "Kritis" : vuln.severity === "high" ? "Berbahaya" : vuln.severity === "medium" ? "Perhatian" : "Aman"}
        </Badge>
      </td>
      <td className="py-7 px-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
          <span className="text-[11px] font-mono text-white/60 lowercase">{vuln.targetId}</span>
        </div>
      </td>
      <td className="py-7 px-6">
        <div className="flex items-center gap-2">
          {vuln.status === "Open" ? (
            <Activity size={12} className="text-destructive" />
          ) : (
            <CheckCircle2 size={12} className="text-secondary" />
          )}
          <span className={cn("text-[10px] font-black uppercase tracking-widest", vuln.status === "Open" ? "text-destructive" : "text-secondary")}>
            {vuln.status === "Open" ? "Terbuka" : "Selesai"}
          </span>
        </div>
      </td>
      <td className="py-7 px-6">
        <div className="flex items-center gap-4">
          <span className="text-xs font-black text-white font-mono w-6">{vuln.score.toFixed(1)}</span>
          <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${vuln.score * 10}%` }}
              className={cn("h-full rounded-full", vuln.score >= 9 ? "bg-destructive" : vuln.score >= 7 ? "bg-warning" : "bg-primary")}
            />
          </div>
        </div>
      </td>
      <td className="py-7 px-6 text-right">
        <ChevronDown size={16} className={cn("text-muted-foreground/30 transition-transform", expandedId === vuln.id ? "rotate-180 text-primary" : "")} />
      </td>
    </motion.tr>

    {expandedId === vuln.id && (
      <tr className="border-b border-white/5 bg-white/[0.01]">
        <td colSpan={6} className="px-6 py-6">
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Deskripsi</p>
            <p className="text-sm text-white/70 leading-relaxed">{vuln.description}</p>

            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 pt-2">Langkah Perbaikan</p>
            <div className="space-y-3">
              {vuln.actionPlan.map((step) => (
                <div key={step.step} className="flex gap-4 p-4 rounded-xl bg-white/3 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0">{step.step}</span>
                  <div className="flex-1">
                    <p className="text-sm text-white/80">{step.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                        <Clock size={10} /> {step.estimatedTime}
                      </span>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest flex items-center gap-1",
                        step.difficulty === "mudah" ? "text-secondary/70" : step.difficulty === "menengah" ? "text-warning/70" : "text-destructive/70"
                      )}>
                        <Wrench size={10} /> {step.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </td>
      </tr>
    )}
  </React.Fragment>
))}
```

- [ ] **Step 3: Update stats and advisory banner to OJS content**

Replace the Open_Issues stat value:
```tsx
// BEFORE: 128 <span ...>Findings</span>
// AFTER:
{MOCK_VULNERABILITIES.filter(v => v.status === "Open").length}{" "}
<span className="text-xs font-medium text-muted-foreground/40 uppercase tracking-normal">Temuan</span>
```

Replace the subtitle under Active_Detections:
```tsx
// BEFORE: Showing 10 of 128 items found in subnet 10.0.0.0/24
// AFTER: Menampilkan {MOCK_VULNERABILITIES.length} temuan dari seluruh target OJS terdaftar
```

Replace advisory banner heading and text:
```tsx
// BEFORE heading: Intelligence_Advisory
// AFTER heading: Rekomendasi Prioritas

// BEFORE text: Found 3 critical SQL injection vulnerabilities...
// AFTER:
Ditemukan{" "}
<span className="text-white font-black">1 temuan kritis</span> berupa konten judi online di{" "}
<span className="text-white font-black">journal.ub.ac.id</span>. Segera hapus artikel yang terkontaminasi dan ubah password semua akun admin.
```

- [ ] **Step 4: Verify visually**

Navigate to `/vulnerability-report`:
- Clicking any row expands accordion: description + numbered action steps with time/difficulty
- Severity badges show: Kritis/Berbahaya/Perhatian
- Open count matches mock data (6 open findings)

- [ ] **Step 5: Commit**

```bash
git add "app/(dashboard)/vulnerability-report/page.tsx"
git commit -m "feat: expandable Action Plan accordion in vulnerability report"
```

---

## Task 12: RBAC Sidebar

**Files:**
- Modify: `components/layout/Sidebar.tsx`
- Create: `app/(dashboard)/users/page.tsx`

### 12a — Rewrite Sidebar with RBAC

- [ ] **Step 1: Replace the entire Sidebar.tsx**

```tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard, ShieldAlert, Search, BarChart3,
  LogOut, Download, Terminal, Users, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import type { UserRole } from "@/types/ojsdef";

type NavItem = { name: string; href: string; icon: React.ElementType }

const BASE_NAV: NavItem[] = [
  { name: "Beranda",        href: "/dashboard",            icon: LayoutDashboard },
  { name: "Scan Aktif",     href: "/scanning",             icon: Search },
  { name: "Laporan Temuan", href: "/vulnerability-report", icon: ShieldAlert },
  { name: "Risk Scoring",   href: "/risk-scoring",         icon: BarChart3 },
  { name: "Target OJS",     href: "/targets",              icon: Globe },
  { name: "Ekspor",         href: "/export",               icon: Download },
]

const IT_ADMIN_NAV: NavItem[] = [...BASE_NAV, { name: "Log Teknis", href: "/scan-management", icon: Terminal }]
const SAAS_ADMIN_NAV: NavItem[] = [...IT_ADMIN_NAV, { name: "Kelola Pengguna", href: "/users", icon: Users }]

const ROLE_LABEL: Record<UserRole, string> = {
  admin_ojs:  "Admin OJS",
  it_admin:   "IT Admin",
  saas_admin: "SaaS Admin",
}

function getNavItems(role?: string): NavItem[] {
  if (role === "saas_admin") return SAAS_ADMIN_NAV
  if (role === "it_admin")   return IT_ADMIN_NAV
  return BASE_NAV
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const navigation = getNavItems(role)

  return (
    <aside className="w-[260px] border-r border-white/5 bg-neutral-950 flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="p-8">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
            <ShieldAlert size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white uppercase italic">
            OJS<span className="text-secondary">Def</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all group relative",
                isActive ? "text-secondary font-bold" : "text-muted-foreground hover:text-white hover:bg-white/2"
              )}
            >
              {isActive && <div className="absolute left-0 w-1 h-5 bg-secondary rounded-r-full shadow-[0_0_10px_rgba(0,230,153,0.5)]" />}
              <item.icon size={18} className={cn("transition-colors", isActive ? "text-secondary" : "text-muted-foreground group-hover:text-white")} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 mt-auto">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all text-left"
        >
          <LogOut size={18} />
          Sign Out
        </button>

        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-[10px] font-bold text-secondary border border-secondary/30">
              {session?.user?.name?.slice(0, 2).toUpperCase() ?? "AD"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{session?.user?.name ?? "Administrator"}</p>
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">
                {role ? ROLE_LABEL[role] : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
```

### 12b — Create /users placeholder page

- [ ] **Step 2: Create app/(dashboard)/users/page.tsx**

```tsx
export default function UsersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
        Kelola <span className="text-primary">Pengguna</span>
      </h1>
      <p className="text-muted-foreground/60 text-sm">Fitur ini akan tersedia di Fase 2.</p>
    </div>
  );
}
```

- [ ] **Step 3: Verify RBAC visually**

Run `npm run dev`:
1. Login `admin@ub.ac.id` / `admin123` → 6 nav items (no Log Teknis, no Kelola Pengguna)
2. Login `it@ub.ac.id` / `admin123` → 7 nav items (+ Log Teknis)
3. Login `admin@ojsdef.com` / `password123` → 8 nav items (+ Log Teknis + Kelola Pengguna)
4. User card shows correct name and role label (Admin OJS / IT Admin / SaaS Admin)

- [ ] **Step 4: Commit**

```bash
git add components/layout/Sidebar.tsx "app/(dashboard)/users/page.tsx"
git commit -m "feat: RBAC sidebar with 3 role levels + /users placeholder"
```

---

## Spec Coverage Checklist

| PRD/SRS Requirement | Task |
|---|---|
| Remove register/forgot-pw links from login (F-02, F-06) | Task 3 |
| /register → info message, not form | Task 3 |
| /forgot-password → info message, not form | Task 3 |
| Mock data — OJS institutions in Bahasa Indonesia | Task 2 |
| Mock data — OJS-specific vulnerabilities | Task 2 |
| Dashboard widgets: Status Plugin, Database CVE, Target OJS | Task 5 |
| Dashboard table: URL OJS / Jenis Audit / Tingkat Risiko / Temuan / Status | Task 5 |
| Risk labels: Kritis / Berbahaya / Perhatian / Aman | Task 5, 11 |
| Add Target → Tambah Target OJS (F-49 scan types) | Task 6 |
| Domain Verification flow 3-step (F-08) | Task 9 |
| Plugin Installation Guide 4-step (F-09) | Task 10 |
| Action Plan expandable accordion (F-36) | Task 11 |
| RBAC sidebar — 3 role levels (SRS 2.3) | Task 12 |
| 3 hardcoded users | Task 4 |
| TypeScript types | Task 1 |
| Landing page pricing bug | Task 7 |
| Landing page OJS copy | Task 7 |
| Targets list page | Task 8 |

---

*Plan generated 2026-05-18. Implements: `docs/superpowers/specs/2026-05-18-ojsdef-frontend-alignment-design.md`*
