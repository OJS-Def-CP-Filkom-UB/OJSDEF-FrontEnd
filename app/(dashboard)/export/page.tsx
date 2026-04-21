"use client";

import React from "react";
import { 
  CheckCircle2, 
  Download, 
  Mail, 
  Link2, 
  Sparkles, 
  RotateCcw, 
  Printer, 
  FileText,
  Share2,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ExportPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* SUCCESS BANNER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
        
        <div className="space-y-4 max-w-2xl relative z-10">
          <div className="flex items-center gap-2 text-emerald-500">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Generation Successful</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">
            Security Assessment <br/> Report is Ready
          </h1>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed">
            The Q4 Compliance Audit for <span className="text-primary font-bold italic">Enterprise_Stack_Alpha</span> has been processed and encrypted for restricted distribution.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full md:w-auto">
          <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10 bg-white/5 text-white font-bold gap-2 hover:bg-white/10">
            <Mail size={18} /> Distribute to Stakeholders
          </Button>
          <Button className="h-12 px-8 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20">
            <Download size={18} /> Download Master PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* PDF PREVIEW AREA */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border bg-slate-900/40 backdrop-blur-sm overflow-hidden shadow-2xl">
            <div className="h-14 bg-white/5 border-b border-border px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-primary" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">OJS_SEC_AUDIT_V2.PDF</span>
                <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] font-black uppercase text-muted-foreground/60">12 PAGES</Badge>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> Digital Sign Verified</span>
                <span className="text-white/20">|</span>
                <span>75% Zoom</span>
              </div>
            </div>
            
            <CardContent className="bg-black/20 p-12 flex justify-center min-h-[600px]">
              {/* VIRTUAL PAPER */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-xl aspect-[1/1.41] bg-white rounded-sm p-12 text-slate-900 shadow-[0_10px_50px_rgba(0,0,0,0.5)] flex flex-col items-start"
              >
                <div className="w-16 h-2 bg-primary mb-12" />
                <h2 className="text-4xl font-extrabold tracking-tight mb-4">Vulnerability <br/> Assessment Report</h2>
                <p className="text-lg text-slate-500 font-medium mb-16">Enterprise Infrastructure Core :: Cluster Alpha</p>
                
                <div className="space-y-6 w-full mb-12">
                   <div className="h-1 w-full bg-slate-100" />
                   <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Posture Summary</p>
                     <div className="flex gap-2">
                        <div className="h-2 w-full bg-emerald-500 rounded-full" />
                        <div className="h-2 w-1/2 bg-slate-200 rounded-full" />
                     </div>
                   </div>
                </div>

                <div className="mt-auto w-full grid grid-cols-2 gap-8 text-[11px] font-bold border-t border-slate-100 pt-8 mt-auto">
                   <div>
                     <p className="text-slate-400 mb-1">DATE GENERATED</p>
                     <p className="text-slate-900">OCTOBER 24, 2026</p>
                   </div>
                   <div>
                     <p className="text-slate-400 mb-1">AUDIT AUTHORITY</p>
                     <p className="text-primary uppercase tracking-tighter italic font-black">OJS Integrated Engine</p>
                   </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </div>

        {/* SIDEBAR WIDGETS */}
        <div className="lg:col-span-4 space-y-6">
           {/* DISTRIBUTION CARD */}
           <Card className="border-border bg-slate-900/40 backdrop-blur-sm p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <CardTitle className="text-lg font-bold mb-6 flex items-center gap-2">
                <Share2 size={18} className="text-primary" /> Multi-Channel Export
              </CardTitle>
              
              <div className="space-y-4 relative z-10">
                 <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-4 items-center group cursor-pointer hover:border-primary/30 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                      <Link2 size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Generate Secure Link</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">7-Day Expiry Hash</p>
                    </div>
                 </div>

                 <div className="pt-6">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Internal Table of Contents</p>
                    <div className="space-y-3">
                       {[
                         { title: "Executive Intelligence", page: "P. 02", active: true },
                         { title: "Threat Vector Analysis", page: "P. 04" },
                         { title: "Asset Correlation", page: "P. 07" },
                         { title: "Remediation Pipeline", page: "P. 10" },
                       ].map((item, i) => (
                         <div key={i} className={cn(
                           "flex justify-between items-center px-1 group cursor-pointer",
                           item.active ? "text-primary" : "text-muted-foreground/60 hover:text-white"
                         )}>
                            <div className="flex items-center gap-3">
                               <div className={cn("w-1.5 h-1.5 rounded-full", item.active ? "bg-primary animate-pulse" : "bg-white/10 group-hover:bg-white/40")} />
                               <span className="text-xs font-bold">{item.title}</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold">{item.page}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </Card>

           {/* AUTO-SYNC STATUS */}
           <Card className="border-border bg-primary/5 p-6 border-primary/20 relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
             <div className="flex gap-4 relative z-10">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
                   <Sparkles size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Vault Sync Active</p>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-2 italic">
                    Successfully archived to Global Security Vault for long-term retention. 
                  </p>
                </div>
             </div>
           </Card>

           {/* UTILITY GRID */}
           <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 transition-all font-bold group">
                 <RotateCcw size={20} className="text-muted-foreground group-hover:rotate-180 transition-transform duration-500" />
                 <span className="text-[10px] uppercase tracking-widest">Version History</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 transition-all font-bold group">
                 <Printer size={20} className="text-muted-foreground group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] uppercase tracking-widest">Hard Copy</span>
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}