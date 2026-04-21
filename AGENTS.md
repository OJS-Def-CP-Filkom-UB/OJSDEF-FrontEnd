<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# OJSDef Frontend Standards

This document outlines the architectural and design standards for the OJSDef SaaS frontend to ensure consistency across the codebase.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 (CSS-first configuration)
- **Animations**: Framer Motion
- **UI Components**: ShadCN UI (Radix-based)
- **State Management**: TanStack Query (Server State), Zustand (Client State - optional), Context API
- **Authentication**: NextAuth v5 (Auth.js)
- **Validation**: Zod + React Hook Form

## Directory Structure
- `app/(auth)/`: Authentication pages (Login, Register).
- `app/(dashboard)/`: Internal SaaS dashboard pages.
- `components/layout/`: Shared layout pieces (Sidebar, Header).
- `components/ui/`: Atomic ShadCN components.
- `lib/mock-data.ts`: Centralized source of truth for all mock data and types.
- `types/`: Global TypeScript definitions.

## Design System: "Flat Deep Dark"
All components must adhere to the high-end dark aesthetic:
- **Background**: Deep slate/black (`#020617`).
- **Cards**: Solid dark backgrounds with glassmorphism touches (`bg-slate-900/40 backdrop-blur-sm`).
- **Borders**: Subtle, high-contrast borders (`border-white/5` or `border-border`).
- **Accent**: Use the primary cyan/primary theme color for focus and interactive elements.
- **Micro-animations**: Use Framer Motion for page transitions and hover effects.

## Development Patterns
1. **Data**: Always use `lib/mock-data.ts` during development to ensure consistent data structures.
2. **Forms**: Use `FormField` components from `@/components/ui/form` with Zod schemas.
3. **Icons**: Exclusively use `lucide-react` for iconography.
4. **Consistency**: Before creating a new component, check if a similar pattern exists in `components/shared` or `components/ui`.
