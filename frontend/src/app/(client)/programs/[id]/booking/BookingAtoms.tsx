"use client";

import React from "react";
import { BadgeCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// ─── StepBadge ────────────────────────────────────────────────────────────────
interface StepBadgeProps {
  step: number;
  current: number;
  label: string;
}

export function StepBadge({ step, current, label }: StepBadgeProps) {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex flex-col items-center gap-1 min-w-0">
      <div
        className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200 ${
          done
            ? "bg-emerald-500 border-emerald-500 text-white"
            : active
            ? "bg-primary border-primary text-primary-foreground"
            : "bg-muted border-border text-muted-foreground"
        }`}
      >
        {done ? <BadgeCheck className="h-3.5 w-3.5" /> : step + 1}
      </div>
      <span
        className={`text-[9px] font-semibold hidden sm:block truncate ${
          active ? "text-primary" : done ? "text-emerald-500" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// ─── SummaryRow ───────────────────────────────────────────────────────────────
interface SummaryRowProps {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}

export function SummaryRow({ label, value, bold, accent }: SummaryRowProps) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`${bold ? "font-extrabold text-sm" : "font-semibold"} ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── StepIndicators ───────────────────────────────────────────────────────────
interface StepIndicatorsProps {
  steps: readonly string[];
  current: number;
}

export function StepIndicators({ steps, current }: StepIndicatorsProps) {
  return (
    <div className="px-6 py-3 border-b border-border/20 shrink-0">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 right-0 top-3.5 h-px bg-border/40 -z-0 mx-8" />
        {steps.map((label, i) => (
          <StepBadge key={i} step={i} current={current} label={label} />
        ))}
      </div>
    </div>
  );
}
