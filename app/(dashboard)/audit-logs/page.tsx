'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuditLogs } from '@/hooks/use-audit-logs'
import { useAuth } from '@/hooks/use-auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import type { AuditLogParams } from '@/types/api'

const ACTION_OPTIONS = [
  { value: '', label: 'Semua Aksi' },
  { value: 'user.login', label: 'Login' },
  { value: 'user.login_failed', label: 'Login Gagal' },
  { value: 'user.logout', label: 'Logout' },
  { value: 'user.created', label: 'User Dibuat' },
  { value: 'user.password_changed', label: 'Ganti Password' },
  { value: 'target.created', label: 'Target Dibuat' },
  { value: 'target.verified', label: 'Target Diverifikasi' },
  { value: 'scan.started', label: 'Scan Dimulai' },
  { value: 'finding.false_positive_toggled', label: 'Toggle False Positive' },
  { value: 'report.exported', label: 'Laporan Diekspor' },
]

export default function AuditLogsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [params, setParams] = useState<AuditLogParams>({ page: 1, per_page: 50 })
  const [filterEmail, setFilterEmail] = useState('')
  const [filterAction, setFilterAction] = useState('')

  if (user && user.role !== 'saas_admin') {
    router.replace('/dashboard')
    return null
  }

  const { data, isLoading } = useAuditLogs(params)

  function applyFilters() {
    setParams(p => ({ ...p, page: 1, user_email: filterEmail || undefined, action: filterAction || undefined }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
        <p className="text-slate-400 text-sm mt-1">Riwayat semua aksi penting di platform OJSDef</p>
      </div>

      <div className="glass-dark rounded-xl border border-white/5 p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="text-xs text-slate-400 mb-1 block">Email User</label>
          <Input value={filterEmail} onChange={e => setFilterEmail(e.target.value)}
            placeholder="cari@email.com"
            className="bg-slate-900/60 border-white/10 text-white placeholder:text-slate-500 text-sm h-9" />
        </div>
        <div className="flex-1 min-w-48">
          <label className="text-xs text-slate-400 mb-1 block">Aksi</label>
          <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
            className="w-full bg-slate-900/60 border border-white/10 text-white rounded-md px-3 h-9 text-sm">
            {ACTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <Button onClick={applyFilters} className="bg-primary hover:bg-primary/90 h-9 text-sm">Filter</Button>
        <Button variant="ghost"
          onClick={() => { setFilterEmail(''); setFilterAction(''); setParams({ page: 1, per_page: 50 }) }}
          className="text-slate-400 hover:text-white h-9 text-sm">
          Reset
        </Button>
      </div>

      <div className="glass-dark rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Waktu', 'User', 'Aksi', 'Resource'].map(h => (
                  <th key={h} className="text-left text-xs text-slate-500 font-semibold uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {[...Array(4)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-800 rounded animate-pulse w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : !data?.items.length ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Tidak ada data audit log</td></tr>
              ) : (
                data.items.map(log => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: idLocale })}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{log.user_email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono bg-slate-800 text-primary px-2 py-0.5 rounded">{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {log.resource_type}{log.resource_id ? ` · ${log.resource_id.slice(0, 8)}…` : ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.total > data.per_page && (
          <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {data.total} total · halaman {data.page} dari {Math.ceil(data.total / data.per_page)}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={data.page <= 1}
                onClick={() => setParams(p => ({ ...p, page: (p.page ?? 1) - 1 }))}
                className="h-7 text-xs border-white/10">Sebelumnya</Button>
              <Button size="sm" variant="outline"
                disabled={data.page >= Math.ceil(data.total / data.per_page)}
                onClick={() => setParams(p => ({ ...p, page: (p.page ?? 1) + 1 }))}
                className="h-7 text-xs border-white/10">Berikutnya</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}