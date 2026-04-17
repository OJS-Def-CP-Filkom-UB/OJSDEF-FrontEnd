import Link from "next/link";
import {
  Shield,
  Play,
  BadgeCheck,
  Zap,
  Puzzle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#020b1d] text-white">
      {/* NAVBAR */}
      <header className="border-b border-white/5 bg-[#04112b]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-[1450px] mx-auto h-20 px-8 grid grid-cols-3 items-center">

          {/* LEFT */}
          <div className="flex items-center gap-3 justify-self-start">
            <div className="w-8 h-8 rounded-lg bg-cyan-400/15 flex items-center justify-center text-cyan-400">
              <Shield size={18} />
            </div>

            <span className="text-xl font-semibold tracking-tight whitespace-nowrap">
              OJS Integrated Security
            </span>
          </div>

          {/* CENTER */}
          <nav className="hidden md:flex items-center justify-center gap-10 text-[15px] text-gray-300">
            <a className="text-cyan-400 relative font-medium cursor-pointer">
              Home
              <span className="absolute left-0 -bottom-3 w-full h-[2px] bg-cyan-400 rounded-full" />
            </a>

            <a className="hover:text-white transition cursor-pointer">
              Features
            </a>

            <a className="hover:text-white transition cursor-pointer">
              Pricing
            </a>

            <a className="hover:text-white transition cursor-pointer">
              About
            </a>
          </nav>

          {/* RIGHT */}
          <div className="flex items-center justify-self-end gap-5">
            <Link
              href="/login"
              className="text-gray-300 hover:text-white text-[15px] transition"
            >
              Login
            </Link>

            <Link
              href="/login"
              className="px-5 h-10 rounded-lg bg-cyan-400 text-black font-semibold text-[14px] flex items-center shadow-[0_0_20px_rgba(34,211,238,0.30)] hover:brightness-110 transition"
            >
              Get Started
            </Link>
          </div>

        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(34,211,238,0.10),transparent_35%)]" />

        <div className="max-w-[1450px] mx-auto px-8 pt-20 pb-24 grid grid-cols-1 xl:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0d1730] border border-cyan-400/10 text-cyan-400 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-cyan-400 rounded-full" />
              OJS Integration Live
            </div>

            <h1 className="text-[64px] leading-[1] font-semibold tracking-[-0.04em] max-w-[720px] text-[#dfe8ff]">
              Secure Your Digital Frontier with OJS Integrated Scanning.
            </h1>

            <p className="mt-8 text-[24px] leading-[1.45] text-[#94a3c2] max-w-[760px]">
              Automated vulnerability detection, real-time risk
              scoring, and comprehensive security reports for
              enterprise-grade protection.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="h-14 px-7 rounded-xl bg-cyan-400 text-black text-[18px] font-semibold flex items-center shadow-[0_0_25px_rgba(34,211,238,0.35)] hover:brightness-110 transition"
              >
                Get Started for Free
              </Link>

              <button className="h-14 px-7 rounded-xl bg-[#2a3554] text-white text-[18px] font-medium flex items-center gap-3 hover:bg-[#354261] transition">
                <Play size={18} fill="white" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* RIGHT MOCKUP */}
          <div className="rounded-[28px] overflow-hidden border border-white/5 bg-[#07162f] shadow-[0_0_60px_rgba(0,0,0,0.35)]">
            <div className="aspect-[1.18/1] relative bg-[radial-gradient(circle_at_60%_35%,rgba(34,211,238,0.28),transparent_20%),linear-gradient(135deg,#051122,#081b36_40%,#04112a)]">

              <div className="absolute inset-8 border border-cyan-400/10 rounded-xl" />
              <div className="absolute top-14 left-14 w-64 h-36 border border-cyan-400/20 rounded-lg bg-cyan-400/5" />
              <div className="absolute top-20 right-16 w-72 h-44 border border-cyan-400/20 rounded-lg bg-cyan-400/5" />
              <div className="absolute bottom-20 left-16 w-80 h-24 border border-cyan-400/20 rounded-lg bg-cyan-400/5" />
              <div className="absolute bottom-14 right-14 w-56 h-32 border border-cyan-400/20 rounded-lg bg-cyan-400/5" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(34,211,238,0.35),transparent_15%)]" />
            </div>
          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-[#000b22] py-16">
        <div className="max-w-[1450px] mx-auto px-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

          <FeatureCard
            icon={<BadgeCheck size={22} />}
            title="Enterprise Reliability"
            desc="Ensure continuous protection with our 99.9% uptime SLA, designed for mission-critical infrastructure."
          />

          <FeatureCard
            icon={<Zap size={22} />}
            title="Fast Remediation"
            desc="Speed up your security response with actionable insights and automated patching recommendations."
          />

          <FeatureCard
            icon={<Puzzle size={22} />}
            title="Seamless Integration"
            desc="Easy to set up and scale. Integrates effortlessly with your existing CI/CD pipelines and deployment workflows."
          />

        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[linear-gradient(90deg,#111c38_0%,#173156_50%,#111c38_100%)]">
        <div className="max-w-[1100px] mx-auto px-8 text-center">

          <h2 className="text-[54px] leading-tight font-semibold tracking-[-0.03em] text-[#dfe8ff]">
            Ready to strengthen your security?
          </h2>

          <p className="mt-5 text-[22px] text-[#a5b2d1] max-w-[900px] mx-auto leading-[1.45]">
            Deploy OJS Integrated Security today and get instant visibility
            into your application&apos;s security posture.
          </p>

          <Link
            href="/login"
            className="mt-10 inline-flex items-center justify-center h-14 px-8 rounded-xl bg-cyan-400 text-black text-[18px] font-semibold shadow-[0_0_25px_rgba(34,211,238,0.35)] hover:brightness-110 transition"
          >
            Initialize Your First Scan
          </Link>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#000b22]">
        <div className="max-w-[1450px] mx-auto px-8 h-24 flex flex-col md:flex-row items-center justify-between gap-4">

          <p className="text-xl font-semibold text-white">
            OJS Integrated Security
          </p>

          <div className="flex flex-wrap items-center gap-8 text-[15px] text-[#94a3c2]">
            <a>Privacy Policy</a>
            <a>Terms of Service</a>
            <a>Security</a>
            <a>Status</a>
          </div>

          <p className="text-sm text-[#64748b]">
            © 2024 OJS Integrated Security. All rights reserved.
          </p>

        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-[24px] bg-[#121d39] border border-white/5 p-8 min-h-[260px]">
      <div className="w-12 h-12 rounded-2xl bg-[#22365f] text-cyan-400 flex items-center justify-center">
        {icon}
      </div>

      <h3 className="mt-6 text-[28px] leading-tight font-semibold text-white">
        {title}
      </h3>

      <p className="mt-4 text-[18px] leading-[1.55] text-[#94a3c2]">
        {desc}
      </p>
    </div>
  );
}