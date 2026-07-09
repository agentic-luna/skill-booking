"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { initAuth } from "@/features/auth/store/authStore";

const authStyles = `
  /* ── Carpet-roll reveal (initial load only) ─────────────────── */
  @keyframes carpet-unroll {
    0%   { clip-path: inset(100% 0 0 0); transform: translateY(60px) scaleY(0.85); opacity: 0; }
    30%  { opacity: 1; }
    60%  { transform: translateY(-6px) scaleY(1.01); }
    80%  { clip-path: inset(0% 0 0 0); transform: translateY(3px) scaleY(0.99); }
    100% { clip-path: inset(0% 0 0 0); transform: translateY(0) scaleY(1); opacity: 1; }
  }
  .carpet-unroll-animate {
    animation: carpet-unroll 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    transform-origin: bottom center;
  }

  /* ── Banner staggered fade-up (initial load) ─────────────────── */
  @keyframes banner-fade-up {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .banner-animate-logo   { animation: banner-fade-up 0.6s ease 0.10s forwards; opacity: 0; }
  .banner-animate-copy   { animation: banner-fade-up 0.7s ease 0.25s forwards; opacity: 0; }
  .banner-animate-footer { animation: banner-fade-up 0.6s ease 0.40s forwards; opacity: 0; }

  /* ── Panel slide transition ──────────────────────────────────── */
  .auth-panel {
    transition: left 0.65s cubic-bezier(0.22, 1, 0.36, 1),
                border-color 0.65s ease;
  }

  /* ── Content fade when panel swaps side ─────────────────────── */
  @keyframes content-pop-in {
    from { opacity: 0; transform: scale(0.97) translateY(8px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
  }
  .content-pop-in {
    animation: content-pop-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
  }
`;

// 5/12 and 7/12 expressed as percentages
const BANNER_W = "41.6667%";   // 5 cols
const FORM_W   = "58.3333%";   // 7 cols
const BANNER_LEFT_LOGIN    = "0%";
const BANNER_LEFT_REGISTER = FORM_W;        // slides to right
const FORM_LEFT_LOGIN      = BANNER_W;      // sits at right
const FORM_LEFT_REGISTER   = "0%";          // slides to left

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => { initAuth(); }, []);

  const pathname = usePathname();
  const isRegister = pathname?.includes("/register") ?? false;

  // Only play the carpet-roll animation on the very first mount
  const [initialLoad, setInitialLoad] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setInitialLoad(false), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: authStyles }} />

      {/* ── MOBILE layout (single column) ─────────────────────── */}
      <div className="lg:hidden relative min-h-screen bg-transparent overflow-hidden">
        {/* Mobile logo */}
        <div className="absolute top-8 left-8 z-10">
          <Link href="/" className="flex items-center">
            <span className="text-lg font-bold tracking-tight text-graphite-ink">
              BookMy<span className="text-nightshade-black">Skill</span>
            </span>
          </Link>
        </div>
        {/* Form pinned to bottom */}
        <div className="flex flex-col min-h-screen justify-end">
          <div
            className={`${initialLoad ? "carpet-unroll-animate" : ""} w-full bg-bone-white px-6 pt-8 pb-16 rounded-t-2xl border border-b-0 border-clay-shadow/30 shadow-[0_-4px_24px_0_rgba(0,0,0,0.08)] min-h-[78vh] flex flex-col`}
          >
            {children}
          </div>
        </div>
      </div>

      {/* ── DESKTOP layout (dual sliding panels) ───────────────── */}
      <div className="hidden lg:block relative min-h-screen overflow-hidden bg-transparent">

        {/* ── Banner Panel ───────────────────────────────────── */}
        <div
          className="auth-panel absolute top-0 bottom-0 flex flex-col justify-between p-12 bg-transparent"
          style={{
            width: BANNER_W,
            left: isRegister ? BANNER_LEFT_REGISTER : BANNER_LEFT_LOGIN,
            borderRight: isRegister ? undefined : "1px solid rgba(0,0,0,0.07)",
            borderLeft:  isRegister ? "1px solid rgba(0,0,0,0.07)" : undefined,
          }}
        >
          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-clay-shadow/10 via-transparent to-transparent pointer-events-none" />

          {/* Logo */}
          <Link
            href="/"
            className="banner-animate-logo relative z-10 flex items-center hover:opacity-90 transition-opacity"
          >
            <span className="text-xl font-bold tracking-tight text-graphite-ink">
              BookMy<span className="text-nightshade-black">Skill</span>
            </span>
          </Link>

          {/* Copy */}
          <div
            className="banner-animate-copy relative z-10 space-y-6 my-auto max-w-md"
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-graphite-ink leading-[1.15]">
              Unlock Your{" "}
              <span className="text-nightshade-black">Potential</span> with
              Expert Training.
            </h1>
            <p className="text-stone-grey text-base leading-relaxed">
              Join a global marketplace connecting eager learners with certified
              hosts. Streamlined bookings, dynamic scheduling, and interactive
              analytics all in one place.
            </p>
          </div>

          {/* Footer */}
          <div className="banner-animate-footer relative z-10 text-xs text-stone-grey flex justify-between">
            <span>&copy; {new Date().getFullYear()} BookMySkill Inc.</span>
            <div className="space-x-3">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms</a>
            </div>
          </div>
        </div>

        {/* ── Form Panel ─────────────────────────────────────── */}
        <div
          className="auth-panel absolute top-0 bottom-0 flex flex-col justify-end items-center pb-0"
          style={{
            width: FORM_W,
            left: isRegister ? FORM_LEFT_REGISTER : FORM_LEFT_LOGIN,
          }}
        >
          {/* Form card */}
          <div
            className={`${initialLoad ? "carpet-unroll-animate" : ""} w-full max-w-[420px] bg-bone-white px-8 pt-8 pb-16 rounded-t-2xl border border-b-0 border-clay-shadow/30 shadow-[0_-4px_24px_0_rgba(0,0,0,0.08)] min-h-[78vh] flex flex-col`}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
