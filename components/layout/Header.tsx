"use client";

export default function Header() {
  return (
    <header
      className="h-20 px-6 flex items-center justify-between border-b border-slate-800"
      style={{ backgroundColor: "var(--color-secondary)" }}
    >
      {/* LEFT */}
      <div>
        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--color-primary)" }}
        >
          OJS Integrated Security
        </h2>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition">
          🔔
        </div>

        {/* Settings */}
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition">
          ⚙️
        </div>

        {/* Profile */}
        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-semibold">
          U
        </div>
      </div>
    </header>
  );
}