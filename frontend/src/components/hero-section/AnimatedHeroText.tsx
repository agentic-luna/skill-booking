"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const PHRASES = [
  "Build Skills That Matter.",
  "Learn from Industry Experts.",
  "Upgrade Your Skill Set.",
];

const TYPING_SPEED = 60;
const DELETING_SPEED = 30;
const PAUSE_AFTER_TYPED = 2000;

export default function AnimatedHeroText() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = PHRASES[phraseIndex];
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (displayText.length < current.length) {
        timer = setTimeout(() => {
          setDisplayText(current.slice(0, displayText.length + 1));
        }, TYPING_SPEED);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, PAUSE_AFTER_TYPED);
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1));
        }, DELETING_SPEED);
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIndex]);

  return (
    <span className="font-serif italic font-light text-nightshade-black select-none">
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className="inline-block ml-0.5 w-[2px] h-[0.8em] bg-nightshade-black align-middle"
        style={{ verticalAlign: "middle" }}
      />
    </span>
  );
}
