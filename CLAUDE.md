# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Development server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
```

## Tech Stack (Actual)

- **Next.js 16.2.3** — App Router, React Server Components
- **React 19.2.4**
- **Tailwind CSS v4** — CSS-first config (no `tailwind.config.js`)
- **ShadCN UI** via `radix-ui` + `class-variance-authority`
- **Framer Motion 12** — animations
- **TanStack Query v5** — server state
- **NextAuth v5 beta.25** — Credentials provider, JWT strategy
- **Zod v4** + **React Hook Form v7** — form validation
- **Recharts v3** — charts
- **Axios v1** — HTTP client (for backend API calls)

## Architecture

### App Router Structure

Pages live under `app/` with two route groups:
- `(auth)/` — login, register, forgot-password (semua public)
- `(dashboard)/` — semua halaman yang butuh auth

Auth middleware di `lib/auth.config.ts` melindungi semua rute `/dashboard/*` dan `/targets/*`. Cookie JWT disimpan sebagai httpOnly.

### State Management

- **Server state**: TanStack Query — semua API calls ke backend FastAPI
- **Auth state**: NextAuth `useSession()` — jangan ambil role dari state lain
- **Client state**: Context API cukup untuk MVP (Zustand optional)

### Tailwind CSS v4

Config via `globals.css` menggunakan `@theme {}` block — **bukan** `tailwind.config.js`. Custom tokens (warna, radius) didefinisikan di CSS variables, bukan di config object.

### ShadCN Components

Install komponen baru: `npx shadcn add <component-name>`. Komponen masuk ke `components/ui/`. Jangan edit langsung file di `components/ui/` — buat wrapper di `components/shared/` jika butuh kustomisasi.

## Implemented Pages

```
app/
├── page.tsx                        — Landing page publik
├── (auth)/
│   ├── login/page.tsx              — Login form (satu-satunya entry point auth)
│   ├── register/page.tsx           — Info page (tanpa form — post-MVP per PRD)
│   └── forgot-password/page.tsx    — Info page (tanpa form — post-MVP per PRD)
└── (dashboard)/
    ├── dashboard/page.tsx          — Overview: tabel Scan Terbaru + Quick Insights
    ├── scanning/page.tsx           — Scan aktif / live
    ├── scan-management/page.tsx    — Log teknis (saas_admin saja)
    ├── vulnerability-report/page.tsx — Laporan temuan + Action Plan accordion
    ├── risk-scoring/page.tsx       — Risk scoring matrix
    ├── export/page.tsx             — Ekspor laporan PDF
    ├── change-password/page.tsx    — Ganti password
    ├── add-target/page.tsx         — Redirect ke /targets/new
    ├── users/page.tsx              — Kelola pengguna (saas_admin only)
    └── targets/
        ├── page.tsx                — Daftar semua target OJS
        ├── new/page.tsx            — Form tambah target OJS baru
        └── [id]/
            ├── page.tsx            — Detail target
            ├── verify/page.tsx     — Verifikasi domain (3-step flow)
            └── plugin-guide/page.tsx — Panduan instalasi plugin OJSDef (4-step)
```

## Current Status

Frontend telah diimplementasikan lengkap sesuai PRD MVP:
- Semua halaman dashboard tersedia dengan mock data dari `lib/mock-data.ts`
- RBAC sidebar per role (`admin_ojs`, `viewer`, `saas_admin`)
- Design system "Flat Deep Dark" dengan Framer Motion animations
- Auth flow via NextAuth v5 dengan 3 hardcoded users (prototype)

Lihat `AGENTS.md` untuk standar detail: mock data, TypeScript types, design system, dan development patterns.
Lihat `docs/superpowers/plans/2026-05-18-ojsdef-alignment.md` untuk rencana implementasi detail.
