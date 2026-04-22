"use client";

import { useState, useEffect, useRef } from "react";
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
  Loader2,
  Radio,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_SCAN_LOGS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const LOG_COLOR_MAP: Record<string, string> = {
  INFO: "text-primary/70",
  DONE: "text-secondary",
  TASK: "text-warning",
  EXEC: "text-primary",
  WARN: "text-destructive",
};

export default function ScanningPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [threats, setThreats] = useState(0);
  const [visibleLogs, setVisibleLogs] = useState<{ time: string; type: string; msg: string }[]>([]);
  
  const logRef = useRef<HTMLDivElement>(null);
  const logIndexRef = useRef(0);

  const ESTIMATED_TOTAL = 300; 

  useEffect(() => {
    const timerId = setInterval(() => {
      setElapsed(prev => prev + 1);
      setProgress(prev => {
        if (prev >= 99) return 99;
        const inc = prev < 20 ? 1.2 : prev < 50 ? 0.6 : prev < 80 ? 0.2 : 0.02;
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
        
        if (MOCK_SCAN_LOGS[idx].type === "WARN" || (MOCK_SCAN_LOGS[idx].type === "EXEC" && Math.random() > 0.8)) {
          setThreats(t => t + 1);
        }
      }
    }, 2000);

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
    <div className="space-y-8 pb-10">
      {/* OPERATION STATUS BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl glass-dark flex items-center justify-center text-primary shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden">
               <motion.div
                 animate={{ opacity: [0.4, 1, 0.4] }}
                 transition={{ duration: 2, repeat: Infinity }}
               >
                 <Activity size={28} />
               </motion.div>
               <div className="absolute inset-0 bg-primary/5 animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Badge variant="cyber" className="h-5 px-2 text-[9px] tracking-[0.15em] font-black uppercase">
                Operation Alpha-7
              </Badge>
              <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">Runtime: {formatTime(elapsed)}</span>
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white">Security Vulnerability <span className="text-primary">Extraction</span></h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Button 
            variant="outline"
            className="flex-1 lg:flex-none border-white/5 bg-white/2 text-xs font-black uppercase tracking-widest px-6 h-12 rounded-2xl hover:bg-white/5"
          >
            Download Interim_Rep
          </Button>
          <Button 
            variant="destructive"
            onClick={() => router.push("/dashboard")}
            className="flex-1 lg:flex-none bg-destructive/10 text-destructive border-destructive/20 font-black uppercase text-xs tracking-widest px-6 h-12 rounded-2xl hover:bg-destructive/20 shadow-[0_0_30px_rgba(255,77,77,0.1)] gap-2"
          >
            <XCircle size={16} /> Terminate_Engine
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CENTERPIECE: PROGRESS & STATS */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-8">
          <Card className="glass-dark border-none min-h-[480px] flex flex-col items-center justify-center relative overflow-hidden group">
             {/* Decorative Background Elements */}
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05)_0%,transparent_70%)]" />
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.826 10.558c1.026.13 2.102-1.03 1.084-2.127-5.224-5.616-15.654-7.62-15.654-7.62-1.027.13-2.102 1.03-1.083 2.127 5.224 5.615 15.653 7.62 15.653 7.62zm-19.492 5.064c1.026.13 2.102-1.03 1.083-2.127C31.18 7.88 20.75 5.875 20.75 5.875c-1.026.13-2.102 1.03-1.083 2.128 5.223 5.615 15.652 7.62 15.652 7.62zm-19.49 5.063c1.027.13 2.103-1.03 1.084-2.127-5.224-5.615-15.654-7.62-15.654-7.62-1.027.13-2.102 1.03-1.083 2.128 5.224 5.615 15.653 7.62 15.653 7.62z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd' /%3E%3C/svg%3E")` }} />

             <div className="relative z-10 w-full p-8 text-center space-y-12">
               <div className="space-y-1">
                 <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary/50">Core Engine Throughput</h2>
                 <p className="text-[10px] font-mono text-muted-foreground/40 break-all uppercase">api.sentinel-core.infra.node_02</p>
               </div>

               <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
                 <svg className="w-full h-full -rotate-90 sm:scale-110" viewBox="0 0 100 100">
                   <circle className="text-white/2 stroke-current" strokeWidth="4" fill="transparent" r="46" cx="50" cy="50" />
                   {/* Background track gradient shadow */}
                   <circle className="text-primary/5 stroke-current blur-sm" strokeWidth="8" fill="transparent" r="46" cx="50" cy="50" />
                   
                   <motion.circle 
                     className="text-primary stroke-current" 
                     strokeWidth="4" 
                     strokeLinecap="round" 
                     fill="transparent" 
                     r="46" 
                     cx="50" 
                     cy="50" 
                     initial={{ strokeDasharray: "0, 289" }}
                     animate={{ strokeDasharray: `${(progress / 100) * 289}, 289` }}
                     transition={{ duration: 1, ease: "circOut" }}
                   />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <motion.div
                       initial={{ scale: 0.8, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       className="flex items-baseline"
                    >
                      <span className="text-7xl font-black text-white text-glow-cyan leading-none">{Math.round(progress)}</span>
                      <span className="text-xl font-black text-white/20 ml-1">%</span>
                    </motion.div>
                    <div className="flex items-center gap-1.5 mt-3">
                      <div className="w-1 h-1 rounded-full bg-secondary animate-ping" />
                      <span className="text-[9px] text-secondary font-black uppercase tracking-widest">Active_Probe</span>
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/2 border border-white/5 rounded-2xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Threats</p>
                    <p className={cn("text-2xl font-black font-mono", threats > 0 ? "text-destructive text-glow-red" : "text-secondary")}>
                      {String(threats).padStart(2, "0")}
                    </p>
                 </div>
                 <div className="bg-white/2 border border-white/5 rounded-2xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Estimated</p>
                    <p className="text-2xl font-black font-mono text-white">
                      {formatTime(remaining)}
                    </p>
                 </div>
               </div>
             </div>

             <div className="absolute bottom-0 left-0 w-full h-1 bg-white/3">
                <motion.div 
                  className="h-full bg-primary shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
             </div>
          </Card>
        </div>

        {/* LOGS PANEL */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-8">
           <Card className="glass border-none h-[480px] flex flex-col overflow-hidden">
              <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Terminal size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">Engine_Telemetry</h3>
                    <p className="text-[9px] font-mono text-muted-foreground/40 uppercase">Channel: Secure_PROB_001</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden md:flex gap-4">
                    {["INFO", "DONE", "TASK", "EXEC", "WARN"].map(type => (
                      <div key={type} className="flex items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-crosshair">
                        <div className={cn("w-1.5 h-1.5 rounded-full", type === "INFO" ? "bg-primary/50" : type === "DONE" ? "bg-secondary" : type === "TASK" ? "bg-warning" : type === "EXEC" ? "bg-primary" : "bg-destructive")} />
                        <span className="text-[9px] font-black font-mono text-white/40">{type}</span>
                      </div>
                    ))}
                  </div>
                  <Badge className="bg-secondary/10 text-secondary text-[9px] font-black border-0">SYSTEM_NOMINAL</Badge>
                </div>
              </div>

              <CardContent className="flex-1 overflow-hidden p-0 relative">
                <div 
                  ref={logRef}
                  className="absolute inset-0 p-8 overflow-y-auto font-mono text-[11px] space-y-1.5 scrollbar-thin scroll-smooth"
                >
                  <AnimatePresence mode="popLayout">
                    {visibleLogs.length === 0 && (
                      <div className="flex items-center gap-3 text-muted-foreground/30 animate-pulse font-mono uppercase tracking-widest h-full justify-center">
                        <Loader2 size={16} className="animate-spin" />
                        Establishing Secure Tunnel...
                      </div>
                    )}
                    {visibleLogs.map((log, i) => (
                      <motion.div 
                        key={`${log.time}-${i}`} 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "flex gap-4 py-1 border-l pl-4 transition-all duration-300",
                          i === visibleLogs.length - 1 ? "border-primary bg-primary/10 -ml-4 pl-8" : "border-white/5"
                        )}
                      >
                         <span className="text-white/20 whitespace-nowrap">[{log.time}]</span>
                         <span className={cn("font-black min-w-[40px] text-[10px]", LOG_COLOR_MAP[log.type])}>{log.type}</span>
                         <span className="text-white/60 tracking-tight">{log.msg}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div className="h-4 w-2 bg-primary/60 inline-block align-middle animate-pulse ml-2" />
                </div>
              </CardContent>

              <div className="px-8 py-5 border-t border-white/5 bg-white/1 flex items-center justify-between h-14">
                 <div className="flex items-center gap-8">
                   <div className="flex items-center gap-2">
                     <Radio size={14} className="text-secondary animate-pulse" />
                     <span className="text-[10px] font-black font-mono text-secondary uppercase tracking-widest">Network: 1,421 PPS</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <Cpu size={14} className="text-primary" />
                     <span className="text-[10px] font-black font-mono text-primary/80 uppercase tracking-widest">CPU: 42.8%</span>
                   </div>
                 </div>
                 <span className="text-[9px] font-black font-mono text-white/20 uppercase">Module: OJS_A_CORE_V1.0</span>
              </div>
           </Card>
        </div>
      </div>

      {/* QUICK INSIGHTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Zap, label: "Extraction Rate", value: "8.2 KB/s", color: "text-primary" },
          { icon: ShieldAlert, label: "Critical Vects", value: threats, color: threats > 0 ? "text-destructive" : "text-white/40" },
          { icon: Globe, label: "Mesh Discovered", value: "31 Nodes", color: "text-secondary" },
          { icon: Clock, label: "ET_COMPLETION", value: formatTime(remaining), color: "text-white" },
        ].map((item, i) => (
          <Card key={i} className="glass-dark border-none h-24 relative overflow-hidden group">
            <CardContent className="h-full p-0 flex items-center px-6 gap-5">
               <div className={cn("w-10 h-10 rounded-xl bg-white/3 flex items-center justify-center transition-all group-hover:scale-110", item.color)}>
                 <item.icon size={20} />
               </div>
               <div className="space-y-0.5">
                  <p className="text-[9px] font-black font-mono text-muted-foreground/50 uppercase tracking-[0.2em]">{item.label}</p>
                  <p className={cn("text-xl font-black font-mono", item.color)}>{item.value}</p>
               </div>
               <div className="absolute top-0 right-0 w-16 h-16 bg-white/1 rotate-45 translate-x-8 -translate-y-8" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}