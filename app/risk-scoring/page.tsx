import { Search, ArrowRight, ChevronLeft, ChevronRight, Download, Bell, HelpCircle } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";

export default function RiskScoringPage() {
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
        
        {/* 3. MAIN CONTENT (Rata Kiri) */}
        <main className="flex-1 overflow-y-auto bg-[#020617]">
          <div className="w-full pl-8 pr-8 py-8 space-y-8 pb-12">
            
            {/* PAGE TITLE */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Risk Scoring Dashboard
                </h1>
              </div>
              <div className="bg-[#111c31] border border-white/5 px-4 py-2 rounded-lg text-[11px] font-bold tracking-widest text-gray-400">
                LAST SYNC <span className="text-emerald-400 ml-2 font-black">2 mins ago</span>
              </div>
            </div>

            {/* TOP CARDS GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* CARD 1: POSTURE SCORE */}
              <div className="bg-[#111c31]/40 border border-white/10 rounded-2xl p-8 flex flex-col items-center">
                <h2 className="w-full text-[11px] font-black text-gray-500 tracking-[0.3em] mb-10 uppercase">
                  Security Posture Score
                </h2>
                
                <div className="relative w-52 h-52 flex items-center justify-center mb-8">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="#1e293b" strokeWidth="9" fill="none" />
                    <circle cx="50" cy="50" r="42" stroke="#22d3ee" strokeWidth="9" fill="none" strokeDasharray="263.8" strokeDashoffset="60" className="drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center text-center">
                    <span className="text-6xl font-black text-white">78</span>
                    <span className="text-[10px] font-black text-emerald-400 tracking-widest mt-1">HIGH RISK</span>
                  </div>
                </div>

                <div className="w-full flex justify-between items-center pt-8 border-t border-white/5">
                  <div>
                    <p className="text-[10px] text-gray-500 tracking-widest font-black mb-1">RISK REDUCTION</p>
                    <p className="text-2xl font-black text-emerald-400">+12.4%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 tracking-widest font-black mb-1">THREAT LEVEL</p>
                    <p className="text-2xl font-black text-cyan-400 uppercase">Low</p>
                  </div>
                </div>
              </div>

              {/* CARD 2: SEVERITY */}
              <div className="bg-[#111c31]/40 border border-white/10 rounded-2xl p-8 flex flex-col">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-lg font-bold text-white tracking-wide">Vulnerabilities per Severity</h2>
                  <div className="flex bg-[#020617] rounded-lg p-1 border border-white/5">
                    <button className="px-4 py-1.5 text-[10px] font-black text-gray-500">Day</button>
                    <button className="px-4 py-1.5 text-[10px] font-black bg-cyan-400 text-black rounded-md">Week</button>
                  </div>
                </div>

                <div className="space-y-7 flex-1">
                  <SeverityBar label="CRITICAL" count="14 ITEMS" color="bg-red-500" width="w-[15%]" />
                  <SeverityBar label="HIGH" count="42 ITEMS" color="bg-orange-500" width="w-[45%]" />
                  <SeverityBar label="MEDIUM" count="128 ITEMS" color="bg-cyan-400" width="w-[85%]" />
                  <SeverityBar label="LOW" count="256 ITEMS" color="bg-emerald-400" width="w-[55%]" />
                </div>

                <div className="flex justify-between items-end mt-10">
                  <p className="text-xs text-gray-500">Aggregated data from 1,402 endpoints.</p>
                  <button className="text-[10px] font-black text-cyan-400 flex items-center gap-2 hover:gap-3 transition-all tracking-widest">
                    VIEW FULL BREAKDOWN <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* TABLE SECTION */}
            <div className="bg-[#111c31]/20 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#111c31]/20">
                <h2 className="text-sm font-bold tracking-wide">Risk Priority List</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                    <input type="text" placeholder="Filter vulnerabilities..." className="bg-[#020617] border border-white/5 rounded-lg pl-10 pr-4 py-2 text-xs w-64 focus:outline-none focus:border-cyan-400" />
                  </div>
                  <button className="flex items-center gap-2 bg-[#111c31] border border-white/10 px-4 py-2 rounded-lg text-[10px] font-black tracking-widest hover:bg-white/10 transition">
                    <Download size={14} /> EXPORT CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-gray-500 font-black border-b border-white/5 uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Vulnerability</th>
                      <th className="px-8 py-5 text-center">Risk Level</th>
                      <th className="px-8 py-5 text-center">Impact</th>
                      <th className="px-8 py-5">Likelihood</th>
                      <th className="px-8 py-5 text-center">Priority</th>
                      <th className="px-8 py-5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <TableRow title="Log4j RCE (CVE-2021-44228)" asset="PRODUCTION CLUSTER ALPHA" level="CRITICAL" impact="Extreme" impactColor="bg-red-500" likelihood="Highly Likely" priority="P1" />
                    <TableRow title="SQL Injection on Login" asset="API.CUSTOMER-PORTAL.V1" level="HIGH" impact="High" impactColor="bg-orange-500" likelihood="Likely" priority="P1" />
                    <TableRow title="Outdated SSH Version" asset="STAGING-VM-04" level="MEDIUM" impact="Moderate" impactColor="bg-cyan-400" likelihood="Possible" priority="P2" />
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="p-5 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500 font-black tracking-widest">
                <span>Showing 1-10 of 1,402 items</span>
                <div className="flex gap-2 items-center">
                  <ChevronLeft size={16} className="cursor-pointer hover:text-white" />
                  <span className="w-8 h-8 flex items-center justify-center bg-cyan-400 text-black rounded-lg font-bold">1</span>
                  <span className="w-8 h-8 flex items-center justify-center hover:text-white cursor-pointer font-bold">2</span>
                  <span className="w-8 h-8 flex items-center justify-center hover:text-white cursor-pointer font-bold">3</span>
                  <ChevronRight size={16} className="cursor-pointer hover:text-white" />
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

function SeverityBar({ label, count, color, width }: any) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] font-black mb-2.5 tracking-widest">
        <span className={label === 'CRITICAL' ? 'text-red-500' : 'text-gray-400'}>{label}</span>
        <span className="text-gray-500 font-bold">{count}</span>
      </div>
      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
        <div className={`${color} h-full ${width} rounded-full`}></div>
      </div>
    </div>
  );
}

