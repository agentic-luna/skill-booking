"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHRASES = [
  { prefix: "Find The Best ", highlight: "Training Events in India." },
  { prefix: "Learn from ", highlight: "Industry Experts." },
  { prefix: "Upgrade Your ", highlight: "Training." },
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
    <span className="font-sans font-bold tracking-tight text-gray-900 select-none whitespace-nowrap">
      <AnimatePresence mode="wait">
        <motion.span
          key={phraseIndex}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(4px)" }}
          className="inline-flex flex-col text-center"
        >
          <span className="block">{PHRASES[phraseIndex].prefix}</span>
          <span className="block text-[#a0f212]">{PHRASES[phraseIndex].highlight}</span>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
