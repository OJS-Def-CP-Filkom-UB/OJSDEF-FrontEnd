"use client";

import Link from "next/link";
import { Plus, ExternalLink, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_OJS_TARGETS } from "@/lib/mock-data";
import type { PluginStatus } from "@/types/ojsdef";
import { cn } from "@/lib/utils";

const PLUGIN_STATUS_CONFIG: Record<PluginStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  connected:       { label: "Terhubung",         color: "text-secondary",           icon: CheckCircle2 },
  disconnected:    { label: "Terputus",           color: "text-destructive",          icon: XCircle },
  error:           { label: "Error",              color: "text-warning",              icon: XCircle },
  never_connected: { label: "Belum Diverifikasi", color: "text-muted-foreground",     icon: Clock },
}

function getRiskColor(score: number | null): string {
  if (score === null) return "text-muted-foreground"
  if (score >= 80) return "text-destructive"
  if (score >= 60) return "text-orange-400"
  if (score >= 40) return "text-warning"
  return "text-secondary"
}

export default function TargetsPage() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
            Daftar Target <span className="text-primary">OJS</span>
          </h1>
          <p className="text-muted-foreground/60 text-sm mt-1">{MOCK_OJS_TARGETS.length} instalasi OJS terdaftar</p>
        </div>
        <Link href="/targets/new">
          <Button className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:scale-105 transition-transform gap-2">
            <Plus size={16} /> Tambah Target
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {MOCK_OJS_TARGETS.map((target, i) => {
          const statusCfg = PLUGIN_STATUS_CONFIG[target.pluginStatus]
          const StatusIcon = statusCfg.icon

          return (
            <motion.div key={target.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-dark border border-transparent hover:border-white/10 transition-all h-full">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{target.institutionName}</p>
                      <p className="text-[10px] font-mono text-muted-foreground/50 mt-0.5">{target.url}</p>
                    </div>
                    <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest border-white/10", statusCfg.color)}>
                      <StatusIcon size={10} className="mr-1" />
                      {statusCfg.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/3 rounded-xl p-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Skor Risiko</p>
                      <p className={cn("text-xl font-black", getRiskColor(target.lastRiskScore))}>
                        {target.lastRiskScore ?? "—"}
                      </p>
                    </div>
                    <div className="bg-white/3 rounded-xl p-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Versi OJS</p>
                      <p className="text-xs font-mono text-white/80">{target.ojsVersion ?? "?"}</p>
                    </div>
                  </div>

                  <p className="text-[9px] text-muted-foreground/30 font-mono">
                    Scan terakhir: {target.lastScanAt ?? "Belum pernah"}
                  </p>

                  <div className="flex gap-2 mt-auto pt-2 border-t border-white/5">
                    <Link href={`/targets/${target.id}/verify`} className="flex-1">
                      <Button variant="outline" className="w-full h-9 text-[9px] font-black uppercase tracking-widest border-white/5 rounded-xl hover:bg-white/5">
                        Detail
                      </Button>
                    </Link>
                    <Button variant="outline" className="h-9 px-3 border-white/5 rounded-xl hover:bg-white/5 text-muted-foreground">
                      <RefreshCw size={14} />
                    </Button>
                    <a href={`https://${target.url}`} target="_blank" rel="noreferrer">
                      <Button variant="outline" className="h-9 px-3 border-white/5 rounded-xl hover:bg-white/5 text-muted-foreground">
                        <ExternalLink size={14} />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
