'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useScans } from '@/hooks/use-scans'
import { useTargets } from '@/hooks/use-targets'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { SCAN_STATUS_LABELS, SCAN_STATUS_COLORS, SCAN_TYPE_LABELS } from '@/lib/utils'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ScanStatus, ScanType } from '@/types/api'

const PAGE_SIZE = 10

const STATUS_OPTIONS: { value: ScanStatus | 'all'; label: string }[] = [
  { value: 'all',       label: 'Semua Status' },
  { value: 'queued',    label: 'Antrian' },
  { value: 'running',   label: 'Berjalan' },
  { value: 'completed', label: 'Selesai' },
  { value: 'failed',    label: 'Gagal' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

const TYPE_OPTIONS: { value: ScanType | 'all'; label: string }[] = [
  { value: 'all',      label: 'Semua Tipe' },
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'Eksternal' },
  { value: 'full',     label: 'Full Audit' },
]

function ScanManagementContent() {
  const router = useRouter()
  const { data: scans, isLoading } = useScans()
  const { data: targets } = useTargets()

  const [filterTarget, setFilterTarget] = useState<string>('all')
  const [filterType, setFilterType] = useState<ScanType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<ScanStatus | 'all'>('all')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [page, setPage] = useState(1)

  function applyFilter<T>(setter: (v: T) => void, value: T) {
    setter(value)
    setPage(1)
  }

  const filtered = useMemo(() => {
    if (!scans) return []
    return scans.filter((scan) => {
      if (filterTarget !== 'all' && scan.target_id !== filterTarget) return false
      if (filterType !== 'all' && scan.scan_type !== filterType) return false
      if (filterStatus !== 'all' && scan.status !== filterStatus) return false
      if (filterDateFrom) {
        const from = new Date(filterDateFrom).setHours(0, 0, 0, 0)
        if (new Date(scan.created_at).getTime() < from) return false
      }
      if (filterDateTo) {
        const to = new Date(filterDateTo).setHours(23, 59, 59, 999)
        if (new Date(scan.created_at).getTime() > to) return false
      }
      return true
    })
  }, [scans, filterTarget, filterType, filterStatus, filterDateFrom, filterDateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const hasActiveFilter =
    filterTarget !== 'all' || filterType !== 'all' || filterStatus !== 'all' ||
    !!filterDateFrom || !!filterDateTo

  function resetFilters() {
    setFilterTarget('all')
    setFilterType('all')
    setFilterStatus('all')
    setFilterDateFrom('')
    setFilterDateTo('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Log Teknis</h1>
        <p className="text-slate-400 mt-1 text-sm">Riwayat lengkap semua job scan</p>
      </div>

      {/* Filters */}
      <div className="glass-dark rounded-xl border border-white/5 p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-slate-500 text-xs uppercase tracking-wide">Target</label>
            <Select value={filterTarget} onValueChange={(v) => applyFilter(setFilterTarget, v)}>
              <SelectTrigger className="bg-slate-900/60 border-white/10 text-white h-9 text-sm">
                <SelectValue placeholder="Semua Target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Target</SelectItem>
                {targets?.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-slate-500 text-xs uppercase tracking-wide">Tipe Scan</label>
            <Select
              value={filterType}
              onValueChange={(v) => applyFilter(setFilterType, v as ScanType | 'all')}
            >
              <SelectTrigger className="bg-slate-900/60 border-white/10 text-white h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-slate-500 text-xs uppercase tracking-wide">Status</label>
            <Select
              value={filterStatus}
              onValueChange={(v) => applyFilter(setFilterStatus, v as ScanStatus | 'all')}
            >
              <SelectTrigger className="bg-slate-900/60 border-white/10 text-white h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-slate-500 text-xs uppercase tracking-wide">Dari Tanggal</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => applyFilter(setFilterDateFrom, e.target.value)}
              className="h-9 px-3 text-sm bg-slate-900/60 border border-white/10 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-slate-500 text-xs uppercase tracking-wide">Sampai Tanggal</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => applyFilter(setFilterDateTo, e.target.value)}
              className="h-9 px-3 text-sm bg-slate-900/60 border border-white/10 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {hasActiveFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-slate-400 hover:text-white self-end"
            >
              Reset Filter
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-dark rounded-xl border border-white/5">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : !paginated.length ? (
            <div className="p-8 text-center text-slate-500">
              {hasActiveFilter
                ? 'Tidak ada data yang cocok dengan filter.'
                : 'Belum ada riwayat scan.'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs uppercase border-b border-white/5">
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Target</th>
                  <th className="px-6 py-3 text-left">Tipe</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Skor</th>
                  <th className="px-6 py-3 text-left">Dibuat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginated.map((scan) => (
                  <tr
                    key={scan.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => router.push(`/scan-management/${scan.id}`)}
                  >
                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">
                      {scan.id.slice(0, 8)}…
                    </td>
                    <td className="px-6 py-3 text-slate-300 text-sm">
                      {targets?.find((t) => t.id === scan.target_id)?.name ??
                        scan.target_id.slice(0, 8) + '…'}
                    </td>
                    <td className="px-6 py-3 text-slate-400">
                      {SCAN_TYPE_LABELS[scan.scan_type]}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-sm ${SCAN_STATUS_COLORS[scan.status]}`}>
                        {SCAN_STATUS_LABELS[scan.status]}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-400">
                      {scan.overall_score != null ? scan.overall_score.toFixed(1) : '—'}
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs">
                      {new Date(scan.created_at).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <p className="text-slate-500 text-sm">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} dari {filtered.length} scan
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

export default function ScanManagementPage() {
  return (
    <RoleGuard allowedRoles={['saas_admin', 'admin_ojs']}>
      <ScanManagementContent />
    </RoleGuard>
  )
}
