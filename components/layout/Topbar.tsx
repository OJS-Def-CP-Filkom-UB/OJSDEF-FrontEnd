"use client";

import React from "react";
import { 
  Bell, 
  HelpCircle, 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Topbar() {
  return (
    <header className="h-14 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
          <span className="text-secondary/80">OJS</span>
          <span className="opacity-40">/</span>
          <span>Integrated Security</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-white hover:bg-white/5 relative">
            <Bell size={16} />
            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-secondary rounded-full border border-black shadow-[0_0_5px_rgba(0,230,153,0.5)]" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-white hover:bg-white/5">
            <HelpCircle size={16} />
          </Button>
        </div>

        <div className="h-6 w-px bg-white/5" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-secondary font-bold text-[10px]">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
