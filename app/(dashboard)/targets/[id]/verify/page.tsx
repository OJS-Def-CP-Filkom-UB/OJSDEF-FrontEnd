"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, FileText, Globe, ArrowRight, Loader2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_OJS_TARGETS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type VerifyMethod = "file" | "dns"
type VerifyStep = 1 | 2 | 3
type VerifyResult = "success" | "fail" | null

const STEPS = ["Pilih Metode", "Instruksi", "Verifikasi"]

export default function VerifyPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const target = MOCK_OJS_TARGETS.find((t) => t.id === id) ?? MOCK_OJS_TARGETS[0]

  const [step, setStep] = useState<VerifyStep>(1)
  const [method, setMethod] = useState<VerifyMethod | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<VerifyResult>(null)

  const handleCheck = async () => {
    setIsChecking(true)
    setResult(null)
    await new Promise((r) => setTimeout(r, 2000))
    setIsChecking(false)
    setResult("success")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <div>
        <Badge variant="cyber" className="h-6 px-3 tracking-[0.2em] uppercase text-[9px] font-black mb-4">Domain Verification</Badge>
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
          Verifikasi <span className="text-primary">Domain</span>
        </h1>
        <p className="text-muted-foreground/60 text-sm mt-1 font-mono">{target.url}</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center">
        {STEPS.map((label, i) => {
          const stepNum = (i + 1) as VerifyStep
          const isDone = step > stepNum
          const isActive = step === stepNum
          return (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all", isDone ? "bg-secondary text-black" : isActive ? "bg-primary text-black" : "bg-white/5 text-muted-foreground")}>
                  {isDone ? <CheckCircle2 size={14} /> : stepNum}
                </div>
                <span className={cn("text-[9px] font-black uppercase tracking-widest text-center", isActive ? "text-primary" : "text-muted-foreground/40")}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={cn("h-px flex-1 mx-2 mb-5", step > stepNum ? "bg-secondary" : "bg-white/5")} />}
            </div>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="glass-dark border-none">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Pilih Metode Verifikasi</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: "file" as VerifyMethod, icon: FileText, title: "Upload File Token", desc: "Upload file token ke direktori root OJS Anda" },
                    { id: "dns" as VerifyMethod, icon: Globe, title: "DNS TXT Record", desc: "Tambahkan TXT record ke konfigurasi DNS domain" },
                  ].map((m) => (
                    <button key={m.id} onClick={() => setMethod(m.id)} className={cn("p-5 rounded-2xl border text-left transition-all", method === m.id ? "border-primary/50 bg-primary/5" : "border-white/5 bg-white/2 hover:border-white/10")}>
                      <m.icon size={20} className={cn("mb-3", method === m.id ? "text-primary" : "text-muted-foreground/40")} />
                      <p className="text-xs font-black text-white uppercase tracking-wide">{m.title}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1">{m.desc}</p>
                    </button>
                  ))}
                </div>
                <Button className="w-full h-12 rounded-2xl font-black uppercase text-xs tracking-widest gap-2" disabled={!method} onClick={() => setStep(2)}>
                  Lanjut <ArrowRight size={16} />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="glass-dark border-none">
              <CardContent className="p-6 space-y-5">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/60">
                  Instruksi — {method === "file" ? "Upload File Token" : "DNS TXT Record"}
                </h3>
                <ol className="space-y-4">
                  {(method === "file"
                    ? [
                        `Unduh file token verifikasi: ojsdef-verify-${target.id}.txt`,
                        `Upload file tersebut ke direktori root OJS Anda`,
                        `Pastikan file dapat diakses di: https://${target.url}/ojsdef-verify-${target.id}.txt`,
                        `Klik "Periksa Sekarang" setelah file berhasil diupload`,
                      ]
                    : [
                        `Buka panel manajemen DNS domain ${target.url}`,
                        `Tambahkan TXT record baru dengan nilai: ojsdef-verify=${target.id}-abc123`,
                        `Propagasi DNS memerlukan waktu 5–30 menit`,
                        `Klik "Periksa Sekarang" setelah TXT record aktif`,
                      ]
                  ).map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                      <p className="text-sm text-white/70">{s}</p>
                    </li>
                  ))}
                </ol>
                <Button className="w-full h-12 rounded-2xl font-black uppercase text-xs tracking-widest gap-2" onClick={() => setStep(3)}>
                  Saya Sudah Selesai <ArrowRight size={16} />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="glass-dark border-none">
              <CardContent className="p-6 space-y-5">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Verifikasi Domain</h3>
                <p className="text-sm text-white/70">
                  Klik tombol di bawah untuk memverifikasi kepemilikan domain <span className="text-primary font-mono">{target.url}</span>.
                </p>

                {result === "success" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/10 border border-secondary/20">
                    <CheckCircle2 size={18} className="text-secondary" />
                    <div>
                      <p className="text-xs font-black text-secondary uppercase tracking-wide">Verifikasi Berhasil</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">Domain berhasil diverifikasi. Lanjutkan ke instalasi plugin.</p>
                    </div>
                  </motion.div>
                )}

                {result === "fail" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
                    <XCircle size={18} className="text-destructive" />
                    <div>
                      <p className="text-xs font-black text-destructive uppercase tracking-wide">Verifikasi Gagal</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">Token tidak ditemukan. Periksa kembali langkah instruksi.</p>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 h-12 rounded-2xl font-black uppercase text-xs tracking-widest border-white/5" onClick={() => setStep(2)} disabled={isChecking}>Kembali</Button>
                  <Button className="flex-1 h-12 rounded-2xl font-black uppercase text-xs tracking-widest gap-2" onClick={handleCheck} disabled={isChecking}>
                    {isChecking ? <><Loader2 size={16} className="animate-spin" /> Memeriksa...</> : "Periksa Sekarang"}
                  </Button>
                </div>

                {result === "success" && (
                  <Button className="w-full h-12 rounded-2xl bg-secondary text-black font-black uppercase text-xs tracking-widest gap-2" onClick={() => router.push(`/targets/${target.id}/plugin-guide`)}>
                    Lanjut ke Instalasi Plugin <ArrowRight size={16} />
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
