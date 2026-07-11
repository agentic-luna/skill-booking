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
    <div className="flex min-h-screen overflow-hidden">

      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-14 overflow-hidden bg-gradient-to-br from-[#6b3a2a] via-[#8b5230] to-[#c47c5a]">

        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl bg-[#fdf6f0]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 blur-2xl bg-[#3d1f12]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 blur-2xl bg-[#e8d5c0]" />

        {/* Logo */}
        <Link
          href="/"
          className="relative z-10 flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20l-7-3-7 3V2z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            BookMy<span className="opacity-75">Skill</span>
          </span>
        </Link>

        {/* Hero copy */}
        <div className="relative z-10 space-y-6 max-w-md">
          <p className="text-sm font-semibold tracking-widest text-white/60 uppercase">
            Learn · Grow · Excel
          </p>
          <h1 className="text-5xl font-extrabold leading-[1.1] text-white">
            Hey,&nbsp;Hello!
          </h1>
          <p className="text-lg font-medium text-white/80">
            Join The Waitlist For The Skill Marketplace!
          </p>
          <p className="text-sm text-white/60 leading-relaxed">
            We provide all the advantages that can simplify your learning
            journey without any further requirements — connecting eager learners
            with certified instructors, instantly.
          </p>

          {/* Stats row */}
          <div className="flex gap-8 pt-4">
            {[
              { value: "12k+", label: "Learners" },
              { value: "800+", label: "Instructors" },
              { value: "4.9★", label: "Rating" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-white/40 flex justify-between">
          <span>© {new Date().getFullYear()} BookMySkill Inc.</span>
          <div className="space-x-3">
            <a href="#" className="hover:text-white/70 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white/70 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>

      {/* ── Right Auth Panel ── */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-8 py-12 relative bg-gradient-to-br from-linen-canvas to-haze">

        {/* Mobile logo */}
        <div className="absolute top-8 left-8 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-nightshade-black">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20l-7-3-7 3V2z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-graphite-ink">
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

        {/* White card */}
        <div className="w-full max-w-[440px] rounded-3xl bg-white shadow-2xl shadow-[#6b3a2a]/10 p-8 sm:p-10">
          {children}
        </div>
      </div>

    </div>
  );
}
