"use client";

import React from "react";
import { motion } from "framer-motion";
import { CreditCard, ThumbsUp, CheckCircle, Headset, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import AnimatedHeroText from "./AnimatedHeroText";
import AdvancedSearchBar from "./AdvancedSearchBar";
import { CATEGORIES } from "@/constants/categories";

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
            <p className="text-gray-600 text-lg md:text-xl font-medium max-w-xl mb-8">
              Search lowest prices on training event tickets.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom Area (Search Bar + Search Event By Type + Why BookMyTraining) */}
      <div className="relative w-full bg-white pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          {/* Search Bar */}
          <div className="w-full relative z-30 -mt-12 flex justify-center">
            <div className="w-full max-w-4xl shadow-xl shadow-gray-200/50 rounded-[32px] bg-white">
              <AdvancedSearchBar />
            </div>
          </div>

          {/* Search Training Event By Type Section */}
          <div className="mt-14 mb-14">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-full border border-emerald-200/60 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>CURATED CATALOG</span>
                </div>
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
                const IconComponent = cat.icon;
                return (
                  <motion.div
                    key={cat.value}
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="flex flex-col justify-between p-6 rounded-[24px] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200/80 transition-all duration-300 group cursor-pointer"
                    onClick={() => router.push(`/programs?category=${cat.value}`)}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center border shadow-2xs group-hover:scale-110 transition-transform`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <span className="text-[11px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          Explore
                        </span>
                      </div>
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
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Why BookMyTraining? Section */}
          <div className="mt-16 mb-8">
            <h2 className="text-[24px] md:text-[30px] font-extrabold text-gray-900 mb-8 text-center tracking-tight">
              Why BookMyTraining?
            </h2>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15 }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              {/* Card 1 */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                }}
                whileHover={{ y: -6 }}
                className="flex flex-col items-center justify-center p-5 bg-[#fafff0] rounded-[20px] text-center border border-[#a0f212]/20 shadow-sm hover:shadow-xl hover:shadow-[#a0f212]/10 transition-all cursor-default group"
              >
                <div className="h-12 w-12 bg-[#a0f212]/20 text-[#6a9e08] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="text-[15px] font-extrabold text-gray-900 mb-2 leading-tight">
                  Book now, pay at the session
                </h3>
                <p className="text-[13px] text-gray-500 leading-relaxed px-1">
                  FREE cancellation on most bookings and classes.
                </p>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                }}
                whileHover={{ y: -6 }}
                className="flex flex-col items-center justify-center p-5 bg-[#fafff0] rounded-[20px] text-center border border-[#a0f212]/20 shadow-sm hover:shadow-xl hover:shadow-[#a0f212]/10 transition-all cursor-default group"
              >
                <div className="h-12 w-12 bg-[#a0f212]/20 text-[#6a9e08] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ThumbsUp className="h-6 w-6" />
                </div>
                <h3 className="text-[15px] font-extrabold text-gray-900 mb-2 leading-tight">
                  Real reviews from fellow learners
                </h3>
                <p className="text-[13px] text-gray-500 leading-relaxed px-1">
                  Get trusted feedback from users who actually took the classes.
                </p>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                }}
                whileHover={{ y: -6 }}
                className="flex flex-col items-center justify-center p-5 bg-[#fafff0] rounded-[20px] text-center border border-[#a0f212]/20 shadow-sm hover:shadow-xl hover:shadow-[#a0f212]/10 transition-all cursor-default group"
              >
                <div className="h-12 w-12 bg-[#a0f212]/20 text-[#6a9e08] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-[15px] font-extrabold text-gray-900 mb-2 leading-tight">
                  Verified expert trainers
                </h3>
                <p className="text-[13px] text-gray-500 leading-relaxed px-1">
                  Learn from vetted industry professionals across the globe.
                </p>
              </motion.div>

              {/* Card 4 */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                }}
                whileHover={{ y: -6 }}
                className="flex flex-col items-center justify-center p-5 bg-[#fafff0] rounded-[20px] text-center border border-[#a0f212]/20 shadow-sm hover:shadow-xl hover:shadow-[#a0f212]/10 transition-all cursor-default group"
              >
                <div className="h-12 w-12 bg-[#a0f212]/20 text-[#6a9e08] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Headset className="h-6 w-6" />
                </div>
                <h3 className="text-[15px] font-extrabold text-gray-900 mb-2 leading-tight">
                  Trusted customer service
                </h3>
                <p className="text-[13px] text-gray-500 leading-relaxed px-1">
                  We're always here to help whenever you need it, 24/7.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
