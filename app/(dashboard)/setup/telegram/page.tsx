'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useGetTelegramLink } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { MessageCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react'

const STEPS = [
  { n: 1, title: 'Klik tombol di bawah', desc: 'Telegram akan terbuka otomatis' },
  { n: 2, title: 'Tekan tombol START di bot', desc: 'Tidak perlu ketik apapun' },
  { n: 3, title: 'Kembali ke halaman ini', desc: 'Halaman ini otomatis berlanjut' },
]

export default function SetupTelegramPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { data: linkData } = useGetTelegramLink()
  const [linked, setLinked] = useState(false)

  // Detect if already linked before page opens
  useEffect(() => {
    if (user?.telegram_chat_id) {
      setLinked(true)
    }
  }, [user])

  // Redirect after linked
  useEffect(() => {
    if (!linked) return
    const timer = setTimeout(() => router.push('/dashboard'), 1500)
    return () => clearTimeout(timer)
  }, [linked, router])

  // Poll every 3 seconds
  useEffect(() => {
    if (linked) return
    const interval = setInterval(async () => {
      await refreshUser()
    }, 3000)
    return () => clearInterval(interval)
  }, [linked, refreshUser])

  // Update linked when user state changes
  useEffect(() => {
    if (user?.telegram_chat_id && !linked) {
      setLinked(true)
    }
  }, [user?.telegram_chat_id, linked])

  if (linked) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="glass-dark rounded-xl border border-green-500/20 p-10 text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-400/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <h2 className="text-white font-bold text-xl">Telegram Berhasil Terhubung!</h2>
          <p className="text-slate-400 text-sm">Mengarahkan ke dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto mt-8">
      <div className="glass-dark rounded-xl border border-white/5 p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Hubungkan Akun Telegram</h1>
            <p className="text-slate-400 text-sm">Diperlukan sebelum menggunakan dashboard</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map(({ n, title, desc }) => (
            <div
              key={n}
              className="flex items-start gap-4 bg-slate-900/40 border border-white/5 rounded-lg px-4 py-3"
            >
              <div className="h-7 w-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-primary text-xs font-bold">{n}</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{title}</p>
                <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Telegram username info */}
        {user?.telegram_username && (
          <div className="bg-slate-900/40 border border-white/5 rounded-lg px-4 py-3">
            <p className="text-slate-400 text-xs mb-1">Akun Telegram yang akan dihubungkan:</p>
            <p className="text-white font-mono text-sm">{user.telegram_username}</p>
            <p className="text-slate-500 text-xs mt-1">
              Konfirmasi dengan admin jika tidak sesuai
            </p>
          </div>
        )}

        {/* CTA */}
        <Button
          asChild
          className="w-full bg-primary hover:bg-primary/90"
          disabled={!linkData?.deeplink}
        >
          <a
            href={linkData?.deeplink ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Buka Bot Telegram OJSDef
          </a>
        </Button>

        {/* Polling status */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Menunggu konfirmasi dari Telegram...</span>
          </div>
          <p className="text-center text-slate-600 text-xs">
            Halaman ini otomatis berlanjut setelah Anda menekan START di bot
          </p>
        </div>
      </div>
    </div>
  )
}
