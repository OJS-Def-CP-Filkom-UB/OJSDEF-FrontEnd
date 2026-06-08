# OJSDef — Frontend Dashboard

Dashboard keamanan SaaS untuk platform **OJSDef**, dibangun dengan Next.js 16 App Router.

## Status

**Prototype** — Semua halaman UI sudah diimplementasikan dengan mock data. Integrasi ke backend FastAPI belum dilakukan (next phase).

## Tech Stack

- **Next.js 16.2.3** — App Router, React Server Components
- **React 19** + **TypeScript**
- **Tailwind CSS v4** — CSS-first config via `@theme {}` (bukan `tailwind.config.js`)
- **ShadCN UI** — komponen Radix-based di `components/ui/`
- **Framer Motion 12** — animasi halaman dan elemen interaktif
- **NextAuth v5 beta** — Credentials provider, JWT strategy
- **TanStack Query v5** — server state management
- **Zod + React Hook Form** — validasi form

## Commands

```bash
npm run dev      # Development server — http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
```

## Design System

**"Flat Deep Dark"** — dark mode dengan glassmorphism:

- Background: `#020617` (deep slate)
- Cards: class `glass-dark` atau `bg-slate-900/40 backdrop-blur-sm`
- Accent primary: Cyan (`text-primary`) — elemen interaktif
- Accent secondary: Green (`text-secondary`) — success states

## RBAC (Role-Based Access Control)

| Role | Akses |
|------|-------|
| `admin_ojs` | Dashboard, Target OJS, Mulai Scan, Log Teknis, Laporan, Export |
| `saas_admin` | Semua admin_ojs + Kelola Pengguna + Audit Log platform |
| `viewer` | Dashboard, Target OJS, Laporan, Export (read-only) |

## Struktur Halaman

```
app/
├── (auth)/login          — Login (satu-satunya auth entry point)
├── (dashboard)/
│   ├── dashboard         — Overview + Quick Insights
│   ├── targets/          — Daftar, tambah, detail, verifikasi, plugin guide
│   ├── scanning          — Live scan progress
│   ├── scan-management   — Log teknis (admin_ojs + saas_admin)
│   ├── vulnerability-report — Temuan + badge "Positif Palsu" + Action Plan
│   ├── risk-scoring      — Scoring matrix CVSS v3
│   ├── export            — Export laporan PDF
│   ├── users             — Kelola pengguna (saas_admin only)
│   └── audit-logs        — Audit log platform (saas_admin only)
```

## Dokumentasi

- `CLAUDE.md` — panduan pengembangan, tech stack, RBAC detail
- `AGENTS.md` — standar frontend, mock data, design system, development patterns
- `docs/OJSDef_SRS_v1.2.md` — spesifikasi kebutuhan sistem
- `docs/OJSDef_PRD_v1.2.md` — product requirements
