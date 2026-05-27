'use client'

import { useReports, useDownloadReport } from '@/hooks/use-reports'
import { Download, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ExportPage() {
  const { data: reports, isLoading, error } = useReports()
  const downloadReport = useDownloadReport()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Export Laporan</h1>
        <p className="text-slate-400 mt-1 text-sm">Unduh laporan PDF hasil pemindaian keamanan</p>
      </div>

      <div className="glass-dark rounded-xl border border-white/5">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold">Laporan Tersedia</h2>
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
        ) : !reports?.length ? (
          <div className="p-8 text-center text-slate-500">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p>Belum ada laporan. Selesaikan scan untuk membuat laporan.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center gap-4 px-6 py-4">
                <div className="p-2 rounded-lg bg-slate-800">
                  <FileText className="h-5 w-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">
                    Laporan {report.format.toUpperCase()} — {report.job_id.slice(0, 8)}…
                  </p>
                  <p className="text-slate-500 text-xs">
                    {new Date(report.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                    {report.file_size_bytes && (
                      <> · {(report.file_size_bytes / 1024).toFixed(0)} KB</>
                    )}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-slate-300 hover:text-white"
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
      </div>
    </div>
  )
}
