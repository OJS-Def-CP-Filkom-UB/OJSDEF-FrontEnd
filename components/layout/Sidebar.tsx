'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import {
  LayoutDashboard, Target, ScanLine, ShieldAlert, BarChart2,
  Download, FileText, Users, LogOut, ChevronRight, KeyRound, ClipboardList,
} from 'lucide-react'
import type { UserRole } from '@/types/api'
import { TenantSelector } from '@/components/shared/TenantSelector'

type NavItem = { label: string; href: string; icon: React.ElementType }

const BASE_NAV: NavItem[] = [
  { label: 'Beranda', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Target OJS', href: '/targets', icon: Target },
  { label: 'Laporan Keamanan', href: '/vulnerability-report', icon: ShieldAlert },
  { label: 'Risk Scoring', href: '/risk-scoring', icon: BarChart2 },
  { label: 'Export Laporan', href: '/export', icon: Download },
]

const SCAN_NAV: NavItem = { label: 'Mulai Scan', href: '/scanning', icon: ScanLine }
const LOG_NAV: NavItem = { label: 'Log Scan', href: '/scan-management', icon: FileText }
const USERS_NAV: NavItem = { label: 'Kelola Pengguna', href: '/users', icon: Users }
const AUDIT_NAV: NavItem = { label: 'Audit Log', href: '/audit-logs', icon: ClipboardList }

function getNavItems(role: UserRole): NavItem[] {
  if (role === 'viewer') return BASE_NAV
  if (role === 'admin_ojs') return [...BASE_NAV, SCAN_NAV, LOG_NAV]
  // saas_admin: tidak dapat memulai scan
  return [...BASE_NAV, LOG_NAV, USERS_NAV, AUDIT_NAV]
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()

  if (isLoading) {
    return (
      <aside className="w-64 flex-shrink-0 h-screen flex flex-col bg-slate-950 border-r border-white/5">
        <div className="px-6 py-5 border-b border-white/5">
          <div className="h-8 w-24 bg-slate-800 rounded animate-pulse" />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-800/60 rounded-lg animate-pulse" />
          ))}
        </nav>
      </aside>
    )
  }

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
          <Image src="/logo-OjsDef.webp" alt="OJSDef" loading='eager' width={32} height={32} className="h-8 w-8 object-contain" />
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

      {/* User info + aksi akun */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        <div className="px-3 py-2">
          <p className="text-white text-sm font-medium truncate">{user.full_name}</p>
          <p className="text-slate-500 text-xs truncate">{user.email}</p>
        </div>
        <TenantSelector />
        <Link
          href="/change-password"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
            pathname === '/change-password'
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <KeyRound className={`h-4 w-4 ${pathname === '/change-password' ? 'text-primary' : 'text-slate-500'}`} />
          Ganti Password
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="h-4 w-4 text-slate-500" />
          Keluar
        </button>
      </div>
    </aside>
  )
}
