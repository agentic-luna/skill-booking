"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const PHRASES = [
  "Build Skills That Matter.",
  "Learn from Industry Experts.",
  "Upgrade Your Skill Set.",
];

const TYPING_SPEED = 60;
const DELETING_SPEED = 30;
const WAVE_DURATION = 2000;   // ms for one sweep
const WAVE_SWEEPS = 1.8;      // sweeps before deleting
const WAVE_RADIUS = 5;        // wider = smoother glow

type Phase = "typing" | "waving" | "deleting";

// Smooth bell curve falloff
function bellCurve(dist: number, radius: number): number {
  const t = dist / radius;
  return Math.max(0, Math.exp(-2.5 * t * t));
}

export default function AnimatedHeroText() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");

  // Refs to each character span so we can mutate styles directly (no re-render)
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const waveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Typewriter ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "typing" && phase !== "deleting") return;

    const current = PHRASES[phraseIndex];
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (displayText.length < current.length) {
        timer = setTimeout(() => {
          setDisplayText(current.slice(0, displayText.length + 1));
        }, TYPING_SPEED);
      } else {
        setPhase("waving");
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1));
        }, DELETING_SPEED);
      } else {
        setPhase("typing");
        setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, phase, phraseIndex]);

  // ── Wave Animation — direct DOM mutation, zero React re-renders ───────────
  useEffect(() => {
    if (phase !== "waving") {
      // Reset all chars back to light weight
      charRefs.current.forEach((el) => {
        if (el) el.style.fontWeight = "300";
      });
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (waveTimerRef.current) clearTimeout(waveTimerRef.current);
      return;
    }

    const textLen = PHRASES[phraseIndex].length;
    const totalTravel = textLen + WAVE_RADIUS * 2;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = (elapsed % WAVE_DURATION) / WAVE_DURATION;
      const wavePos = -WAVE_RADIUS + progress * totalTravel;

      charRefs.current.forEach((el, i) => {
        if (!el) return;
        const dist = Math.abs(i - wavePos);
        const ratio = bellCurve(dist, WAVE_RADIUS);
        const weight = Math.round(300 + ratio * 550);
        el.style.fontWeight = String(weight);
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    // After N sweeps, start deleting
    waveTimerRef.current = setTimeout(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setPhase("deleting");
    }, WAVE_DURATION * WAVE_SWEEPS);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (waveTimerRef.current) clearTimeout(waveTimerRef.current);
    };
  }, [phase, phraseIndex]);

  return (
    <span className="font-serif italic text-nightshade-black select-none">
      {displayText.split("").map((char, i) => {
        if (char === " ") {
          return (
            <span
              key={`${phraseIndex}-${i}`}
              style={{ display: "inline-block", width: "0.28em" }}
            />
          );
        }
        return (
          <span
            key={`${phraseIndex}-${i}`}
            ref={(el) => { charRefs.current[i] = el; }}
            style={{
              fontWeight: 300,
              display: "inline-block",
              // Smooth transition on font-weight changes
              transition: "font-weight 0.18s cubic-bezier(0.25, 0.1, 0.25, 1)",
            }}
          >
            {char}
          </span>
        );
      })}

      {/* Cursor — only during typing/deleting */}
      {phase !== "waving" && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="inline-block ml-0.5 w-[2px] h-[0.8em] bg-nightshade-black align-middle"
          style={{ verticalAlign: "middle" }}
        />
      )}
    </span>
  );
}
