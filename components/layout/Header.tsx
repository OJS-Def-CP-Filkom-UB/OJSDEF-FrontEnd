export default function Header() {
    return (
      <header className="h-20 border-b border-slate-800 px-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-cyan-400">
          OJS Integrated Security
        </h2>
  
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-slate-700"></div>
          <div className="w-8 h-8 rounded-full bg-slate-700"></div>
          <div className="w-10 h-10 rounded-full bg-slate-500"></div>
        </div>
      </header>
    );
  }