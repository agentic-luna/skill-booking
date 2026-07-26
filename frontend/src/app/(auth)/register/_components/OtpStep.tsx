"use client";

import React, { useState } from "react";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OtpStepProps {
  idPrefix: string;
  title: string;
  description: string;
  isLoading: boolean;
  error: string | null;
  devOtp?: string;
  onSubmit: (otp: string) => Promise<void>;
  onResend: () => void;
}

export default function OtpStep({
  idPrefix,
  title,
  description,
  isLoading,
  error,
  devOtp,
  onSubmit,
  onResend,
}: OtpStepProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!devOtp) return;
    navigator.clipboard.writeText(devOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const cleanDigits = pastedData.replace(/\D/g, "").slice(0, 6).split("");
    if (cleanDigits.length === 0) return;

    const next = [...digits];
    for (let i = 0; i < 6; i++) {
      if (cleanDigits[i] !== undefined) {
        next[i] = cleanDigits[i];
      }
    }
    setDigits(next);

    const targetIndex = Math.min(cleanDigits.length, 5);
    document.getElementById(`${idPrefix}-${targetIndex}`)?.focus();
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

      {devOtp && (
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Development Mode OTP Code</span>
          </div>
          <div className="flex items-center justify-between bg-background/50 px-3 py-2 rounded-lg border border-border/50">
            <code className="text-xl font-mono font-bold tracking-widest text-foreground">
              {devOtp}
            </code>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-green-500 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 rounded-xl border border-red-500/30 animate-pulse flex items-center gap-2">
          <span>{error}</span>
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
                onPaste={handlePaste}
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
