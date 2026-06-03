'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Copy, CheckCircle2, AlertCircle, FileText, Globe, Loader2, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useTarget, useVerifyTarget } from '@/hooks/use-targets'

type ToastState = { type: 'success' | 'error'; message: string } | null

function Toast({ toast }: { toast: ToastState }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.2 }}
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border max-w-sm ${
            toast.type === 'success'
              ? 'bg-green-500/15 border-green-500/30 text-green-300'
              : 'bg-red-500/15 border-red-500/30 text-red-300'
          }`}
        >
          {toast.type === 'success'
            ? <CheckCircle className="h-5 w-5 shrink-0" />
            : <AlertCircle className="h-5 w-5 shrink-0" />}
          <p className="text-sm">{toast.message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API unavailable — do nothing, user can copy manually
    }
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

export default function VerifyPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'file' | 'dns'>('file')
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>(null)

  const { data: target } = useTarget(id)
  const verifyMutation = useVerifyTarget(id)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  function handleVerify() {
    setVerifyError(null)
    verifyMutation.mutate(undefined, {
      onSuccess: (data) => {
        if (data.verified) {
          setToast({ type: 'success', message: 'Domain berhasil diverifikasi! Mengalihkan ke panduan plugin...' })
          setTimeout(() => router.push(`/targets/${id}/plugin-guide`), 1800)
        } else {
          setVerifyError('Verifikasi belum berhasil. Pastikan file atau DNS record sudah terpasang, lalu coba lagi.')
          setToast({ type: 'error', message: 'Verifikasi gagal. Periksa konfigurasi dan coba lagi.' })
        }
      },
      onError: () => {
        const msg = 'Terjadi kesalahan saat memeriksa verifikasi. Silakan coba lagi.'
        setVerifyError(msg)
        setToast({ type: 'error', message: msg })
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
      <Toast toast={toast} />
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
            {verifyMutation.isPending
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Memeriksa...</>
              : 'Cek Verifikasi'}
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
            {verifyMutation.isPending
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Memeriksa...</>
              : 'Cek Verifikasi'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
