'use client'

import { useDashboardStats } from '@/hooks/use-dashboard'
import { useScans } from '@/hooks/use-scans'
import { SCAN_STATUS_LABELS, SCAN_STATUS_COLORS, SCAN_TYPE_LABELS, SEVERITY_LABELS, SEVERITY_COLORS } from '@/lib/utils'
import { ShieldCheck, Target, ScanLine, AlertTriangle } from 'lucide-react'

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: recentScans, isLoading: scansLoading } = useScans({ limit: 5 })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Beranda</h1>
        <p className="text-slate-400 mt-1 text-sm">Ringkasan postur keamanan instalasi OJS Anda</p>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-dark rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-cyan-400/10">
              <Target className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="text-slate-400 text-sm">Total Target</span>
          </div>
          {statsLoading ? (
            <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-white">{stats?.targets.total ?? 0}</p>
          )}
        </div>

        <div className="glass-dark rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-400/10">
              <ScanLine className="h-5 w-5 text-green-400" />
            </div>
            <span className="text-slate-400 text-sm">Scan (30 Hari)</span>
          </div>
          {statsLoading ? (
            <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-white">{stats?.scans.last_30_days ?? 0}</p>
          )}
        </div>

        <div className="glass-dark rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-400/10">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-slate-400 text-sm">Skor Rata-rata</span>
          </div>
          {statsLoading ? (
            <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-white">
              {stats?.security_posture.average_score != null
                ? stats.security_posture.average_score.toFixed(1)
                : '—'}
            </p>
          )}
        </div>

        <div className="glass-dark rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-red-400/10">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <span className="text-slate-400 text-sm">Temuan Kritis</span>
          </div>
          {statsLoading ? (
            <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-white">{stats?.findings_summary.critical ?? 0}</p>
          )}
        </div>
      </div>

      {/* Recent Scans */}
      <div className="glass-dark rounded-xl border border-white/5">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold">Scan Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          {scansLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : !recentScans?.length ? (
            <div className="p-8 text-center text-slate-500">Belum ada scan. Mulai scan pertama Anda.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs uppercase">
                  <th className="px-6 py-3 text-left">Target</th>
                  <th className="px-6 py-3 text-left">Tipe</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Skor</th>
                  <th className="px-6 py-3 text-left">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4 text-slate-300">{scan.target_id}</td>
                    <td className="px-6 py-4 text-slate-400">{SCAN_TYPE_LABELS[scan.scan_type]}</td>
                    <td className="px-6 py-4">
                      <span className={SCAN_STATUS_COLORS[scan.status]}>
                        {SCAN_STATUS_LABELS[scan.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {scan.overall_score != null ? (
                        <span className={
                          scan.risk_level ? SEVERITY_COLORS[scan.risk_level] : 'text-slate-400'
                        }>
                          {scan.overall_score.toFixed(1)}
                          {scan.risk_level && ` — ${SEVERITY_LABELS[scan.risk_level]}`}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(scan.created_at).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
