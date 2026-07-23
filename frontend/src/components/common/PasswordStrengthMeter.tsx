"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { evaluatePasswordStrength } from "@/lib/validation/authValidation";

interface PasswordStrengthMeterProps {
  password?: string;
}

export default function PasswordStrengthMeter({ password = "" }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const result = evaluatePasswordStrength(password);

  const rules = [
    { label: "8+ characters", valid: result.hasMinLength },
    { label: "Number (0-9)", valid: result.hasNumber },
    { label: "Uppercase (A-Z)", valid: result.hasUpper },
    { label: "Special symbol (!@#$)", valid: result.hasSpecial },
  ];

  return (
    <div className="space-y-2 mt-1 p-2.5 bg-muted/30 rounded-xl border border-border/40 text-[11px]">
      {/* Strength Bar */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-muted-foreground">Password Strength:</span>
        <span className={`font-bold uppercase tracking-wider text-[10px] ${
          result.score <= 1 
            ? "text-red-500" 
            : result.score === 2 
              ? "text-amber-500" 
              : "text-emerald-500"
        }`}>
          {result.label}
        </span>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[0, 1, 2, 3].map((step) => (
          <div
            key={step}
            className={`h-full rounded-full transition-all duration-300 ${
              step <= result.score ? result.color : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Criteria Checklist */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[10px]">
        {rules.map((rule, idx) => (
          <div key={idx} className="flex items-center gap-1">
            {rule.valid ? (
              <Check className="h-3 w-3 text-emerald-500 shrink-0 font-bold" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground/50 shrink-0" />
            )}
            <span className={rule.valid ? "text-foreground font-medium" : "text-muted-foreground"}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
