"use client";

import React, { useState } from "react";
import { X, Sparkles, Rocket, Eye, Flame, Search, ChevronRight, Star } from "lucide-react";
import { FeaturedBadge, ProBoostBadge, UltraProBadge, FeaturedOrganizerBadge } from "../common/BoostBadges";

interface PlacementPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlacementPreviewModal({ isOpen, onClose }: PlacementPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<"hero" | "carousel" | "search" | "trending">("hero");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#07130e] border border-emerald-900/60 rounded-[36px] max-w-4xl w-full p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden space-y-6">
        
        {/* Glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#a0f212]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-950 pb-5">
          <div className="flex items-center gap-3">
            <div className="bg-[#a0f212]/10 p-2.5 rounded-2xl border border-[#a0f212]/20">
              <Eye className="h-5 w-5 text-[#a0f212]" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                Live Placement Previews <Sparkles className="h-4 w-4 text-[#a0f212]" />
              </h3>
              <p className="text-xs text-emerald-100/50 font-medium">
                See exactly how your workshop will stand out to thousands of eager students.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-100/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#0d2218] p-1.5 rounded-2xl border border-emerald-950 overflow-x-auto gap-1">
          {[
            { id: "hero", label: "Homepage Hero Banner (Ultra Pro)" },
            { id: "carousel", label: "Featured Carousel (Pro & Ultra)" },
            { id: "search", label: "Top Search Listings (All Tiers)" },
            { id: "trending", label: "Trending Section (Pro & Ultra)" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[140px] text-center py-2.5 px-3 rounded-xl text-xs font-black transition-all ${
                  isActive
                    ? "bg-[#a0f212] text-[#0d1e17] shadow-md"
                    : "text-emerald-100/50 hover:text-emerald-100 hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Preview Screen Canvas */}
        <div className="bg-[#0b1c14] border border-emerald-900/40 rounded-3xl p-6 relative overflow-hidden min-h-[320px]">
          
          {/* TAB 1: HERO BANNER (ULTRA PRO) */}
          {activeTab === "hero" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-[10px] text-emerald-500 font-black uppercase tracking-widest">
                <span>Featured Placement: Homepage Main Hero Spotlight</span>
                <span className="text-[#a0f212] bg-[#a0f212]/10 px-2 py-0.5 rounded-full border border-[#a0f212]/20">Ultra Pro Tier Only</span>
              </div>

              {/* Hero Spotlight Mockup Card */}
              <div className="bg-gradient-to-r from-[#0d2218] to-[#122e20] border border-[#a0f212]/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl flex flex-col sm:flex-row items-center gap-6">
                <img
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=400"
                  alt="Spotlight"
                  className="w-full sm:w-48 h-36 object-cover rounded-2xl border border-[#a0f212]/20 shrink-0"
                />
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <UltraProBadge />
                    <FeaturedOrganizerBadge />
                  </div>
                  <h4 className="text-lg font-black text-white leading-tight truncate">
                    Advanced AI & Fullstack Masterclass 2026
                  </h4>
                  <p className="text-xs text-emerald-100/60 leading-relaxed font-semibold line-clamp-2">
                    Prime placement at the top of the BookMyTraining homepage viewed by over 50,000 students weekly.
                  </p>
                  <div className="pt-1 flex items-center gap-4">
                    <span className="text-base font-black text-[#a0f212]">₹1,499</span>
                    <button className="bg-[#a0f212] text-[#0d1e17] text-xs font-black px-4 py-2 rounded-xl">
                      Reserve Spot
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FEATURED CAROUSEL (PRO & ULTRA) */}
          {activeTab === "carousel" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-[10px] text-emerald-500 font-black uppercase tracking-widest">
                <span>Featured Placement: Homepage Spotlight Carousel</span>
                <span className="text-[#a0f212] bg-[#a0f212]/10 px-2 py-0.5 rounded-full border border-[#a0f212]/20">Pro & Ultra Pro Tiers</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#07130e] border border-[#a0f212]/30 rounded-2xl p-4 space-y-3 relative">
                  <div className="aspect-video rounded-xl overflow-hidden relative">
                    <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=300" alt="" className="object-cover w-full h-full" />
                    <div className="absolute top-2 left-2">
                      <ProBoostBadge />
                    </div>
                  </div>
                  <h5 className="text-xs font-bold text-white truncate">React & Next.js Masterclass</h5>
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-[#a0f212]">
                    <span>₹999</span>
                    <span className="text-emerald-100/50 text-[9px]">4.9 ★</span>
                  </div>
                </div>

                <div className="bg-[#07130e] border border-emerald-950 rounded-2xl p-4 space-y-3 opacity-60">
                  <div className="aspect-video rounded-xl overflow-hidden relative">
                    <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300" alt="" className="object-cover w-full h-full" />
                  </div>
                  <h5 className="text-xs font-bold text-white truncate">Organic Workshop Listing</h5>
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-white">
                    <span>₹499</span>
                    <span className="text-emerald-100/50 text-[9px]">4.5 ★</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEARCH LISTINGS (ALL TIERS) */}
          {activeTab === "search" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-[10px] text-emerald-500 font-black uppercase tracking-widest">
                <span>Search Placement: Top Ranking Order</span>
                <span className="text-[#a0f212]">Ultra (Rank 3) &gt; Pro (Rank 2) &gt; Basic (Rank 1)</span>
              </div>

              <div className="space-y-3">
                
                {/* Ultra Pro Result */}
                <div className="p-3 bg-[#0d2218] border border-[#a0f212]/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-[#a0f212] w-4">#1</span>
                    <UltraProBadge />
                    <span className="text-xs font-bold text-white">Executive Leadership Workshop</span>
                  </div>
                  <span className="text-[10px] text-[#a0f212] font-black uppercase">Ultra Pro Rank</span>
                </div>

                {/* Pro Result */}
                <div className="p-3 bg-[#0d2218]/70 border border-[#a0f212]/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-[#a0f212] w-4">#2</span>
                    <ProBoostBadge />
                    <span className="text-xs font-bold text-white">UI/UX Design Systems Intensive</span>
                  </div>
                  <span className="text-[10px] text-[#a0f212] font-black uppercase">Pro Boost Rank</span>
                </div>

                {/* Basic Result */}
                <div className="p-3 bg-[#07130e] border border-emerald-950 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-emerald-500 w-4">#3</span>
                    <FeaturedBadge />
                    <span className="text-xs font-bold text-white">Python Backend Engineering</span>
                  </div>
                  <span className="text-[10px] text-emerald-500 font-black uppercase">Basic Rank</span>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: TRENDING SECTION */}
          {activeTab === "trending" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-[10px] text-emerald-500 font-black uppercase tracking-widest">
                <span>Placement: Trending & Recommended Masterclasses Widget</span>
                <span className="text-[#a0f212]">Pro & Ultra Pro Tiers</span>
              </div>

              <div className="p-5 bg-[#07130e] border border-emerald-900/50 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#a0f212]/10 border border-[#a0f212]/20 flex items-center justify-center text-[#a0f212] shrink-0">
                  <Flame className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white truncate">Trending Masterclass Spotlight</span>
                    <ProBoostBadge />
                  </div>
                  <p className="text-[10px] text-emerald-100/50 font-semibold mt-0.5">
                    Positioned directly inside student recommendation triggers across category pages.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#a0f212] hover:bg-[#aee665] text-[#0d1e17] text-xs font-black px-6 py-2.5 rounded-xl transition-all"
          >
            Close Previews
          </button>
        </div>

      </div>
    </div>
  );
}
