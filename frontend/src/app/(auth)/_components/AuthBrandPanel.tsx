"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthBrandPanel() {
  const pathname = usePathname() || "";
  const isAdmin = pathname.includes("/admin");
  const isRegister = pathname.includes("/register");

  const getContent = () => {
    if (isAdmin) {
      return {
        slogan: "Control Panel",
        title: "Platform Administration Portal",
        description: "Access host verifications, coordinate workshop approvals, manage earnings disbursement, and monitor marketplace status.",
        stats: [
          { value: "1.2M+", label: "Total Value" },
          { value: "2.5k+", label: "Active Programs" },
          { value: "100%", label: "Platform Uptime" },
        ]
      };
    }
    if (isRegister) {
      return {
        slogan: "Join the Community",
        title: "Start Learning in Real-Time",
        description: "Create a free account to explore premium workshops, book secure spots, and start certified learning programs today.",
        stats: [
          { value: "12k+", label: "Active Learners" },
          { value: "800+", label: "Verified Instructors" },
          { value: "100%", label: "Secure Checkout" },
        ]
      };
    }
    // Default / Login
    return {
      slogan: "Welcome Back",
      title: "Continue Your Learning Journey",
      description: "Sign in to access your dashboard, resume your active classes, and connect with your workshop hosts.",
      stats: [
        { value: "94%", label: "Completion Rate" },
        { value: "250+", label: "Live Workshops" },
        { value: "4.9★", label: "Class Reviews" },
      ]
    };
  };

  const content = getContent();

  return (
    <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-14 overflow-hidden bg-gradient-to-r from-white/30 via-white/5 to-transparent">

      {/* Decorative blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl bg-[#a0f212]" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 blur-2xl bg-[#68ea3f]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-5 blur-3xl bg-[#abf282]" />

      {/* Logo */}
      <Link href="/" className="relative z-10 flex items-center gap-2.5 hover:opacity-90 transition-opacity">
        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-xs border border-clay-shadow/40">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-graphite-ink">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20l-7-3-7 3V2z" />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-graphite-ink">BookMy<span className="text-charcoal-slate">Training</span></span>
      </Link>

      {/* Hero copy */}
      <div className="relative z-10 space-y-6 max-w-md">
        <p className="text-sm font-semibold tracking-widest text-charcoal-slate uppercase">{content.slogan}</p>
        <h1 className="text-5xl font-extrabold leading-[1.1] text-graphite-ink">{content.title}</h1>
        <p className="text-sm text-stone-grey leading-relaxed">{content.description}</p>
        <div className="flex gap-8 pt-4">
          {content.stats.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-graphite-ink">{s.value}</p>
              <p className="text-xs text-stone-grey/60 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-xs text-stone-grey/60 flex justify-between">
        <span>© {new Date().getFullYear()} BookMyTraining Inc.</span>
        <div className="space-x-3">
          <a href="#" className="hover:text-graphite-ink transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-graphite-ink transition-colors">Terms</a>
        </div>
      </div>
    </div>
  );
}
