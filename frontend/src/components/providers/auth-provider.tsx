"use client";

import React, { useEffect } from "react";
import { initAuth, useAuthStore } from "@/features/auth/store/authStore";

import ClientAuthModal from "@/features/auth/components/ClientAuthModal";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    initAuth();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full border border-primary/30" />
          <div className="h-4 w-32 bg-muted rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <ClientAuthModal />
    </>
  );
}
