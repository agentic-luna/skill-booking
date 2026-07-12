"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { CanvasText } from "@/components/ui/canvas-text";

const PHRASES = [
  { prefix: "Build Skills That ", highlight: "Matter." },
  { prefix: "Learn from ", highlight: "Industry Experts." },
  { prefix: "Upgrade Your ", highlight: "Skill Set." },
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
          className="inline-block"
        >
          {PHRASES[phraseIndex].prefix}
          <CanvasText
            text={PHRASES[phraseIndex].highlight}
            className="ml-2"
            backgroundClassName="bg-white"
            colors={[
              "rgba(160, 242, 18, 1)",
              "rgba(160, 242, 18, 0.9)",
              "rgba(160, 242, 18, 0.8)",
              "rgba(171, 242, 130, 0.9)",
              "rgba(171, 242, 130, 0.8)",
              "rgba(160, 242, 18, 0.6)",
              "rgba(160, 242, 18, 0.5)",
              "rgba(171, 242, 130, 0.4)",
              "rgba(160, 242, 18, 0.2)",
              "rgba(171, 242, 130, 0.1)",
            ]}
            lineGap={3}
            animationDuration={15}
          />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
