"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VerifyPage() {
  const router = useRouter();
  const { verifyOtp, isVerifying, pendingUser, isLoading, error, clearError } = useAuthStore();
  const [code, setCode] = useState<string[]>(Array(6).fill(""));

  useEffect(() => {
    // If not in verifying state, redirect back to register
    if (!isVerifying && !pendingUser) {
      router.push("/register");
    }
  }, [isVerifying, pendingUser, router]);

  const handleChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newCode = [...code];
    newCode[index] = val.substring(val.length - 1);
    setCode(newCode);
    clearError();

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const newCode = [...code];
      newCode[index] = "";
      setCode(newCode);

      // Auto-focus previous input
      if (index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = code.join("");
    if (otpCode.length < 6) return;

    const success = await verifyOtp(otpCode);
    if (success) {
      const role = useAuthStore.getState().user?.role;
      if (role === "client") {
        router.push("/home");
      } else if (role === "host") {
        router.push("/host/dashboard");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Verify your email
        </h2>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a 6-digit verification code to{" "}
          <span className="font-semibold text-foreground">
            {pendingUser?.email || "your email"}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-center block text-sm">Enter Code</Label>
          <div className="flex justify-between gap-2 max-w-xs mx-auto">
            {code.map((num, idx) => (
              <Input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength={1}
                value={num}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-12 text-center text-lg font-bold p-0 rounded-lg focus-visible:ring-2 focus-visible:ring-primary bg-background border-border"
                disabled={isLoading}
              />
            ))}
          </div>
          <span className="text-xs text-center block text-muted-foreground mt-2">
            Use code <span className="font-bold text-foreground">123456</span> to complete mock verification.
          </span>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || code.some((c) => !c)}
        >
          {isLoading ? "Verifying..." : "Verify & Continue"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Didn&apos;t receive the code?{" "}
        <button
          type="button"
          onClick={() => alert("Mock OTP code resent to email.")}
          className="font-semibold text-primary hover:underline"
        >
          Resend code
        </button>
      </div>
    </div>
  );
}
