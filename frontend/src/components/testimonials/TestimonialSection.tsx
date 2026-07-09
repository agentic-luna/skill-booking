import React from "react";
import { TestimonialCard } from "./TestimonialCard";
import { testimonialsList } from "./testimonialsData";

export default function TestimonialSection() {
  return (
    <section className="py-20 bg-transparent border-t border-clay-shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Loved by Thousands of Learners
          </h2>
          <p className="text-muted-foreground text-sm">
            See how BookMySkill is helping individuals master practical skills under live guidance.
          </p>
        </div>

        <div className="relative overflow-hidden flex w-full group py-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex shrink-0 animate-marquee hover:[animation-play-state:paused]">
            {testimonialsList.map((t, idx) => (
              <div key={`t1-${idx}`} className="w-[350px] mr-6">
                <TestimonialCard testimonial={t} />
              </div>
            ))}
          </div>
          <div className="flex shrink-0 animate-marquee hover:[animation-play-state:paused]" aria-hidden="true">
            {testimonialsList.map((t, idx) => (
              <div key={`t2-${idx}`} className="w-[350px] mr-6">
                <TestimonialCard testimonial={t} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
