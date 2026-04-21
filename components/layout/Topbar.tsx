"use client";

import React from "react";
import { 
  Bell, 
  HelpCircle, 
  Search,
  Command,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Topbar() {
  return (
    <header className="h-16 border-b border-border bg-slate-950/50 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="flex items-center gap-8 flex-1">
        <div className="flex items-center gap-2 text-primary opacity-80 uppercase text-[10px] font-black tracking-[0.2em]">
          <span>Security Protocol v4.2.0</span>
          <div className="w-1 h-1 rounded-full bg-primary" />
          <span className="text-muted-foreground font-bold">Operational</span>
        </div>

        <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/5 px-4 h-10 rounded-xl w-96 group hover:border-white/10 transition-all cursor-text">
          <Search size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-xs text-muted-foreground flex-1 font-medium">Search Intelligence logs...</span>
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="outline" className="hidden lg:flex bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold gap-1.5 px-3 h-8">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Systems Normal
        </Badge>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 relative">
            <Bell size={20} />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-slate-950" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5">
            <HelpCircle size={20} />
          </Button>
        </div>

        <div className="h-8 w-[1px] bg-white/5 mx-2" />

        <div className="flex items-center gap-3 pl-2">
          <div className="flex flex-col items-end hidden sm:block">
            <span className="text-xs font-bold text-white leading-none">Admin_Level_01</span>
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Superuser</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shadow-lg shadow-primary/5">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
