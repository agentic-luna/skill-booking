"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Check, ShieldCheck, Sparkles, MessageSquare, Plus, 
  Users, IndianRupee, ArrowRight, Zap, Target, BarChart3, Clock 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/common/BackButton";

export default function HostLandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#070e0b] text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative border-b border-white/5 bg-gradient-to-b from-[#0a1410] via-[#070e0b] to-[#050a08] pt-24 pb-20">
        {/* Animated Glow Elements */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#a0f212]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#a0f212]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="mb-8">
            <BackButton href="/" label="Back to Home" />
          </div>
          
          <div className="flex flex-col lg:flex-row items-start justify-between gap-16">
            
            {/* Hero Left: Platform Value Proposition */}
            <div className="flex-1 space-y-8 max-w-2xl text-left">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-[#a0f212]/10 border border-[#a0f212]/20 text-[#a0f212] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider"
              >
                <Sparkles className="h-3.5 w-3.5" /> Join 12,450+ Active Trainers
              </motion.div>

              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]"
                >
                  List your <span className="text-[#a0f212]">training events</span> on BookMyTraining
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-gray-300 text-base sm:text-lg leading-relaxed font-medium"
                >
                  No more tracking manual UPI receipts, building clunky landing pages, or spending marketing budget on cold social media ads. Get discovered directly by thousands of learners searching for live workshops and certifications.
                </motion.p>
              </div>

              {/* Quick Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10"
              >
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-[#a0f212]">10k+</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Eager Learners</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-[#a0f212]">₹0</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Listing Cost</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-[#a0f212]">15%</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Flat Fee on Sales</p>
                </div>
              </motion.div>
            </div>

            {/* Hero Right: Sign-up Widget (Booking.com style Card) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              className="w-full max-w-[460px] bg-white text-gray-900 rounded-[32px] p-8 sm:p-10 shadow-2xl relative border border-white/10"
            >
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 leading-none">Register for free</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-2">Start hosting in minutes</p>
                </div>

                {/* Checked Checklist */}
                <div className="space-y-4 pt-2">
                  <div className="flex gap-3">
                    <div className="h-5 w-5 rounded-full bg-[#a0f212]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-[#7bc908]" strokeWidth={3} />
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      <strong>45% of hosts</strong> receive their first booking within 7 days.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-5 w-5 rounded-full bg-[#a0f212]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-[#7bc908]" strokeWidth={3} />
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      Control confirmations: instantly confirm or request profile reviews.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-5 w-5 rounded-full bg-[#a0f212]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-[#7bc908]" strokeWidth={3} />
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      Automatic billing, payouts, invoice creation, and verification.
                    </p>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <Link href="/host/register">
                    <Button className="w-full bg-[#0d1e17] text-white hover:bg-[#142e23] font-black h-14 rounded-2xl text-base shadow-lg transition-transform hover:-translate-y-0.5 duration-200">
                      Get Started Now
                    </Button>
                  </Link>

                  <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5 text-center">
                    <p className="text-xs text-gray-500 font-semibold">Already started a registration?</p>
                    <div className="flex justify-center gap-2 text-xs font-bold">
                      <Link href="/host/register" className="text-indigo-600 hover:underline">Continue registration</Link>
                      <span className="text-gray-300">|</span>
                      <Link href="/host/login" className="text-[#0d1e17] hover:underline font-black">Sign In</Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* WHY US SECTION: Explaining the Platform Need */}
      <div className="bg-[#050a08] border-b border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-black text-white"
            >
              Why list on BookMyTraining?
            </motion.h2>
            <p className="text-gray-400 text-base font-medium">
              We handle the logistics and administrative burden so you can focus entirely on delivering world-class workshops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#a0f212]/10 border border-[#a0f212]/20 flex items-center justify-center text-[#a0f212]">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Reach Eager Learners</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                Your listings are shown to high-intent learners filtering specifically by technology, culinary arts, business, or fitness categories.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#a0f212]/10 border border-[#a0f212]/20 flex items-center justify-center text-[#a0f212]">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Built-in Razorpay Billing</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                No setup fees. Allow users to pay with cards, NetBanking, or UPI instantly, with direct automated payout settlement to your bank account.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#a0f212]/10 border border-[#a0f212]/20 flex items-center justify-center text-[#a0f212]">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Detailed Finance Ledger</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                Track revenue, verify booking counts, monitor commission adjustments, and manage refunds easily from a unified dashboard.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#a0f212]/10 border border-[#a0f212]/20 flex items-center justify-center text-[#a0f212]">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">On-Demand Boost Tiers</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                Need more seats filled? Boost your workshops directly onto the client homepage with standard, pro, or premium boost pricing plans.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* WORRY FREE SECTION: How we back you */}
      <div className="bg-white text-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-[#0d1e17]">Host worry-free. We’ve got your back.</h2>
            <p className="text-gray-500 text-base font-medium">
              Every detail is designed to put you, the instructor, in complete control of your classes.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
          >
            {/* Card 1 */}
            <motion.div variants={itemVariants} className="p-8 rounded-[24px] bg-[#f8fdfa] border border-[#a0f212]/15 shadow-sm space-y-4">
              <div className="bg-[#0d1e17] w-12 h-12 rounded-2xl flex items-center justify-center text-[#a0f212]">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Your training, your rules</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                Set exact seat capacities, run live interactive webinars, or select physical venues. Customize pricing structures and manage seats.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div variants={itemVariants} className="p-8 rounded-[24px] bg-[#f8fdfa] border border-[#a0f212]/15 shadow-sm space-y-4">
              <div className="bg-[#0d1e17] w-12 h-12 rounded-2xl flex items-center justify-center text-[#a0f212]">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Get to know your learners</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                Communicate directly with registered attendees. Review verified user names and contact details before the session start time.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={itemVariants} className="p-8 rounded-[24px] bg-[#f8fdfa] border border-[#a0f212]/15 shadow-sm space-y-4">
              <div className="bg-[#0d1e17] w-12 h-12 rounded-2xl flex items-center justify-center text-[#a0f212]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Stay protected</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                Banish unpaid attendance. Our automated billing system locks bookings and manages cancellations fairly based on global parameters.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
