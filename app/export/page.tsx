// app/export/page.tsx

import {
    CheckCircle2,
    Mail,
    Download,
    Link2,
    Sparkles,
    RotateCcw,
    Printer,
    Bell,
    HelpCircle,
  } from "lucide-react";
  import Sidebar from "../../components/layout/Sidebar";
  import Header from "../../components/layout/Header";
  
  export default function ExportPage() {
    return (
      <div className="flex h-screen overflow-hidden bg-[#020617] text-white">
        {/* 1. SIDEBAR */}
        <Sidebar />
  
        {/* 2. AREA KANAN */}
        <div className="flex-1 flex flex-col h-screen min-w-0">
          
          {/* HEADER */}
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#020617] shrink-0">
            <h2 className="text-sm font-semibold text-cyan-400 tracking-wide">
              OJS Integrated Security
            </h2>
            <div className="flex items-center gap-5 text-gray-400">
              <Bell size={18} className="hover:text-white cursor-pointer" />
              <HelpCircle size={18} className="hover:text-white cursor-pointer" />
              <div className="w-8 h-8 rounded-full bg-slate-600 border border-white/10 overflow-hidden">
                 <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="user profile" />
              </div>
            </div>
          </header>
  
          {/* 3. MAIN KONTEN (MEFET KIRI) */}
          <main className="flex-1 overflow-y-auto bg-[#020617]">
            {/* w-full dan pl-8 biar mepet kiri kayak risk scoring */}
            <div className="w-full pl-8 pr-8 py-8 space-y-8 pb-12">
              
              {/* TOP AREA */}
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-8">
                
                {/* LEFT CONTENT */}
                <div className="min-w-0">
                  {/* STATUS */}
                  <div className="flex items-center gap-2 text-emerald-400 mb-4">
                    <CheckCircle2 size={20} />
                    <span className="text-sm font-bold tracking-widest uppercase">
                      Export Success
                    </span>
                  </div>
  
                  {/* TITLE */}
                  <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
                    Report Generated Successfully
                  </h1>
  
                  {/* SUBTITLE + BUTTONS (Ukuran Button diperkecil) */}
                  <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                    <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
                      The Q4 Vulnerability Assessment for{" "}
                      <span className="text-cyan-400 font-bold">
                        Enterprise_Stack_Alpha
                      </span>{" "}
                      is ready for distribution.
                    </p>
  
                    <div className="flex gap-3 shrink-0">
                      {/* Button dikecilin jadi h-12 dan text-xs/sm */}
                      <button className="h-12 px-6 rounded-xl bg-[#111c31] hover:bg-white/5 border border-white/10 transition flex items-center gap-2 text-sm font-bold text-white">
                        <Mail size={18} />
                        Send to Email
                      </button>
  
                      <button className="h-12 px-6 rounded-xl bg-cyan-400 hover:bg-cyan-300 transition flex items-center gap-2 text-sm font-bold text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        <Download size={18} />
                        Download PDF
                      </button>
                    </div>
                  </div>
  
                  {/* PDF PREVIEW */}
                  <div className="mt-10 rounded-2xl overflow-hidden border border-white/10 bg-[#0b1220] shadow-2xl">
                    {/* PDF BAR */}
                    <div className="h-12 bg-[#111c31] px-5 flex items-center justify-between border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-300 tracking-wider">
                          SEC_REPORT_V2_4.PDF
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-black text-gray-500 uppercase">
                          12 PAGES
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs font-bold">75%</div>
                    </div>
  
                    {/* PAPER (A4 Look) */}
                    <div className="bg-[#020617]/50 p-12 flex justify-center">
                      <div className="w-full max-w-[700px] aspect-[1/1.4] bg-white rounded-sm p-16 shadow-2xl text-black">
                        <div className="w-16 h-1.5 bg-blue-600 mb-12" />
                        <h2 className="text-4xl font-bold text-slate-900 leading-tight mb-4">
                          Vulnerability Assessment Report
                        </h2>
                        <p className="text-xl text-slate-500 mb-20">
                          Enterprise Infrastructure Group Alpha
                        </p>
  
                        <div className="mt-auto pt-40 space-y-5">
                          <InfoRow label="DATE" value="OCT 24, 2026" />
                          <InfoRow label="REPORT ID" value="#OJS-992-QX" />
                          <InfoRow label="STATUS" value="CERTIFIED" valueClass="text-emerald-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
  
                {/* RIGHT SIDEBAR (WIDGETS) */}
                <div className="space-y-6">
                  {/* DISTRIBUTION CARD */}
                  <div className="rounded-2xl bg-[#111c31]/40 border border-white/10 p-6">
                    <h3 className="text-lg font-bold text-white mb-6">
                      Distribution Options
                    </h3>
  
                    <div className="rounded-xl bg-[#020617] p-4 flex gap-4 items-center border border-white/5">
                      <div className="w-10 h-10 rounded-lg bg-[#111c31] flex items-center justify-center text-cyan-400">
                        <Link2 size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Share secure link</p>
                        <p className="text-xs text-gray-500">Expires in 7 days</p>
                      </div>
                    </div>
  
                    <div className="mt-8">
                      <p className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase mb-4">
                        Table of Contents
                      </p>
                      <div className="space-y-3">
                        <TocRow title="Executive Summary" page="P. 02" active />
                        <TocRow title="Methodology" page="P. 04" />
                        <TocRow title="Network Perimeter" page="P. 06" />
                        <TocRow title="Cloud Resource Audit" page="P. 09" />
                        <TocRow title="Remediation Roadmap" page="P. 11" />
                      </div>
                    </div>
                  </div>
  
                  {/* AUTO-SYNC CARD */}
                  <div className="rounded-2xl bg-gradient-to-br from-[#111c31] to-[#020617] border border-white/10 p-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 shrink-0 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                        <Sparkles size={22} />
                      </div>
                      <div>
                        <p className="text-md font-bold text-white">Auto-Sync Enabled</p>
                        <p className="text-xs text-gray-400 leading-relaxed mt-2">
                          Report synced to Compliance Vault for long-term audit retention.
                        </p>
                      </div>
                    </div>
                  </div>
  
                  {/* QUICK ACTIONS */}
                  <div className="rounded-xl bg-[#111c31]/40 border border-white/10 overflow-hidden grid grid-cols-2">
                    <button className="h-24 flex flex-col items-center justify-center gap-2 border-r border-white/10 hover:bg-white/5 transition">
                      <RotateCcw size={20} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-300">Logs</span>
                    </button>
                    <button className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition">
                      <Printer size={20} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-300">Print</span>
                    </button>
                  </div>
                </div>
              </div>
              
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  /* SUB-COMPONENTS */
  
  function InfoRow({ label, value, valueClass = "text-slate-800" }: any) {
    return (
      <div className="flex justify-between items-center border-t border-slate-100 pt-4">
        <span className="text-xs font-bold text-slate-400 tracking-wider">{label}</span>
        <span className={`text-sm font-bold ${valueClass}`}>{value}</span>
      </div>
    );
  }
  
  function TocRow({ title, page, active = false }: any) {
    return (
      <div className="flex justify-between items-center group cursor-pointer">
        <span className={`text-sm font-medium transition-colors ${active ? "text-cyan-400" : "text-gray-400 group-hover:text-white"}`}>
          {title}
        </span>
        <span className="text-xs font-bold text-gray-600 tracking-tighter">{page}</span>
      </div>
    );
  }