'use client'

import { use } from 'react'
import { useTarget, useVerifyTarget } from '@/hooks/use-targets'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, ArrowLeft, FileText, Globe } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

type Method = 'file' | 'dns'

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: target, isLoading } = useTarget(id)
  const verifyTarget = useVerifyTarget(id)
  const [method, setMethod] = useState<Method>('file')
  const [verifyResult, setVerifyResult] = useState<{ verified: boolean; method: string | null } | null>(null)

  async function handleVerify() {
    try {
      // Backend mencoba file & DNS secara berurutan otomatis — tidak perlu kirim method
      const result = await verifyTarget.mutateAsync()
      setVerifyResult(result)
    } catch {
      setVerifyResult({ verified: false, method: null })
    }
  }

  if (isLoading) return <div className="h-64 bg-slate-800 rounded-xl animate-pulse" />

  if (!target) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Target tidak ditemukan.</p>
        <Link href="/targets"><Button variant="ghost" className="mt-4">Kembali</Button></Link>
      </div>
    )
  }

  if (target.is_verified) {
    return (
      <div className="max-w-lg space-y-6">
        <Link href={`/targets/${id}`} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Detail Target
        </Link>
        <div className="glass-dark rounded-xl border border-green-400/20 bg-green-400/5 p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <h2 className="text-white text-xl font-bold">Target Sudah Terverifikasi</h2>
          <p className="text-slate-400 mt-2 text-sm">{target.name} sudah berhasil diverifikasi.</p>
          <Link href={`/targets/${id}/plugin-guide`}>
            <Button className="mt-6 bg-primary hover:bg-primary/90">Lanjut ke Panduan Plugin</Button>
          </Link>
        </div>
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
        <h1 className="text-2xl font-bold text-white">Verifikasi Domain</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Buktikan kepemilikan domain <span className="text-cyan-400">{target.url}</span>
        </p>
      </div>

      {/* Method selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setMethod('file')}
          className={`glass-dark rounded-xl border p-4 text-left transition-all ${
            method === 'file' ? 'border-primary bg-primary/10' : 'border-white/5 hover:border-white/10'
          }`}
        >
          <FileText className={`h-5 w-5 mb-2 ${method === 'file' ? 'text-primary' : 'text-slate-500'}`} />
          <p className="text-white text-sm font-medium">Upload File</p>
          <p className="text-slate-500 text-xs mt-0.5">Unggah file verifikasi ke server OJS</p>
        </button>
        <button
          onClick={() => setMethod('dns')}
          className={`glass-dark rounded-xl border p-4 text-left transition-all ${
            method === 'dns' ? 'border-primary bg-primary/10' : 'border-white/5 hover:border-white/10'
          }`}
        >
          <Globe className={`h-5 w-5 mb-2 ${method === 'dns' ? 'text-primary' : 'text-slate-500'}`} />
          <p className="text-white text-sm font-medium">DNS TXT Record</p>
          <p className="text-slate-500 text-xs mt-0.5">Tambahkan TXT record ke DNS domain</p>
        </button>
      </div>

      {/* Instructions */}
      <div className="glass-dark rounded-xl border border-white/5 p-5 space-y-3">
        {method === 'file' ? (
          <>
            <h3 className="text-white font-medium">Langkah Verifikasi File</h3>
            <ol className="space-y-2 text-sm text-slate-400 list-decimal list-inside">
              <li>Unduh file verifikasi dari backend (akan diberikan setelah klik Verifikasi)</li>
              <li>Upload ke direktori root OJS: <code className="text-cyan-400 bg-slate-800 px-1 rounded">public/ojsdef-verify.txt</code></li>
              <li>Pastikan file dapat diakses di <code className="text-cyan-400">{target.url}/ojsdef-verify.txt</code></li>
              <li>Klik tombol Periksa Verifikasi</li>
            </ol>
          </>
        ) : (
          <>
            <h3 className="text-white font-medium">Langkah Verifikasi DNS</h3>
            <ol className="space-y-2 text-sm text-slate-400 list-decimal list-inside">
              <li>Login ke panel DNS domain Anda</li>
              <li>Tambahkan TXT record baru untuk domain root</li>
              <li>Isi nilai record dengan token yang diberikan backend</li>
              <li>Tunggu propagasi DNS (5–30 menit), lalu klik Periksa Verifikasi</li>
            </ol>
          </>
        )}
      </div>

      {/* Result */}
      {verifyResult && (
        <div className={`rounded-xl border p-4 flex items-center gap-3 ${
          verifyResult.verified
            ? 'bg-green-400/10 border-green-400/20'
            : 'bg-red-400/10 border-red-400/20'
        }`}>
          {verifyResult.verified
            ? <CheckCircle className="h-5 w-5 text-green-400" />
            : <XCircle className="h-5 w-5 text-red-400" />}
          <p className={`text-sm ${verifyResult.verified ? 'text-green-400' : 'text-red-400'}`}>
            {verifyResult.verified
              ? 'Domain berhasil diverifikasi!'
              : 'Verifikasi gagal. Pastikan file/record sudah dipasang dengan benar.'}
          </p>
        </div>
      )}

      <Button
        onClick={handleVerify}
        disabled={verifyTarget.isPending}
        className="bg-primary hover:bg-primary/90"
      >
        {verifyTarget.isPending ? 'Memeriksa...' : 'Periksa Verifikasi'}
      </Button>

      {verifyResult?.verified && (
        <Link href={`/targets/${id}/plugin-guide`}>
          <Button variant="outline" className="border-white/10 text-slate-300 hover:text-white">
            Lanjut ke Panduan Plugin →
          </Button>
        </Link>
      )}
    </div>
  )
}
