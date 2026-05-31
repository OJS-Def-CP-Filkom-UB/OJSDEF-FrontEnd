'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, CheckCircle2, AlertCircle, FileText, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTarget, useVerifyTarget } from '@/hooks/use-targets'

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
      className="text-slate-400 hover:text-primary transition-colors p-1 rounded"
      title="Salin"
    >
      {copied ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Langkah {number}</p>
      <p className="text-white text-sm">{title}</p>
      {children}
    </div>
  )
}

function CodeRow({ value, highlight, small }: { value: string; highlight?: 'green'; small?: boolean }) {
  return (
    <div className="flex items-center justify-between bg-slate-900 rounded-lg px-4 py-3 mt-1">
      <code className={`font-mono break-all ${small ? 'text-xs' : 'text-sm'} ${highlight === 'green' ? 'text-green-400' : 'text-primary'}`}>
        {value}
      </code>
      <div className="ml-3 shrink-0">
        <CopyButton text={value} />
      </div>
    </div>
  )
}

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'file' | 'dns'>('file')
  const [verifyError, setVerifyError] = useState<string | null>(null)

  const { data: target } = useTarget(id)
  const verifyMutation = useVerifyTarget(id)

  function handleVerify() {
    setVerifyError(null)
    verifyMutation.mutate(undefined, {
      onSuccess: (data) => {
        if (data.verified) {
          router.push(`/targets/${id}/plugin-guide`)
        } else {
          setVerifyError('Verifikasi belum berhasil. Pastikan file atau DNS record sudah terpasang, lalu coba lagi.')
        }
      },
      onError: () => {
        setVerifyError('Terjadi kesalahan saat memeriksa verifikasi. Silakan coba lagi.')
      },
    })
  }

  const token = target?.verification_token
  const domain = (() => {
    try { return new URL(target?.url ?? '').hostname } catch { return target?.url ?? '' }
  })()

  const fileInfo = token ? {
    filename: `ojsdef-verify-${token}.txt`,
    content: `ojsdef-verification=${token}`,
    path: `/.well-known/ojsdef-verify-${token}.txt`,
  } : null

  const dnsInfo = token ? {
    record_name: `_ojsdef-verify.${domain}`,
    record_value: `ojsdef-verification=${token}`,
  } : null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Verifikasi Domain</h1>
        <p className="text-slate-400 text-sm mt-1">
          {target?.url ?? '—'} · Pilih metode verifikasi di bawah
        </p>
      </div>

      <div className="flex gap-0 border-b border-white/5">
        {(['file', 'dns'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'file' ? <FileText className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
            {tab === 'file' ? 'Metode File' : 'Metode DNS'}
          </button>
        ))}
      </div>

      {verifyError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex gap-2">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-300/90 text-sm">{verifyError}</p>
        </div>
      )}

      {!token ? (
        <p className="text-slate-400 text-sm">Memuat informasi verifikasi...</p>
      ) : activeTab === 'file' && fileInfo ? (
        <div className="glass-dark rounded-xl border border-white/5 p-6 space-y-5">
          <Step number={1} title="Buat file dengan nama berikut di server OJS Anda:">
            <CodeRow value={fileInfo.filename} />
          </Step>
          <Step number={2} title="Isi file tersebut dengan konten berikut (satu baris):">
            <CodeRow value={fileInfo.content} highlight="green" />
          </Step>
          <Step number={3} title="Upload file ke path berikut agar dapat diakses publik:">
            <CodeRow value={`${target?.url}${fileInfo.path}`} small />
          </Step>
          <Button
            onClick={handleVerify}
            disabled={verifyMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {verifyMutation.isPending ? 'Memeriksa...' : 'Cek Verifikasi'}
          </Button>
        </div>
      ) : activeTab === 'dns' && dnsInfo ? (
        <div className="glass-dark rounded-xl border border-white/5 p-6 space-y-5">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 flex gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-amber-300/90 text-sm">
              Propagasi DNS dapat memakan waktu hingga 24 jam setelah record ditambahkan.
            </p>
          </div>
          <p className="text-white text-sm">Tambahkan TXT record berikut di pengaturan DNS domain Anda:</p>
          <div className="space-y-2">
            <div className="grid grid-cols-3 text-xs text-slate-500 font-semibold uppercase tracking-wider px-1">
              <span>Tipe</span><span>Nama Record</span><span>Nilai</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-900 rounded px-3 py-2.5 text-slate-300 text-sm font-mono">TXT</div>
              <div className="flex items-center justify-between bg-slate-900 rounded px-3 py-2.5">
                <code className="text-primary text-xs font-mono break-all">{dnsInfo.record_name}</code>
                <CopyButton text={dnsInfo.record_name} />
              </div>
              <div className="flex items-center justify-between bg-slate-900 rounded px-3 py-2.5">
                <code className="text-green-400 text-xs font-mono break-all">{dnsInfo.record_value}</code>
                <CopyButton text={dnsInfo.record_value} />
              </div>
            </div>
          </div>
          <Button
            onClick={handleVerify}
            disabled={verifyMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {verifyMutation.isPending ? 'Memeriksa...' : 'Cek Verifikasi'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
