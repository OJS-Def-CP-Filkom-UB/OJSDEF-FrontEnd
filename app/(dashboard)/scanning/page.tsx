'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useScans, useScanJob, useStartScan } from '@/hooks/use-scans'
import { useTargets } from '@/hooks/use-targets'
import { SCAN_STATUS_LABELS, SCAN_STATUS_COLORS, SCAN_TYPE_LABELS } from '@/lib/utils'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ScanJob, ScanType } from '@/types/api'

interface LogEntry {
  time: string
  type: 'INFO' | 'TASK' | 'DONE' | 'WARN'
  msg: string
}

const LOG_COLOR: Record<string, string> = {
  INFO: '#58a6ff',
  TASK: '#e3b341',
  DONE: '#3fb950',
  WARN: '#f85149',
}

function getTime(): string {
  const now = new Date()
  return [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':')
}

function computeOverallPct(job: ScanJob): number {
  if (job.status === 'completed') return 100
  if (!job.progress) return 0
  const { stage, current_step, total_steps } = job.progress
  const ratio = current_step / total_steps
  const type = job.scan_type
  if (type === 'full') {
    if (stage === 'external_scan') return Math.round(ratio * 40)
    if (stage === 'internal_audit') return Math.round(40 + ratio * 30)
    if (stage === 'scoring') return Math.round(70 + ratio * 30)
  } else if (type === 'external') {
    if (stage === 'external_scan') return Math.round(ratio * 80)
    if (stage === 'scoring') return Math.round(80 + ratio * 20)
  } else {
    if (stage === 'internal_audit') return Math.round(ratio * 80)
    if (stage === 'scoring') return Math.round(80 + ratio * 20)
  }
  return 0
}

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
  const notifiedRef = useRef(false)
  const prevMsgRef = useRef<string | null>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const [showCompletedBanner, setShowCompletedBanner] = useState(false)
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])

  useEffect(() => {
    const msg = job?.progress?.message
    if (msg && msg !== prevMsgRef.current) {
      prevMsgRef.current = msg
      setLogEntries((prev) => [
        ...prev,
        {
          time: getTime(),
          type: (job!.progress!.log_type ?? 'INFO') as LogEntry['type'],
          msg,
        },
      ])
    }
  }, [job?.progress?.message])

  useEffect(() => {
    if (job?.status === 'completed' && !notifiedRef.current) {
      notifiedRef.current = true
      setShowCompletedBanner(true)
      setLogEntries((prev) => {
        const last = prev[prev.length - 1]
        if (!last || last.msg !== 'Scan selesai') {
          return [...prev, { time: getTime(), type: 'DONE', msg: 'Scan selesai' }]
        }
        return prev
      })
    }
  }, [job?.status])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logEntries])

  if (isLoading) return <div className="glass-dark rounded-xl border border-white/5 p-6 animate-pulse h-40" />
  if (!job) return null

  const progressPct = computeOverallPct(job)
  const statusLabel = job.progress?.message ?? (job.status === 'completed' ? 'Selesai' : 'Menunggu')
  const isRunning = job.status === 'running' || job.status === 'queued'

  return (
    <div className="space-y-4">
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
            <span>{statusLabel}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Log feed */}
        {logEntries.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {isRunning && (
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#00e5cc', animation: 'pulse-dot 1.5s infinite',
                }} />
              )}
              <span style={{
                fontSize: 11, color: '#8b949e',
                textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
              }}>
                Worker Log
              </span>
            </div>
            <div
              ref={logRef}
              style={{
                background: '#0a0f1a',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '10px 14px',
                overflowY: 'auto',
                fontFamily: 'var(--font-geist-mono, monospace)',
                fontSize: 11.5,
                lineHeight: 1.8,
                maxHeight: 200,
              }}
            >
              {logEntries.map((entry, i) => {
                const isLast = i === logEntries.length - 1
                return (
                  <div
                    key={i}
                    style={{
                      padding: '1px 0 1px 8px',
                      borderLeft: isLast && isRunning ? '2px solid #00e5cc' : '2px solid transparent',
                      background: isLast && isRunning ? 'rgba(0,229,204,0.04)' : 'transparent',
                      borderRadius: 2,
                    }}
                  >
                    <span style={{ color: '#4a5568', marginRight: 6 }}>[{entry.time}]</span>
                    <span style={{
                      color: LOG_COLOR[entry.type] ?? '#8b949e',
                      fontWeight: 700, marginRight: 4,
                    }}>
                      {entry.type}
                    </span>
                    <span style={{ color: '#c9d1d9' }}>{entry.msg}</span>
                  </div>
                )
              })}
              {isRunning && (
                <span style={{
                  display: 'inline-block', width: 7, height: 13,
                  background: '#00e5cc', verticalAlign: 'text-bottom',
                  animation: 'blink 1s infinite', borderRadius: 1, marginLeft: 2,
                }} />
              )}
            </div>
          </div>
        )}

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

      {/* CTA Lihat Laporan */}
      {(job.status === 'completed' || showCompletedBanner) && (
        <div className="glass-dark rounded-xl border border-green-500/20 p-6 text-center space-y-4">
          <p className="text-white font-semibold">Scan selesai</p>
          <p className="text-slate-400 text-sm">
            {(job.critical_count ?? 0) + (job.high_count ?? 0) + (job.medium_count ?? 0) + (job.low_count ?? 0)} temuan
            · Risk score: {job.overall_score ?? '—'}
          </p>
          <Link href={`/vulnerability-report?jobId=${job.id}`}>
            <Button className="bg-primary hover:bg-primary/90">Lihat Laporan</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

function RecentJobsList() {
  const { data: scans } = useScans({ limit: 10 })
  const activeJob = scans?.find((s) => s.status === 'running' || s.status === 'queued')
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
