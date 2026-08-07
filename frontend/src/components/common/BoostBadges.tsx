"use client";

import React from "react";
import { Sparkles, Zap, Rocket, ShieldCheck, Flame } from "lucide-react";

export function FeaturedBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-[#a0f212] text-[#0b0c01] text-[9px] px-3 py-1 rounded-full font-black tracking-widest uppercase shadow-[0_0_12px_rgba(160,242,18,0.3)] flex items-center gap-1 shrink-0 ${className}`}>
      <Sparkles className="h-3 w-3 text-[#0b0c01]" />
      <span>RECOMMENDED</span>
    </div>
  );
}

export function ProBoostBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-[#a0f212] text-[#0b0c01] text-[9px] px-3 py-1 rounded-full font-black tracking-widest uppercase shadow-[0_0_15px_rgba(160,242,18,0.5)] flex items-center gap-1 shrink-0 animate-pulse ${className}`}>
      <Zap className="h-3 w-3 fill-[#0b0c01]" />
      <span>PRO BOOST</span>
    </div>
  );
}

export function UltraProBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gradient-to-r from-purple-600 via-indigo-600 to-[#a0f212] text-white text-[9px] px-3 py-1 rounded-full font-black tracking-widest uppercase shadow-[0_0_20px_rgba(167,139,250,0.6)] flex items-center gap-1 shrink-0 ${className}`}>
      <Rocket className="h-3 w-3 text-[#a0f212]" />
      <span>ULTRA PRO SPOTLIGHT</span>
    </div>
  );
}

export function FeaturedOrganizerBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-[#a0f212]/15 border border-[#a0f212]/40 text-emerald-800 dark:text-[#a0f212] text-[8px] px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1 shrink-0 ${className}`}>
      <ShieldCheck className="h-3 w-3 text-[#a0f212]" />
      <span>PRO HOST</span>
    </div>
  );
}
