"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthBrandPanel() {
  const pathname = usePathname() || "";
  const isAdmin = pathname.includes("/admin");
  const isHost = pathname.includes("/host");
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
    if (isHost) {
      if (isRegister) {
        return {
          slogan: "Scale Your Audience",
          title: "Teach Live Workshops Worldwide",
          description: "Onboard as a certified instructor today. Reach thousands of eager learners, automate session logistics, and secure bank payouts easily.",
          stats: [
            { value: "₹0", label: "Setup Cost" },
            { value: "15%", label: "Platform Fee" },
            { value: "10k+", label: "Eager Students" },
          ]
        };
      }
      return {
        slogan: "Welcome Back, Instructor",
        title: "Publish and Scale Your Workshops",
        description: "Sign in to access your instructor dashboard, analyze enrollment reports, and dispatch notifications to your students.",
        stats: [
          { value: "12k+", label: "Trainers" },
          { value: "100%", label: "Direct Payouts" },
          { value: "24/7", label: "Host Support" },
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
        <div className="bg-gradient-to-br from-[#a0f212] to-[#8ee00d] p-1.5 rounded-md shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5 text-[#0b0c01]">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-xl font-extrabold tracking-tight text-graphite-ink">BookMy<span className="text-[#a0f212]">Training</span></span>
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
