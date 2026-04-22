"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Shield, ArrowLeft, Loader2, AlertCircle, Lock, Mail, ChevronRight } from "lucide-react";
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

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Establish secure session failed.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Synchronous communication error. Target unreachable.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] space-y-10 relative z-10"
      >
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="group mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/10 flex items-center justify-center text-primary shadow-[0_0_40px_rgba(6,182,212,0.15)] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <Shield size={32} />
            </div>
          </Link>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="cyber" className="text-[9px] font-black uppercase tracking-[0.3em] h-5 px-3">LOGIN SESSION</Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">OJS<span className="text-primary not-italic">DEF</span></h1>
            <p className="text-muted-foreground/60 text-sm font-medium tracking-tight">Access the OJS Integrated Security Nexus</p>
          </div>
        </div>

        <Card className="glass-dark border-none overflow-hidden shadow-2xl">
          <div className="h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-50" />
          <CardHeader className="space-y-1 p-8 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Login Your Account</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <AnimatePresence mode="wait">
              {error && (
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

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Email</FormLabel>
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
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Password</FormLabel>
                        <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors">
                          forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative group/field">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/20 group-focus-within/field:text-primary transition-colors" />
                          <Input
                            type="password"
                            placeholder="**********"
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
                        LOGIN_IN_PROGRESS...
                      </>
                    ) : (
                      <span className="flex items-center gap-2">
                        LOGIN <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
            Don't have an account? <Link href="/register" className="text-primary hover:text-white hover:underline transition-colors">Register Here</Link>
          </p>

          <Link
            href="/"
            className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 hover:text-white transition-all group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-2 transition-transform" />
            Return_To_Home_Base
          </Link>
        </div>
      </motion.div>
    </div>
  );
}