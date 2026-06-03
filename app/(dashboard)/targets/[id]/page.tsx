'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTarget } from '@/hooks/use-targets'
import { useScans, useStartScan } from '@/hooks/use-scans'
import { cn } from '@/lib/utils'
import type { ScanJob, OJSTarget } from '@/types/api'

function getActionButton(t: OJSTarget): { label: string; href: string } {
  if (!t.is_verified) {
    return { label: 'Verifikasi Domain', href: `/targets/${t.id}/verify` }
  }
  if (t.plugin_status === 'never_connected') {
    return { label: 'Panduan Instalasi Plugin', href: `/targets/${t.id}/plugin-guide` }
  }
  if (t.plugin_status === 'connected') {
    return { label: 'Mulai Scan', href: `/scanning?target=${t.id}` }
  }
  return { label: 'Lihat Status Plugin', href: `/targets/${t.id}/plugin-guide` }
}

const SCAN_STATUS_LABELS: Record<string, string> = {
  queued: 'Menunggu',
  running: 'Berjalan',
  completed: 'Selesai',
  failed: 'Gagal',
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-green-400',
}

function ScanRow({ scan }: { scan: ScanJob }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all">
      <div className="space-y-0.5">
        <p className="text-xs font-black text-white uppercase tracking-tight">
          {scan.scan_type}
        </p>
        <p className="text-[10px] font-mono text-muted-foreground/40 uppercase">
          {new Date(scan.created_at).toLocaleDateString('id-ID')}
        </p>
      </div>
      <div className="flex items-center gap-4">
        {scan.overall_score !== null && (
          <span
            className={cn(
              'text-sm font-black',
              SEVERITY_COLORS[scan.risk_level ?? 'low']
            )}
          >
            {scan.overall_score.toFixed(1)}
          </span>
        )}
        <Badge
          variant="outline"
          className="text-[9px] font-black uppercase tracking-widest border-white/10"
        >
          {SCAN_STATUS_LABELS[scan.status] ?? scan.status}
        </Badge>
      </div>
    </div>
  )
}

