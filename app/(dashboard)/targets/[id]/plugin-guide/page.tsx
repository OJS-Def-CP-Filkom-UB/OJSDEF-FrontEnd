"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Upload, Key, Wifi, CheckCircle2, Loader2, XCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_OJS_TARGETS } from "@/lib/mock-data";

const API_KEY_MOCK = "ojsdef-ak-7f3a91bc2e4d5f6a8b0c"

export default function PluginGuidePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const target = MOCK_OJS_TARGETS.find((t) => t.id === id) ?? MOCK_OJS_TARGETS[0]

  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<"connected" | "disconnected" | null>(null)

  const handleCheck = async () => {
    setIsChecking(true)
    setResult(null)
    await new Promise((r) => setTimeout(r, 2000))
    setIsChecking(false)
    setResult("connected")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <div>
        <Badge variant="cyber" className="h-6 px-3 tracking-[0.2em] uppercase text-[9px] font-black mb-4">Plugin Guide</Badge>
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
          Instalasi <span className="text-primary">Plugin OJSDef</span>
        </h1>
        <p className="text-muted-foreground/60 text-sm mt-1 font-mono">{target.url}</p>
      </div>

      <div className="space-y-4">
        {[
          {
            num: 1, icon: Download, title: "Unduh Plugin",
            content: (
              <div className="space-y-3">
                <p className="text-sm text-white/70">Unduh file plugin OJSDef untuk versi OJS Anda.</p>
                <Button variant="outline" className="h-10 px-5 rounded-xl font-black uppercase text-xs tracking-widest border-white/10 gap-2">
                  <Download size={14} /> Unduh ojsdef-plugin-v1.2.zip
                </Button>
              </div>
            ),
          },
          {
            num: 2, icon: Upload, title: "Upload ke OJS",
            content: (
              <ol className="space-y-3">
                {["Login ke panel admin OJS Anda", "Buka Settings → Website → Plugins", "Klik tombol Upload Plugin", "Pilih file ojsdef-plugin-v1.2.zip", "Klik Install dan tunggu selesai", "Aktifkan plugin dengan klik Enable"].map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-white/70">
                    <span className="w-5 h-5 rounded-full bg-white/5 text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            ),
          },
          {
            num: 3, icon: Key, title: "Aktivasi & API Key",
            content: (
              <div className="space-y-4">
                <p className="text-sm text-white/70">Masukkan API Key berikut di halaman konfigurasi plugin OJSDef:</p>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-black/40 border border-white/5">
                  <code className="text-primary font-mono text-xs flex-1 break-all">{API_KEY_MOCK}</code>
                </div>
                <ol className="space-y-2">
                  {["Di panel admin OJS, buka Settings → Website → Plugins", "Klik Settings di samping plugin OJSDef", "Tempelkan API Key di atas ke kolom yang tersedia", "Klik Save"].map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm text-white/70">
                      <span className="w-5 h-5 rounded-full bg-white/5 text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            ),
          },
        ].map((s, i) => (
          <motion.div key={s.num} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-dark border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><s.icon size={18} /></div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Langkah {s.num}</p>
                    <h3 className="text-sm font-black text-white">{s.title}</h3>
                  </div>
                </div>
                {s.content}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Step 4: Verify Connection */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-dark border-none">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary"><Wifi size={18} /></div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Langkah 4</p>
                  <h3 className="text-sm font-black text-white">Verifikasi Koneksi</h3>
                </div>
              </div>

              <p className="text-sm text-white/70">Setelah mengisi API Key, klik tombol di bawah untuk memverifikasi koneksi antara OJSDef dan instalasi OJS Anda.</p>

              {result === "connected" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/10 border border-secondary/20">
                  <CheckCircle2 size={18} className="text-secondary" />
                  <div>
                    <p className="text-xs font-black text-secondary uppercase tracking-wide">Plugin Terhubung</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">Plugin OJSDef berhasil terhubung ke instalasi OJS Anda.</p>
                  </div>
                </motion.div>
              )}

              {result === "disconnected" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
                  <XCircle size={18} className="text-destructive" />
                  <div>
                    <p className="text-xs font-black text-destructive uppercase tracking-wide">Tidak Terhubung</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">Periksa kembali API Key dan pastikan plugin sudah aktif.</p>
                  </div>
                </motion.div>
              )}

              <Button className="w-full h-12 rounded-2xl font-black uppercase text-xs tracking-widest gap-2" onClick={handleCheck} disabled={isChecking}>
                {isChecking ? <><Loader2 size={16} className="animate-spin" /> Memeriksa...</> : <><Wifi size={16} /> Periksa Koneksi</>}
              </Button>

              {result === "connected" && (
                <Button className="w-full h-12 rounded-2xl bg-secondary text-black font-black uppercase text-xs tracking-widest gap-2" onClick={() => router.push("/targets")}>
                  Selesai — Kembali ke Daftar Target <ArrowRight size={16} />
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
