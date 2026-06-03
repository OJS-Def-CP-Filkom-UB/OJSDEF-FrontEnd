'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { useScanJob, useCancelScan, useRetryScan } from '@/hooks/use-scans'
import { useTargets } from '@/hooks/use-targets'
import { SCAN_STATUS_LABELS, SCAN_STATUS_COLORS, SCAN_TYPE_LABELS } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { ScanJob } from '@/types/api'
import { getDiagnosticGuide } from '@/lib/diagnostics'

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

export default function ScanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const { data: job, isLoading } = useScanJob(jobId)
  const { data: targets } = useTargets()
  const cancelScan = useCancelScan()
  const retryScan = useRetryScan()

  const logRef = useRef<HTMLDivElement>(null)

  const logEntries = useMemo<LogEntry[]>(() => {
    const log = job?.progress?.log ?? []
    return log.map((entry) => ({
      time: new Date(entry.ts * 1000).toLocaleTimeString('id-ID', {
        hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
      }),
      type: (entry.type ?? 'INFO') as LogEntry['type'],
      msg:  entry.msg,
    }))
  }, [job?.progress?.log])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logEntries])

  const [cancelError, setCancelError] = useState<string | null>(null)

  async function handleCancel() {
    setCancelError(null)
    try {
      await cancelScan.mutateAsync(jobId)
    } catch {
      setCancelError('Gagal membatalkan scan. Silakan coba lagi.')
    }
  }

  async function handleRetry() {
    if (!job) return
    const newJob = await retryScan.mutateAsync({
      targetId: job.target_id,
      scanType: job.scan_type,
    })
    router.push(`/scan-management/${newJob.id}`)
  }

  if (isLoading) return <div className="h-64 bg-slate-800 rounded-xl animate-pulse" />
  if (!job) return <div className="p-8 text-center text-slate-500">Scan tidak ditemukan.</div>

  const targetName = targets?.find((t) => t.id === job.target_id)?.name ?? '—'
  const progressPct = computeOverallPct(job)
  const isRunning = job.status === 'running' || job.status === 'queued'
  const isTerminal =
    job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled'
  const statusLabel =
    job.progress?.message ??
    (job.status === 'completed' ? 'Selesai' : SCAN_STATUS_LABELS[job.status])
  const diagnosticGuide =
    job.status === 'failed' ? getDiagnosticGuide(job.diagnostic_code) : null

  return (
    <div className="space-y-6">
      <Link
        href="/scan-management"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Log Teknis
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{targetName}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {SCAN_TYPE_LABELS[job.scan_type]} ·{' '}
            {new Date(job.created_at).toLocaleString('id-ID')}
          </p>
        </div>
        <span className={`text-sm font-semibold whitespace-nowrap ${SCAN_STATUS_COLORS[job.status]}`}>
          {SCAN_STATUS_LABELS[job.status]}
        </span>
      </div>

      <div className="glass-dark rounded-xl border border-white/5 p-6 space-y-5">
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

        {logEntries.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {isRunning && (
                <div
                  style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#00e5cc', animation: 'pulse-dot 1.5s infinite',
                  }}
                />
              )}
              <span style={{ fontSize: 11, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Worker Log
              </span>
            </div>
            <div
              ref={logRef}
              style={{
                background: '#0a0f1a', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '10px 14px', overflowY: 'auto',
                fontFamily: 'var(--font-geist-mono, monospace)',
                fontSize: 11.5, lineHeight: 1.8, maxHeight: 200,
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
                    <span style={{ color: LOG_COLOR[entry.type] ?? '#8b949e', fontWeight: 700, marginRight: 4 }}>
                      {entry.type}
                    </span>
                    <span style={{ color: '#c9d1d9' }}>{entry.msg}</span>
                  </div>
                )
              })}
              {isRunning && (
                <span style={{
                  display: 'inline-block', width: 7, height: 13, background: '#00e5cc',
                  verticalAlign: 'text-bottom', animation: 'blink 1s infinite',
                  borderRadius: 1, marginLeft: 2,
                }} />
              )}
            </div>
          </div>
        )}

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

        {diagnosticGuide && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-sm font-semibold text-red-300">
                Diagnosa &amp; Cara Perbaiki
              </span>
            </div>
            <p className="text-sm font-medium text-white">{diagnosticGuide.title}</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-slate-300">
              {diagnosticGuide.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            {job.diagnostic_detail && (
              <p className="text-xs text-slate-500 font-mono pt-1 border-t border-white/5">
                Detail: {job.diagnostic_detail}
              </p>
            )}
            <Link
              href={`/targets/${job.target_id}/plugin-guide`}
              className="inline-block text-sm text-cyan-400 hover:text-cyan-300"
            >
              Buka Panduan Plugin →
            </Link>
          </div>
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          {isRunning && (
            <Button variant="destructive" onClick={handleCancel} disabled={cancelScan.isPending}>
              {cancelScan.isPending ? 'Membatalkan...' : 'Batalkan Scan'}
            </Button>
          )}
          {cancelError && <p className="text-red-400 text-sm w-full">{cancelError}</p>}
          {isTerminal && (
            <Button
              variant="outline"
              onClick={handleRetry}
              disabled={retryScan.isPending}
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              {retryScan.isPending ? 'Memulai...' : 'Scan Ulang'}
            </Button>
          )}
          {job.status === 'completed' && (
            <Link href={`/vulnerability-report?jobId=${job.id}`}>
              <Button className="bg-primary hover:bg-primary/90">Lihat Laporan Lengkap →</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
