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
      const res = await api.get(`/api/v1/reports/${reportId}/download`, {
        responseType: 'blob',
      })
      const url = URL.createObjectURL(res.data as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ojsdef-report-${reportId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    },
  })
}
