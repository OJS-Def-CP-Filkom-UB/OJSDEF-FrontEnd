'use client'

import { useAuth } from '@/hooks/use-auth'
import { useAdminTenants } from '@/hooks/use-admin'
import { useTenantContext } from '@/lib/tenant-context'
import { Building2 } from 'lucide-react'

export function TenantSelector() {
  const { user } = useAuth()
  const { selectedTenantId, setSelectedTenantId } = useTenantContext()
  const { data: tenants } = useAdminTenants()

  if (user?.role !== 'saas_admin') return null

  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-2 mb-1.5">
        <Building2 className="h-3 w-3 text-slate-500" />
        <span className="text-slate-500 text-xs">Filter Tenant</span>
      </div>
      <select
        value={selectedTenantId ?? 'all'}
        onChange={(e) => setSelectedTenantId(e.target.value === 'all' ? null : e.target.value)}
        className="w-full h-8 bg-slate-900 border border-white/10 text-slate-300 text-xs rounded-md px-2"
        style={{ colorScheme: 'dark' }}
      >
        <option value="all" className="bg-slate-900 text-slate-300">Semua Tenant</option>
        {tenants?.map((t) => (
          <option key={t.id} value={t.id} className="bg-slate-900 text-slate-300">{t.name}</option>
        ))}
      </select>
    </div>
  )
}
