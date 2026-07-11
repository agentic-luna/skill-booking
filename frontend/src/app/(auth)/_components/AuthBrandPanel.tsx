import React from "react";
import Link from "next/link";

const STATS = [
  { value: "12k+", label: "Learners" },
  { value: "800+", label: "Instructors" },
  { value: "4.9★", label: "Rating" },
];

export default function AuthBrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-14 overflow-hidden bg-gradient-to-br from-[#6b3a2a] via-[#8b5230] to-[#c47c5a]">

      {/* Decorative blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl bg-[#fdf6f0]" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 blur-2xl bg-[#3d1f12]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 blur-2xl bg-[#e8d5c0]" />

      {/* Logo */}
      <Link href="/" className="relative z-10 flex items-center gap-2.5 hover:opacity-90 transition-opacity">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20l-7-3-7 3V2z" />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-white">BookMy<span className="opacity-75">Skill</span></span>
      </Link>

      {/* Hero copy */}
      <div className="relative z-10 space-y-6 max-w-md">
        <p className="text-sm font-semibold tracking-widest text-white/60 uppercase">Learn · Grow · Excel</p>
        <h1 className="text-5xl font-extrabold leading-[1.1] text-white">Hey,&nbsp;Hello!</h1>
        <p className="text-lg font-medium text-white/80">Join The Waitlist For The Skill Marketplace!</p>
        <p className="text-sm text-white/60 leading-relaxed">
          We provide all the advantages that can simplify your learning journey without any further requirements
          — connecting eager learners with certified instructors, instantly.
        </p>
        <div className="flex gap-8 pt-4">
          {STATS.map((s) => (
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
          <a href="#" className="hover:text-white/70 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white/70 transition-colors">Terms</a>
        </div>
      </div>
    </div>
  );
}
