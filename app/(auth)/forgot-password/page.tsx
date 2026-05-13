"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2, AlertCircle, Mail, ChevronRight, KeyRound, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const resetSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ResetFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      // Simulasi loading ke backend (karena belum ada API beneran)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log("Reset email sent to:", values.email);
      // Kalau sukses, ganti tampilan ke pesan sukses
      setIsSubmitted(true);
    } catch (err) {
      setError("Synchronous communication error. Target unreachable.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* BACKGROUND ELEMENTS (Sama persis kayak Login) */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] space-y-10 relative z-10"
      >
        <div className="flex flex-col items-center text-center">
          <div className="group mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/10 flex items-center justify-center text-primary shadow-[0_0_40px_rgba(6,182,212,0.15)] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <KeyRound size={32} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="cyber" className="text-[9px] font-black uppercase tracking-[0.3em] h-5 px-3">PASSWORD RECOVERY</Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">RESET<span className="text-primary not-italic">ACCESS</span></h1>
            <p className="text-muted-foreground/60 text-sm font-medium tracking-tight">Initiate secure protocol to regain access</p>
          </div>
        </div>

        <Card className="glass-dark border-none overflow-hidden shadow-2xl">
          <div className="h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-50" />
          <CardHeader className="space-y-1 p-8 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-white/40">
              {isSubmitted ? "Protocol Initiated" : "Verify Identity"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <AnimatePresence mode="wait">
              {error && !isSubmitted && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-4"
                >
                  <AlertCircle size={18} className="text-destructive mt-0.5 shrink-0 shadow-[0_0_10px_rgba(255,77,77,0.4)]" />
                  <p className="text-xs text-destructive font-black uppercase tracking-tight leading-relaxed">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center space-y-4 py-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-sm text-white font-medium">Reset Transmitted</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  If <span className="text-primary font-mono">{form.getValues().email}</span> exists in our system, you will receive encrypted reset instructions shortly.
                </p>
              </motion.div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Email Recovery</FormLabel>
                        <FormControl>
                          <div className="relative group/field">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/20 group-focus-within/field:text-primary transition-colors" />
                            <Input
                              placeholder="whoami@mail.com"
                              className="h-14 bg-white/2 border-white/5 focus:border-primary/40 focus:ring-primary/10 transition-all rounded-2xl pl-12 font-mono text-xs tracking-widest placeholder:text-muted-foreground/10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px] font-black uppercase text-destructive/80 italic pl-1" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full h-16 rounded-[24px] cursor-pointer bg-primary text-primary-foreground font-black uppercase text-xs tracking-[0.3em] shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 group"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={20} className="mr-3 animate-spin" />
                          TRANSMITTING...
                        </>
                      ) : (
                        <span className="flex items-center gap-2">
                          SEND RESET LINK <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Link
            href="/login"
            className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 hover:text-white transition-all group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-2 transition-transform" />
            Return_To_Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}