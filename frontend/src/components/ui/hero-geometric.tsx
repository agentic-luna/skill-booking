"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Code2, HeartPulse, LineChart, Brain, Target, Palette } from "lucide-react";

interface HeroGeometricProps {
    title1?: string;
    titleComponent?: React.ReactNode;
    title2?: string;
    description?: string;
    className?: string;
    children?: React.ReactNode;
}

const floatingSkills = [
  { icon: Code2, title: "Coding", radius: 550, angle: 0, size: "lg" },
  { icon: HeartPulse, title: "Yoga", radius: 520, angle: 60, size: "xl" },
  { icon: LineChart, title: "Trading", radius: 580, angle: 120, size: "md" },
  { icon: Brain, title: "Soft Skills", radius: 530, angle: 180, size: "lg" },
  { icon: Target, title: "Motivation", radius: 600, angle: 240, size: "md" },
  { icon: Palette, title: "Design", radius: 500, angle: 300, size: "lg" },
];

const floatingSkillsMobile = [
  { icon: Code2, title: "Coding", top: "15%", left: "15%", delay: 0, size: "md" },
  { icon: HeartPulse, title: "Yoga", top: "80%", left: "15%", delay: 1, size: "md" },
  { icon: Target, title: "Motivation", top: "20%", left: "80%", delay: 0.5, size: "md" },
];

export function HeroGeometric({
    title1,
    titleComponent,
    title2,
    description,
    className,
    children,
}: HeroGeometricProps) {
    return (
        <div
            className={cn("relative w-full min-h-[90vh] flex flex-col items-center justify-center bg-[#1E3326] text-white overflow-hidden", className)}
            style={{ containerType: "size" }}
        >
            {/* Dark/Green Gradients for the premium vibe */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#a0f212]/40 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#a0f212]/35 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-[#a0f212]/30 blur-[100px] rounded-full pointer-events-none" />

            {/* Subtle Grid / Stars */}
            <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

            {/* Desktop Orbiting Skills */}
            <motion.div 
              className="absolute top-1/2 left-1/2 w-0 h-0 z-40 hidden lg:block pointer-events-none"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
              {floatingSkills.map((skill, idx) => {
                const Icon = skill.icon;
                return (
                  <div
                    key={idx}
                    className="absolute top-0 left-0"
                    style={{ transform: `rotate(${skill.angle}deg) translateY(-${skill.radius}px) rotate(-${skill.angle}deg)` }}
                  >
                    <motion.div
                      className="pointer-events-auto cursor-pointer group flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      animate={{ rotate: -360 }} // Counter-rotate to stay upright
                      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                      whileHover={{ scale: 1.15, zIndex: 50 }}
                    >
                      <div className={cn(
                        "relative flex items-center justify-center rounded-full bg-[#11131A]/80 backdrop-blur-md border border-white/5 shadow-[0_0_30px_rgba(160,242,18,0.15)] transition-all duration-300 group-hover:shadow-[0_0_50px_rgba(160,242,18,0.4)] group-hover:border-[#a0f212]/60",
                        skill.size === "md" ? "w-16 h-16" : skill.size === "lg" ? "w-20 h-20" : "w-24 h-24"
                      )}>
                        {/* Inner glowing ring */}
                        <div className="absolute inset-0 rounded-full border border-[#a0f212]/40 shadow-[inset_0_0_20px_rgba(160,242,18,0.2)] group-hover:border-[#a0f212] group-hover:shadow-[inset_0_0_30px_rgba(160,242,18,0.4)] transition-all duration-300"></div>
                        {/* The Icon */}
                        <Icon className={cn("text-[#a0f212] drop-shadow-[0_0_10px_rgba(160,242,18,0.5)] group-hover:drop-shadow-[0_0_20px_rgba(160,242,18,0.8)] transition-all duration-300", skill.size === "md" ? "w-6 h-6" : skill.size === "lg" ? "w-8 h-8" : "w-10 h-10")} />
                      </div>
                      <div className="mt-4 px-4 py-1.5 bg-[#0A0D14]/90 backdrop-blur-md rounded-full border border-white/10 text-xs font-semibold text-white/90 shadow-lg tracking-wide uppercase opacity-70 group-hover:opacity-100 group-hover:border-[#a0f212]/40 group-hover:text-white transition-all duration-300 whitespace-nowrap">
                        {skill.title}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>

            {/* Mobile/Tablet Static Floating Skills */}
            <div className="absolute inset-0 z-40 lg:hidden pointer-events-none">
              {floatingSkillsMobile.map((skill, idx) => {
                const Icon = skill.icon;
                return (
                  <motion.div
                    key={`mobile-${idx}`}
                    className="absolute flex flex-col items-center justify-center pointer-events-auto cursor-pointer group"
                    style={{ top: skill.top, left: skill.left }}
                    animate={{
                      y: [0, -15, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: skill.delay,
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="relative flex items-center justify-center rounded-full bg-[#11131A]/80 backdrop-blur-md border border-[#a0f212]/40 shadow-[0_0_20px_rgba(160,242,18,0.15)] w-12 h-12 sm:w-16 sm:h-16 group-hover:shadow-[0_0_30px_rgba(160,242,18,0.3)] transition-all duration-300">
                      <Icon className="text-[#a0f212] w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Content */}
            <div className="relative z-20 w-full flex-1 flex flex-col items-center justify-center pointer-events-none">
                <div className="w-full max-w-[1200px] px-6 flex flex-col items-center relative pointer-events-none">
                    <div className="flex flex-col items-center text-center gap-2 md:gap-4 mb-8 md:mb-12 mt-12 md:mt-0 pointer-events-auto">
                        {(title1 || titleComponent) && (
                            <div className="overflow-visible">
                                <motion.h1
                                    initial={{ y: 20, opacity: 0, filter: "blur(10px)", scale: 0.95 }}
                                    animate={{ y: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
                                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                    className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight tracking-tight pb-4 whitespace-nowrap text-white"
                                >
                                    {titleComponent ?? (
                                        <span className="font-serif italic font-light drop-shadow-md text-white">
                                            {title1}
                                        </span>
                                    )}
                                </motion.h1>
                            </div>
                        )}
                        {title2 && (
                            <div className="overflow-hidden">
                                <motion.h1
                                    initial={{ y: "100%", opacity: 0 }}
                                    animate={{ y: "0%", opacity: 1 }}
                                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                    className="text-[12cqi] md:text-[8cqi] lg:text-[6cqi] leading-[0.9] tracking-tighter font-bold text-white drop-shadow-md"
                                >
                                    {title2}
                                </motion.h1>
                            </div>
                        )}
                    </div>

                    {description && (
                        <div className="max-w-2xl text-center mb-10 pointer-events-auto">
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="text-base md:text-[1.125rem] leading-relaxed text-white/70 font-medium drop-shadow-md"
                            >
                                {description}
                            </motion.p>
                        </div>
                    )}
                    
                    {children && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                            className="w-full flex justify-center drop-shadow-sm z-30 relative pointer-events-auto"
                        >
                            {children}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
