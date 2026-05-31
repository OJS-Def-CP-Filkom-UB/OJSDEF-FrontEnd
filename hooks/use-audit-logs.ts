import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { AuditLogListResponse, AuditLogParams } from '@/types/api'

export function useAuditLogs(params: AuditLogParams = {}) {
  return useQuery<AuditLogListResponse>({
    queryKey: ['audit-logs', params],
    queryFn: () =>
      api.get<AuditLogListResponse>('/api/v1/audit-logs', { params }).then(r => r.data),
    staleTime: 30_000,
  })
}
