"use client";

import React from "react";
import { CalendarCheck, ThumbsUp, Globe, Headset } from "lucide-react";
import AnimatedHeroText from "./AnimatedHeroText";
import AdvancedSearchBar from "./AdvancedSearchBar";

export default function HeroSection() {
  return (
    <div className="w-full flex flex-col">
      {/* Top Hero Area */}
      <div className="relative w-full bg-[#f2fcf5] pt-20 pb-16">
        <div className="max-w-[1100px] w-full mx-auto px-6">
          {/* Top Content: Split Layout */}
          <div className="w-full flex flex-col lg:flex-row items-center gap-6 lg:gap-8 mb-4 mt-6">
            {/* Left Text */}
            <div className="w-full lg:w-[40%] flex flex-col items-start lg:items-start text-left">
              <h1 className="text-[28px] md:text-[36px] lg:text-[42px] font-extrabold text-gray-900 leading-[1.15] tracking-tight mb-4">
                <AnimatedHeroText />
              </h1>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                Discover the best handpicked trainings and programs to upgrade your skillset today.
              </p>
            </div>

            {/* Right Image Grid */}
            <div className="w-full lg:w-[60%] grid grid-cols-3 gap-2 h-[260px] md:h-[300px]">
              {/* Main tall image */}
              <div className="col-span-1 row-span-2 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop"
                  alt="Hero Main"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Top right */}
              <div className="col-span-2 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop"
                  alt="Hero 2"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Bottom right */}
              <div className="col-span-1 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop"
                  alt="Hero 3"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="col-span-1 rounded-2xl overflow-hidden">
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
        <div className="max-w-[1100px] w-full mx-auto px-6">
          
          {/* Search Bar — pulled up slightly over the background transition */}
          <div className="w-full relative z-30 -mt-8">
            <AdvancedSearchBar />
          </div>

          {/* Why BookMySkill? Section */}
          <div className="mt-14">
            <h2 className="text-[22px] font-extrabold text-gray-900 mb-5 tracking-tight">Why BookMySkill?</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Card 1 */}
              <div className="flex flex-col p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                <div className="w-10 h-10 mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-[15px] font-bold text-gray-900 mb-2 leading-snug">
                  Book now, pay at the session
                </h3>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  FREE cancellation on most bookings and classes.
                </p>
              </div>

              {/* Card 2 */}
              <div className="flex flex-col p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                <div className="w-10 h-10 mb-4 bg-green-50 rounded-full flex items-center justify-center">
                  <ThumbsUp className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-[15px] font-bold text-gray-900 mb-2 leading-snug">
                  Real reviews from fellow learners
                </h3>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  Get trusted feedback from users who actually took the classes.
                </p>
              </div>

              {/* Card 3 */}
              <div className="flex flex-col p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                <div className="w-10 h-10 mb-4 bg-orange-50 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-[15px] font-bold text-gray-900 mb-2 leading-snug">
                  Verified expert trainers
                </h3>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  Learn from vetted industry professionals across the globe.
                </p>
              </div>

              {/* Card 4 */}
              <div className="flex flex-col p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                <div className="w-10 h-10 mb-4 bg-purple-50 rounded-full flex items-center justify-center">
                  <Headset className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-[15px] font-bold text-gray-900 mb-2 leading-snug">
                  Trusted customer service you can rely on, 24/7
                </h3>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  We're always here to help whenever you need it.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
