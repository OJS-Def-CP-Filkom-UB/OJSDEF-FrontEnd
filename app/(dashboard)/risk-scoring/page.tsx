"use client";

import React from "react";
import { 
  BarChart3, 
  Activity, 
  ArrowUpRight, 
  Download, 
  Search as SearchIcon, 
  Filter, 
  ChevronRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MOCK_RISK_ITEMS, VULN_STATS, SYSTEM_HEALTH, RiskPriorityItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function RiskScoringPage() {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Risk Intelligence</h1>
            <p className="text-muted-foreground mt-1 font-medium">Predictive scoring and asset-based risk prioritization</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            LIVE SYNC ACTIVE
          </div>
          <Button className="rounded-xl font-bold px-5 shadow-lg shadow-primary/20 gap-2 h-12">
            <Zap size={18} /> Recalculate Scores
          </Button>
        </div>
      </div>

      {/* RISK SUMMARY ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Posture Ring */}
        <Card className="lg:col-span-4 border-border bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-8">
          <CardDescription className="text-xs uppercase font-bold tracking-widest text-primary/70 mb-8 self-start">Posture Score</CardDescription>
          <div className="relative w-48 h-48 mb-8">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle className="text-white/5 stroke-current" strokeWidth="6" fill="transparent" r="42" cx="50" cy="50" />
              <motion.circle 
                className="text-primary stroke-current" 
                strokeWidth="6" 
                strokeLinecap="round" 
                fill="transparent" 
                r="42" 
                cx="50" 
                cy="50" 
                initial={{ strokeDasharray: "0, 263.8" }}
                animate={{ strokeDasharray: `${(SYSTEM_HEALTH.score / 100) * 263.8}, 263.8` }}
                transition={{ duration: 1.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-bold text-white">{SYSTEM_HEALTH.score}</span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Status: High</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 w-full pt-8 border-t border-border">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Reduction</p>
              <p className="text-lg font-bold text-primary">+12.4%</p>
            </div>
            <div className="text-center border-l border-border">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Threat Level</p>
              <p className="text-lg font-bold text-emerald-500">LOW</p>
            </div>
          </div>
        </Card>

        {/* Severity Progress */}
        <Card className="lg:col-span-8 border-border bg-slate-900/40 backdrop-blur-sm p-8">
          <div className="flex justify-between items-center mb-10">
            <CardTitle className="text-xl font-bold">Vulnerability Distribution</CardTitle>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
              <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs font-bold bg-white/10 text-white shadow-sm">Weekly</Button>
              <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs font-bold text-muted-foreground hover:text-white transition">Monthly</Button>
            </div>
          </div>
          
          <div className="space-y-8">
            {VULN_STATS.map((stat) => (
              <div key={stat.label} className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: stat.color }}>{stat.label}</span>
                    <span className="text-[10px] text-muted-foreground font-bold">({stat.value} ITEMS)</span>
                  </div>
                  <span className="text-xs font-bold text-white">{stat.percentage}%</span>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    className="h-full rounded-full" 
                    style={{ backgroundColor: stat.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.percentage}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between text-xs font-medium text-muted-foreground">
            <p>Aggregated from 1,402 enterprise-grade cloud endpoints.</p>
            <button className="text-primary font-bold hover:underline">VIEW FULL INFRASTRUCTURE MAP</button>
          </div>
        </Card>
      </div>

      {/* RISK PRIORITY TABLE */}
      <Card className="border-border bg-slate-900/40 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-8">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold text-white">Risk Remediation Priority</CardTitle>
            <CardDescription className="font-medium">Prioritized findings based on likelihood and impact dots</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Filter by asset or threat..." className="pl-9 h-10 w-64 text-sm bg-white/5 border-white/10 rounded-xl" />
            </div>
            <Button variant="outline" className="h-10 rounded-xl border-primary/20 bg-primary/5 text-primary font-bold gap-2 px-5 hover:bg-primary/10">
              <Download size={16} /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-white/5">
                  <th className="text-left py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vulnerability Component</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Risk Level</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Impact Level</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Likelihood</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Priority</th>
                  <th className="text-right py-4 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RISK_ITEMS.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-6 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{item.name}</span>
                        <span className="text-[11px] text-muted-foreground mt-1.5 uppercase font-bold tracking-wider">{item.asset}</span>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <Badge variant={item.risk === "critical" ? "destructive" : item.risk === "high" ? "warning" : "default"} className="font-bold h-6 border-0">
                        {item.risk}
                      </Badge>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {[1, 2, 3].map((dot) => (
                            <div 
                              key={dot} 
                              className={cn(
                                "w-2.5 h-2.5 rounded-sm transition-all",
                                dot <= item.impactDots ? "bg-primary" : "bg-white/5"
                              )} 
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-white/70">{item.impact}</span>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <span className="text-sm font-medium text-white/60">{item.likelihood}</span>
                    </td>
                    <td className="py-6 px-4">
                      <div className={cn(
                        "inline-flex items-center justify-center w-10 h-7 rounded-lg text-[11px] font-bold border shrink-0",
                        item.priority === "P1" ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                        item.priority === "P2" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      )}>
                        {item.priority}
                      </div>
                    </td>
                    <td className="py-6 px-4 text-right">
                      <Button variant="ghost" size="sm" className="rounded-xl font-bold text-xs hover:bg-white/10 px-4">
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <p className="text-xs text-muted-foreground font-semibold">Displaying 1-10 of 1,402 prioritized risk elements</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-white/5 bg-white/5 hover:bg-white/10 rounded-lg">‹</Button>
              <Button size="sm" className="h-9 w-9 p-0 font-bold rounded-lg shadow-md shadow-primary/20">1</Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-white/5 bg-white/5 hover:bg-white/10 rounded-lg">2</Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-white/5 bg-white/5 hover:bg-white/10 rounded-lg">3</Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-white/5 bg-white/5 hover:bg-white/10 rounded-lg">›</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
