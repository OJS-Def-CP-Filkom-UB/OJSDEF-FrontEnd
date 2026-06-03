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
      const response = await api.get<Blob>(`/api/v1/reports/${reportId}/pdf`, {
        responseType: 'blob',
      })
      if (typeof window === 'undefined') return
      const url = URL.createObjectURL(response.data)
      const a   = document.createElement('a')
      a.href     = url
      a.download = `ojsdef-report-${reportId.slice(0, 8)}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  })
}
