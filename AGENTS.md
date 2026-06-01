<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# OJSDef Frontend Standards

This document outlines the architectural and design standards for the OJSDef SaaS frontend to ensure consistency across the codebase.

OJSDef adalah SaaS untuk memindai keamanan instalasi OJS (Open Journal Systems). Semua teks UI, label, dan data mock menggunakan **Bahasa Indonesia**.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 (CSS-first configuration)
- **Animations**: Framer Motion
- **UI Components**: ShadCN UI (Radix-based)
- **State Management**: TanStack Query (Server State), Zustand (Client State - optional), Context API
- **Authentication**: NextAuth v5 (Auth.js) — Credentials provider, JWT strategy
- **Validation**: Zod + React Hook Form

## Directory Structure

```
app/
├── (auth)/
│   ├── login/page.tsx              — Login form (satu-satunya entry point auth untuk MVP)
│   ├── register/page.tsx           — Info page saja (tanpa form — post-MVP per PRD F-02)
│   └── forgot-password/page.tsx    — Info page saja (tanpa form — post-MVP per PRD F-06)
├── (dashboard)/
│   ├── dashboard/page.tsx          — Overview: tabel Scan Terbaru + 3 Quick Insights widget
│   ├── scanning/page.tsx           — Scan aktif / live + completion banner + "Lihat Laporan" CTA
│   ├── scan-management/page.tsx    — Log teknis (saas_admin + admin_ojs tenant sendiri)
│   ├── vulnerability-report/page.tsx — Laporan temuan + badge "Positif Palsu" + Action Plan accordion
│   ├── risk-scoring/page.tsx       — Risk scoring matrix
│   ├── export/page.tsx             — Ekspor laporan PDF
│   ├── change-password/page.tsx    — Ganti password
│   ├── targets/
│   │   ├── page.tsx                — Daftar semua target OJS terdaftar
│   │   ├── new/page.tsx            — Form tambah target OJS baru
│   │   └── [id]/
│   │       ├── page.tsx            — Detail target + plugin status card + action CTA berdasarkan status
│   │       ├── verify/page.tsx     — Verifikasi domain: tabs file+DNS, instruksi copy-paste
│   │       └── plugin-guide/page.tsx — Panduan instalasi plugin OJSDef (4-step)
│   ├── add-target/page.tsx         — Redirect ke /targets/new (jangan dihapus)
│   ├── users/page.tsx              — Kelola pengguna (saas_admin only) + tenant selector
│   └── audit-logs/page.tsx         — Audit log platform (saas_admin only) [BARU]
├── page.tsx                        — Landing page publik
components/
├── layout/
│   └── Sidebar.tsx                 — RBAC sidebar, nav items berdasarkan useSession().role
├── ui/                             — Atomic ShadCN components
lib/
├── mock-data.ts                    — Satu-satunya sumber data mock (domain OJS)
├── auth.ts                         — 3 hardcoded users untuk prototype
└── auth.config.ts                  — NextAuth config, JWT/session callbacks, route protection
types/
└── ojsdef.ts                       — OJS-domain TypeScript types (source of truth)
```

## Authentication & RBAC

**Prototype users (hardcoded di `lib/auth.ts`):**

| Email | Password | Role |
|-------|----------|------|
| `admin@ub.ac.id` | `admin123` | `admin_ojs` |
| `viewer@ub.ac.id` | `admin123` | `viewer` |
| `admin@ojsdef.com` | `password123` | `saas_admin` |

**Sidebar navigation per role (`components/layout/Sidebar.tsx`):**
- `viewer`: Beranda, Target OJS, Laporan Keamanan, Risk Scoring, Export Laporan (5 item — read-only)
- `admin_ojs`: semua viewer + Mulai Scan, Log Teknis (7 item)
- `saas_admin`: semua admin_ojs + Kelola Pengguna, Audit Log (9 item)

`session.user.role` diisi via JWT callback di `lib/auth.config.ts`. Gunakan `useSession()` dari `next-auth/react` untuk membaca role di client components.

## Mock Data (`lib/mock-data.ts`)

Import data hanya dari `lib/mock-data.ts`. Jangan buat data fiktif inline di halaman.

**Key exports:**
- `MOCK_OJS_TARGETS: OJSTarget[]` — 3 target OJS (Universitas Brawijaya, FKUI Jakarta, ITS Surabaya)
- `MOCK_FINDINGS: ScanFinding[]` — 7 temuan dengan `actionPlan[]` tiap temuan, semua Bahasa Indonesia
- `MOCK_VULNERABILITIES` — derived dari `MOCK_FINDINGS` (digunakan di vulnerability-report page)
- `MOCK_SCANS: ScanRow[]` — gunakan `scan.institutionName` dan `scan.scanType` (**bukan** `scan.node` atau `scan.type`)
- `MOCK_RISK_ITEMS`, `MOCK_SCAN_LOGS`, `MOCK_ACTIVE_SCANS`, `MOCK_SCAN_HISTORY`, `VULN_STATS`, `SYSTEM_HEALTH`

**TypeScript types (`types/ojsdef.ts`)** — import dari sini, jangan redefine:
- `OJSScanType`: `"internal" | "external" | "full_audit"`
- `PluginStatus`: `"connected" | "disconnected" | "error" | "never_connected"`
- `RiskLevel`: `"critical" | "high" | "medium" | "low"`
- `UserRole`: `"admin_ojs" | "saas_admin" | "viewer"`
- Interfaces: `OJSTarget`, `ScanFinding`, `ActionPlanStep`, `ScanSession`

## MVP Scope (PRD v1.2)

Halaman berikut **hanya menampilkan pesan info** — bukan form (post-MVP):
- `/register` — pesan: "Pembuatan akun dilakukan oleh Administrator OJSDef"
- `/forgot-password` — pesan: "Hubungi SaaS Administrator OJSDef Anda"

**Jangan** menambahkan form, input, atau link ke kedua halaman tersebut.

## Design System: "Flat Deep Dark"

Semua komponen harus mengikuti estetika dark ini:
- **Background**: Deep slate/black (`#020617`)
- **Cards**: class `glass-dark` (glassmorphism), atau `bg-slate-900/40 backdrop-blur-sm`
- **Borders**: `border-white/5` atau `border-border`
- **Accent primary**: Cyan (`text-primary`, `bg-primary`) — focus dan elemen interaktif
- **Accent secondary**: Green (`text-secondary`, `bg-secondary`) — success states dan active nav indicator
- **Micro-animations**: Framer Motion untuk page transitions dan hover effects

## Development Patterns

1. **Data**: Selalu gunakan `lib/mock-data.ts`. Jangan buat data fiktif inline di halaman.
2. **Types**: Import dari `@/types/ojsdef` — jangan redefine interface yang sudah ada.
3. **Forms**: Gunakan `FormField` dari `@/components/ui/form` dengan Zod schema.
4. **Icons**: Hanya gunakan `lucide-react`.
5. **Language**: Semua label UI, teks tombol, pesan error, dan data mock dalam **Bahasa Indonesia**.
6. **Severity labels**: Urutan PRD — **Kritis / Berbahaya / Perhatian / Aman** (bukan Critical/High/Medium/Low).
7. **New pages**: Sebelum membuat komponen baru, cek `components/shared` dan `components/ui` terlebih dahulu.
