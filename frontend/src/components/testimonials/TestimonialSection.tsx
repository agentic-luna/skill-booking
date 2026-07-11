import React from "react";
import { TestimonialCard } from "./TestimonialCard";
import { testimonialsList } from "./testimonialsData";

export default function TestimonialSection() {
  // Duplicate cards for seamless infinite loop
  const allCards = [...testimonialsList, ...testimonialsList];

  return (
    <section className="py-20 bg-transparent border-t border-clay-shadow overflow-hidden">
      <div className="space-y-12">
        {/* Header — constrained to page width */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Loved by Thousands of Learners
          </h2>
          <p className="text-muted-foreground text-sm">
            See how BookMySkill is helping individuals master practical skills under live guidance.
          </p>
        </div>

        {/*
          Single-row infinite marquee.
          - ONE flex container with 2× the cards
          - translateX(-50%) moves exactly one full set width → seamless loop
          - px-3 on each card wrapper = equal 24px gap between all cards,
            INCLUDING the gap at the loop boundary (last→first)
        */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="relative py-4 overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            }}
          >
            <div className="flex animate-marquee hover:[animation-play-state:paused]">
              {allCards.map((t, idx) => (
                <div
                  key={idx}
                  aria-hidden={idx >= testimonialsList.length ? "true" : undefined}
                  className="flex-none w-[340px] px-3"
                >
                  <TestimonialCard testimonial={t} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
