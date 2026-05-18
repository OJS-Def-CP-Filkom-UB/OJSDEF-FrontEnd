"use client";

import { Globe, Server, Cpu, ArrowRight, CheckCircle2, Link2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  institutionName: z.string().min(2, "Nama institusi wajib diisi"),
  ojsUrl: z.string().url("Masukkan URL yang valid (contoh: https://journal.example.ac.id)"),
  scanType: z.enum(["internal", "external", "full_audit"]),
})

type FormValues = z.infer<typeof formSchema>

const SCAN_TYPES = [
  { id: "internal" as const, title: "Audit Internal", desc: "Pemindaian dari dalam via plugin PHP", time: "5–10 menit", icon: Server },
  { id: "external" as const, title: "Audit Eksternal", desc: "Pemindaian dari luar via bot OJSDef", time: "10–15 menit", icon: Globe },
  { id: "full_audit" as const, title: "Audit Lengkap", desc: "Internal + Eksternal bersamaan", time: "15–20 menit", icon: Cpu },
]

export default function NewTargetPage() {
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { institutionName: "", ojsUrl: "", scanType: "internal" },
  })

  const onSubmit = (_values: FormValues) => {
    router.push("/targets/target_01/verify")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
          <Badge variant="cyber" className="h-6 px-3 tracking-[0.2em] uppercase text-[9px] font-black">Tambah Target</Badge>
        </motion.div>

        <motion.h1
          className="text-5xl font-black tracking-tighter text-white"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          Tambah Target <span className="text-secondary">OJS</span>
        </motion.h1>

        <motion.p
          className="text-muted-foreground text-lg font-medium max-w-xl"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          Daftarkan instalasi OJS baru untuk dipantau dan diaudit secara berkala.
        </motion.p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="glass border-none h-full">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Link2 size={18} className="text-primary" /> Identifikasi Target
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="institutionName"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/50 px-1">Nama Institusi / Label</FormLabel>
                          <FormControl>
                            <Input placeholder="Universitas Brawijaya" className="h-12 bg-white/3 border-white/5 rounded-2xl px-5 text-sm font-mono focus:border-secondary/30 focus:ring-0 placeholder:text-muted-foreground/30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ojsUrl"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/50 px-1">URL Instalasi OJS</FormLabel>
                          <FormControl>
                            <div className="relative group/input">
                              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-secondary transition-colors" />
                              <Input placeholder="https://journal.example.ac.id" className="h-12 bg-white/3 border-white/5 rounded-2xl pl-12 pr-5 text-sm font-mono focus:border-secondary/30 focus:ring-0 placeholder:text-muted-foreground/30" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="glass-dark border-none h-full flex flex-col justify-between">
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Langkah Selanjutnya</h3>
                  <div className="space-y-6">
                    {["Verifikasi kepemilikan domain OJS", "Instalasi plugin OJSDef ke server", "Mulai pemindaian pertama"].map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0 text-xs font-black">{i + 1}</div>
                        <div className="flex items-center"><p className="text-xs font-bold text-white">{step}</p></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <div className="p-8 border-t border-white/5 bg-secondary/5">
                  <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-[0_0_30px_rgba(0,230,153,0.15)] group">
                    <span className="flex items-center gap-3">
                      Lanjut ke Verifikasi Domain <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>

          <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <CheckCircle2 size={20} className="text-secondary" /> Pilih Jenis Audit
            </h3>
            <FormField
              control={form.control}
              name="scanType"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {SCAN_TYPES.map((type) => (
                        <FormItem key={type.id} className="space-y-0">
                          <FormControl>
                            <RadioGroupItem value={type.id} className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col h-full glass-dark rounded-2xl p-6 cursor-pointer border border-transparent peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-secondary/5 hover:border-white/10 transition-all">
                            <div className="flex justify-between items-start mb-6">
                              <div className="w-10 h-10 rounded-xl bg-white/3 flex items-center justify-center text-muted-foreground">
                                <type.icon size={20} />
                              </div>
<span className="text-[10px] font-black font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded">{type.time}</span>
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white mb-2 block">{type.title}</span>
                            <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold uppercase tracking-wider">{type.desc}</p>
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
          </motion.div>
        </form>
      </Form>
    </div>
  )
}
