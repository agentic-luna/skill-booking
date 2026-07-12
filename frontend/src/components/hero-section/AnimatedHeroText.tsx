"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHRASES = [
  "Build Skills That Matter.",
  "Learn from Industry Experts.",
  "Upgrade Your Skill Set.",
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
    <span className="font-sans font-bold tracking-tight text-white select-none">
      <AnimatePresence mode="wait">
        <motion.span
          key={phraseIndex}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="inline-block"
        >
          {PHRASES[phraseIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
