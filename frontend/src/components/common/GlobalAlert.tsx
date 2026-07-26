"use client";

import React, { useEffect, useState, useRef } from "react";
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from "lucide-react";
import { useAlertStore } from "@/features/alerts/store/alertStore";

const alertConfigs = {
  info: {
    icon: Info,
    colorClass: "text-blue-500 dark:text-blue-400",
    bgClass: "bg-blue-500/5",
    borderClass: "border-blue-500/20",
    glowClass: "shadow-[0_15px_30px_rgba(59,130,246,0.08)]",
    progressClass: "bg-blue-500",
  },
  success: {
    icon: CheckCircle2,
    colorClass: "text-[#a0f212] dark:text-[#a0f212]",
    bgClass: "bg-[#a0f212]/5",
    borderClass: "border-[#a0f212]/20",
    glowClass: "shadow-[0_15px_30px_rgba(160,242,18,0.08)]",
    progressClass: "bg-[#a0f212]",
  },
  warning: {
    icon: AlertTriangle,
    colorClass: "text-amber-500 dark:text-amber-400",
    bgClass: "bg-amber-500/5",
    borderClass: "border-amber-500/20",
    glowClass: "shadow-[0_15px_30px_rgba(245,158,11,0.08)]",
    progressClass: "bg-amber-500",
  },
  destructive: {
    icon: AlertCircle,
    colorClass: "text-red-500 dark:text-red-400",
    bgClass: "bg-red-500/5",
    borderClass: "border-red-500/20",
    glowClass: "shadow-[0_15px_30px_rgba(239,68,68,0.08)]",
    progressClass: "bg-red-500",
  },
};

export default function GlobalAlert() {
  const { isOpen, title, description, type, hideAlert } = useAlertStore();
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      elapsedRef.current = 0;
      setProgress(100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const duration = 3500;
    const intervalTime = 30;

    const timer = setInterval(() => {
      if (!isPaused) {
        elapsedRef.current += intervalTime;
        const remaining = Math.max(0, 100 - (elapsedRef.current / duration) * 100);
        setProgress(remaining);
        if (elapsedRef.current >= duration) {
          hideAlert();
        }
      }
    }, intervalTime);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") hideAlert();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isPaused, hideAlert]);

  if (!isOpen) return null;

  const config = alertConfigs[type] || alertConfigs.info;
  const Icon = config.icon;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed z-[9999] top-4 left-1/2 -translate-x-1/2 sm:top-auto sm:left-auto sm:translate-x-0 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[360px] max-w-[340px] sm:max-w-sm overflow-hidden rounded-xl sm:rounded-2xl border ${config.borderClass} ${config.bgClass} ${config.glowClass} bg-white/95 dark:bg-black/95 backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] animate-in slide-in-from-top-5 sm:slide-in-from-bottom-5 fade-in duration-300`}
    >
      <div className="p-3 sm:p-4 flex items-center sm:items-start gap-2.5 sm:gap-3.5">
        <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl shrink-0 bg-muted/40`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${config.colorClass}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <h5 className="font-bold text-xs sm:text-sm text-foreground tracking-tight leading-tight mb-0.5 sm:mb-1">
              {title}
            </h5>
          )}
          <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug sm:leading-relaxed break-words font-medium">
            {description}
          </p>
        </div>

        <button
          onClick={hideAlert}
          className="p-1 rounded-lg shrink-0 text-muted-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none"
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] sm:h-[3px] bg-black/[0.03] dark:bg-white/[0.03]">
        <div
          className={`h-full ${config.progressClass} transition-all duration-300 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
