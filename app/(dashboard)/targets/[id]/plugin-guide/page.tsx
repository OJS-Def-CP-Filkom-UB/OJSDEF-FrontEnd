'use client'

import { use, useState } from 'react'
import { useTarget, usePluginGuide, useRegenerateApiKey } from '@/hooks/use-targets'
import { Button } from '@/components/ui/button'
import { Copy, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
    >
      {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}

const STEPS = [
  {
    num: 1,
    title: 'Unduh Plugin',
    desc: 'Download plugin OJSDef dari repositori resmi dan ekstrak ke direktori plugins OJS.',
  },
  {
    num: 2,
    title: 'Instalasi',
    desc: 'Login ke panel admin OJS, buka Settings → Website → Plugins → Upload Plugin. Upload file ZIP plugin.',
  },
  {
    num: 3,
    title: 'Konfigurasi Kredensial',
    desc: 'Di halaman pengaturan plugin, masukkan Backend URL, API Key, dan Target ID di bawah ini.',
  },
  {
    num: 4,
    title: 'Aktifkan Plugin',
    desc: 'Aktifkan plugin dan klik "Test Koneksi" untuk memverifikasi bahwa plugin terhubung ke OJSDef.',
  },
]

export default function PluginGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: target, isLoading: targetLoading } = useTarget(id)
  const { data: guide, isLoading: guideLoading } = usePluginGuide(id)
  const regenerateKey = useRegenerateApiKey(id)

  const isLoading = targetLoading || guideLoading

  if (isLoading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-800 rounded-xl animate-pulse" />)}</div>

  if (!target) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Target tidak ditemukan.</p>
        <Link href="/targets"><Button variant="ghost" className="mt-4">Kembali</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href={`/targets/${id}`} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Detail Target
        </Link>
        <h1 className="text-2xl font-bold text-white">Panduan Instalasi Plugin</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Pasang plugin OJSDef di <span className="text-cyan-400">{target.name}</span>
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step) => (
          <div key={step.num} className="glass-dark rounded-xl border border-white/5 p-5 flex gap-4">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {step.num}
            </div>
            <div>
              <h3 className="text-white font-medium">{step.title}</h3>
              <p className="text-slate-400 text-sm mt-1">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* API Credentials */}
      {guide && (
        <div className="glass-dark rounded-xl border border-white/5 p-6 space-y-4">
          <h2 className="text-white font-semibold">Kredensial Plugin</h2>

          <div className="space-y-3">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Backend URL</p>
              <div className="flex items-center gap-2 bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2">
                <code className="text-slate-300 text-sm flex-1 font-mono break-all">{guide.backend_url}</code>
                <CopyButton text={guide.backend_url} />
              </div>
            </div>

            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">API Key</p>
              <div className="flex items-center gap-2 bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2">
                <code className="text-cyan-400 text-sm flex-1 font-mono break-all">{guide.api_key}</code>
                <CopyButton text={guide.api_key} />
              </div>
            </div>

            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Target ID</p>
              <div className="flex items-center gap-2 bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2">
                <code className="text-slate-300 text-sm flex-1 font-mono break-all">{guide.target_id}</code>
                <CopyButton text={guide.target_id} />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-slate-400 hover:text-white"
              onClick={() => {
                if (confirm('Regenerasi API key? Key lama akan tidak berlaku.')) {
                  regenerateKey.mutate()
                }
              }}
              disabled={regenerateKey.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${regenerateKey.isPending ? 'animate-spin' : ''}`} />
              {regenerateKey.isPending ? 'Memperbarui...' : 'Regenerasi API Key'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
