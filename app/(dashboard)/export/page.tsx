'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useReports, useDownloadReport } from '@/hooks/use-reports'
import { Download, FileText, AlertCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PAGE_SIZE = 10

function ExportContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: reports, isLoading, error } = useReports()
  const downloadReport = useDownloadReport()

  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!reports) return []
    const q = search.trim().toLowerCase()
    if (!q) return reports
    return reports.filter((r) => r.job_id.toLowerCase().includes(q))
  }, [reports, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set('search', value.trim())
    } else {
      params.delete('search')
    }
    router.replace(`/export?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Export Laporan</h1>
        <p className="text-slate-400 mt-1 text-sm">Unduh laporan PDF hasil pemindaian keamanan</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Cari berdasarkan ID scan…"
          className="w-full pl-9 pr-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="glass-dark rounded-xl border border-white/5">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-white font-semibold">Laporan Tersedia</h2>
          {!isLoading && !!reports?.length && (
            <span className="text-slate-500 text-xs">
              {filtered.length} dari {reports.length} laporan
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-800 rounded animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 flex items-center gap-2 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Gagal memuat laporan</span>
          </div>
        ) : !paginated.length ? (
          <div className="p-8 text-center text-slate-500">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p>
              {search.trim()
                ? 'Tidak ada laporan yang cocok dengan pencarian.'
                : 'Belum ada laporan PDF. Jika scan sudah selesai namun laporan tidak muncul, coba jalankan scan ulang.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {paginated.map((report) => (
              <div key={report.id} className="flex items-center gap-4 px-6 py-4">
                <div className="p-2 rounded-lg bg-slate-800 shrink-0">
                  <FileText className="h-5 w-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">
                    Laporan {report.format.toUpperCase()}
                  </p>
                  <p className="text-slate-500 text-xs font-mono truncate">{report.job_id}</p>
                  <p className="text-slate-500 text-xs">
                    {new Date(report.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                    {report.file_size_bytes != null && (
                      <> · {(report.file_size_bytes / 1024).toFixed(0)} KB</>
                    )}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-slate-300 hover:text-white shrink-0"
                  onClick={() => downloadReport.mutate(report.id)}
                  disabled={downloadReport.isPending}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Unduh
                </Button>
              </div>
            ))}
          </div>
        )}

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <p className="text-slate-500 text-sm">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} dari {filtered.length} laporan
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-slate-400 text-sm tabular-nums">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ExportPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-slate-800 rounded-xl animate-pulse" />}>
      <ExportContent />
    </Suspense>
  )
}
