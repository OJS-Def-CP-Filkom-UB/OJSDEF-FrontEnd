import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Report } from '@/types/api'

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: () => api.get<Report[]>('/api/v1/reports').then((r) => r.data),
  })
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: async (reportId: string) => {
      // Backend returns 302 redirect ke MinIO pre-signed URL.
      // Gunakan window.open agar browser mengikuti redirect langsung.
      if (typeof window !== 'undefined') {
        // Buka tab baru — browser akan mengikuti 302 dan mulai download.
        window.open(`/api/v1/reports/${reportId}/pdf`, '_blank')
      }
    },
  })
}
