import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { OJSTarget, CreateTargetRequest, VerifyTargetResponse, PluginGuideResponse } from '@/types/api'
import { useTenantContext } from '@/lib/tenant-context'

export function useTargets() {
  const { selectedTenantId } = useTenantContext()
  return useQuery({
    queryKey: ['targets', selectedTenantId],
    queryFn: () =>
      api.get<OJSTarget[]>('/api/v1/targets', {
        params: selectedTenantId ? { tenant_id: selectedTenantId } : {},
      }).then((r) => r.data),
  })
}

export function useTarget(id: string) {
  return useQuery({
    queryKey: ['targets', id],
    queryFn: () => api.get<OJSTarget>(`/api/v1/targets/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateTarget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTargetRequest) =>
      api.post<OJSTarget>('/api/v1/targets', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['targets'] }),
  })
}

export function useDeleteTarget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/targets/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['targets'] }),
  })
}

export function useVerifyTarget(targetId: string) {
  const qc = useQueryClient()
  return useMutation({
    // Backend mencoba file & DNS secara berurutan — tidak perlu kirim method di body
    mutationFn: () =>
      api
        .post<VerifyTargetResponse>(`/api/v1/targets/${targetId}/verify`)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['targets', targetId] })
      qc.invalidateQueries({ queryKey: ['targets'] })
    },
  })
}

export function usePluginGuide(targetId: string) {
  return useQuery({
    queryKey: ['targets', targetId, 'plugin-guide'],
    queryFn: () =>
      api
        .get<PluginGuideResponse>(`/api/v1/targets/${targetId}/plugin-guide`)
        .then((r) => r.data),
    enabled: !!targetId,
  })
}

export function useRegenerateApiKey(targetId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      api
        .post<{ api_key: string }>(`/api/v1/targets/${targetId}/regenerate-key`)
        .then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['targets', targetId, 'plugin-guide'] }),
  })
}
