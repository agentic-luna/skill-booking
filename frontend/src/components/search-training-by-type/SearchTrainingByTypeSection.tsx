"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/constants/categories";

const CATEGORY_IMAGES: Record<string, string> = {
  "life-coaching": "/typesection/life-coaching.png",
  "relationship": "/typesection/relationship.jpeg",
  "business": "/typesection/buisness.jpeg",
  "trauma-healing": "/typesection/trauma-healing.jpg",
};

export default function SearchTrainingByTypeSection() {
  const router = useRouter();

  return (
    <div className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="mt-14 mb-14">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>

              <h2 className="text-[26px] md:text-[34px] font-extrabold text-gray-900 tracking-tight">
                Search Training Event By Type
              </h2>
            </div>
            <button
              onClick={() => router.push("/programs")}
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors group"
            >
              <span>Explore All Workshops</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => {
              return (
                <motion.div
                  key={cat.value}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="flex flex-col justify-between rounded-[24px] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200/80 transition-all duration-300 group cursor-pointer overflow-hidden"
                  onClick={() => router.push(`/programs?category=${cat.value}`)}
                >
                  <div className="relative w-full h-36 bg-gray-100 overflow-hidden">
                    <img
                      src={CATEGORY_IMAGES[cat.value] || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600"}
                      alt={cat.label}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 right-3 text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-gray-800 shadow-xs group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                      Explore
                    </span>
                  </div>

                  <div className="p-6 pt-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                        {cat.label}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed mb-4">
                        {cat.description}
                      </p>
                    </div>

                    {/* Interactive Sub-Keywords Pills */}
                    <div className="pt-3 border-t border-gray-100/80 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {cat.keywords.map((kw) => (
                        <button
                          key={kw}
                          onClick={() => router.push(`/programs?category=${cat.value}&keywords=${encodeURIComponent(kw)}`)}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all duration-150"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
