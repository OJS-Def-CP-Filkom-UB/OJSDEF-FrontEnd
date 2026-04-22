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
  ChevronRight,
  Terminal,
  Activity
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
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
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* HEADER SECTION */}
      <div className="text-center md:text-left space-y-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 justify-center md:justify-start"
        >
          <Badge variant="cyber" className="h-6 px-3 tracking-[0.2em] uppercase text-[9px] font-black">
            Asset Provisioning
          </Badge>
          <div className="h-px bg-white/5 flex-1 hidden md:block" />
        </motion.div>
        
        <motion.h1 
          className="text-5xl font-black tracking-tighter text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Initialize <span className="text-secondary">Probe</span>
        </motion.h1>
        <motion.p 
          className="text-muted-foreground text-lg font-medium max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Deploy our proprietary scanning engine to identify threat vectors across your infrastructure.
        </motion.p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Core Identification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass border-none h-full relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Terminal size={40} />
                 </div>
                 <CardContent className="p-8 space-y-8">
                   <div className="space-y-1">
                     <h3 className="text-lg font-bold text-white flex items-center gap-2">
                       <Shield size={18} className="text-primary" /> Target ID
                     </h3>
                     <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Identification module</p>
                   </div>

                   <div className="space-y-6">
                     <FormField
                       control={form.control}
                       name="targetName"
                       render={({ field }) => (
                         <FormItem className="space-y-2">
                           <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/50 px-1">Label Name</FormLabel>
                           <FormControl>
                             <Input placeholder="PROD_GATEWAY_V2" className="h-12 bg-white/3 border-white/5 rounded-2xl px-5 text-sm font-mono focus:border-secondary/30 focus:ring-0 placeholder:text-muted-foreground/30" {...field} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />

                     <FormField
                       control={form.control}
                       name="targetUrl"
                       render={({ field }) => (
                         <FormItem className="space-y-2">
                           <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/50 px-1">Endpoint URL</FormLabel>
                           <FormControl>
                             <div className="relative group/input">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-secondary transition-colors" />
                                <Input placeholder="https://..." className="h-12 bg-white/3 border-white/5 rounded-2xl pl-12 pr-5 text-sm font-mono focus:border-secondary/30 focus:ring-0 placeholder:text-muted-foreground/30" {...field} />
                             </div>
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>
                 </CardContent>
              </Card>
            </motion.div>

            {/* Quick Policy Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
               <Card className="glass-dark border-none h-full relative overflow-hidden flex flex-col justify-between">
                  <CardContent className="p-8 space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Security Policy Compliance</h3>
                    
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Authorization Verified</p>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">System confirms that current user holds 'Security_Lead' status for asset registration.</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Lock size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Advanced Encrypt</p>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Probe results will be zero-knowledge encrypted via RSA-4096 before persisting.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <div className="p-8 border-t border-white/5 bg-secondary/5">
                    <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-[0_0_30px_rgba(0,230,153,0.15)] group relative overflow-hidden">
                       <span className="relative z-10 flex items-center gap-3">
                         Launch Scanning Engine <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                       </span>
                    </Button>
                    <p className="text-center text-[9px] text-muted-foreground/40 font-black tracking-widest mt-4 uppercase">System Status: Nominal</p>
                  </div>
               </Card>
            </motion.div>
          </div>

          {/* Intelligence Depth (Scan Types) */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <Activity size={20} className="text-secondary" /> Intelligence Depth
              </h3>
              <Badge variant="outline" className="border-white/5 text-muted-foreground font-mono">STEP_02//CONF</Badge>
            </div>

            <FormField
              control={form.control}
              name="scanType"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                      {[
                        { id: "quick", title: "QUICK_PULSE", desc: "Top 10 OWASP & SSL check", time: "5M", icon: Zap },
                        { id: "full", title: "NOMINAL_AUDIT", desc: "IDOR & Component scan", time: "25M", icon: Server },
                        { id: "deep", title: "CHAOS_MODE", desc: "Fuzzing & Payload inject", time: "2H", icon: Cpu },
                        { id: "compliance", title: "NIST_PROTO", desc: "Full industry audit", time: "4H", icon: Shield },
                      ].map((type) => (
                        <FormItem key={type.id} className="space-y-0">
                          <FormControl>
                            <RadioGroupItem value={type.id} className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col h-full glass-dark rounded-2xl p-6 cursor-pointer border border-transparent peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-secondary/5 hover:border-white/10 transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                              <div className="w-10 h-10 rounded-xl bg-white/3 flex items-center justify-center text-muted-foreground group-peer-data-[state=checked]:text-secondary transition-colors">
                                <type.icon size={20} />
                              </div>
                              <span className="text-[10px] font-black font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded">{type.time}</span>
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white group-peer-data-[state=checked]:text-secondary transition-colors mb-2 block">{type.title}</span>
                            <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold uppercase tracking-wider">{type.desc}</p>
                            
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-secondary scale-0 group-peer-data-[state=checked]:scale-100 transition-transform" />
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
          </motion.div>
        </form>
      </Form>
    </div>
  );
}
