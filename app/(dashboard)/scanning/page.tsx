'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useScans, useScanJob, useStartScan } from '@/hooks/use-scans'
import { useTargets } from '@/hooks/use-targets'
import { SCAN_STATUS_LABELS, SCAN_STATUS_COLORS, SCAN_TYPE_LABELS } from '@/lib/utils'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import type { ScanType } from '@/types/api'

function StartScanForm() {
  const { data: targets } = useTargets()
  const startScan = useStartScan()
  const [targetId, setTargetId] = useState('')
  const [scanType, setScanType] = useState<ScanType>('external')
  const [error, setError] = useState<string | null>(null)

  async function handleStart() {
    if (!targetId) { setError('Pilih target terlebih dahulu'); return }
    setError(null)
    try {
      await startScan.mutateAsync({ targetId, scanType })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memulai scan')
    }
  }

  return (
    <div className="glass-dark rounded-xl border border-white/5 p-6 space-y-4">
      <h2 className="text-white font-semibold">Mulai Scan Baru</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-slate-400 text-sm">Target OJS</label>
          <Select value={targetId} onValueChange={setTargetId}>
            <SelectTrigger className="bg-slate-900/60 border-white/10 text-white">
              <SelectValue placeholder="Pilih target..." />
            </SelectTrigger>
            <SelectContent>
              {targets?.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-slate-400 text-sm">Tipe Scan</label>
          <Select value={scanType} onValueChange={(v: string) => setScanType(v as ScanType)}>
            <SelectTrigger className="bg-slate-900/60 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="external">Eksternal</SelectItem>
              <SelectItem value="full">Audit Penuh</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <Button
        onClick={handleStart}
        disabled={startScan.isPending}
        className="bg-primary hover:bg-primary/90"
      >
        {startScan.isPending ? 'Memulai...' : 'Mulai Scan'}
      </Button>
    </div>
  )
}

function ScanJobMonitor({ jobId }: { jobId: string }) {
  const { data: job, isLoading } = useScanJob(jobId)

  if (isLoading) return <div className="glass-dark rounded-xl border border-white/5 p-6 animate-pulse h-40" />
  if (!job) return null

  const progress = job.progress
  const progressPct = progress
    ? Math.round((progress.current_step / progress.total_steps) * 100)
    : job.status === 'completed' ? 100 : 0

  return (
    <div className="glass-dark rounded-xl border border-white/5 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">Scan ID: {job.id.slice(0, 8)}…</h2>
          <p className="text-slate-400 text-sm">{SCAN_TYPE_LABELS[job.scan_type]}</p>
        </div>
        <span className={`text-sm font-medium ${SCAN_STATUS_COLORS[job.status]}`}>
          {SCAN_STATUS_LABELS[job.status]}
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-500">
          <span>{progress?.stage ?? (job.status === 'completed' ? 'Selesai' : 'Menunggu')}</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Counts — shown when completed */}
      {job.status === 'completed' && (
        <div className="grid grid-cols-4 gap-3 pt-2 border-t border-white/5">
          <div className="text-center">
            <p className="text-red-400 text-xl font-bold">{job.critical_count}</p>
            <p className="text-slate-500 text-xs">Kritis</p>
          </div>
          <div className="text-center">
            <p className="text-orange-400 text-xl font-bold">{job.high_count}</p>
            <p className="text-slate-500 text-xs">Berbahaya</p>
          </div>
          <div className="text-center">
            <p className="text-yellow-400 text-xl font-bold">{job.medium_count}</p>
            <p className="text-slate-500 text-xs">Perhatian</p>
          </div>
          <div className="text-center">
            <p className="text-green-400 text-xl font-bold">{job.low_count}</p>
            <p className="text-slate-500 text-xs">Aman</p>
          </div>
        </div>
      )}
    </div>
  )
}

function RecentJobsList() {
  const { data: scans } = useScans({ limit: 10 })
  const activeJob = scans?.find(
    (s) => s.status === 'running' || s.status === 'queued'
  )

  if (!activeJob) return null
  return <ScanJobMonitor jobId={activeJob.id} />
}

function ScanningContent() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get('jobId')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mulai Scan</h1>
        <p className="text-slate-400 mt-1 text-sm">Jalankan pemindaian keamanan terhadap instalasi OJS Anda</p>
      </div>

      <RoleGuard allowedRoles={['saas_admin', 'admin_ojs']}>
        <StartScanForm />
      </RoleGuard>

      {jobId ? <ScanJobMonitor jobId={jobId} /> : <RecentJobsList />}
    </div>
  )
}

export default function ScanningPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-slate-800 rounded-xl animate-pulse" />}>
      <ScanningContent />
    </Suspense>
  )
}
