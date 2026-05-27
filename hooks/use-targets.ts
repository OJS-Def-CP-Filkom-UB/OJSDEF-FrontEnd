import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { OJSTarget, CreateTargetRequest, VerifyTargetResponse, PluginGuideResponse } from '@/types/api'

export function useTargets() {
  return useQuery({
    queryKey: ['targets'],
    queryFn: () => api.get<OJSTarget[]>('/api/v1/targets').then((r) => r.data),
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
  return useMutation({
    mutationFn: (method: 'file' | 'dns') =>
      api
        .post<VerifyTargetResponse>(`/api/v1/targets/${targetId}/verify`, { method })
        .then((r) => r.data),
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
        .post<PluginGuideResponse>(
          `/api/v1/targets/${targetId}/plugin-guide/regenerate-key`
        )
        .then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['targets', targetId, 'plugin-guide'] }),
  })
}
