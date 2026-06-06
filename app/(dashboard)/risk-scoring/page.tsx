'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useScans, useScanJob } from '@/hooks/use-scans'
import { SEVERITY_LABELS, SEVERITY_COLORS, SEVERITY_BG_COLORS, SCAN_TYPE_LABELS } from '@/lib/utils'
import { ShieldAlert, ShieldCheck, Shield, ShieldOff, Info } from 'lucide-react'
import type { ScanType } from '@/types/api'

type ScanTypeFilter = ScanType | 'all'

const FILTER_OPTIONS: { value: ScanTypeFilter; label: string }[] = [
  { value: 'all',      label: 'Terbaru' },
  { value: 'full',     label: 'Audit Penuh' },
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'Eksternal' },
]

const SEVERITY_ROWS = [
  { key: 'critical', label: 'Kritis',    color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20',       Icon: ShieldOff   },
  { key: 'high',     label: 'Berbahaya', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20', Icon: ShieldAlert },
  { key: 'medium',   label: 'Perhatian', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', Icon: Shield      },
  { key: 'low',      label: 'Aman',      color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20',   Icon: ShieldCheck },
] as const

function scoreColor(score: number | null) {
  if (score == null) return 'text-slate-400'
  if (score <= 25)   return 'text-red-400'
  if (score <= 50)   return 'text-orange-400'
  if (score <= 75)   return 'text-yellow-400'
  return 'text-green-400'
}

/* ------------------------------------------------------------------ */
/* Single-job view                                                      */
/* ------------------------------------------------------------------ */
function RiskMatrix({ jobId }: { jobId: string }) {
  const { data: job, isLoading } = useScanJob(jobId)

  if (isLoading) return <div className="h-64 bg-slate-800 rounded-xl animate-pulse" />
  if (!job) return <p className="text-slate-500">Data scan tidak ditemukan.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Berdasarkan:</span>
          <span className="text-slate-300 font-medium">{SCAN_TYPE_LABELS[job.scan_type]}</span>
          <span>·</span>
          <span>{new Date(job.created_at).toLocaleString('id-ID')}</span>
        </div>
        <div
          className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-800/60 border border-white/5 rounded-lg px-3 py-1.5"
          title="Skor ini hanya mencerminkan satu sesi scan. Skor rata-rata semua target tersedia di halaman Beranda."
        >
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>Skor satu sesi scan · bukan rata-rata semua target</span>
        </div>
      </div>

      <div className="glass-dark rounded-xl border border-white/5 p-8 text-center">
        <p className={`text-7xl font-black ${scoreColor(job.overall_score)}`}>
          {job.overall_score != null ? job.overall_score.toFixed(1) : '—'}
        </p>
        <p className="text-slate-400 mt-3 text-sm">Skor Risiko Keseluruhan (0–100)</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {SEVERITY_ROWS.map(({ key, label, color, bg, Icon }) => (
          <div key={key} className={`glass-dark rounded-xl border p-5 text-center ${bg}`}>
            <Icon className={`h-6 w-6 mx-auto mb-2 ${color}`} />
            <p className={`text-3xl font-bold ${color}`}>{job[`${key}_count`]}</p>
            <p className="text-slate-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {job.risk_level && (
        <div className={`glass-dark rounded-xl border p-5 ${SEVERITY_BG_COLORS[job.risk_level]}`}>
          <p className="text-slate-400 text-sm mb-1">Level Risiko Keseluruhan</p>
          <p className={`text-2xl font-bold ${SEVERITY_COLORS[job.risk_level]}`}>
            {SEVERITY_LABELS[job.risk_level]}
          </p>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Filter + auto-select logic                                           */
/* ------------------------------------------------------------------ */
function AutoSelectJob({
  typeFilter,
  onFilterChange,
}: {
  typeFilter: ScanTypeFilter
  onFilterChange: (f: ScanTypeFilter) => void
}) {
  const { data: scans } = useScans({ limit: 50 })
  const completed = scans?.filter((s) => s.status === 'completed') ?? []

  // 'all' (Terbaru): pick the single most recent completed scan regardless of type
  const latest =
    typeFilter === 'all'
      ? completed[0]
      : completed.find((s) => s.scan_type === typeFilter)

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              typeFilter === value
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-slate-800/60 text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {!latest ? (
        <div className="glass-dark rounded-xl border border-white/5 p-8 text-center text-slate-500">
          <p>
            Belum ada scan
            {typeFilter !== 'all' ? ` ${SCAN_TYPE_LABELS[typeFilter]}` : ''} selesai.
            Jalankan scan terlebih dahulu.
          </p>
        </div>
      ) : (
        <RiskMatrix jobId={latest.id} />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */
function RiskScoringContent() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get('jobId')
  const [typeFilter, setTypeFilter] = useState<ScanTypeFilter>('all')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Risk Scoring</h1>
        <p className="text-slate-400 mt-1 text-sm">Skor risiko keseluruhan berdasarkan hasil pemindaian</p>
      </div>

      {jobId
        ? <RiskMatrix jobId={jobId} />
        : <AutoSelectJob typeFilter={typeFilter} onFilterChange={setTypeFilter} />
      }
    </div>
  )
}

export default function RiskScoringPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-slate-800 rounded-xl animate-pulse" />}>
      <RiskScoringContent />
    </Suspense>
  )
}
