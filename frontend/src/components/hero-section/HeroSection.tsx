"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
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
      description="Upskill with confidence. Book live, interactive training sessions and get hands-on guidance from proven industry experts."
    >
      <div className="w-full flex flex-col items-center space-y-6">
        {/* Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-2xl mx-auto bg-bone-white p-2 rounded-md shadow-lg border border-clay-shadow/50 relative z-20 group transition-all duration-300 ease-out hover:shadow-xl focus-within:shadow-xl focus-within:-translate-y-1 hover:-translate-y-1">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <Input
              type="text"
              placeholder="What skill do you want to learn today?"
              className="pl-12 h-14 w-full text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none text-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="h-14 px-8 text-base rounded-md shadow-sm transition-transform active:scale-95">
            Search
          </Button>
        </form>

        <div className="text-xs text-graphite-ink/80 pt-1 flex items-center justify-center gap-2 flex-wrap relative z-20">
          <span className="font-medium">Popular Categories:</span>
          {["React 19", "Sourdough", "HIIT Fit", "Street Photography"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setSearchQuery(item);
                router.push(`/programs?search=${encodeURIComponent(item)}`);
              }}
              className="bg-bone-white/90 backdrop-blur hover:bg-white text-graphite-ink border border-clay-shadow/20 px-3 py-1.5 rounded-sm transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </HeroGeometric>
  );
}
