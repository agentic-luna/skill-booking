"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { sendOtp } from "@/features/auth/api/otp.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VerifyPage() {
  const router = useRouter();
  const { verifyOtp, pendingRegistration, isLoading, error, clearError } = useAuthStore();
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [devOtp, setDevOtp] = useState<string | undefined>();

  useEffect(() => {
    if (!pendingRegistration) router.push("/register");
  }, [pendingRegistration, router]);

  // DEV: read devOtp from sessionStorage if available
  useEffect(() => {
    const stored = sessionStorage.getItem("dev_otp");
    if (stored) {
      setDevOtp(stored);
      sessionStorage.removeItem("dev_otp");
    }
  }, []);

  // DEV: auto-fill and submit when devOtp is set
  useEffect(() => {
    if (!devOtp || devOtp.length !== 6) return;
    setCode(devOtp.split(""));
    const timer = setTimeout(async () => {
      const success = await verifyOtp(devOtp);
      if (success) {
        const role = useAuthStore.getState().user?.role;
        router.push(role === "host" ? "/host/dashboard" : "/");
      }
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devOtp]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code]; next[index] = val; setCode(next); clearError();
    if (val && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const next = [...code]; next[index] = ""; setCode(next);
      if (index > 0) document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = code.join("");
    if (otpCode.length < 6) return;
    const success = await verifyOtp(otpCode);
    if (success) {
      const role = useAuthStore.getState().user?.role;
      router.push(role === "host" ? "/host/dashboard" : "/");
    }
  };

  const handleResend = async () => {
    if (!pendingRegistration) return;
    const target = !pendingRegistration.emailVerified ? pendingRegistration.email : pendingRegistration.phone;
    const type = !pendingRegistration.emailVerified ? "EMAIL" : "PHONE";
    await sendOtp(target, type).catch(() => { });
  };

  const target = !pendingRegistration?.emailVerified ? pendingRegistration?.email : pendingRegistration?.phone;
  const heading = !pendingRegistration?.emailVerified ? "Verify your email" : "Verify your phone";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{heading}</h2>
        <p className="text-sm text-muted-foreground">We&apos;ve sent a 6-digit code to <span className="font-semibold text-foreground">{target}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">{error}</div>}
        <div className="space-y-2">
          <Label className="text-center block text-sm">Enter Code</Label>
          <div className="flex justify-between gap-2 max-w-xs mx-auto">
            {code.map((num, idx) => (
              <Input key={idx} id={`otp-${idx}`} type="text" inputMode="numeric" maxLength={1} value={num}
                onChange={(e) => handleChange(idx, e.target.value)} onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-12 text-center text-lg font-bold p-0 rounded-lg focus-visible:ring-2 focus-visible:ring-primary bg-background border-border" disabled={isLoading} />
            ))}
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading || code.some((c) => !c)}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {isLoading ? "Verifying..." : "Verify & Continue"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Didn&apos;t receive the code?{" "}
        <button type="button" onClick={handleResend} className="font-semibold text-primary hover:underline">Resend code</button>
      </div>
    </div>
  );
}
