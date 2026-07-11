"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroGeometricProps {
    title1?: string;
    titleComponent?: React.ReactNode;
    title2?: string;
    description?: string;
    className?: string;
    color1?: string;
    color2?: string;
    speed?: number;
    children?: React.ReactNode;
}

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
            className={cn("relative w-full min-h-screen flex flex-col items-center bg-transparent text-foreground", className)}
            style={{ containerType: "size" }}
        >
            {/* Background Video */}
            <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none overflow-hidden [mask-image:linear-gradient(to_bottom,white_70%,transparent_100%)] -webkit-[mask-image:linear-gradient(to_bottom,white_70%,transparent_100%)]">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-0 left-0 w-full h-full object-cover animate-in fade-in duration-1000"
                >
                    <source src="/hero.mp4" type="video/mp4" />
                </video>
                {/* Gradient Overlays for smooth blending and text readability */}
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/10" />
            </div>

            {/* Content */}
            {(title1 || title2 || description || children) && (
                <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center pt-8 pb-8 md:pt-20 md:pb-20">
                    {/* Glowing backdrop to ensure text is always readable over any video */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[800px] h-[70%] bg-white/70 blur-[100px] rounded-full pointer-events-none -z-10" />
                    
                    <div className="w-full max-w-[1200px] px-6 flex flex-col items-center relative">
                        
                        {/* Headline */}
                        <div className="flex flex-col items-center text-center gap-2 md:gap-4 mb-8 md:mb-12">
                            {(title1 || titleComponent) && (
                                <div className="overflow-visible">
                                    <motion.h1
                                        initial={{ y: 20, opacity: 0, filter: "blur(10px)", scale: 0.95 }}
                                        animate={{ y: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
                                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                        className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight tracking-tight pb-4 whitespace-nowrap"
                                    >
                                        {titleComponent ?? (
                                            <span className="font-serif italic font-light drop-shadow-md text-nightshade-black">
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
                                        className="text-[12cqi] md:text-[8cqi] lg:text-[6cqi] leading-[0.9] tracking-tighter font-bold text-nightshade-black drop-shadow-sm"
                                    >
                                        {title2}
                                    </motion.h1>
                                </div>
                            )}
                        </div>

                        {/* Subheadline */}
                        {description && (
                            <div className="max-w-2xl text-center mb-10">
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className="text-base md:text-[1.125rem] leading-relaxed text-charcoal-slate font-medium drop-shadow-sm"
                                >
                                    {description}
                                </motion.p>
                            </div>
                        )}
                        
                        {/* Search and Categories Box */}
                        {children && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="w-full flex justify-center drop-shadow-sm"
                            >
                                {children}
                            </motion.div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
