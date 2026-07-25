"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
  variant?: "default" | "ghost" | "outline";
}

export default function BackButton({ 
  href, 
  label = "Back", 
  className,
  variant = "ghost" 
}: BackButtonProps) {
  const router = useRouter();

  const content = (
    <ChevronLeft className="h-6 w-6 transition-transform duration-300 group-hover:-translate-x-1 text-graphite-ink" />
  );

  const baseClasses = cn(
    "group inline-flex items-center justify-center transition-all duration-300 rounded-full h-12 w-12 shrink-0 bg-bone-white border border-clay-shadow/30 shadow-sm hover:shadow-md hover:bg-haze hover:border-clay-shadow/60 hover:-translate-y-0.5",
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button 
      onClick={() => router.back()} 
      className={baseClasses}
    >
      {content}
    </button>
  );
}
