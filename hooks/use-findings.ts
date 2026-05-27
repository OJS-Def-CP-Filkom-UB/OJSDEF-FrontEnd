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
    mutationFn: ({
      findingId,
      isFalsePositive,
    }: {
      findingId: string
      isFalsePositive: boolean
    }) =>
      api.patch(`/api/v1/scans/${jobId}/findings/${findingId}`, {
        is_false_positive: isFalsePositive,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['findings', jobId] }),
  })
}
