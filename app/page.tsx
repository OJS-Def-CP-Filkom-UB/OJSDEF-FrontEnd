"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Play,
  BadgeCheck,
  Zap,
  Puzzle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* NAVBAR */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1450px] mx-auto h-20 px-8 flex items-center justify-between">
          {/* LEFT */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Shield size={22} />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              OJSDef
            </span>
          </Link>

          {/* CENTER */}
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-muted-foreground">
            <Link href="#" className="text-primary hover:text-white transition">Home</Link>
            <Link href="#" className="hover:text-white transition">Features</Link>
            <Link href="#" className="hover:text-white transition">Pricing</Link>
            <Link href="#" className="hover:text-white transition">About</Link>
          </nav>

          {/* RIGHT */}
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-white transition"
            >
              Login
            </Link>
            <Button asChild className="rounded-full px-6 font-bold shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

        <div className="max-w-[1450px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Security Integration Live
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-8">
              Secure Your Digital Frontier with <span className="text-primary">OJS</span> Integrated Scanning.
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-[640px] mb-12">
              Automated vulnerability detection, real-time risk scoring, and comprehensive security reports for enterprise-grade protection.
            </p>

            <div className="flex flex-wrap gap-5">
              <Button size="lg" className="h-14 px-8 rounded-2xl text-lg font-bold shadow-[0_0_30px_rgba(34,211,238,0.25)]" asChild>
                <Link href="/login">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-2xl text-lg font-bold border-white/10 hover:bg-white/5 transition-colors gap-3">
                <Play size={20} fill="currentColor" /> Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* MOCKUP PREVIEW */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            <div className="w-full aspect-[4/3] rounded-[32px] border border-white/5 bg-slate-900/40 p-4 relative overflow-hidden backdrop-blur-sm group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
              
              {/* Fake Dashboard UI elements */}
              <div className="relative h-full w-full rounded-2xl border border-white/5 bg-slate-900/80 shadow-2xl overflow-hidden">
                <div className="h-12 border-b border-white/5 bg-white/5 flex items-center px-6 gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                </div>
                <div className="p-8 space-y-6">
                  <div className="h-8 w-1/3 bg-white/5 rounded-md" />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-32 bg-white/5 rounded-xl border border-white/5" />
                    <div className="h-32 bg-white/5 rounded-xl border border-white/5" />
                    <div className="h-32 bg-white/5 rounded-xl border border-white/5" />
                  </div>
                  <div className="h-40 bg-white/5 rounded-xl border border-white/5" />
                </div>
              </div>

              {/* Animated Floating Badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute top-1/4 -right-4 p-4 rounded-2xl bg-slate-800 border border-white/10 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <BadgeCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Health Status</p>
                    <p className="text-sm font-bold text-white">System Secured</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-32 bg-slate-900/20 border-y border-white/5">
        <div className="max-w-[1450px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BadgeCheck size={24} />}
              title="Enterprise Reliability"
              desc="Ensure continuous protection with our 99.9% uptime SLA, designed for mission-critical infrastructure."
              delay={0.1}
            />
            <FeatureCard
              icon={<Zap size={24} />}
              title="Fast Remediation"
              desc="Speed up your security response with actionable insights and automated patching recommendations."
              delay={0.2}
            />
            <FeatureCard
              icon={<Puzzle size={24} />}
              title="Seamless Integration"
              desc="Easy to set up and scale. Integrates effortlessly with existing CI/CD pipelines and deployment workflows."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="max-w-[1100px] mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
              Ready to strengthen your security?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Deploy OJS Integrated Security today and get instant visibility into your application&apos;s security posture. No complicated setup required.
            </p>
            <Button size="lg" className="h-16 px-10 rounded-2xl text-xl font-bold group" asChild>
              <Link href="/login">
                Initialize Your First Scan <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 border-t border-border bg-background">
        <div className="max-w-[1450px] mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Shield size={18} />
              </div>
              <span className="text-lg font-bold">OJSDef</span>
            </Link>
            
            <div className="flex flex-wrap gap-8 text-sm font-medium text-muted-foreground">
              <Link href="#" className="hover:text-white transition">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition">Terms of Service</Link>
              <Link href="#" className="hover:text-white transition">Security</Link>
              <Link href="#" className="hover:text-white transition">Status</Link>
            </div>

            <p className="text-sm text-muted-foreground">
              &copy; 2026 OJS Integrated Security.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  delay
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="p-10 rounded-[32px] bg-slate-900/40 border border-white/5 hover:border-primary/20 transition-colors group"
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-5 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-lg text-muted-foreground leading-relaxed">
        {desc}
      </p>
    </motion.div>
  );
}