"use client";

import React from "react";
import { 
  ShieldAlert, 
  Activity, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight, 
  MoreHorizontal,
  ChevronRight,
  Search as SearchIcon,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MOCK_SCANS, VULN_STATS, SYSTEM_HEALTH, RiskLevel } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Security Command</h1>
          <p className="text-muted-foreground mt-1 font-medium">Real-time infrastructure threat analysis and risk scoring</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-white/5 bg-white/5 hover:bg-white/10 font-bold px-5">
            View Analytics
          </Button>
          <Button className="rounded-xl font-bold px-5 shadow-lg shadow-primary/20">
            Start New Scan
          </Button>
        </div>
      </div>

      {/* TOP ROW: HEALTH & VULN SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Card */}
        <Card className="lg:col-span-1 border-border bg-slate-900/40 backdrop-blur-sm overflow-hidden group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs uppercase font-bold tracking-widest text-primary/70">Security Health</CardDescription>
              <Activity size={16} className="text-primary" />
            </div>
            <CardTitle className="text-xl">Global Risk Score</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative flex flex-col items-center justify-center py-6">
              {/* Circular Progress (SVG) */}
              <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    className="text-white/5 stroke-current" 
                    strokeWidth="8" 
                    fill="transparent" 
                    r="40" 
                    cx="50" 
                    cy="50" 
                  />
                  <motion.circle 
                    className="text-primary stroke-current" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    fill="transparent" 
                    r="40" 
                    cx="50" 
                    cy="50" 
                    initial={{ strokeDasharray: "0, 251.2" }}
                    animate={{ strokeDasharray: `${(SYSTEM_HEALTH.score / 100) * 251.2}, 251.2` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-bold text-white">{SYSTEM_HEALTH.score}</span>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Score</span>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Status</p>
                  <p className={cn("text-sm font-bold", SYSTEM_HEALTH.status === "Degraded" ? "text-amber-500" : "text-emerald-500")}>
                    {SYSTEM_HEALTH.status}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Last Updated</p>
                  <p className="text-sm font-bold text-white leading-tight">{SYSTEM_HEALTH.lastUpdate}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vulnerability Summary Card */}
        <Card className="lg:col-span-2 border-border bg-slate-900/40 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardDescription className="text-xs uppercase font-bold tracking-widest text-primary/70">Detections</CardDescription>
                <CardTitle className="text-3xl font-bold">Total: {SYSTEM_HEALTH.vulnerabilitiesTotal}</CardTitle>
              </div>
              <ShieldAlert size={24} className="text-muted-foreground opacity-50" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {VULN_STATS.map((stat) => (
                <div key={stat.label} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stat.color }} />
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{stat.label}</span>
                  </div>
                  <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full" 
                      style={{ backgroundColor: stat.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between group cursor-pointer hover:bg-primary/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="font-bold text-white leading-snug">Vulnerability Compliance Audit</p>
                  <p className="text-sm text-muted-foreground">Your infrastructure is 82% compliant with industry security standards.</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-primary group-hover:translate-x-1 transition-transform">
                <ChevronRight size={20} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RECENT SCANS TABLE */}
      <Card className="border-border bg-slate-900/40 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold">Recent Scan Activity</CardTitle>
            <CardDescription className="font-medium">Monitor active and historical scanning nodes</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Filter scans..." className="pl-9 h-9 w-48 text-xs bg-white/5 border-white/5 rounded-lg" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-2 text-xs font-bold border-white/5 bg-white/5 hover:bg-white/10">
              <Filter size={14} /> Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Target Endpoint</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Scan Type</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Risk Level</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Detected</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="text-right py-4 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SCANS.map((scan) => (
                  <tr key={scan.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-5 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white leading-none">{scan.url}</span>
                        <span className="text-[11px] text-muted-foreground mt-1.5 font-medium">{scan.node}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                        <span className="text-sm text-balance font-medium text-white/80">{scan.type}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-xs">
                      <Badge variant={scan.risk === "critical" ? "destructive" : scan.risk === "high" ? "warning" : "default"} className="font-bold border-0 h-6">
                        {scan.risk}
                      </Badge>
                    </td>
                    <td className="py-5 px-4">
                      <span className="text-sm font-bold text-white">{scan.vulnerabilities} issues</span>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          scan.status === "In Progress" ? "bg-primary animate-pulse" : 
                          scan.status === "Completed" ? "bg-emerald-500" : "bg-red-500"
                        )} />
                        <span className={cn(
                          "text-xs font-bold",
                          scan.status === "In Progress" ? "text-primary" : 
                          scan.status === "Completed" ? "text-emerald-500 text-opacity-80" : "text-red-500"
                        )}>
                          {scan.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal size={18} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">Showing top priority scanning instances</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-bold border-white/5 bg-white/5 hover:bg-white/10 rounded-lg">Previous</Button>
              <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-bold border-white/5 bg-white/5 hover:bg-white/10 rounded-lg">Next Page</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QUICK ACTIONS / BOTTOM STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Scan Velocity", value: "18m 42s", sub: "+12.4% faster throughput", icon: Clock },
          { title: "CVE Database", value: "Sync'd", sub: "Last updated 4m ago", icon: ShieldCheck },
          { title: "Remediation", value: "42 resolved", sub: "72h response window", icon: Activity },
        ].map((item) => (
          <Card key={item.title} className="border-border bg-slate-900/40 backdrop-blur-sm p-6 hover:border-primary/20 transition-colors cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-white/5 text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                <item.icon size={20} />
              </div>
              <ArrowUpRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">{item.title}</h3>
            <p className="text-2xl font-bold text-white mb-1">{item.value}</p>
            <p className="text-xs text-muted-foreground font-medium">{item.sub}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