function TableRow({ title, asset, level, impact, impactColor, likelihood, priority }: any) {
  const levelColors: any = {
    CRITICAL: "border-red-500/30 text-red-500 bg-red-500/10",
    HIGH: "border-orange-500/30 text-orange-500 bg-orange-500/10",
    MEDIUM: "border-cyan-500/30 text-cyan-500 bg-cyan-500/10",
  };

  return (
    <tr className="hover:bg-white/[0.03] transition-colors group">
      <td className="px-8 py-6">
        <p className="text-white font-bold mb-1 group-hover:text-cyan-400 transition-colors">{title}</p>
        <p className="text-[10px] text-gray-600 font-black tracking-widest uppercase">Asset: {asset}</p>
      </td>
      <td className="px-8 py-7 text-center">
        <span className={`px-3 py-1 rounded-full text-[9px] font-black border ${levelColors[level]}`}>{level}</span>
      </td>
      <td className="px-8 py-7">
        <div className="flex items-center justify-center gap-2.5">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-1.5 h-3 rounded-sm ${i <= (impact === 'Extreme' ? 4 : impact === 'High' ? 3 : 2) ? impactColor : 'bg-slate-800'}`}></div>
            ))}
          </div>
          <span className="text-white font-bold text-[10px]">{impact}</span>
        </div>
      </td>
      <td className="px-8 py-7 text-white font-bold text-center">{likelihood}</td>
      <td className="px-8 py-7 text-center">
        <span className="bg-slate-800 text-gray-400 px-2.5 py-1 rounded font-black text-[9px]">{priority}</span>
      </td>
      <td className="px-8 py-7"></td>
    </tr>
  );
}