import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ScanFinding } from '@/types/api'

export function useFindings(jobId: string) {
  return useQuery({
    queryKey: ['findings', jobId],
    queryFn: () =>
      api.get<ScanFinding[]>(`/api/v1/scans/${jobId}/findings`).then((r) => r.data),
    enabled: !!jobId,
  })
}

export function useToggleFalsePositive(jobId: string) {
  const qc = useQueryClient()
  return useMutation({
    // API spec: PATCH tanpa body — backend toggle otomatis (false→true, true→false)
    mutationFn: (findingId: string) =>
      api.patch<ScanFinding>(`/api/v1/scans/${jobId}/findings/${findingId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['findings', jobId] }),
  })
}
