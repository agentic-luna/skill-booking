"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Check, RefreshCw, Lock } from "lucide-react";

interface ReCaptchaBoxProps {
  onVerify: (isVerified: boolean) => void;
  isVerified: boolean;
}

export default function ReCaptchaBox({ onVerify, isVerified }: ReCaptchaBoxProps) {
  const [loading, setLoading] = useState(false);
  const [captchaCode, setCaptchaCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [showChallenge, setShowChallenge] = useState(false);

  // Generate 5-character alphanumeric token
  const generateCaptchaCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setUserInput("");
  };

  useEffect(() => {
    generateCaptchaCode();
  }, []);

  const handleCheckboxClick = () => {
    if (isVerified) return;
    setLoading(true);
    // Simulate smart risk analysis (like reCAPTCHA)
    setTimeout(() => {
      setLoading(false);
      setShowChallenge(true);
    }, 600);
  };

  const handleVerifyChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.toUpperCase().trim() === captchaCode) {
      onVerify(true);
      setShowChallenge(false);
    } else {
      onVerify(false);
      generateCaptchaCode();
    }
  };

  return (
    <div className="space-y-3">
      {/* Standard reCAPTCHA Widget Box */}
      <div className="p-3.5 bg-[#f9f9f9] dark:bg-[#181d1a] border border-[#d3d3d3] dark:border-border/60 rounded-xl shadow-2xs flex items-center justify-between max-w-sm">
        <div className="flex items-center gap-3">
          {/* Checkbox / Spinner / Checkmark */}
          <button
            type="button"
            onClick={handleCheckboxClick}
            disabled={isVerified || loading}
            className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${
              isVerified
                ? "bg-emerald-600 border-emerald-600 text-white"
                : loading
                ? "border-blue-500 border-t-transparent animate-spin"
                : "border-gray-400 dark:border-gray-500 bg-white dark:bg-card hover:border-gray-600"
            }`}
          >
            {isVerified && <Check className="h-4 w-4 stroke-[3]" />}
          </button>

          <span className="text-xs font-semibold text-foreground select-none">
            {isVerified ? "Verified User" : "I'm not a robot"}
          </span>
        </div>

        {/* reCAPTCHA Branding */}
        <div className="flex flex-col items-end text-[9px] text-muted-foreground select-none">
          <div className="flex items-center gap-1 font-bold text-gray-500 dark:text-gray-400">
            <Lock className="h-3 w-3 text-blue-500" />
            <span>reCAPTCHA</span>
          </div>
          <div className="text-[8px] text-gray-400 space-x-1">
            <span>Privacy</span>
            <span>·</span>
            <span>Terms</span>
          </div>
        </div>
      </div>

      {/* Interactive Visual Challenge Modal Box */}
      {showChallenge && !isVerified && (
        <div className="p-4 bg-card border border-primary/30 rounded-xl shadow-lg space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span className="flex items-center gap-1.5 text-primary">
              <ShieldCheck className="h-4 w-4" /> Enter Security Code
            </span>
            <button
              type="button"
              onClick={generateCaptchaCode}
              className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Refresh Code
            </button>
          </div>

          {/* Visual Security Code Canvas Badge */}
          <div className="flex items-center justify-center p-3 bg-slate-900 text-white rounded-lg select-none font-mono font-extrabold text-xl tracking-[0.3em] shadow-inner relative overflow-hidden border border-slate-700">
            {/* Background noise lines */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />
            <span className="relative z-10 transform -rotate-1 skew-x-3 text-emerald-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {captchaCode}
            </span>
          </div>

          <form onSubmit={handleVerifyChallenge} className="flex gap-2">
            <input
              type="text"
              placeholder="Type characters above"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-1 text-xs p-2.5 rounded-lg border border-border bg-background text-foreground font-bold tracking-wider uppercase focus:ring-2 focus:ring-primary"
              maxLength={5}
              required
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Verify
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
