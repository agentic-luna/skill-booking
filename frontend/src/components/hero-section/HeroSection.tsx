"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import AnimatedHeroText from "./AnimatedHeroText";
import AdvancedSearchBar from "./AdvancedSearchBar";

export default function HeroSection() {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col">
      {/* Top Hero Area */}
      <div className="relative w-full bg-[#f2fcf5] pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-3xl flex flex-col items-center"
          >
            <h1 className="text-[36px] md:text-[48px] lg:text-[60px] font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-4">
              <AnimatedHeroText />
            </h1>
            <p className="text-gray-600 text-lg md:text-xl font-medium max-w-xl mb-6">
              Search lowest prices on training event tickets.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(160,242,18,0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/programs/featured")}
              className="mb-8 inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#0b0c01] text-white hover:bg-black rounded-full font-black text-xs tracking-widest uppercase shadow-[0_4px_20px_rgba(160,242,18,0.2)] border border-[#a0f212]/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#a0f212] animate-pulse" />
              <span>Explore Pinned Spotlight Programs</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#a0f212]" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Bottom Area (Search Bar) */}
      <div className="relative w-full bg-white pb-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          {/* Search Bar */}
          <div className="w-full relative z-30 -mt-12 flex justify-center">
            <div className="w-full max-w-4xl shadow-xl shadow-gray-200/50 rounded-[32px] bg-white">
              <AdvancedSearchBar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
