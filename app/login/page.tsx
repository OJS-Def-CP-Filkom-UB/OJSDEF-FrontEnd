"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(to bottom right, #020617, #0e1731)",
      }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-2xl"
        style={{ backgroundColor: "var(--color-secondary)" }}
      >
        {/* LOGO & TITLE */}
        <div className="text-center mb-6">
          <div
            className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center text-white text-xl"
            style={{
              backgroundColor: "var(--color-primary)",
              boxShadow: "0 0 15px rgba(34,211,238,0.5)",
            }}
          >
            🔒
          </div>

          <h1 className="text-lg font-semibold tracking-wide">
            OJS INTEGRATED SECURITY
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            ENCRYPTION STANDARD PROTOCOL V.4.0
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-4">

          {/* EMAIL */}
          <div>
            <label className="text-xs text-slate-400">
              OPERATOR ID / EMAIL
            </label>
            <Input
              placeholder="operator@ojs-security.sys"
              className="mt-1 border-slate-800 text-white bg-transparent focus:ring-1 focus:ring-white/20"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-xs text-slate-400">
              ACCESS KEY
            </label>
            <Input
              type="password"
              placeholder="••••••••••"
              className="mt-1 border-slate-800 text-white bg-transparent focus:ring-1 focus:ring-white/20"
            />
          </div>

          {/* OPTIONS */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                style={{ accentColor: "var(--color-primary)" }}
              />
              Remember me
            </label>

            <span
              className="cursor-pointer hover:underline"
              style={{ color: "var(--color-primary)" }}
            >
              Reset Access
            </span>
          </div>

          {/* BUTTON */}
          <Button
            className="w-full font-semibold text-black transition-all"
            style={{
              backgroundColor: "var(--color-primary)",
              boxShadow: "0 0 12px rgba(34,211,238,0.4)",
            }}
          >
            INITIALIZE SESSION →
          </Button>
        </div>

        {/* FOOTER */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p className="text-green-400">● NODE IDENTITY VERIFIED</p>

          <div className="flex justify-center gap-4 mt-2">
            <span>LOCALIZATION</span>
            <span>CONTACT SYSADMIN</span>
          </div>
        </div>
      </div>
    </div>
  );
}