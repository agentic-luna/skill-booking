"use client";

import React from "react";
import { Rocket } from "lucide-react";
import BoostSettingsTab from "../settings/_components/BoostSettingsTab";

export default function BoostManagementPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col gap-2 pb-2">
        <h1 className="text-4xl lg:text-5xl font-medium tracking-tight text-foreground leading-[1.1]">
          <span className="inline-flex items-center justify-center bg-card shadow-sm border border-black/5 dark:border-white/5 rounded-full p-2 mx-1 align-middle">
            <Rocket className="w-6 h-6 text-foreground" />
          </span>{" "}
          Boost{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a0f212] to-emerald-400 font-bold drop-shadow-[0_0_15px_rgba(160,242,18,0.2)]">
            Management
          </span>
        </h1>
        <p className="text-muted-foreground font-medium pl-2">
          Configure prices and campaign durations for Basic, Pro, and Ultra Pro boost tiers.
        </p>
      </div>

      {/* Render settings list */}
      <BoostSettingsTab />
    </div>
  );
}
