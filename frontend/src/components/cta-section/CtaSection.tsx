import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CtaSection() {
  return (
    <section className="py-20 relative bg-transparent overflow-hidden">
      {/* Abstract light glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,_rgba(168,156,138,0.15),transparent)] pointer-events-none" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center text-foreground relative z-10 space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-graphite-ink">
          Ready to Accelerate Your Learning Curve?
        </h2>
        <p className="text-stone-grey text-base max-w-xl mx-auto leading-relaxed">
          Create an account to explore thousands of live workshops, book secure spots, and start certified learning programs today.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link href="/register">
            <Button size="lg" className="rounded-xl">
              Get Started Now
            </Button>
          </Link>
          <Link href="/register?role=host">
            <Button variant="outline" size="lg" className="border-clay-shadow text-graphite-ink bg-bone-white hover:bg-haze rounded-xl">
              Teach on BookMyTraining
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
