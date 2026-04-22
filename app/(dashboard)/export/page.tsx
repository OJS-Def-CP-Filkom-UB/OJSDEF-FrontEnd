"use client";

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
  ChevronRight,
  Shield,
  Layers,
  Activity,
  History
} from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ExportPage() {
  return (
    <div className="space-y-8 pb-10">
      {/* SUCCESS HERO BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden group"
      >
        <div className="absolute inset-0 glass-dark border border-secondary/20 rounded-[40px]" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-secondary/5 to-transparent rounded-r-[40px] pointer-events-none" />
        
        <div className="relative p-10 flex flex-col md:flex-row justify-between items-center gap-10">
           <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-[0_0_20px_rgba(0,230,153,0.15)]">
                   <ShieldCheck size={24} />
                 </div>
                 <Badge variant="cyber" className="text-[9px] font-black uppercase tracking-[0.2em] h-6 px-3">Engine_Complete</Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-[0.9]">
                  Security Assessment <br/> <span className="text-secondary">Report ready</span>
                </h1>
                <p className="text-muted-foreground/60 font-medium max-w-xl leading-relaxed">
                  The comprehensive security audit for <span className="text-white">Enterprise_Stack_Alpha</span> has been compiled and cryptographically signed.
                </p>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0 relative z-10">
              <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/5 bg-white/2 text-white font-black uppercase text-xs tracking-widest gap-2 hover:bg-white/5 transition-all">
                <Mail size={18} /> Distribute
              </Button>
              <Button className="h-14 px-10 rounded-2xl bg-secondary text-secondary-foreground font-black uppercase text-xs tracking-widest shadow-[0_0_40px_rgba(0,230,153,0.3)] hover:scale-105 transition-transform gap-2">
                <Download size={20} /> Download_Master_PDF
              </Button>
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* PDF PREVIEW AREA */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-6">
          <Card className="glass-dark border-none overflow-hidden relative shadow-2xl">
            <div className="h-16 bg-white/1 border-b border-white/5 px-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText size={18} className="text-primary" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">OJS_SEC_AUDIT_V2.0.PDF</span>
                <Badge variant="outline" className="bg-white/5 border-white/5 text-[9px] font-black uppercase text-muted-foreground/30 px-2 h-5 rounded-md">8.2 MB</Badge>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  <span className="text-[9px] font-black uppercase text-secondary/60 tracking-widest">Signed_Authentic</span>
                </div>
                <div className="h-4 w-px bg-white/5" />
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">75% Zoom</span>
              </div>
            </div>
            
            <CardContent className="bg-black/40 p-12 lg:p-20 flex justify-center min-h-[700px] relative overflow-hidden">
               {/* Grid Pattern Background */}
               <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
               
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl aspect-[1/1.41] bg-white rounded-sm p-16 text-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col items-start relative overflow-hidden group/page"
              >
                <div className="absolute top-0 right-0 p-12 opacity-[0.02]">
                   <Shield size={200} />
                </div>

                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white mb-16">
                   <Activity size={32} />
                </div>
                
                <div className="space-y-4 mb-20 relative z-10">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Restricted :: Security Audit</p>
                   <h2 className="text-5xl font-black tracking-tighter leading-[0.95] text-slate-900 italic">Vulnerability <br/> Intelligence <br/> Report</h2>
                </div>

                <div className="space-y-12 w-full relative z-10">
                   <div className="h-1 w-full bg-slate-100" />
                   <div className="grid grid-cols-2 gap-12">
                      <div className="space-y-2">
                         <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Target_Segment</p>
                         <p className="text-sm font-bold text-slate-600">Enterprise Core Stack / Alpha Cluster</p>
                      </div>
                      <div className="space-y-2">
                         <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Auth_Key_Signature</p>
                         <p className="text-sm font-mono font-bold text-primary italic lowercase">0x4F12...7B99</p>
                      </div>
                   </div>
                </div>

                <div className="mt-auto w-full pt-12 border-t border-slate-100 flex justify-between items-end relative z-10">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Generated_By</p>
                      <p className="text-xs font-black text-slate-900 uppercase">OJS Integrated Engine :: V3.0</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Page 01 // 12</p>
                   </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </div>

        {/* SIDEBAR WIDGETS */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-8">
           {/* MULTI-CHANNEL WIDGET */}
           <Card className="glass border-none p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                 <Share2 size={56} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight text-white mb-8 flex items-center gap-3">
                <Share2 size={16} className="text-primary" /> Distribution_Nexus
              </h3>
              
              <div className="space-y-3 relative z-10">
                 <Button variant="ghost" className="w-full h-16 rounded-2xl bg-white/2 border border-white/5 hover:border-primary/20 hover:bg-primary/5 px-6 flex items-center justify-between group/item transition-all">
                    <div className="flex items-center gap-4 text-left">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover/item:scale-110 transition-transform">
                          <Link2 size={18} />
                       </div>
                       <div>
                          <p className="text-xs font-black text-white uppercase tracking-tight">Access_Token</p>
                          <p className="text-[9px] font-mono text-muted-foreground/40 uppercase">7-Day Hash Validity</p>
                       </div>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground/20 group-hover/item:text-white transition-all" />
                 </Button>

                 <Button variant="ghost" className="w-full h-16 rounded-2xl bg-white/2 border border-white/5 hover:border-secondary/20 hover:bg-secondary/5 px-6 flex items-center justify-between group/item transition-all">
                    <div className="flex items-center gap-4 text-left">
                       <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover/item:scale-110 transition-transform">
                          <ExternalLink size={18} />
                       </div>
                       <div>
                          <p className="text-xs font-black text-white uppercase tracking-tight">Direct_Publish</p>
                          <p className="text-[9px] font-mono text-muted-foreground/40 uppercase">Slack | Jira | GitHub</p>
                       </div>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground/20 group-hover/item:text-white transition-all" />
                 </Button>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5">
                 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-5">Content_Overview</p>
                 <div className="space-y-4">
                    {[
                      { l: "Executive Intelligence", p: "02", a: true },
                      { l: "Impact Vectors", p: "05", a: false },
                      { l: "Remediation Pipeline", p: "09", a: false },
                    ].map((item, i) => (
                      <div key={i} className={cn("flex justify-between items-center", item.a ? "text-primary" : "text-white/40")}>
                         <div className="flex items-center gap-3">
                           <div className={cn("w-1 h-1 rounded-full", item.a ? "bg-primary animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.6)]" : "bg-white/10")} />
                           <span className="text-[11px] font-black uppercase tracking-tight">{item.l}</span>
                         </div>
                         <span className="text-[10px] font-mono opacity-40">P.{item.p}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </Card>

           {/* UTILITY GRID */}
           <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-28 flex flex-col items-center justify-center gap-3 rounded-3xl border-white/5 bg-white/2 hover:bg-white/5 transition-all group overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-8 h-8 bg-white/3 rounded-bl-3xl" />
                 <History size={20} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Version_Log</span>
              </Button>
              <Button variant="outline" className="h-28 flex flex-col items-center justify-center gap-3 rounded-3xl border-white/5 bg-white/2 hover:bg-white/5 transition-all group overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-8 h-8 bg-white/3 rounded-bl-3xl" />
                 <Printer size={20} className="text-muted-foreground/40 group-hover:text-white transition-colors" />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Paper_Form</span>
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}