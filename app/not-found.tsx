"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield,
  RotateCcw,
  Home,
  Terminal,
  AlertTriangle,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#@%&$";

function useGlitchText(target: string, speed = 40) {
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    let frame = 0;
    const totalFrames = target.length * 3;

    const interval = setInterval(() => {
      setDisplay(
        target
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (frame > i * 3) return char;

            return GLITCH_CHARS[
              Math.floor(Math.random() * GLITCH_CHARS.length)
            ];
          })
          .join("")
      );

      frame++;

      if (frame > totalFrames) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [target, speed]);

  return display;
}

const LOG_LINES = [
  {
    time: "11:08:14.120",
    level: "WARN",
    msg: "Route not found in application router",
  },
  {
    time: "11:08:14.123",
    level: "WARN",
    msg: "No matching page handler for requested path",
  },
  {
    time: "11:08:14.126",
    level: "ERR ",
    msg: "404 Not Found — resource does not exist",
  },
  {
    time: "11:08:14.128",
    level: "INFO",
    msg: "Rendering fallback not-found page",
  },
  {
    time: "11:08:14.131",
    level: "INFO",
    msg: "Awaiting user navigation...",
  },
];

export default function NotFoundPage() {
  const router = useRouter();

  const glitchedCode = useGlitchText("404", 60);
  const glitchedTitle = useGlitchText("NOT FOUND", 30);

  const [visibleLogs, setVisibleLogs] = useState(0);
  const [scanPos, setScanPos] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setVisibleLogs((v) => Math.min(v + 1, LOG_LINES.length));
    }, 350);

    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let raf: number;

    const animate = () => {
      setScanPos((p) => (p + 0.4) % 100);
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">

      {/* BACKGROUND */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-yellow-500/10 rounded-full blur-[160px] -z-10" />

      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[120px] -z-10" />

      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Scanline */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background: `linear-gradient(
            transparent ${scanPos}%,
            rgba(250,204,21,0.03) ${scanPos + 2}%,
            transparent ${scanPos + 4}%
          )`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[600px] space-y-10 relative z-10"
      >

        {/* LOGO */}
        <div className="flex justify-center">
          <Link href="/" className="group">
            <div className="w-14 h-14 rounded-2xl bg-white/3 border border-yellow-500/20 flex items-center justify-center text-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.15)] group-hover:scale-110 transition-all duration-500">
              <Shield size={28} />
            </div>
          </Link>
        </div>

        {/* ERROR CODE */}
        <div className="text-center space-y-4">

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.1,
              duration: 0.5,
              ease: "backOut",
            }}
            className="relative inline-block"
          >
            <span
              className="text-[9rem] font-black leading-none tracking-tighter text-yellow-500/10 select-none"
              aria-hidden="true"
            >
              {glitchedCode}
            </span>

            <span className="absolute inset-0 flex items-center justify-center text-[9rem] font-black leading-none tracking-tighter text-yellow-400 drop-shadow-[0_0_40px_rgba(250,204,21,0.5)] select-none">
              400
            </span>
          </motion.div>

          <div className="space-y-2">

            <Badge
              className="text-[9px] font-black uppercase tracking-[0.3em] h-5 px-3 bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
            >
              NOT FOUND
            </Badge>

            <h1 className="text-xl font-black tracking-[0.15em] text-white/80 uppercase font-mono">
              {glitchedTitle}
            </h1>

            <p className="text-sm text-muted-foreground/50 font-medium max-w-sm mx-auto leading-relaxed">
              Halaman yang Anda cari tidak ditemukan atau sudah dipindahkan.
            </p>
          </div>
        </div>

        {/* TERMINAL */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="rounded-2xl bg-white/2 border border-white/5 overflow-hidden"
        >

          {/* TERMINAL HEADER */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-white/2">

            <Terminal
              size={13}
              className="text-muted-foreground/30"
            />

            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
              router.log — not_found
            </span>

            <div className="ml-auto flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
              <div className="w-2 h-2 rounded-full bg-orange-500/30" />
              <div className="w-2 h-2 rounded-full bg-secondary/20" />
            </div>
          </div>

          {/* LOGS */}
          <div className="p-5 space-y-2 font-mono min-h-[130px]">

            {LOG_LINES.slice(0, visibleLogs).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 text-[10px] leading-relaxed"
              >

                <span className="text-muted-foreground/25 shrink-0">
                  {line.time}
                </span>

                <span
                  className={`shrink-0 font-black ${
                    line.level === "ERR "
                      ? "text-red-400/70"
                      : line.level === "WARN"
                      ? "text-yellow-400/70"
                      : "text-cyan-400/50"
                  }`}
                >
                  [{line.level}]
                </span>

                <span className="text-muted-foreground/50">
                  {line.msg}
                </span>
              </motion.div>
            ))}

            {visibleLogs < LOG_LINES.length && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/20 font-mono">
                <span className="animate-pulse">▋</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ACTIONS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3"
        >

          <Button
            onClick={() => router.refresh()}
            className="flex-1 h-14 rounded-[20px] cursor-pointer bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/25 text-yellow-400 font-black uppercase text-[10px] tracking-[0.25em] transition-all hover:scale-[1.02] active:scale-[0.98] group"
          >
            <RotateCcw
              size={16}
              className="mr-2 group-hover:rotate-180 transition-transform duration-500"
            />
            Retry Request
          </Button>

          <Button
            onClick={() => router.push("/")}
            className="flex-1 h-14 rounded-[20px] cursor-pointer bg-white/3 hover:bg-white/6 border border-white/8 text-white/60 hover:text-white font-black uppercase text-[10px] tracking-[0.25em] transition-all hover:scale-[1.02] active:scale-[0.98] group"
          >
            <Home
              size={16}
              className="mr-2 group-hover:-translate-y-0.5 transition-transform"
            />
            Return Home
          </Button>
        </motion.div>

        {/* FOOTER */}
        <div className="flex items-center justify-center gap-2 pt-2">

          <TriangleAlert
            size={11}
            className="text-muted-foreground/20"
          />

          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/20">
            OJS<span className="text-yellow-400/40">DEF</span>
            {" "}— Error_404 // router@ojsdef.id
          </p>
        </div>
      </motion.div>
    </div>
  );
}