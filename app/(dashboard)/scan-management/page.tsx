"use client";

import { 
  Plus, 
  History, 
  Activity, 
  Clock, 
  Search, 
  MoreVertical, 
  ShieldCheck, 
  XSquare,
  ArrowUpRight,
  Download,
  AlertCircle,
  CheckCircle2,
  Settings2,
  Cpu,
  Zap,
  Terminal,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { MOCK_ACTIVE_SCANS, MOCK_SCAN_HISTORY } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function ScanManagementPage() {
  const router = useRouter();

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl glass-dark flex items-center justify-center text-primary shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <Activity size={28} />
          </div>
          <div>
             <div className="flex items-center gap-2 mb-1">
               <Badge variant="cyber" className="text-[9px] font-black uppercase tracking-widest h-5 px-2">Eng_Orchestrator</Badge>
               <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-tighter italic">V.04-Beta</span>
             </div>
             <h1 className="text-3xl font-black tracking-tighter text-white uppercase">Scan <span className="text-primary">Management</span></h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none h-12 px-6 rounded-2xl border-white/5 bg-white/2 text-white font-black uppercase text-xs tracking-widest hover:bg-white/5 gap-2">
            <Settings2 size={16} /> Config
          </Button>
          <Button 
            onClick={() => router.push("/add-target")}
            className="flex-1 md:flex-none h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:scale-105 transition-transform gap-2"
          >
            <Plus size={20} /> New_Probe
          </Button>
        </div>
      </div>

      {/* OPERATIONAL TELEMETRY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active_Probes", value: MOCK_ACTIVE_SCANS.length, sub: "LIVE_ENGINES", color: "text-primary", icon: Activity },
          { label: "Throughput_24H", value: "128", sub: "+12% OFFSET", color: "text-secondary", icon: Zap },
          { label: "Mean_Scan_Time", value: "18.4m", sub: "OPTIMIZED", color: "text-white", icon: Clock },
          { label: "In_Queue", value: "03", sub: "CAP_30%", color: "text-warning", icon: Terminal },
        ].map((stat, i) => (
          <Card key={i} className="glass-dark border-none h-24 relative overflow-hidden group">
            <CardContent className="h-full p-0 flex items-center px-6 gap-5">
               <div className={cn("w-10 h-10 rounded-xl bg-white/3 flex items-center justify-center transition-all group-hover:scale-110", stat.color)}>
                 <stat.icon size={20} />
               </div>
               <div className="space-y-0.5">
                  <p className="text-[9px] font-black font-mono text-muted-foreground/50 uppercase tracking-[0.2em]">{stat.label}</p>
                  <p className={cn("text-xl font-black font-mono", stat.color)}>{stat.value}</p>
               </div>
               <div className="absolute bottom-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                 <stat.icon size={48} />
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ACTIVE OPERATIONS GRID */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <h2 className="text-sm font-black text-white uppercase tracking-tight">Active_Operations_Feed</h2>
           </div>
           <Button variant="ghost" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-4 hover:bg-primary/5">Refresh_Engines</Button>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
           {MOCK_ACTIVE_SCANS.map((scan, i) => (
             <motion.div 
               key={scan.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
             >
               <Card className="glass border-none p-8 relative group overflow-hidden h-full flex flex-col">
                  {/* Status Indicator Bar */}
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary shadow-[0_0_15px_rgba(6,182,212,0.3)]" />
                  
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors tracking-tight uppercase leading-none">{scan.title}</h3>
                        <Badge variant="cyber" className="text-[9px] font-black uppercase h-5 px-2">Live_Scan</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest leading-none">
                         <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-secondary" /> {scan.target}</span>
                         <span className="w-1 h-1 rounded-full bg-white/5" />
                         <span>ID: {scan.id}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground/20 hover:text-white rounded-xl h-10 w-10 hover:bg-white/5 transition-all">
                      <MoreVertical size={20} />
                    </Button>
                  </div>

                  <div className="space-y-4 mb-10 flex-1">
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">Runtime_Integrity</span>
                      <span className="text-xs font-black text-primary font-mono">{scan.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${scan.progress}%` }}
                          className="h-full bg-primary shadow-[0_0_10px_rgba(6,182,212,0.4)] rounded-full transition-all duration-1000 ease-in-out"
                       />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-8 w-full sm:w-auto">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] mb-1">Threats</span>
                        <div className="flex items-center gap-2">
                           <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", scan.threatsFound > 0 ? "bg-destructive" : "bg-secondary")} />
                           <span className={cn("text-base font-black font-mono", scan.threatsFound > 0 ? "text-destructive text-glow-red" : "text-white/60")}>
                             {String(scan.threatsFound).padStart(2, "0")}
                           </span>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-white/5" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] mb-1">Elapsed</span>
                        <span className="text-base font-black font-mono text-white/60 italic">{scan.startTime.split(" ")[1]}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button 
                        variant="outline"
                        onClick={() => router.push("/scanning")}
                        className="flex-1 sm:flex-none h-11 px-6 rounded-2xl border-white/5 bg-white/2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5"
                      >
                        Terminal_View
                      </Button>
                      <Button variant="outline" className="flex-1 sm:flex-none h-11 px-6 rounded-2xl border-destructive/20 bg-destructive/5 text-destructive text-[10px] font-black uppercase tracking-[0.2em] hover:bg-destructive/10">
                        Terminate
                      </Button>
                    </div>
                  </div>
               </Card>
             </motion.div>
           ))}
        </div>
      </div>

      {/* ARCHIVE RECORDS */}
      <Card className="glass-dark border-none overflow-hidden mt-10">
        <CardHeader className="px-10 pt-10 pb-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-white/3 flex items-center justify-center text-muted-foreground/40">
               <History size={20} />
             </div>
             <div className="space-y-0.5">
               <CardTitle className="text-sm font-black uppercase tracking-tight">Audit_Trail</CardTitle>
               <CardDescription className="text-[9px] font-mono uppercase text-muted-foreground/30 tracking-widest">Historical Execution Log</CardDescription>
             </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/20" />
              <Input placeholder="QUERY_HISTORY..." className="pl-10 h-11 w-full md:w-64 text-xs font-mono bg-white/1 border-white/5 rounded-2xl focus-visible:ring-0" />
            </div>
          </div>
        </CardHeader>
        
        <div className="px-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-6 px-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Op_Node</th>
                  <th className="py-6 px-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Probe_Metadata</th>
                  <th className="py-6 px-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Cycle_Time</th>
                  <th className="py-6 px-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Yield_Found</th>
                  <th className="py-6 px-6 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SCAN_HISTORY.map((item, i) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/1 transition-colors group cursor-pointer"
                  >
                    <td className="py-7 px-6">
                      <div className="flex items-center gap-3">
                        {item.status === "completed" ? (
                          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                             <CheckCircle2 size={14} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
                             <AlertCircle size={14} />
                          </div>
                        )}
                        <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", item.status === "completed" ? "text-secondary" : "text-destructive")}>
                           {item.status === "completed" ? "Nominal" : "Failed"}
                        </span>
                      </div>
                    </td>
                    <td className="py-7 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight">{item.title}</span>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">{item.target}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-7 px-6 text-center">
                      <div className="flex items-center justify-center gap-2 text-white/40 font-mono text-[11px] uppercase tracking-tighter">
                        <Clock size={12} className="text-primary/40" /> {item.duration}
                      </div>
                    </td>
                    <td className="py-7 px-6 text-center">
                      <Badge variant={item.threatsFound > 0 ? "destructive" : "cyber"} className="h-6 px-3 border-none font-black text-[9px] uppercase tracking-widest">
                        {item.threatsFound} Detected
                      </Badge>
                    </td>
                    <td className="py-7 px-6 text-right">
                       <Button variant="ghost" className="h-10 px-6 rounded-xl border border-white/5 bg-white/1 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 gap-2">
                         <Download size={14} /> Report
                       </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-10 py-8 flex items-center justify-between border-t border-white/5">
           <p className="text-[10px] font-black font-mono text-muted-foreground/20 uppercase tracking-[0.2em]">End_Of_Log :: showing last 15 security iterations</p>
           <Button variant="ghost" className="text-[10px] font-black text-primary uppercase tracking-[0.4em] px-8 hover:bg-primary/5 h-10 rounded-xl">Full_Archive <ChevronRight size={14} className="ml-2" /></Button>
        </div>
      </Card>
      
      {/* FINAL ACTION BANNER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="glass-dark border border-white/5 rounded-[40px] p-2"
      >
        <div className="glass bg-white/2 rounded-[38px] p-10 flex flex-col md:flex-row items-center gap-10">
           <div className="w-20 h-20 rounded-[30px] bg-white/5 flex items-center justify-center text-white/40 relative group">
             <Cpu size={40} className="group-hover:scale-110 transition-transform" />
           </div>
           <div className="flex-1 space-y-2 text-center md:text-left">
             <h3 className="text-2xl font-black text-white uppercase tracking-tight">Enterprise_Grade_Provisioning</h3>
             <p className="text-muted-foreground/40 leading-relaxed font-medium">
               Need to scan an entire subnet or restricted cloud environment? Contact infrastructure support for unlimited probe allocation.
             </p>
           </div>
           <Button className="h-14 px-10 rounded-3xl bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/90">
             Contact_Authority
           </Button>
        </div>
      </motion.div>
    </div>
  );
}