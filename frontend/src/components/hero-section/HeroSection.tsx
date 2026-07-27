"use client";

import React from "react";
import { motion } from "framer-motion";
import { CalendarCheck, ThumbsUp, Globe, Headset } from "lucide-react";
import AnimatedHeroText from "./AnimatedHeroText";
import AdvancedSearchBar from "./AdvancedSearchBar";

export default function HeroSection() {
  return (
    <div className="w-full flex flex-col">
      {/* Top Hero Area */}
      <div className="relative w-full bg-[#f2fcf5] pt-16 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          {/* Top Content: Split Layout */}
          <div className="w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-12 mb-6 mt-8">
            {/* Left Text */}
            <div className="w-full lg:w-[45%] flex flex-col items-start lg:items-start text-left">
              <h1 className="text-[32px] md:text-[40px] lg:text-[48px] font-extrabold text-gray-900 leading-[1.15] tracking-tight mb-6">
                <AnimatedHeroText />
              </h1>
              <p className="text-base md:text-lg text-gray-500 max-w-md leading-relaxed">
                Discover the best handpicked trainings and programs to upgrade your skillset today.
              </p>
            </div>

            {/* Right Image Grid */}
            <div className="w-full lg:w-[55%] grid grid-cols-3 gap-3 md:gap-4 h-[260px] md:h-[300px] lg:h-[360px]">
              {/* Main tall image */}
              <div className="col-span-1 row-span-2 rounded-3xl overflow-hidden shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop"
                  alt="Hero Main"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Top right */}
              <div className="col-span-2 rounded-3xl overflow-hidden shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop"
                  alt="Hero 2"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Bottom right */}
              <div className="col-span-1 rounded-3xl overflow-hidden shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop"
                  alt="Hero 3"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="col-span-1 rounded-3xl overflow-hidden shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1531496730074-83b638c0a7ac?q=80&w=600&auto=format&fit=crop"
                  alt="Hero 4"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Area (Search Bar + Why BookMySkill) */}
      <div className="relative w-full bg-white pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          
          {/* Search Bar — pulled up slightly over the background transition */}
          <div className="w-full relative z-30 -mt-8">
            <AdvancedSearchBar />
          </div>

          {/* Why BookMySkill? Section */}
          <div className="mt-12 md:mt-16 mb-8">
            <h2 className="text-[26px] md:text-[32px] font-bold text-gray-900 mb-8 text-center tracking-tight">
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
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              
              {/* Card 1: Special Highlight Card */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                }}
                whileHover={{ y: -8 }}
                className="flex flex-col items-center justify-center p-8 bg-[#faf7ff] rounded-[24px] text-center border border-purple-50 shadow-sm hover:shadow-xl hover:shadow-purple-900/5 transition-shadow cursor-default"
              >
                {/* Floating decorative elements mimicking polaroids */}
                <div className="relative h-32 w-full flex justify-center items-center mb-6">
                  <motion.div 
                    initial={{ rotate: 0, x: 0 }}
                    whileInView={{ rotate: -12, x: -48 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="absolute w-16 h-20 bg-white p-1 rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                     <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover rounded-lg" alt="Deco 1"/>
                  </motion.div>
                  <motion.div 
                    initial={{ rotate: 0, x: 0 }}
                    whileInView={{ rotate: 12, x: 48 }}
                    transition={{ type: "spring", delay: 0.3 }}
                    className="absolute w-16 h-20 bg-white p-1 rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                     <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover rounded-lg" alt="Deco 2"/>
                  </motion.div>
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", delay: 0.4 }}
                    className="absolute z-10 w-20 h-24 bg-white p-1 rounded-xl shadow-md border border-gray-100 overflow-hidden"
                  >
                     <img src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover rounded-lg" alt="Deco 3"/>
                  </motion.div>
                </div>
                
                <h3 className="text-[18px] font-extrabold text-gray-900 mb-3 leading-tight">
                  Book now, pay at the session
                </h3>
                <p className="text-[13px] text-gray-500 leading-relaxed mb-8 px-2">
                  FREE cancellation on most bookings and classes.
                </p>
                
              </motion.div>

              {/* Card 2: Image Card */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                }}
                whileHover={{ y: -8 }}
                className="flex flex-col bg-white rounded-[24px] overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-gray-900/5 transition-shadow border border-gray-50 cursor-pointer"
              >
                <div className="h-[280px] w-full overflow-hidden rounded-[24px]">
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop" 
                    alt="Real reviews" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                  />
                </div>
                <div className="pt-5 pb-4 px-2">
                  <h3 className="text-[16px] font-bold text-gray-900 mb-1.5 group-hover:text-[#a0f212] transition-colors">
                    Real reviews from fellow learners
                  </h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed">
                    Get trusted feedback from users who actually took the classes.
                  </p>
                </div>
              </motion.div>

              {/* Card 3: Image Card */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                }}
                whileHover={{ y: -8 }}
                className="flex flex-col bg-white rounded-[24px] overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-gray-900/5 transition-shadow border border-gray-50 cursor-pointer"
              >
                <div className="h-[280px] w-full overflow-hidden rounded-[24px]">
                  <img 
                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop" 
                    alt="Expert trainers" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                  />
                </div>
                <div className="pt-5 pb-4 px-2">
                  <h3 className="text-[16px] font-bold text-gray-900 mb-1.5 group-hover:text-[#a0f212] transition-colors">
                    Verified expert trainers
                  </h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed">
                    Learn from vetted industry professionals across the globe.
                  </p>
                </div>
              </motion.div>

              {/* Card 4: Image Card */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                }}
                whileHover={{ y: -8 }}
                className="flex flex-col bg-white rounded-[24px] overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-gray-900/5 transition-shadow border border-gray-50 cursor-pointer"
              >
                <div className="h-[280px] w-full overflow-hidden rounded-[24px]">
                  <img 
                    src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=600&auto=format&fit=crop" 
                    alt="Customer service" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                  />
                </div>
                <div className="pt-5 pb-4 px-2">
                  <h3 className="text-[16px] font-bold text-gray-900 mb-1.5 group-hover:text-[#a0f212] transition-colors">
                    Trusted customer service
                  </h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed">
                    We're always here to help whenever you need it, 24/7.
                  </p>
                </div>
              </motion.div>

            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
