"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { initAuth } from "@/features/auth/store/authStore";
import AuthBrandPanel from "./_components/AuthBrandPanel";

const authStyles = `
  @keyframes carpet-unroll {
    0%   { clip-path: inset(100% 0 0 0); transform: translateY(60px) scaleY(0.85); opacity: 0; }
    30%  { opacity: 1; }
    60%  { transform: translateY(-6px) scaleY(1.01); }
    80%  { clip-path: inset(0% 0 0 0); transform: translateY(3px) scaleY(0.99); }
    100% { clip-path: inset(0% 0 0 0); transform: translateY(0) scaleY(1); opacity: 1; }
  }
  .carpet-unroll-animate { animation: carpet-unroll 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards; transform-origin: bottom center; }
  @keyframes banner-fade-up {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .banner-animate-logo   { animation: banner-fade-up 0.6s ease 0.10s forwards; opacity: 0; }
  .banner-animate-copy   { animation: banner-fade-up 0.7s ease 0.25s forwards; opacity: 0; }
  .banner-animate-footer { animation: banner-fade-up 0.6s ease 0.40s forwards; opacity: 0; }
  .auth-panel { transition: left 0.65s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.65s ease; }
  @keyframes content-pop-in {
    from { opacity: 0; transform: scale(0.97) translateY(8px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
  }
  .content-pop-in { animation: content-pop-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both; }
`;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => { initAuth(); }, []);
  const [, setInitialLoad] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setInitialLoad(false), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-screen overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: authStyles }} />

      <AuthBrandPanel />

      {/* Right Auth Panel */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-8 py-12 relative bg-gradient-to-br from-linen-canvas to-haze">

        {/* Mobile logo */}
        <div className="absolute top-8 left-8 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-nightshade-black">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20l-7-3-7 3V2z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-graphite-ink">
              BookMy<span className="text-nightshade-black">Skill</span>
            </span>
          </Link>

          <div className="banner-animate-copy relative z-10 space-y-6 my-auto max-w-md">
            <h1 className="text-4xl font-extrabold tracking-tight text-graphite-ink leading-[1.15]">
              Unlock Your{" "}<span className="text-nightshade-black">Potential</span> with Expert Training.
            </h1>
            <p className="text-stone-grey text-base leading-relaxed">
              Join a global marketplace connecting eager learners with certified hosts. Streamlined bookings,
              dynamic scheduling, and interactive analytics all in one place.
            </p>
          </div>

          <div className="banner-animate-footer relative z-10 text-xs text-stone-grey flex justify-between">
            <span>&copy; {new Date().getFullYear()} BookMySkill Inc.</span>
            <div className="space-x-3">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms</a>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="w-full max-w-[440px] rounded-3xl bg-white shadow-2xl shadow-[#6b3a2a]/10 p-8 sm:p-10">
          {children}
        </div>
      </div>

    </div>
  );
}
