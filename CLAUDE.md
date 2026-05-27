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

## Current Status

Frontend baru di-bootstrap (Next.js 16 + dependencies). Halaman dan komponen belum dibuat — masih dalam tahap setup. Mock data dan TypeScript types akan menjadi fondasi development.

Lihat `docs/superpowers/plans/2026-05-18-ojsdef-alignment.md` untuk rencana implementasi detail.
