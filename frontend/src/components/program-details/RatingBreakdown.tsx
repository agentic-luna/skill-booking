"use client";

import React from "react";
import { Star } from "lucide-react";

interface RatingBreakdownProps {
  stats: {
    averageRating: number;
    totalReviews: number;
    breakdown?: Record<string | number, number>;
  } | null;
  selectedRating: number | null;
  onSelectRating: (rating: number | null) => void;
}

const STAR_COLORS: Record<number, { text: string; fill: string; bar: string }> = {
  5: { text: "text-emerald-500", fill: "fill-emerald-500", bar: "bg-emerald-500" },
  4: { text: "text-teal-500", fill: "fill-teal-500", bar: "bg-teal-500" },
  3: { text: "text-amber-500", fill: "fill-amber-500", bar: "bg-amber-500" },
  2: { text: "text-yellow-500", fill: "fill-yellow-500", bar: "bg-yellow-500" },
  1: { text: "text-rose-500", fill: "fill-rose-500", bar: "bg-rose-500" },
};

export default function RatingBreakdown({
  stats,
  selectedRating,
  onSelectRating,
}: RatingBreakdownProps) {
  const averageRating = stats?.averageRating ?? 0;
  const totalReviews = stats?.totalReviews ?? 0;
  const breakdown = stats?.breakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  // Calculate percentages
  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-card border border-border/30 rounded-2xl shadow-xs items-center">
      {/* Average Score Card */}
      <div className="flex flex-col items-center justify-center text-center space-y-2 border-b md:border-b-0 md:border-r pb-6 md:pb-0 border-border/30">
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Overall Rating</span>
        <div className="text-5xl font-black text-foreground tracking-tight flex items-baseline">
          {averageRating.toFixed(1)}
          <span className="text-base font-bold text-muted-foreground ml-1">/5</span>
        </div>
        
        {/* Visual Stars */}
        <div className="flex items-center space-x-0.5">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= Math.round(averageRating);
            return (
              <Star
                key={star}
                className={`h-4.5 w-4.5 ${
                  isFilled 
                    ? "fill-amber-500 text-amber-500" 
                    : "text-muted/40"
                }`}
              />
            );
          })}
        </div>
        
        <span className="text-xs font-semibold text-muted-foreground">
          Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
        </span>
      </div>

      {/* Star Breakdown Bars */}
      <div className="md:col-span-2 space-y-1.5">
        {([5, 4, 3, 2, 1] as number[]).map((star) => {
          const isSelected = selectedRating === star;
          const count = breakdown[star] ?? 0;
          const percentage = getPercentage(count);
          const colors = STAR_COLORS[star] || STAR_COLORS[3];

          return (
            <div
              key={star}
              onClick={() => onSelectRating(isSelected ? null : star)}
              className={`flex items-center space-x-3 text-xs p-2 rounded-xl cursor-pointer select-none transition-all duration-200 ${
                isSelected 
                  ? "bg-muted border border-border/40 shadow-xs scale-[1.01]" 
                  : "hover:bg-muted/45 border border-transparent hover:scale-[1.01]"
              }`}
            >
              <span className={`w-10 font-extrabold text-right flex items-center justify-end gap-1 ${colors.text}`}>
                {star} <Star className={`h-3 w-3 ${colors.fill}`} />
              </span>
              
              {/* Progress Bar Container */}
              <div className="flex-1 h-2 bg-muted/40 rounded-full overflow-hidden border border-border/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              {/* Stats values */}
              <span className="w-16 text-left font-bold text-muted-foreground flex items-center justify-between gap-1.5">
                <span>{percentage}%</span>
                <span className="text-[10px] font-normal text-muted-foreground/60">({count})</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
