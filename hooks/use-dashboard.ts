import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DashboardStats } from '@/types/api'
import { useTenantContext } from '@/lib/tenant-context'

export function useDashboardStats() {
  const { selectedTenantId } = useTenantContext()
  return useQuery({
    queryKey: ['dashboard', selectedTenantId],
    queryFn: () =>
      api.get<DashboardStats>('/api/v1/dashboard/stats', {
        params: selectedTenantId ? { tenant_id: selectedTenantId } : {},
      }).then((r) => r.data),
  })
}
