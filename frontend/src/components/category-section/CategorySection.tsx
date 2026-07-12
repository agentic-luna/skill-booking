import React from "react";
import Link from "next/link";
import { ArrowRight, Code, Dumbbell, Camera, UtensilsCrossed, Briefcase, Palette } from "lucide-react";
import { CategoryCard, CategoryItem } from "./CategoryCard";

const categories: CategoryItem[] = [
  { name: "Technology", slug: "technology", icon: Code, count: 18, color: "text-graphite-ink bg-linen-canvas border border-clay-shadow" },
  { name: "Culinary Arts", slug: "culinary", icon: UtensilsCrossed, count: 12, color: "text-graphite-ink bg-linen-canvas border border-clay-shadow" },
  { name: "Photography", slug: "photography", icon: Camera, count: 8, color: "text-graphite-ink bg-linen-canvas border border-clay-shadow" },
  { name: "Fitness & Wellness", slug: "fitness", icon: Dumbbell, count: 14, color: "text-graphite-ink bg-linen-canvas border border-clay-shadow" },
  { name: "Business", slug: "business", icon: Briefcase, count: 9, color: "text-graphite-ink bg-linen-canvas border border-clay-shadow" },
  { name: "Design & Arts", slug: "design", icon: Palette, count: 15, color: "text-graphite-ink bg-linen-canvas border border-clay-shadow" },
];

export default function CategorySection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif italic font-light tracking-tight text-graphite-ink">
              Explore <br className="hidden md:block" />
              <span className="font-sans not-italic font-bold tracking-tighter">Top Categories</span>
            </h2>
            <p className="text-stone-grey text-lg max-w-lg leading-relaxed">
              Discover verified instructors teaching highly demanded technical and life skills across the globe.
            </p>
          </div>
          <Link href="/programs" className="group shrink-0">
            <div className="flex items-center justify-center px-6 py-2.5 bg-bone-white border border-clay-shadow rounded-full shadow-sm transition-all duration-300 hover:shadow hover:bg-white hover:-translate-y-0.5">
              <span className="text-sm font-semibold tracking-wide text-graphite-ink transition-colors">
                View All Categories
              </span>
              <div className="ml-2 rounded-full bg-charcoal-slate/5 p-1 group-hover:bg-charcoal-slate/10 transition-colors">
                <ArrowRight className="h-4 w-4 text-graphite-ink group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.name} cat={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
