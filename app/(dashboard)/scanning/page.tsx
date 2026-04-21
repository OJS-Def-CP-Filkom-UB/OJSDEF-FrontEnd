"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Activity, 
  Terminal, 
  ShieldAlert, 
  Clock, 
  XCircle, 
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Globe,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MOCK_SCAN_LOGS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const LOG_COLOR_MAP: Record<string, string> = {
  INFO: "text-blue-400",
  DONE: "text-emerald-400",
  TASK: "text-amber-400",
  EXEC: "text-cyan-400",
  WARN: "text-rose-400",
};

export default function ScanningPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [threats, setThreats] = useState(0);
  const [visibleLogs, setVisibleLogs] = useState<{ time: string; type: string; msg: string }[]>([]);
  
  const logRef = useRef<HTMLDivElement>(null);
  const logIndexRef = useRef(0);

  // Simulation parameters
  const ESTIMATED_TOTAL = 180; // 3 minutes

  useEffect(() => {
    const timerId = setInterval(() => {
      setElapsed(prev => prev + 1);
      setProgress(prev => {
        if (prev >= 99) return 99;
        const inc = prev < 30 ? 0.8 : prev < 60 ? 0.4 : prev < 85 ? 0.2 : 0.05;
        return Math.min(99, parseFloat((prev + inc).toFixed(2)));
      });
    }, 1000);

    const logId = setInterval(() => {
      const idx = logIndexRef.current;
      if (idx < MOCK_SCAN_LOGS.length) {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
        
        setVisibleLogs(prev => [...prev, { ...MOCK_SCAN_LOGS[idx], time: timeStr }]);
        logIndexRef.current = idx + 1;
        
        // Randomly increase threats found
        if (MOCK_SCAN_LOGS[idx].type === "WARN" || (MOCK_SCAN_LOGS[idx].type === "EXEC" && Math.random() > 0.7)) {
          setThreats(t => t + 1);
        }
      }
    }, 2500);

    return () => {
      clearInterval(timerId);
      clearInterval(logId);
    };
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [visibleLogs]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const remaining = Math.max(0, ESTIMATED_TOTAL - elapsed);

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
              <Activity size={24} className="animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-bold tracking-widest px-2 h-5">
                Live Operation
              </Badge>
              <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">ID: SCAN-7729110</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Active Vulnerability Scan</h1>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push("/dashboard")}
          className="rounded-xl border-destructive/20 bg-destructive/5 text-destructive font-bold gap-2 hover:bg-destructive/10 h-12 px-6"
        >
          <XCircle size={18} /> Abort Operation
        </Button>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PROGRESS CARD */}
        <Card className="lg:col-span-5 border-border bg-slate-900/40 backdrop-blur-sm p-8 flex flex-col items-center justify-between min-h-[450px]">
          <div className="w-full">
             <CardDescription className="text-xs uppercase font-bold tracking-widest text-primary/70 mb-2">Engine Progress</CardDescription>
             <h2 className="text-sm font-bold text-white/60 mb-8 flex items-center gap-2">
               <Globe size={14} className="text-primary" /> Target: api.sentinel-core.infra
             </h2>
          </div>

          <div className="relative w-56 h-56">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle className="text-white/5 stroke-current" strokeWidth="8" fill="transparent" r="44" cx="50" cy="50" />
              <motion.circle 
                className="text-primary stroke-current" 
                strokeWidth="8" 
                strokeLinecap="round" 
                fill="transparent" 
                r="44" 
                cx="50" 
                cy="50" 
                strokeDasharray="276.46"
                initial={{ strokeDashoffset: 276.46 }}
                animate={{ strokeDashoffset: 276.46 - (progress / 100) * 276.46 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="flex items-baseline gap-0.5">
                <span className="text-5xl font-bold text-white tracking-tighter">{Math.round(progress)}</span>
                <span className="text-xl font-medium text-white/40">%</span>
              </div>
              <span className="text-[10px] text-primary/80 font-bold uppercase tracking-[0.2em] mt-2">Scanning Phase</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full mt-10 pt-8 border-t border-border">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">Elapsed</p>
              <p className="text-xl font-bold font-mono text-white">{formatTime(elapsed)}</p>
            </div>
            <div className="text-center border-x border-border px-4">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">Threats</p>
              <p className={cn("text-xl font-bold font-mono", threats > 0 ? "text-destructive" : "text-emerald-500")}>
                {String(threats).padStart(2, "0")}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">Est. Left</p>
              <p className="text-xl font-bold font-mono text-white">~{formatTime(remaining)}</p>
            </div>
          </div>
        </Card>

        {/* LOG FEED CARD */}
        <Card className="lg:col-span-7 border-border bg-slate-900/40 backdrop-blur-sm flex flex-col h-[450px]">
          <CardHeader className="pb-4 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-primary" />
                <CardTitle className="text-lg font-bold">Engine Telemetry Feed</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-white/5 text-primary text-[10px] font-bold tracking-widest font-mono">
                DAEMON_ACTIVE
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col min-h-0">
            <div className="flex gap-4 mb-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400" /> INFO</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /> DONE</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400" /> TASK</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-400" /> WARN</div>
            </div>

            <div 
              ref={logRef}
              className="flex-1 bg-black/40 rounded-xl border border-white/5 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed scrollbar-thin scrollbar-thumb-white/10"
            >
              <AnimatePresence mode="popLayout">
                {visibleLogs.length === 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                    <Loader2 size={12} className="animate-spin" />
                    Initializing engine components...
                  </div>
                )}
                {visibleLogs.map((log, i) => (
                  <motion.div 
                    key={`${log.time}-${i}`} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "py-1.5 flex gap-3 border-l-2 pl-4 mb-1",
                      i === visibleLogs.length - 1 ? "bg-primary/5 border-primary" : "border-transparent"
                    )}
                  >
                    <span className="text-white/20 whitespace-nowrap">[{log.time}]</span>
                    <span className={cn("font-bold min-w-[45px]", LOG_COLOR_MAP[log.type] || "text-white/40")}>{log.type}</span>
                    <span className="text-white/80">{log.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="w-2 h-4 bg-primary inline-block ml-1 align-middle animate-pulse" />
            </div>

            <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                 <div className="relative">
                   <Cpu size={16} className="text-primary" />
                   <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
                 </div>
                 <span className="text-xs font-bold text-white/60">Processing Neural Patterns</span>
               </div>
               <div className="text-[11px] font-bold font-mono text-primary">
                 THROUGHPUT: 1,402 PPS
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QUICK STATUS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: ShieldAlert, label: "Vulnerabilities", value: threats, sub: "Critical Issues", color: "text-rose-500", bg: "bg-rose-500/10" },
          { icon: Globe, label: "Endpoints", value: "1,240", sub: "Discovered", color: "text-blue-500", bg: "bg-blue-500/10" },
          { icon: Activity, label: "Scan Speed", value: "Medium", sub: "Deep Analysis", color: "text-primary", bg: "bg-primary/10" },
          { icon: CheckCircle2, label: "Confidence", value: "98.2%", sub: "Accuracy Index", color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((item, i) => (
          <Card key={i} className="border-border bg-slate-900/40 backdrop-blur-sm p-4">
             <div className="flex items-center gap-4">
                <div className={cn("p-2 rounded-xl", item.bg, item.color)}>
                  <item.icon size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</p>
                   <p className="text-lg font-bold text-white">{item.value}</p>
                   <p className="text-[10px] font-medium text-muted-foreground/60">{item.sub}</p>
                </div>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
}