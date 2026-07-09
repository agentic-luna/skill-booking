"use client";

import React from "react";
import { Check } from "lucide-react";

const STEPS = ["Account Info", "Verify Email", "Verify Phone"];

interface StepIndicatorProps {
  current: number;
}

export default function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < current
                  ? "bg-primary text-white"
                  : i === current
                  ? "bg-primary/10 border-2 border-primary text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < current ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span
              className={`text-[10px] font-medium whitespace-nowrap ${
                i === current ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`flex-1 h-px mb-4 transition-all ${
                i < current ? "bg-primary" : "bg-border"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
