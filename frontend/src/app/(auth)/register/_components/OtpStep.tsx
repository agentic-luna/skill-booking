"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OtpStepProps {
  idPrefix: string;
  title: string;
  description: string;
  isLoading: boolean;
  error: string | null;
  onSubmit: (otp: string) => Promise<void>;
  onResend: () => void;
}

export default function OtpStep({
  idPrefix,
  title,
  description,
  isLoading,
  error,
  onSubmit,
  onResend,
}: OtpStepProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));

  const handleChange = (index: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[index] = val;
    setDigits(next);
    if (val && index < 5) document.getElementById(`${idPrefix}-${index + 1}`)?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      if (index > 0) document.getElementById(`${idPrefix}-${index - 1}`)?.focus();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) return;
    await onSubmit(otp);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {error && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label className="text-center block text-sm">Enter 6-digit code</Label>
          <div className="flex justify-between gap-2">
            {digits.map((d, idx) => (
              <Input
                key={idx}
                id={`${idPrefix}-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-10 h-12 text-center text-lg font-bold p-0 rounded-lg focus-visible:ring-2 focus-visible:ring-primary"
                disabled={isLoading}
              />
            ))}
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading || digits.some((d) => !d)}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {isLoading ? "Verifying..." : "Verify & Continue"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Didn&apos;t receive the code?{" "}
        <button type="button" onClick={onResend} className="font-semibold text-primary hover:underline">
          Resend code
        </button>
      </div>
    </div>
  );
}
