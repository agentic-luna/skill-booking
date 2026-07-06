"use client";

import React from "react";
import { Check, Loader2 } from "lucide-react";

export default function SuccessState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
        <div className="relative bg-emerald-500 text-white p-5 rounded-full shadow-lg shadow-emerald-500/30">
          <Check className="h-10 w-10" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          Workshop Submitted!
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your program is awaiting Super Admin approval before it appears in the explore listings.
        </p>
      </div>
      <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Redirecting to Programs…</span>
      </div>
    </div>
  );
}
