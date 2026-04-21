"use client";

import React from "react";
import { 
  Shield, 
  Globe, 
  Server, 
  Cpu, 
  ArrowRight, 
  Zap, 
  Info, 
  Plus, 
  CheckCircle2,
  Lock,
  ChevronRight
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  targetName: z.string().min(2, "Target name is required"),
  targetUrl: z.string().url("Please enter a valid URL (e.g., https://example.com)"),
  scanType: z.enum(["quick", "full", "deep", "compliance"]),
  priority: z.enum(["normal", "high"]),
});

export default function AddTargetPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetName: "",
      targetUrl: "",
      scanType: "quick",
      priority: "normal",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Adding target:", values);
    router.push("/scanning");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Plus size={18} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Asset provisioning</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
          Initialize New <br/> Security Perimeter
        </h1>
        <p className="text-muted-foreground font-medium text-lg max-w-2xl">
          Register a new target for deep autonomous scanning. Our engine will map endpoints and identify vulnerabilities in real-time.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN: CORE INFO */}
            <div className="lg:col-span-7 space-y-8">
              <Card className="border-border bg-slate-900/40 backdrop-blur-sm p-8 shadow-xl">
                 <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                   <div className="space-y-1">
                     <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
                       <Shield size={20} className="text-primary" /> Target Credentials
                     </CardTitle>
                     <CardDescription className="text-xs uppercase font-bold tracking-widest">Identify the asset for analysis</CardDescription>
                   </div>
                   <Badge variant="outline" className="bg-white/5 border-white/10 text-primary font-bold px-3">STEP 1/2</Badge>
                 </CardHeader>
                 
                 <CardContent className="p-0 space-y-6">
                    <FormField
                      control={form.control}
                      name="targetName"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-white/70">Project / Asset Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Customer Portal Production" className="h-12 bg-white/5 border-white/10 rounded-xl px-4 text-white focus:border-primary/50 transition-all font-medium" {...field} />
                          </FormControl>
                          <FormMessage className="text-[11px] font-bold" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="targetUrl"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-white/70">Target Endpoint URL</FormLabel>
                          <FormControl>
                            <div className="relative">
                               <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                               <Input placeholder="https://api.sentinel-core.infra" className="h-12 bg-white/5 border-white/10 rounded-xl pl-12 pr-4 text-white focus:border-primary/50 transition-all font-medium" {...field} />
                            </div>
                          </FormControl>
                          <FormDescription className="text-[10px] text-muted-foreground/60 font-semibold px-1 italic">
                            Ensuring connection via secure protocols (HTTPS) is highly recommended.
                          </FormDescription>
                          <FormMessage className="text-[11px] font-bold" />
                        </FormItem>
                      )}
                    />
                 </CardContent>
              </Card>

              {/* SCAN CONFIGURATION */}
              <Card className="border-border bg-slate-900/40 backdrop-blur-sm p-8 shadow-xl">
                 <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                   <div className="space-y-1">
                     <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
                       <Zap size={20} className="text-primary" /> Intelligence Profile
                     </CardTitle>
                     <CardDescription className="text-xs uppercase font-bold tracking-widest">Select scan depth and frequency</CardDescription>
                   </div>
                   <Badge variant="outline" className="bg-white/5 border-white/10 text-primary font-bold px-3">STEP 2/2</Badge>
                 </CardHeader>
                 
                 <CardContent className="p-0">
                    <FormField
                      control={form.control}
                      name="scanType"
                      render={({ field }) => (
                        <FormItem className="space-y-6">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                            >
                              {[
                                { id: "quick", title: "Quick Pulse", desc: "Top 10 OWASP & SSL checks", time: "~5m" },
                                { id: "full", title: "Normal Audit", desc: "Deep crawling & IDOR scan", time: "~25m" },
                                { id: "deep", title: "Chaos Mode", desc: "Full fuzzing & CVE probes", time: "~2h" },
                                { id: "compliance", title: "Compliance", desc: "PCI-DSS / SOC2 Audit", time: "~4h" },
                              ].map((type) => (
                                <FormItem key={type.id} className="space-y-0">
                                  <FormControl>
                                    <RadioGroupItem
                                      value={type.id}
                                      className="peer sr-only"
                                    />
                                  </FormControl>
                                  <FormLabel className="flex flex-col h-full border border-white/5 bg-white/5 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-white/10 transition-all group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="text-sm font-bold text-white group-peer-data-[state=checked]:text-primary transition-colors">{type.title}</span>
                                      <span className="text-[10px] font-black font-mono text-muted-foreground">{type.time}</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{type.desc}</p>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary/10 rounded-full scale-0 group-peer-data-[state=checked]:scale-150 transition-transform duration-500" />
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN: SUMMARY & TIPS */}
            <div className="lg:col-span-5 space-y-6">
               <Card className="border-border bg-slate-900/40 backdrop-blur-sm p-6 overflow-hidden relative border-l-4 border-l-primary">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <Info size={18} className="text-primary" />
                    <CardTitle className="text-md font-bold text-white uppercase tracking-tight">Deployment Policy</CardTitle>
                  </div>
                  
                  <div className="space-y-6 relative z-10">
                     <div className="space-y-4">
                        <div className="flex items-start gap-4">
                           <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                              <CheckCircle2 size={16} />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-white">Authorized Scan Only</p>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Ensure you have explicit written permission to scan the target infrastructure. Autonomous probing can be resource-intensive.</p>
                           </div>
                        </div>

                        <div className="flex items-start gap-4">
                           <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                              <Lock size={16} />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-white">Encryption Verified</p>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">All telemetry data from this probe will be encrypted with your enterprise RSA master key before storage.</p>
                           </div>
                        </div>
                     </div>

                     <div className="pt-6 border-t border-white/5">
                        <Button type="submit" onClick={form.handleSubmit(onSubmit)} className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 gap-3 group">
                           Initialize Probe <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-4">Average launch time: 4.2 seconds</p>
                     </div>
                  </div>
               </Card>

               {/* RECENT TEMPLATES (MOCK) */}
               <div className="px-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Saved Profiles</p>
                  <div className="space-y-3">
                     {["Production_Cluster_Standard", "Staging_Health_Probe", "Daily_OWASP_Check"].map((item, i) => (
                       <button key={i} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all text-left group">
                          <div className="flex items-center gap-3">
                             <Server size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                             <span className="text-xs font-bold text-white/70">{item}</span>
                          </div>
                          <ChevronRight size={14} className="text-muted-foreground" />
                       </button>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
