"use client";

import React, { useEffect } from "react";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { AlertCircle, CheckCircle2, Info, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const iconMap = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  destructive: XCircle,
};

const styleMap = {
  info: {
    icon: "text-blue-500 bg-blue-500/10 border-blue-500/15",
    border: "border-blue-500/20",
    button: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25",
  },
  success: {
    icon: "text-emerald-500 bg-emerald-500/10 border-emerald-500/15",
    border: "border-emerald-500/20",
    button: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25",
  },
  warning: {
    icon: "text-amber-500 bg-amber-500/10 border-amber-500/15",
    border: "border-amber-500/20",
    button: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/25",
  },
  destructive: {
    icon: "text-destructive bg-destructive/10 border-destructive/15",
    border: "border-destructive/20",
    button: "bg-destructive hover:bg-destructive/90 text-white shadow-destructive/25",
  },
};

export default function GlobalAlert() {
  const { isOpen, title, description, type, hideAlert } = useAlertStore();

  // Escape key hides the alert
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") hideAlert();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hideAlert]);

  if (!isOpen) return null;

  const IconComp = iconMap[type];
  const styles = styleMap[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={hideAlert}
      />

      {/* Alert Card Box */}
      <div 
        className={`relative w-full max-w-sm bg-card border ${styles.border} p-6 rounded-2xl shadow-xl flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 z-10`}
        role="alertdialog"
        aria-modal="true"
      >
        {/* Header Dismiss Icon */}
        <button
          onClick={hideAlert}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Large Visual Icon */}
        <div className={`p-4 rounded-full border ${styles.icon} shadow-xs`}>
          <IconComp className="h-8 w-8" />
        </div>

        {/* Text details */}
        <div className="space-y-1.5 w-full">
          <h3 className="font-extrabold text-base text-foreground tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed px-2">
            {description}
          </p>
        </div>

        {/* Action button */}
        <div className="pt-2 w-full">
          <Button
            onClick={hideAlert}
            className={`w-full rounded-xl h-10 text-xs font-semibold shadow-md transition-all ${styles.button}`}
          >
            Acknowledge
          </Button>
        </div>
      </div>
    </div>
  );
}
