"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Shield,
  Play,
  BadgeCheck,
  Zap,
  Activity,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [hoveredPricing, setHoveredPricing] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans overflow-x-hidden">
      {/* NAVBAR */}
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-full mx-auto h-20 px-8 flex items-center justify-between">
          {/* LEFT */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo-OjsDef.webp"
              alt="OJSDef"
              width={100}
              height={100}
              loading="eager"
              className="w-20 h-20 object-contain group-hover:scale-110 transition-transform"
            />

            {/*<span className="text-xl font-black tracking-tighter uppercase text-white">
              OJS<span className="text-primary">Def</span>
            </span>*/}
          </Link>

          {/* CENTER */}
          <nav className="hidden md:flex justify-between gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            <Link href="#" className="text-primary hover:text-white transition">
              Home
            </Link>

            <Link href="#features" className="hover:text-white transition">
              Features
            </Link>

            <Link href="#about" className="hover:text-white transition">
              About
            </Link>

            <Link href="#" className="hover:text-white transition">
              Pricing
            </Link>
          </nav>

          {/* RIGHT */}
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-white transition"
            >
              Login
            </Link>

            <Button
              asChild
              className="rounded-2xl px-6 h-11 bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:scale-105 transition-transform"
            >
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* BACKGROUND */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] -z-10 animate-pulse" />

        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />

        <div className="max-w-[1450px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>

                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>

              Security_Core_Live
            </div>

            <h1 className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8 uppercase text-white italic">
              Secure <br />
              <span className="text-primary not-italic">Digital</span> <br />
              Frontier.
            </h1>

            <p className="text-xl text-muted-foreground/60 leading-relaxed max-w-[600px] mb-12 font-medium">
              Lindungi instalasi OJS Anda dari penyusupan konten ilegal, defacement, dan eksploitasi kerentanan dengan audit dua arah berbasis CVSS v3.
            </p>

            <div className="flex flex-wrap gap-5">
              <Button
                size="lg"
                className="h-16 px-10 rounded-3xl text-xs font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:scale-105 transition-transform"
                asChild
              >
                <Link href="/login">Launch_OJS_Integrated</Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-16 px-10 rounded-3xl text-xs font-black uppercase tracking-widest border-white/10 glass-dark hover:bg-white/10 transition-colors gap-3"
              >
                <Play size={18} fill="currentColor" />
                Technical_Watch
              </Button>
            </div>
          </motion.div>

          {/* RIGHT MOCKUP */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            <div className="w-full aspect-16/10 rounded-[40px] border border-white/5 bg-slate-950/40 p-4 relative overflow-hidden backdrop-blur-sm group shadow-2xl">
              <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-transparent opacity-30" />

              <div className="relative h-full w-full rounded-[30px] border border-white/5 bg-slate-900/90 shadow-2xl overflow-hidden">
                <div className="h-14 border-b border-white/5 bg-white/2 flex items-center px-8 justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/5" />
                    <div className="w-3 h-3 rounded-full bg-white/5" />
                    <div className="w-3 h-3 rounded-full bg-white/5" />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-24 h-2 bg-white/5 rounded-full" />
                    <div className="w-8 h-8 rounded-full bg-white/5" />
                  </div>
                </div>

                <div className="p-10 space-y-10">
                  <div className="flex justify-between items-end border-b border-white/5 pb-8">
                    <div className="space-y-2">
                      <div className="h-2 w-32 bg-primary/20 rounded-full" />

                      <div className="h-10 w-64 bg-white/5 rounded-xl block" />
                    </div>

                    <div className="w-32 h-32 rounded-full border-4 border-primary/20 border-t-primary animate-spin-slow p-2">
                      <div className="w-full h-full rounded-full bg-primary/5 flex items-center justify-center">
                        <span className="text-2xl font-black text-white italic">
                          82
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="h-32 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-transparent" />
                    </div>

                    <div className="h-32 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-tr from-secondary/10 to-transparent" />
                    </div>
                  </div>
                </div>
              </div>

              {/* FLOATING CARD */}
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 2, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 6,
                  ease: "easeInOut",
                }}
                className="absolute top-1/3 -right-6 p-6 rounded-[30px] glass-dark border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-20"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-[0_0_20px_rgba(0,230,153,0.2)]">
                    <BadgeCheck size={32} />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-[0.2em]">
                      Intel_Status
                    </p>

                    <p className="text-lg font-black text-white italic uppercase tracking-tighter">
                      Secured_Vault
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="py-32 relative border-y border-white/5"
      >
        <div className="max-w-[1450px] mx-auto px-8">
          <div className="mb-20 text-center">
            <p className="text-primary text-[11px] font-black uppercase tracking-[0.3em] mb-4">
              Core Features
            </p>

            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
              Built for <span className="text-primary not-italic">Modern</span>{" "}
              Security
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard icon={<Shield size={24} />} title="Audit Dua Arah" desc="Pemindaian internal via plugin PHP sekaligus audit eksternal via bot OJSDef untuk deteksi komprehensif." delay={0.1} />
            <FeatureCard icon={<Zap size={24} />} title="Risk Scoring CVSS v3" desc="Setiap temuan dinilai dengan standar CVSS v3 untuk prioritas perbaikan yang akurat dan terstruktur." delay={0.2} />
            <FeatureCard icon={<Activity size={24} />} title="Laporan PDF Bahasa Indonesia" desc="Laporan audit lengkap dan panduan perbaikan dalam Bahasa Indonesia, siap dibagikan ke manajemen." delay={0.3} />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-32 relative border-y border-white/5">
        <div className="max-w-[1450px] mx-auto px-8">
          <div className="mb-20 text-center">
            <p className="text-primary text-[11px] font-black uppercase tracking-[0.3em] mb-4">
              Pricing
            </p>

            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
              Pilih <span className="text-primary not-italic">Paket</span> Anda
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <PricingCard
              title="Starter"
              price="$0"
              period="/MONTH"
              desc="Untuk institusi yang baru memulai audit keamanan OJS."
              features={[
                "1 target OJS",
                "Audit Eksternal",
                "Laporan dasar PDF",
                "Komunitas support",
              ]}
              isActive={hoveredPricing === "Starter"}
              onHover={() => setHoveredPricing("Starter")}
              delay={0.1}
            />

            <PricingCard
              title="Cyber_Pro"
              price="$49"
              period="/MONTH"
              desc="Untuk institusi dengan beberapa jurnal OJS aktif."
              features={[
                "Semua fitur Starter",
                "Audit Internal + Eksternal",
                "Risk Scoring berbasis CVSS v3",
                "Laporan PDF Bahasa Indonesia",
              ]}
              isActive={hoveredPricing === "Cyber_Pro"}
              onHover={() => setHoveredPricing("Cyber_Pro")}
              delay={0.2}
            />

            <PricingCard
              title="Enterprise"
              price="Custom"
              period="/YEAR"
              desc="Untuk perguruan tinggi dengan puluhan instalasi OJS."
              features={[
                "Semua fitur Cyber_Pro",
                "Multi-target tak terbatas",
                "Notifikasi Telegram & Email",
                "Dukungan teknis prioritas",
              ]}
              isActive={hoveredPricing === "Enterprise"}
              onHover={() => setHoveredPricing("Enterprise")}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-36 relative overflow-hidden">
        <div className="absolute left-1/2 top-1/2 w-[700px] h-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[160px] -z-10" />

        <div className="max-w-[1450px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-primary text-[11px] font-black uppercase tracking-[0.3em] mb-5">
              About OJSDef
            </p>

            <h2 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tighter uppercase text-white italic mb-10">
              Cyber Defense <br />
              <span className="text-primary not-italic">Built</span> For Scale
            </h2>

            <div className="space-y-7 text-lg text-muted-foreground/60 leading-relaxed font-medium">
              <p>
                OJSDef is an integrated security intelligence platform designed
                to help organizations identify, analyze, and mitigate digital
                threats with precision.
              </p>

              <p>
                Combining automated vulnerability detection, security posture
                analytics, and centralized reporting, OJSDef enables modern
                infrastructure teams to maintain resilience against evolving
                cyber threats.
              </p>

              <p>
                Designed with a high-performance architecture and enterprise
                scalability in mind, the platform provides a streamlined
                experience for continuous monitoring and proactive defense
                operations.
              </p>
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-[40px] border border-white/5 bg-slate-900/40 backdrop-blur-sm p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-40" />

              <div className="relative z-10 space-y-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">
                      OJSDef Core
                    </p>

                    <h3 className="text-4xl font-black text-white tracking-tight">
                      Security Intelligence Matrix
                    </h3>
                  </div>

                  <div className="w-20 h-20 rounded-[24px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_40px_rgba(6,182,212,0.15)]">
                    <Shield size={36} />
                  </div>
                </div>

                <div className="space-y-5">
                  {[
                    "Automated vulnerability assessment",
                    "Centralized risk monitoring",
                    "Enterprise-grade architecture",
                    "Integrated reporting & analytics",
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <ChevronRight size={18} />
                      </div>

                      <span className="text-white/80 font-medium">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05)_0%,transparent_70%)]" />

        <div className="max-w-[1100px] mx-auto px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-12"
          >
            <h2 className="text-5xl md:text-8xl font-black leading-[0.9] text-white uppercase italic tracking-tighter">
              Ready to{" "}
              <span className="text-secondary not-italic">Bolster</span> <br />
              Your Defense?
            </h2>

            <p className="text-2xl text-muted-foreground/60 max-w-3xl mx-auto font-medium">
              Deploy OJS Integrated Security today and get instant visibility
              into your application&apos;s security posture.
            </p>

            <Button
              size="lg"
              className="h-20 px-12 rounded-[32px] text-sm font-black uppercase tracking-[0.2em] bg-white text-black shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform group"
              asChild
            >
              <Link href="/login">
                Initialize_First_Probe
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-24 border-t border-white/5 bg-slate-950">
        <div className="max-w-[1450px] mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo-OjsDef.webp"
                alt="OJSDef"
                width={100}
                height={100}
                loading='eager'
                className="w-30 h-30 object-contain"
              />

              {/*<span className="text-xl font-black uppercase tracking-tighter text-white">
                OJS<span className="text-primary">Def</span>
              </span>*/}
            </Link>

            <div className="flex flex-wrap gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
              <Link href="#" className="hover:text-primary transition-colors">
                Privacy_Prot
              </Link>

              <Link href="#" className="hover:text-primary transition-colors">
                Terms_Ops
              </Link>

              <Link href="#" className="hover:text-primary transition-colors">
                Intel_Sec
              </Link>

              <Link href="#" className="hover:text-primary transition-colors">
                Nodes_Status
              </Link>
            </div>

            <p className="text-[10px] font-black font-mono text-muted-foreground/20 uppercase tracking-widest">
              &copy; 2026 OJS_INTEGRATED_SECURITY_CO.
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
  delay,
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
      className="p-10 rounded-[40px] glass-dark border border-white/5 relative overflow-hidden flex flex-col h-full hover:-translate-y-2 transition-all duration-500"
    >
      <div className="w-16 h-16 rounded-[24px] bg-primary/10 text-primary flex items-center justify-center mb-12 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-6 uppercase tracking-tight text-white italic">{title}</h3>
      <p className="text-lg text-muted-foreground/60 leading-relaxed font-medium">{desc}</p>
    </motion.div>
  );
}

function PricingCard({
  title, price, period, desc, features, isActive, onHover, delay,
}: {
  title: string; price: string; period: string; desc: string;
  features: string[]; isActive?: boolean; onHover: () => void; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      onMouseEnter={onHover}
      className={`p-10 rounded-[40px] glass-dark border cursor-pointer ${isActive ? "border-primary/50 shadow-[0_0_40px_rgba(6,182,212,0.15)] bg-slate-900/60" : "border-white/5"} relative overflow-hidden flex flex-col h-full hover:-translate-y-2 transition-all duration-500`}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-4">{title}</p>
      <div className="flex items-end gap-1 mb-2">
        <span className="text-5xl font-black text-white">{price}</span>
        <span className="text-sm text-muted-foreground/60 mb-2 font-black uppercase">{period}</span>
      </div>
      <p className="text-muted-foreground/60 text-sm mb-8">{desc}</p>
      <ul className="space-y-3 mt-auto">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-sm text-white/70">
            <CheckCircle2 size={14} className="text-primary shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}