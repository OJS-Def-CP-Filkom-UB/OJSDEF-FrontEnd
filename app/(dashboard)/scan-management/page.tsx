"use client";

import React from "react";
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
  Settings2
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
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Scan Orchestrator</h1>
            <p className="text-muted-foreground mt-1 font-medium text-sm">Manage active probes and historical security records</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl font-bold border-white/10 bg-white/5 text-white h-12 px-5 hover:bg-white/10">
             <Settings2 size={18} className="mr-2" /> Global Config
           </Button>
           <Button 
             onClick={() => router.push("/add-target")}
             className="rounded-xl font-bold px-6 shadow-lg shadow-primary/20 h-12 gap-2"
           >
             <Plus size={20} /> New Security Scan
           </Button>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Active Probes", value: MOCK_ACTIVE_SCANS.length, sub: "Currently Running", color: "text-primary" },
          { label: "Total Scans (24h)", value: "142", sub: "+12% from yesterday", color: "text-emerald-500" },
          { label: "Avg. Scan Time", value: "18.4m", sub: "Optimized Performance", color: "text-blue-500" },
          { label: "Scan Queue", value: "03/10", sub: "Load: 30%", color: "text-amber-500" },
        ].map((stat, i) => (
          <Card key={i} className="border-border bg-slate-900/40 backdrop-blur-sm p-4 overflow-hidden relative">
             <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
             <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
             <div className="flex items-baseline gap-2">
               <h2 className={cn("text-2xl font-bold font-mono text-white", stat.color)}>{stat.value}</h2>
               <span className="text-[10px] font-bold text-muted-foreground/60">{stat.sub}</span>
             </div>
          </Card>
        ))}
      </div>

      {/* ACTIVE SCANS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Activity size={18} className="text-primary" />
          <h2 className="text-lg font-bold text-white uppercase tracking-tight">Active Operations</h2>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
           {MOCK_ACTIVE_SCANS.map((scan) => (
             <Card key={scan.id} className="border-border bg-slate-900/40 backdrop-blur-sm p-6 relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{scan.title}</h3>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest bg-primary/5 text-primary border-primary/20">
                        {scan.status.replace("-", " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                      <ShieldCheck size={12} /> Target: {scan.target}
                      <span className="text-white/10 mx-1">|</span>
                      ID: {scan.id}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white rounded-lg h-8 w-8">
                    <MoreVertical size={16} />
                  </Button>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Scanning Progress</span>
                    <span className="text-sm font-bold text-primary">{scan.progress}%</span>
                  </div>
                  <Progress value={scan.progress} className="h-2 bg-white/5" />
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Threats Found</span>
                      <span className={cn("text-sm font-bold", scan.threatsFound > 0 ? "text-rose-500" : "text-emerald-500")}>
                        {scan.threatsFound} Issues
                      </span>
                    </div>
                    <div className="w-[1px] h-6 bg-white/10" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Start Time</span>
                      <span className="text-sm font-bold text-white/70 font-mono italic">{scan.startTime.split(" ")[1]}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      onClick={() => router.push("/scanning")}
                      className="text-xs font-bold text-primary hover:bg-primary/10 rounded-xl"
                    >
                      Console View
                    </Button>
                    <Button variant="outline" className="text-xs font-bold text-destructive hover:bg-destructive/10 border-destructive/20 rounded-xl">
                      Terminate
                    </Button>
                  </div>
                </div>
             </Card>
           ))}
        </div>
      </div>

      {/* RECENT HISTORY TABLE */}
      <Card className="border-border bg-slate-900/40 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-8">
          <div className="flex items-center gap-3">
            <History size={20} className="text-muted-foreground" />
            <div>
              <CardTitle className="text-xl font-bold text-white">Execution History</CardTitle>
              <CardDescription className="font-medium text-xs uppercase tracking-widest mt-1">Audit Trail & Archive</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Search records..." className="pl-9 h-10 w-64 text-sm bg-white/5 border-white/10 rounded-xl" />
            </div>
            <Button variant="outline" className="h-10 rounded-xl border-white/10 bg-white/5 text-white font-bold gap-2 px-5 hover:bg-white/10">
              <History size={16} /> Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border bg-white/5">
                  <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Scan Status</th>
                  <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Target Information</th>
                  <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Engine Duration</th>
                  <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Threats Found</th>
                  <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right border-0 rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SCAN_HISTORY.map((item, i) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-6 px-4">
                      {item.status === "completed" ? (
                        <div className="flex items-center gap-2 text-emerald-500">
                          <CheckCircle2 size={16} />
                          <span className="text-xs font-bold uppercase tracking-wider">Success</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-rose-500">
                          <AlertCircle size={16} />
                          <span className="text-xs font-bold uppercase tracking-wider">Failed</span>
                        </div>
                      )}
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{item.title}</span>
                        <span className="text-[11px] text-muted-foreground/60 font-semibold font-mono tracking-tight mt-1">{item.target}</span>
                      </div>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <span className="text-xs font-bold text-white/50 flex items-center justify-center gap-1.5">
                        <Clock size={12} /> {item.duration}
                      </span>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <Badge variant={item.threatsFound > 0 ? "destructive" : "outline"} className={cn(
                        "h-6 px-3 border-0 font-bold",
                        item.threatsFound === 0 && "bg-emerald-500/10 text-emerald-500"
                      )}>
                        {item.threatsFound} Found
                      </Badge>
                    </td>
                    <td className="py-6 px-4 text-right">
                       <Button variant="ghost" size="sm" className="rounded-xl font-bold text-xs hover:bg-white/10 gap-2">
                         <Download size={14} /> Report
                       </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <p className="text-[11px] text-muted-foreground font-bold tracking-tight">Displaying the last 15 security scan iterations</p>
            <Button variant="ghost" className="text-xs font-bold text-primary rounded-xl hover:bg-primary/10 px-6">
              View Full Archive Archive
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}