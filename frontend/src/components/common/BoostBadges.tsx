"use client";

import React from "react";
import { Sparkles, Zap, Rocket, ShieldCheck, Flame } from "lucide-react";

export function FeaturedBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 text-emerald-800 dark:text-[#a0f212] text-[9px] px-3 py-1 rounded-full font-black tracking-widest uppercase shadow-[0_0_12px_rgba(160,242,18,0.3)] flex items-center gap-1 shrink-0 ${className}`}>
      <Sparkles className="h-3 w-3 text-[#a0f212]" />
      <span>FEATURED</span>
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

export function SponsoredBanner({ tier = "BASIC", className = "" }: { tier?: string; className?: string }) {
  const t = (tier || "BASIC").toUpperCase();
  return (
    <div className={`w-full bg-gradient-to-r from-[#0d2218] via-[#122e20] to-[#07130e] border border-[#a0f212]/30 rounded-2xl p-4 flex items-center justify-between shadow-lg text-white ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-[#a0f212]/10 border border-[#a0f212]/20">
          {t === "PRO" ? <Rocket className="h-5 w-5 text-[#a0f212]" /> : <Flame className="h-5 w-5 text-[#a0f212]" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white uppercase tracking-wide">
              {t === "PRO" ? "Featured Ultra Spotlight Masterclass" : t === "STANDARD" ? "Promoted Masterclass" : "Featured Workshop"}
            </span>
            <span className="text-[9px] bg-[#a0f212]/20 text-[#a0f212] px-2 py-0.5 rounded-full font-extrabold uppercase">
              SPONSORED
            </span>
          </div>
          <p className="text-[10px] text-emerald-100/60 font-semibold">
            Priority placement active on BookMyTraining spotlight network.
          </p>
        </div>
      </div>
    </div>
  );
}
