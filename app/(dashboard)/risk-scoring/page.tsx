"use client";

import { 
  BarChart3, 
  Activity, 
  ArrowUpRight, 
  Download, 
  Search as SearchIcon, 
  Filter, 
  ChevronRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Trophy,
  Target,
  ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MOCK_RISK_ITEMS, VULN_STATS, SYSTEM_HEALTH } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function RiskScoringPage() {
  return (
    <div className="space-y-8 pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl glass-dark flex items-center justify-center text-primary shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <BarChart3 size={28} />
          </div>
          <div>
             <div className="flex items-center gap-2 mb-1">
               <Badge variant="cyber" className="text-[9px] font-black uppercase tracking-widest h-5 px-2">Predictive_Eng</Badge>
               <span className="text-[10px] font-mono text-muted-foreground/40 uppercase">Global Sync: Nominal</span>
             </div>
             <h1 className="text-3xl font-black tracking-tighter text-white uppercase">Risk <span className="text-primary">Intelligence</span></h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="hidden md:flex items-center gap-4 px-6 border-r border-white/5 h-12">
            <div className="text-right">
              <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Last Update</p>
              <p className="text-[11px] font-mono text-white/60 uppercase">12:42:01 UTC</p>
            </div>
          </div>
          <Button className="flex-1 md:flex-none h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:scale-105 transition-transform gap-2">
            <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" /> Recalc_Scores
          </Button>
        </div>
      </div>

      {/* RISK SUMMARY ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Posture Ring */}
        <Card className="lg:col-span-12 xl:col-span-4 glass-dark border-none flex flex-col items-center justify-center p-10 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.1)_0%,transparent_50%)]" />
          
          <div className="w-full flex justify-between items-start mb-8 relative z-10">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">Infrastructure_Health</p>
              <h3 className="text-xl font-black text-white uppercase">Posture_Score</h3>
            </div>
            <Trophy size={20} className="text-primary/20" />
          </div>

          <div className="relative w-56 h-56 mb-10">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle className="text-white/3 stroke-current" strokeWidth="4" fill="transparent" r="46" cx="50" cy="50" />
              <motion.circle 
                className="text-primary stroke-current" 
                strokeWidth="4" 
                strokeLinecap="round" 
                fill="transparent" 
                r="46" 
                cx="50" 
                cy="50" 
                initial={{ strokeDasharray: "0, 289" }}
                animate={{ strokeDasharray: `${(SYSTEM_HEALTH.score / 100) * 289}, 289` }}
                transition={{ duration: 2, ease: "circOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-6xl font-black text-white text-glow-cyan leading-none">{SYSTEM_HEALTH.score}</span>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span className="text-[10px] text-secondary font-black uppercase tracking-widest">Optimized</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 w-full relative z-10">
            <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-1 text-center">
              <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Threat_Level</p>
              <p className="text-xl font-black text-secondary">LOW</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-1 text-center">
              <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Reduction</p>
              <p className="text-xl font-black text-primary">+12.4%</p>
            </div>
          </div>
        </Card>

        {/* Severity Progress */}
        <Card className="lg:col-span-12 xl:col-span-8 glass border-none p-10 flex flex-col justify-between">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Threat_Distribution</h2>
              <p className="text-[10px] font-mono text-muted-foreground/40 uppercase">Aggregated findings from 1,402 monitored endpoints</p>
            </div>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
              <Button variant="ghost" size="sm" className="h-8 px-4 font-black uppercase text-[9px] tracking-widest bg-white/5 text-white">Weekly</Button>
              <Button variant="ghost" size="sm" className="h-8 px-4 font-black uppercase text-[9px] tracking-widest text-muted-foreground/40 hover:text-white">Monthly</Button>
            </div>
          </div>
          
          <div className="space-y-10">
            {VULN_STATS.map((stat, i) => (
              <div key={stat.label} className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: stat.color }}>{stat.label}</span>
                    <span className="text-[10px] font-mono text-white/20 uppercase">({stat.value} ITEMS)</span>
                  </div>
                  <span className="text-xs font-black text-white font-mono">{stat.percentage}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    className="h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                    style={{ 
                      backgroundColor: stat.color,
                      boxShadow: `0 0 20px ${stat.color}40`
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.percentage}%` }}
                    transition={{ duration: 1.5, delay: i * 0.1, ease: "circOut" }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground/40 uppercase tracking-widest">
              <Activity size={12} className="text-primary" />
              Realtime feed from Enterprise_Core
            </div>
            <Button variant="ghost" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:bg-primary/5 px-4 h-8 rounded-lg">
              Infrastructure_Map <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </Card>
      </div>

      {/* RISK PRIORITY TABLE */}
      <Card className="glass-dark border-none overflow-hidden">
        <CardHeader className="px-10 pt-10 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <CardTitle className="text-sm font-black uppercase tracking-tight">Remediation_Priority</CardTitle>
            <CardDescription className="text-[10px] font-mono uppercase text-muted-foreground/40">Likelihood vs Impact correlation engine</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
              <Input placeholder="FILTER_PRIORITY..." className="pl-10 h-11 w-full md:w-64 text-xs font-mono bg-white/2 border-white/5 rounded-2xl focus-visible:ring-0" />
            </div>
            <Button variant="outline" className="h-11 px-6 rounded-2xl border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-primary/10">
              <Download size={16} /> Export_CSV
            </Button>
          </div>
        </CardHeader>
        
        <div className="px-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Vector_Component</th>
                  <th className="text-left py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Risk_Idx</th>
                  <th className="text-left py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Impact_Vector</th>
                  <th className="text-left py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Likelihood</th>
                  <th className="text-left py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Priority</th>
                  <th className="py-6 px-6"></th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RISK_ITEMS.map((item, i) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/2 transition-colors group cursor-pointer"
                  >
                    <td className="py-7 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-black text-white group-hover:text-primary transition-colors tracking-tight uppercase">{item.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">{item.asset}</span>
                      </div>
                    </td>
                    <td className="py-7 px-6">
                      <Badge 
                        variant={item.risk === "critical" ? "destructive" : item.risk === "high" ? "warning" : "cyber"} 
                        className="text-[9px] font-black uppercase tracking-widest h-6 px-3 rounded-lg border-none"
                      >
                        {item.risk}
                      </Badge>
                    </td>
                    <td className="py-7 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {[1, 2, 3].map((dot) => (
                            <div 
                              key={dot} 
                              className={cn(
                                "w-2.5 h-2.5 rounded-sm transition-all",
                                dot <= item.impactDots ? (item.risk === "critical" ? "bg-destructive shadow-[0_0_8px_rgba(255,77,77,0.4)]" : "bg-primary") : "bg-white/5"
                              )} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{item.impact}</span>
                      </div>
                    </td>
                    <td className="py-7 px-6">
                      <span className="text-[11px] font-mono text-white/60 lowercase">{item.likelihood}</span>
                    </td>
                    <td className="py-7 px-6">
                      <div className={cn(
                        "inline-flex items-center justify-center w-12 h-7 rounded-lg text-[10px] font-black font-mono border",
                        item.priority === "P1" ? "bg-destructive/10 text-destructive border-destructive/20" : 
                        item.priority === "P2" ? "bg-warning/10 text-warning border-warning/20" : 
                        "bg-secondary/10 text-secondary border-secondary/20"
                      )}>
                        {item.priority}
                      </div>
                    </td>
                    <td className="py-7 px-6 text-right">
                       <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg group-hover:bg-white/10 text-muted-foreground/20 group-hover:text-white">
                         <ChevronRight size={16} />
                       </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-10 py-8 flex items-center justify-between border-t border-white/5">
           <p className="text-[10px] font-black font-mono text-muted-foreground/30 uppercase tracking-[0.2em]">Showing 01 - 10 of 1,402 prioritizing risk vectors</p>
           <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 px-4 border-white/5 bg-white/2 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/5">Prev</Button>
              <Button variant="outline" size="sm" className="h-9 px-4 border-white/5 bg-white/2 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/5">Next</Button>
           </div>
        </div>
      </Card>
      
      {/* ACTION BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-dark border border-white/5 rounded-[40px] p-2"
      >
        <div className="glass bg-primary/5 rounded-[38px] p-10 flex flex-col md:flex-row items-center gap-10">
           <div className="w-20 h-20 rounded-[30px] bg-primary/10 flex items-center justify-center text-primary relative group">
             <div className="absolute inset-0 bg-primary/20 rounded-[30px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
             <Target size={40} className="relative z-10" />
           </div>
           <div className="flex-1 space-y-2 text-center md:text-left">
             <h3 className="text-2xl font-black text-white uppercase tracking-tight">Intelligence_Auto_Pilot</h3>
             <p className="text-muted-foreground/60 leading-relaxed font-medium">
               Enable machine-learning driven remediation to automatically handle P3 and P4 risks across non-critical infrastructure segments.
             </p>
           </div>
           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
             <Button variant="outline" className="h-14 px-10 rounded-3xl border-white/10 bg-white/2 font-black uppercase text-[10px] tracking-widest hover:bg-white/5">
               Learn_More
             </Button>
             <Button className="h-14 px-10 rounded-3xl bg-secondary text-secondary-foreground font-black uppercase text-[10px] tracking-widest shadow-[0_0_40px_rgba(0,230,153,0.3)] hover:scale-105 transition-transform">
               Activate_Agent
             </Button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
