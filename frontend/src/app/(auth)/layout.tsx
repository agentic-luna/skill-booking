"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { initAuth } from "@/features/auth/store/authStore";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Rehydrate auth session client-side
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <div className="flex min-h-screen grid-cols-1 lg:grid-cols-12 overflow-hidden">
      {/* Visual Banner - Hidden on mobile */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 bg-linen-canvas border-r border-clay-shadow">
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-clay-shadow/10 via-transparent to-transparent pointer-events-none" />
        
        {/* Branding Logo */}
        <Link href="/" className="relative z-10 flex items-center hover:opacity-90 transition-opacity">
          <span className="text-xl font-bold tracking-tight text-graphite-ink">
            BookMy<span className="text-nightshade-black">Skill</span>
          </span>
        </Link>

        {/* Dynamic Graphic Copy */}
        <div className="relative z-10 space-y-6 my-auto max-w-md">
          <h1 className="text-4xl font-extrabold tracking-tight text-graphite-ink leading-[1.15]">
            Unlock Your <span className="text-nightshade-black">Potential</span> with Expert Training.
          </h1>
          <p className="text-stone-grey text-base leading-relaxed">
            Join a global marketplace connecting eager learners with certified hosts. Streamlined bookings, dynamic scheduling, and interactive analytics all in one place.
          </p>
        </div>

        {/* Footer meta info */}
        <div className="relative z-10 text-xs text-stone-grey flex justify-between">
          <span>&copy; {new Date().getFullYear()} BookMySkill Inc.</span>
          <div className="space-x-3">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms</a>
          </div>
        </div>
      </div>

      {/* Main Authentication Flow Container */}
      <div className="flex flex-col col-span-1 lg:col-span-7 justify-center px-4 sm:px-6 lg:px-8 py-12 bg-background relative">
        {/* Theme and Logo Header for Mobile */}
        <div className="absolute top-8 left-8 flex items-center justify-between w-full pr-16 lg:hidden">
          <Link href="/" className="flex items-center">
            <span className="text-lg font-bold tracking-tight text-graphite-ink">
              BookMy<span className="text-nightshade-black">Skill</span>
            </span>
          </Link>
        </div>

        {/* Auth Forms */}
        <div className="mx-auto w-full max-w-[420px] transition-all">
          {children}
        </div>
      </div>
    </div>
  );
}
