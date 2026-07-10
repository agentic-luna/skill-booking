import React from "react";
import { TestimonialCard } from "./TestimonialCard";
import { testimonialsList } from "./testimonialsData";

export default function TestimonialSection() {
  return (
    <section className="py-20 bg-transparent border-t border-clay-shadow">
      <div className="space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Loved by Thousands of Learners
          </h2>
          <p className="text-muted-foreground text-sm">
            See how BookMySkill is helping individuals master practical skills under live guidance.
          </p>
        </div>

        {/* 
          Correct infinite marquee pattern:
          - ONE outer overflow-hidden container
          - ONE inner flex row containing two copies of cards (original + duplicate)
          - The animation slides the whole inner row left by 50%
          - This creates a seamless loop
        */}
        <div
          className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] py-4"
          style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}
        >
          <div className="flex animate-marquee hover:[animation-play-state:paused]">
            {/* First copy */}
            {testimonialsList.map((t, idx) => (
              <div
                key={`a-${idx}`}
                className="flex-none w-[340px] px-3"
              >
                <TestimonialCard testimonial={t} />
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {testimonialsList.map((t, idx) => (
              <div
                key={`b-${idx}`}
                className="flex-none w-[340px] px-3"
                aria-hidden="true"
              >
                <TestimonialCard testimonial={t} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
