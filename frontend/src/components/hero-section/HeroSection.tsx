"use client";

import React from "react";
import { motion } from "framer-motion";
import { CreditCard, ThumbsUp, CheckCircle, Headset, ShieldCheck } from "lucide-react";
import AnimatedHeroText from "./AnimatedHeroText";
import AdvancedSearchBar from "./AdvancedSearchBar";

export default function HeroSection() {
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

      {/* Bottom Area (Search Bar + Why BookMyTraining) */}
      <div className="relative w-full bg-white pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          {/* Search Bar */}
          <div className="w-full relative z-30 -mt-12 flex justify-center">
            <div className="w-full max-w-4xl shadow-xl shadow-gray-200/50 rounded-[32px] bg-white">
              <AdvancedSearchBar />
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
