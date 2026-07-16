"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHRASES = [
  { prefix: "Build Skills That", highlight: " Matter" },
  { prefix: "Learn from", highlight: " Industry Experts" },
  { prefix: "Upgrade Your", highlight: " Skill Set" },
];

const DISPLAY_DURATION = 3500;

export default function AnimatedHeroText() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }, DISPLAY_DURATION);

    return () => clearInterval(timer);
  }, []);

  return (
    <span className="font-sans font-bold tracking-tight text-white select-none whitespace-nowrap">
      <AnimatePresence mode="wait">
        <motion.span
          key={phraseIndex}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <span>{PHRASES[phraseIndex].prefix}</span>
          <span
            className="hero-gradient-text"
            style={{
              backgroundImage: "linear-gradient(90deg, #a0f212, #abf282, #c8f7a0, #a0f212, #abf282)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "heroGradientFlow 4s linear infinite",
            }}
          >
            {PHRASES[phraseIndex].highlight}
          </span>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
