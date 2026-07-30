"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { verifyEmailMagicLink, user } = useAuthStore();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token provided in URL.");
      return;
    }

    const verify = async () => {
      try {
        await verifyEmailMagicLink(token);
        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Invalid or expired verification link.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="w-full max-w-md bg-background border border-border/40 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
        
        {/* Brand Header */}
        <div className="flex items-center justify-center space-x-2 text-[#a0f212]">
          <Sparkles className="h-5 w-5" />
          <span className="font-extrabold text-sm tracking-wider uppercase">BookMyTraining Security</span>
        </div>

        {status === "loading" && (
          <div className="space-y-4 py-8">
            <div className="mx-auto w-16 h-16 bg-[#a0f212]/10 border border-[#a0f212]/30 rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-[#a0f212] animate-spin" />
            </div>
            <h2 className="text-xl font-black text-foreground">Verifying Magic Link...</h2>
            <p className="text-xs text-muted-foreground">Please wait while we secure your account.</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6 py-4 animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground">Email Verified!</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your email address <strong className="text-foreground">{user?.email}</strong> has been successfully linked to your account.
              </p>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400 gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Enterprise Email Security Active</span>
            </div>

            <Link href="/programs">
              <Button className="w-full h-11 text-xs font-extrabold rounded-xl bg-gradient-to-r from-[#1b2b0a] to-[#2a420f] border border-[#a0f212]/30 text-[#a0f212] hover:from-[#a0f212] hover:to-[#8ce20b] hover:text-[#0b0c01] transition-all shadow-md">
                Explore Workshops <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6 py-4">
            <div className="mx-auto w-20 h-20 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center shadow-lg">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground">Verification Failed</h2>
              <p className="text-xs text-red-500 font-semibold p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                {errorMessage}
              </p>
            </div>

            <Link href="/programs">
              <Button variant="outline" className="w-full h-11 text-xs font-bold rounded-xl">
                Return to Marketplace
              </Button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