function PluginStatusCard({ target }: { target: OJSTarget }) {
  const [showTroubleshoot, setShowTroubleshoot] = useState(false)

  const config = ({
    connected: { badge: 'Terhubung', color: 'text-green-400 bg-green-400/10 border-green-400/20', Icon: Wifi },
    disconnected: { badge: 'Tidak Terhubung', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', Icon: WifiOff },
    error: { badge: 'Error', color: 'text-red-400 bg-red-400/10 border-red-400/20', Icon: AlertTriangle },
    never_connected: { badge: 'Belum Terhubung', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', Icon: WifiOff },
  } as const)[target.plugin_status] ?? { badge: 'Tidak Diketahui', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', Icon: WifiOff }

  const needsTroubleshoot = target.plugin_status === 'error' || target.plugin_status === 'disconnected'

  return (
    <div id="plugin-status" className="glass-dark rounded-xl border border-white/5 p-5 space-y-4">
      <h3 className="text-white font-semibold text-sm">Status Plugin</h3>

      <div className="flex flex-wrap items-center gap-3">
        <span className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border font-medium ${config.color}`}>
          <config.Icon className="h-4 w-4" />
          {config.badge}
        </span>

        {target.plugin_status === 'connected' && target.connection_mode && (
          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
            Mode: {target.connection_mode === 'direct' ? 'Direct' : 'Heartbeat'}
          </span>
        )}

        {target.last_heartbeat && (
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            Terakhir aktif:{' '}
            {formatDistanceToNow(new Date(target.last_heartbeat), { addSuffix: true, locale: idLocale })}
          </span>
        )}
      </div>

      {needsTroubleshoot && (
        <div>
          <button
            onClick={() => setShowTroubleshoot(v => !v)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            {showTroubleshoot ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Panduan perbaikan
          </button>

          {showTroubleshoot && (
            <ol className="mt-3 space-y-1.5 text-sm text-slate-300 list-decimal list-inside">
              <li>Pastikan plugin OJSDef aktif di panel plugin OJS</li>
              <li>Cek API key di konfigurasi plugin (Settings &rarr; OJSDef)</li>
              <li>Pastikan server OJS dapat mengakses endpoint backend OJSDef</li>
              <li>
                Jika masih error, re-download plugin dari{' '}
                <a href={`/targets/${target.id}/plugin-guide`} className="text-primary underline">
                  halaman Panduan Instalasi
                </a>
              </li>
            </ol>
          )}
        </div>
      )}
    </div>
  )
}

export default function TargetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: target, isLoading } = useTarget(id)
  const { data: allScans } = useScans()
  const startScan = useStartScan()

  const targetScans =
    allScans?.filter((s) => s.target_id === id).slice(0, 5) ?? []

  if (isLoading) {
    return (
      <div className="p-8 text-muted-foreground/40 text-sm font-mono uppercase tracking-widest animate-pulse">
        Memuat target...
      </div>
    )
  }

  if (!target) {
    return (
      <div className="p-8 text-destructive/60 text-sm">
        Target tidak ditemukan.
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl border border-white/5"
          onClick={() => router.push('/targets')}
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
            {target.name}
          </h1>
          <p className="text-muted-foreground/60 text-sm font-mono">
            {target.url}
          </p>
        </div>
      </div>

      {/* Primary Action CTA */}
      {target && (() => {
        const action = getActionButton(target)
        return (
          <Link href={action.href}>
            <Button className="bg-primary hover:bg-primary/90 text-sm">
              {action.label}
            </Button>
          </Link>
        )
      })()}

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-dark border-none">
          <CardContent className="p-4 space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
              Verifikasi
            </p>
            <div className="flex items-center gap-2">
              {target.is_verified ? (
                <CheckCircle2 size={16} className="text-secondary" />
              ) : (
                <XCircle size={16} className="text-destructive" />
              )}
              <p className="text-xs font-black text-white">
                {target.is_verified ? 'Terverifikasi' : 'Belum'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-dark border-none">
          <CardContent className="p-4 space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
              Plugin
            </p>
            <div className="flex items-center gap-2">
              <Wifi
                size={16}
                className={
                  target.plugin_connected ? 'text-secondary' : 'text-muted-foreground/30'
                }
              />
              <p className="text-xs font-black text-white">
                {target.plugin_connected ? 'Terhubung' : 'Terputus'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-dark border-none">
          <CardContent className="p-4 space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
              Versi OJS
            </p>
            <p className="text-xs font-black text-white font-mono">
              {target.ojs_version ?? '—'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-dark border-none">
          <CardContent className="p-4 space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
              Terdaftar
            </p>
            <p className="text-xs font-black text-white">
              {new Date(target.created_at).toLocaleDateString('id-ID')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plugin Status */}
      <PluginStatusCard target={target} />

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {!target.is_verified && (
          <Link href={`/targets/${id}/verify`}>
            <Button
              variant="outline"
              className="h-10 px-5 rounded-xl font-black uppercase text-xs tracking-widest border-primary/20 bg-primary/5 text-primary gap-2"
            >
              <CheckCircle2 size={14} /> Verifikasi Domain
            </Button>
          </Link>
        )}
        <Link href={`/targets/${id}/plugin-guide`}>
          <Button
            variant="outline"
            className="h-10 px-5 rounded-xl font-black uppercase text-xs tracking-widest border-white/5 gap-2"
          >
            <RefreshCw size={14} /> Panduan Plugin
          </Button>
        </Link>
        <Button
          className="h-10 px-5 rounded-2xl bg-primary font-black uppercase text-xs tracking-widest gap-2"
          disabled={startScan.isPending}
          onClick={() =>
            startScan.mutate(
              { targetId: id, scanType: 'full' },
              { onSuccess: (scan) => router.push(`/scanning?jobId=${scan.id}`) }
            )
          }
        >
          <Plus size={14} /> Mulai Scan
        </Button>
        <a href={`${target.url}`} target="_blank" rel="noreferrer">
          <Button
            variant="ghost"
            className="h-10 px-4 rounded-xl border border-white/5 gap-2 text-muted-foreground hover:text-white"
          >
            <ExternalLink size={14} /> Buka OJS
          </Button>
        </a>
      </div>

      {/* Recent Scans */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/60">
          Riwayat Scan
        </h3>
        {targetScans.length === 0 ? (
          <p className="text-muted-foreground/40 text-sm">
            Belum ada scan untuk target ini.
          </p>
        ) : (
          <div className="space-y-2">
            {targetScans.map((scan, i) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ScanRow scan={scan} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
