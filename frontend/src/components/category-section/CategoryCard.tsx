import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface CategoryItem {
  name: string;
  slug: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  color: string;
}

export const CategoryCard = ({ cat }: { cat: CategoryItem }) => {
  const Icon = cat.icon;
  return (
    <Link
      href={`/programs?category=${cat.slug}`}
      className="group relative flex items-center p-4 pr-6 rounded-[2rem] bg-transparent border border-clay-shadow/40 hover:bg-white hover:border-clay-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-1 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex-shrink-0 h-16 w-16 rounded-[1.5rem] bg-linen-canvas flex items-center justify-center border border-clay-shadow/30 group-hover:bg-charcoal-slate group-hover:scale-95 transition-all duration-500 z-10">
        <Icon className="h-7 w-7 text-graphite-ink group-hover:text-bone-white transition-colors duration-500" />
      </div>
      
      <div className="ml-5 flex-1 z-10">
        <h3 className="font-serif italic tracking-wide font-medium text-lg text-graphite-ink mb-0.5 group-hover:text-black transition-colors duration-500">
          {cat.name}
        </h3>
        <p className="text-xs font-medium text-stone-grey group-hover:text-graphite-ink/70 transition-colors duration-500">
          {cat.count} Workshops
        </p>
      </div>
      
      <div className="z-10 ml-auto flex-shrink-0 h-10 w-10 rounded-full bg-bone-white border border-clay-shadow/40 flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 shadow-sm">
        <ArrowRight className="h-4 w-4 text-nightshade-black" />
      </div>
    </Link>
  );
};
