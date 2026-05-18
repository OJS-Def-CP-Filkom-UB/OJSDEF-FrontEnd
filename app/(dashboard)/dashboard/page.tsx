"use client";

import { 
  ShieldAlert, 
  Activity, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight, 
  MoreHorizontal,
  Search as SearchIcon,
  Filter,
  Zap,
  Radio
} from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MOCK_SCANS, VULN_STATS, SYSTEM_HEALTH } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function DashboardOverview() {
  return (
    <div className="space-y-8 pb-10">
      {/* PRIMARY METRICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Exposure Main Card */}
        <Card className="lg:col-span-4 glass-dark overflow-hidden border-none relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[420px]">
            <div className="text-center space-y-2 mb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/60">System Security Level</span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Global Risk Exposure</h2>
            </div>

            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle 
                  className="text-white/3 stroke-current" 
                  strokeWidth="6" 
                  fill="transparent" 
                  r="44" 
                  cx="50" 
                  cy="50" 
                />
                <motion.circle 
                  className="text-primary stroke-current" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                  fill="transparent" 
                  r="44" 
                  cx="50" 
                  cy="50" 
                  initial={{ strokeDasharray: "0, 276.46" }}
                  animate={{ strokeDasharray: `${(SYSTEM_HEALTH.score / 100) * 276.46}, 276.46` }}
                  transition={{ duration: 2, ease: "circOut", delay: 0.2 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <motion.span 
                  className="text-7xl font-black text-white text-glow-cyan leading-none"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {SYSTEM_HEALTH.score}
                </motion.span>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Score / 100</span>
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-4 w-full">
              <div className="flex-1 bg-white/2 border border-white/5 rounded-2xl p-4 text-center">
                <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mb-1">State</p>
                <p className="text-sm font-bold text-secondary">{SYSTEM_HEALTH.status}</p>
              </div>
              <div className="flex-1 bg-white/2 border border-white/5 rounded-2xl p-4 text-center">
                <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Last Audit</p>
                <p className="text-sm font-bold text-white">4M AGO</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vulnerability Summary Grid */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {VULN_STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="glass border-none h-full group hover:border-white/10 transition-all cursor-pointer overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: stat.color }} />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                        <h3 className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/3 flex items-center justify-center text-muted-foreground group-hover:text-white transition-colors">
                        <ArrowUpRight size={18} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 mt-6">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full rounded-full"
                          style={{ backgroundColor: stat.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.percentage}%` }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                        />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">{stat.percentage}%</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="glass border-none h-32 relative overflow-hidden group cursor-pointer">
             <div className="absolute inset-0 bg-linear-to-r from-secondary/5 to-transparent transition-opacity group-hover:opacity-100 opacity-50" />
             <CardContent className="p-0 h-full flex items-center px-8 justify-between relative z-10">
               <div className="flex items-center gap-6">
                 <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-[0_0_20px_rgba(0,230,153,0.1)]">
                   <ShieldCheck size={32} />
                 </div>
                 <div>
                   <h4 className="text-lg font-bold text-white tracking-tight">Active Engine Security Compliance</h4>
                   <p className="text-sm text-muted-foreground">OJS Integrated Security Protocol is currently adhering to NIST Standards.</p>
                 </div>
               </div>
               <Button className="rounded-full bg-white text-black font-black uppercase text-[10px] tracking-widest px-8 h-10 hover:bg-white/90">
                 Run Full Compliance Scan
               </Button>
             </CardContent>
          </Card>
        </div>
      </div>

      {/* RECENT SCANS TABLE */}
      <Card className="glass border-none overflow-hidden">
        <div className="px-8 py-6 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              Live Engine Operations
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1 h-1 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "200ms" }} />
                <div className="w-1 h-1 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "400ms" }} />
              </div>
            </h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Real-time scan intelligence feed</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input placeholder="TARGET_ID..." className="pl-9 h-10 w-64 text-[11px] bg-white/3 border-white/5 focus:border-primary/30 rounded-full font-mono uppercase tracking-widest" />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 border-white/5 bg-white/3 rounded-full">
              <Filter size={16} />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto px-4">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 border-b border-white/5">
                  <th className="text-left py-6 px-4">Target Instance</th>
                  <th className="text-left py-6 px-4">Protocol</th>
                  <th className="text-left py-6 px-4">Risk Level</th>
                  <th className="text-left py-6 px-4">Threats</th>
                  <th className="text-left py-6 px-4">Status</th>
                  <th className="text-right py-6 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SCANS.map((scan) => (
                  <tr key={scan.id} className="group border-b border-white/2 hover:bg-white/2 transition-colors cursor-pointer">
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                          <Radio size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-white group-hover:text-primary transition-colors">{scan.url}</span>
                          <span className="text-[9px] text-muted-foreground mt-1 font-mono uppercase tracking-widest">{scan.institutionName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/80 bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-full">
                        {scan.scanType.split("_")[0]}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <Badge className={cn(
                        "rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest border-0",
                        scan.risk === "critical" ? "bg-destructive/10 text-destructive" :
                        scan.risk === "high" ? "bg-warning/10 text-warning" :
                        "bg-primary/10 text-primary"
                      )}>
                        {scan.risk}
                      </Badge>
                    </td>
                    <td className="py-5 px-4 text-center font-black text-xs text-white">
                      {scan.vulnerabilities}
                    </td>
                    <td className="py-5 px-4">
                       <div className="flex items-center gap-3">
                         <div className={cn(
                           "w-1.5 h-1.5 rounded-full",
                           scan.status === "In Progress" ? "bg-primary animate-pulse" : 
                           scan.status === "Completed" ? "bg-secondary" : "bg-destructive"
                         )} />
                         <span className={cn(
                           "text-[11px] font-black uppercase tracking-widest",
                           scan.status === "In Progress" ? "text-primary/70" : 
                           scan.status === "Completed" ? "text-secondary/70" : "text-destructive/70"
                         )}>
                           {scan.status}
                         </span>
                       </div>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 flex items-center justify-between border-t border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Showing prioritized threat vectors</span>
            <div className="flex gap-2">
              <Button variant="outline" className="h-9 rounded-full px-6 text-[10px] font-black uppercase tracking-widest border-white/5 hover:bg-white/5">Prev_Pge</Button>
              <Button variant="outline" className="h-9 rounded-full px-6 text-[10px] font-black uppercase tracking-widest border-white/5 hover:bg-white/5">Next_Pge</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QUICK INSIGHTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Engine Throughput", value: "18.4 MS", sub: "+2.4% Optimal", icon: Zap, color: "text-secondary" },
          { title: "Vulnerability Database", value: "STABLE", sub: "Last Synced: 2m ago", icon: ShieldCheck, color: "text-primary" },
          { title: "Network Latency", value: "42 MS", sub: "EU-WEST-1 Active", icon: GlobeIcon, color: "text-cyan-400" },
        ].map((item) => (
          <Card key={item.title} className="glass border-none group hover:border-white/5 transition-all cursor-pointer">
            <CardContent className="p-6 flex items-center gap-5">
              <div className={cn("w-12 h-12 rounded-xl bg-white/3 flex items-center justify-center transition-colors group-hover:bg-white/6", item.color)}>
                <item.icon size={22} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{item.title}</p>
                <p className="text-xl font-black text-white group-hover:text-primary transition-colors">{item.value}</p>
                <p className="text-[10px] font-bold text-muted-foreground/40 mt-0.5">{item.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function GlobeIcon({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}
