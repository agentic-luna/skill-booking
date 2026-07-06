import React from "react";
import { AlertCircle, CheckCircle2, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertVariant = "info" | "success" | "warning" | "destructive";

interface AlertBoxProps {
  variant?: AlertVariant;
  title?: string;
  description: string;
  className?: string;
  onClose?: () => void;
}

const variantStyles: Record<AlertVariant, { container: string; icon: string; title: string; close: string; bg: string }> = {
  info: {
    container: "bg-blue-500/5 border-blue-500/20 text-blue-800 dark:text-blue-300",
    icon: "text-blue-500",
    title: "text-blue-900 dark:text-blue-200",
    close: "hover:bg-blue-500/10 text-blue-500",
    bg: "bg-blue-500/10",
  },
  success: {
    container: "bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300",
    icon: "text-emerald-500",
    title: "text-emerald-900 dark:text-emerald-200",
    close: "hover:bg-emerald-500/10 text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  warning: {
    container: "bg-amber-500/5 border-amber-500/20 text-amber-800 dark:text-amber-300",
    icon: "text-amber-500",
    title: "text-amber-900 dark:text-amber-200",
    close: "hover:bg-amber-500/10 text-amber-500",
    bg: "bg-amber-500/10",
  },
  destructive: {
    container: "bg-destructive/5 border-destructive/20 text-destructive dark:text-destructive/80",
    icon: "text-destructive",
    title: "text-destructive font-bold",
    close: "hover:bg-destructive/10 text-destructive",
    bg: "bg-destructive/10",
  },
};

const variantIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  destructive: XCircle,
};

export default function AlertBox({
  variant = "info",
  title,
  description,
  className,
  onClose,
}: AlertBoxProps) {
  const IconComp = variantIcons[variant];
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "relative w-full flex items-start space-x-3.5 p-4 rounded-xl border text-xs leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300",
        styles.container,
        className
      )}
    >
      <div className={cn("p-1.5 rounded-lg shrink-0", styles.bg)}>
        <IconComp className={cn("h-4.5 w-4.5", styles.icon)} />
      </div>

      <div className="flex-1 space-y-1">
        {title && <h5 className={cn("font-bold text-sm leading-none", styles.title)}>{title}</h5>}
        <p className="opacity-90">{description}</p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className={cn("p-1 rounded-md shrink-0 transition-colors focus:outline-none", styles.close)}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
