"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeroGeometric } from "@/components/ui/hero-geometric";
import AnimatedHeroText from "@/components/hero-section/AnimatedHeroText";

export default function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/programs?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <HeroGeometric
      titleComponent={<AnimatedHeroText />}
    >
      <div className="w-full flex flex-col items-center space-y-6">
        {/* Search Input Box */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="flex items-center w-full max-w-2xl mx-auto bg-[#11131A]/60 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative z-20 group transition-all duration-300 ease-out hover:shadow-[0_8px_40px_rgba(160,242,18,0.1)] focus-within:shadow-[0_8px_40px_rgba(160,242,18,0.1)] focus-within:border-[#a0f212]/30 focus-within:-translate-y-1 hover:-translate-y-1 hover:border-white/20"
        >
          <div className="relative flex-1 flex items-center">
            <Input
              type="text"
              placeholder="What skill do you want to learn today?"
              className="px-6 h-14 w-full text-lg bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none text-white placeholder:text-white/40 font-light"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="h-14 w-14 shrink-0 rounded-full bg-gradient-to-b from-[#a0f212] to-[#8ac90c] hover:from-[#b1f530] hover:to-[#9ad918] flex items-center justify-center text-black shadow-md transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(160,242,18,0.4)] focus:outline-none focus:ring-2 focus:ring-[#a0f212]/50 border border-[#c1f76f]/50"
          >
            <Search className="h-5 w-5 stroke-[2.5px]" />
          </button>
        </form>

        <Link href="/programs" className="mt-6 md:mt-10 relative group inline-block animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
          {/* Animated outer glow ring */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#a0f212]/40 via-[#a0f212]/70 to-[#a0f212]/40 rounded-full opacity-70 group-hover:opacity-100 blur-lg transition-all duration-700 group-hover:duration-300"></div>
          
          {/* Main button surface */}
          <Button 
            size="lg" 
            className="relative h-12 md:h-14 px-8 md:px-12 bg-gradient-to-b from-[#a0f212] to-[#8ac90c] hover:from-[#b1f530] hover:to-[#9ad918] text-black border border-[#c1f76f]/50 rounded-full transition-all duration-300 shadow-[0_0_25px_rgba(160,242,18,0.5)] group-hover:shadow-[0_0_40px_rgba(160,242,18,0.7)] font-bold tracking-wide text-sm md:text-base overflow-hidden"
          >
            {/* Subtle inner top highlight */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            {/* Inner bottom glow */}
            <div className="absolute inset-x-4 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-black/10 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
            Explore Skills
          </Button>
        </Link>      </div>
    </HeroGeometric>
  );
}
