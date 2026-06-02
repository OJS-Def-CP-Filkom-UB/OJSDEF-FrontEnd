'use client'

import { useRouter } from 'next/navigation'
import { useScans } from '@/hooks/use-scans'
import { useTargets } from '@/hooks/use-targets'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { SCAN_STATUS_LABELS, SCAN_STATUS_COLORS, SCAN_TYPE_LABELS } from '@/lib/utils'

function ScanManagementContent() {
  const router = useRouter()
  const { data: scans, isLoading } = useScans()
  const { data: targets } = useTargets()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Log Teknis</h1>
        <p className="text-slate-400 mt-1 text-sm">Riwayat lengkap semua job scan</p>
      </div>

      <div className="glass-dark rounded-xl border border-white/5">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : !scans?.length ? (
            <div className="p-8 text-center text-slate-500">Belum ada riwayat scan.</div>
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
                {scans.map((scan) => (
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
