"use client";

import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] space-y-10 relative z-10"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/10 flex items-center justify-center text-primary shadow-[0_0_40px_rgba(6,182,212,0.15)] mb-8">
            <KeyRound size={32} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="cyber" className="text-[9px] font-black uppercase tracking-[0.3em] h-5 px-3">Reset Password</Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">OJS<span className="text-primary not-italic">DEF</span></h1>
          </div>
        </div>

        <Card className="glass-dark border-none overflow-hidden shadow-2xl">
          <div className="h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-50" />
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Informasi Reset Password</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            <p className="text-sm text-white/80 leading-relaxed">
              Untuk reset password, hubungi{" "}
              <span className="text-primary font-bold">SaaS Administrator OJSDef</span> Anda.
            </p>
            <p className="text-sm text-muted-foreground/60 leading-relaxed">
              Administrator akan membantu proses reset password akun Anda secara manual.
            </p>
          </CardContent>
        </Card>

        <Link
          href="/login"
          className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 hover:text-white transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-2 transition-transform" />
          Kembali ke Login
        </Link>
      </motion.div>
    </div>
  );
}
