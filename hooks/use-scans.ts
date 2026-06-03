import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ScanJob, ScanType } from '@/types/api'

export function useScans(params?: { limit?: number }) {
  const limit = params?.limit
  return useQuery({
    queryKey: ['scans', { limit }],
    queryFn: () => {
      const url = limit ? `/api/v1/scans?limit=${limit}` : '/api/v1/scans'
      return api.get<ScanJob[]>(url).then((r) => r.data)
    },
  })
}

export function useScanJob(jobId: string) {
  return useQuery({
    queryKey: ['scans', jobId],
    queryFn: () => api.get<ScanJob>(`/api/v1/scans/${jobId}`).then((r) => r.data),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'running' || status === 'queued' ? 3000 : false
    },
  })
}

export function useStartScan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ targetId, scanType }: { targetId: string; scanType: ScanType }) =>
      api
        .post<ScanJob>('/api/v1/scans', { target_id: targetId, scan_type: scanType })
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scans'] }),
  })
}

export function useCancelScan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) =>
      api.post(`/api/v1/scans/${jobId}/cancel`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scans'] }),
  })
}

export function useRetryScan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ targetId, scanType }: { targetId: string; scanType: ScanType }) =>
      api
        .post<ScanJob>('/api/v1/scans', { target_id: targetId, scan_type: scanType })
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scans'] }),
  })
}
