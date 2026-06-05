'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useScans, useScanJob } from '@/hooks/use-scans'
import { SEVERITY_LABELS, SEVERITY_COLORS, SEVERITY_BG_COLORS } from '@/lib/utils'
import { ShieldAlert, ShieldCheck, Shield, ShieldOff } from 'lucide-react'

function ScoreDisplay({ score, label }: { score: number | null; label: string }) {
  const color =
    score == null ? 'text-slate-400'
    : score <= 25 ? 'text-red-400'
    : score <= 50 ? 'text-orange-400'
    : score <= 75 ? 'text-yellow-400'
    : 'text-green-400'

  return (
    <div className="glass-dark rounded-xl border border-white/5 p-8 text-center">
      <p className={`text-7xl font-black ${color}`}>
        {score != null ? score.toFixed(1) : '—'}
      </p>
      <p className="text-slate-400 mt-3 text-sm">{label}</p>
    </div>
  )
}

function RiskMatrix({ jobId }: { jobId: string }) {
  const { data: job, isLoading } = useScanJob(jobId)

  if (isLoading) return <div className="h-64 bg-slate-800 rounded-xl animate-pulse" />
  if (!job) return <p className="text-slate-500">Data scan tidak ditemukan.</p>

  const counts = [
    { label: 'Kritis', count: job.critical_count, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', Icon: ShieldOff },
    { label: 'Berbahaya', count: job.high_count, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20', Icon: ShieldAlert },
    { label: 'Perhatian', count: job.medium_count, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', Icon: Shield },
    { label: 'Aman', count: job.low_count, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20', Icon: ShieldCheck },
  ]

  return (
    <div className="space-y-6">
      <ScoreDisplay score={job.overall_score} label="Skor Risiko Keseluruhan (0–100)" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {counts.map(({ label, count, color, bg, Icon }) => (
          <div key={label} className={`glass-dark rounded-xl border p-5 text-center ${bg}`}>
            <Icon className={`h-6 w-6 mx-auto mb-2 ${color}`} />
            <p className={`text-3xl font-bold ${color}`}>{count}</p>
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

function AutoSelectJob() {
  const { data: scans } = useScans({ limit: 20 })
  const latest = scans?.find((s) => s.status === 'completed')

  if (!latest) {
    return (
      <div className="glass-dark rounded-xl border border-white/5 p-8 text-center text-slate-500">
        <p>Belum ada scan selesai. Jalankan scan terlebih dahulu.</p>
      </div>
    )
  }

  return <RiskMatrix jobId={latest.id} />
}

function RiskScoringContent() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get('jobId')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Risk Scoring</h1>
        <p className="text-slate-400 mt-1 text-sm">Skor risiko keseluruhan berdasarkan hasil pemindaian</p>
      </div>

      {jobId ? <RiskMatrix jobId={jobId} /> : <AutoSelectJob />}
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
