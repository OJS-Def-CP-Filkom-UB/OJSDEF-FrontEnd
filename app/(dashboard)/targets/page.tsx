'use client'

import { useTargets, useDeleteTarget } from '@/hooks/use-targets'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, CheckCircle, XCircle, Wifi, WifiOff, ExternalLink, Trash2 } from 'lucide-react'

export default function TargetsPage() {
  const { data: targets, isLoading } = useTargets()
  const deleteTarget = useDeleteTarget()
  const { user } = useAuth()
  const isSaasAdmin = user?.role === 'saas_admin'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Target OJS</h1>
          <p className="text-slate-400 mt-1 text-sm">Daftar instalasi OJS yang dipantau</p>
        </div>
        {!isSaasAdmin && (
          <Link href="/targets/new">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Target
            </Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !targets?.length ? (
        <div className="glass-dark rounded-xl border border-white/5 p-12 text-center">
          <p className="text-slate-500 mb-4">Belum ada target OJS terdaftar.</p>
          {!isSaasAdmin && (
            <Link href="/targets/new">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Target Pertama
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {targets.map((target) => (
            <div key={target.id} className="glass-dark rounded-xl border border-white/5 p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-white font-semibold truncate">{target.name}</h3>
                  <a
                    href={target.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 text-xs hover:text-cyan-400 flex items-center gap-1 mt-0.5"
                  >
                    {target.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                {!isSaasAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-600 hover:text-red-400 flex-shrink-0"
                    onClick={() => {
                      if (confirm(`Hapus target "${target.name}"?`)) {
                        deleteTarget.mutate(target.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                  target.is_verified
                    ? 'bg-green-400/10 text-green-400 border border-green-400/20'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {target.is_verified
                    ? <CheckCircle className="h-3 w-3" />
                    : <XCircle className="h-3 w-3" />}
                  {target.is_verified ? 'Terverifikasi' : 'Belum Verifikasi'}
                </div>
                <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                  target.plugin_connected
                    ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {target.plugin_connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {target.plugin_connected ? 'Plugin Terhubung' : 'Plugin Tidak Aktif'}
                </div>
              </div>

              {target.ojs_version && (
                <p className="text-slate-500 text-xs">OJS {target.ojs_version}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-white/5">
                <Link href={`/targets/${target.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full border-white/10 text-slate-300 hover:text-white text-xs">
                    Detail
                  </Button>
                </Link>
                {!isSaasAdmin && !target.is_verified && (
                  <Link href={`/targets/${target.id}/verify`} className="flex-1">
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-xs">
                      Verifikasi
                    </Button>
                  </Link>
                )}
                {!isSaasAdmin && target.is_verified && !target.plugin_connected && (
                  <Link href={`/targets/${target.id}/plugin-guide`} className="flex-1">
                    <Button size="sm" className="w-full bg-cyan-500 hover:bg-cyan-600 text-xs">
                      Pasang Plugin
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
