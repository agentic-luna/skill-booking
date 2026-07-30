import React from "react";
import { Button } from "@/components/ui/button";
import { Program } from "@/constants/mockData";

interface MobileBookingBarProps {
  program: Program;
  user: any; // Replace with your exact User type if available
  onBookClick: () => void;
}

export default function MobileBookingBar({
  program,
  user,
  onBookClick,
}: MobileBookingBarProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/50 p-4 pb-safe-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/80">
            Price
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-foreground">
              ₹{program.price}
            </span>
            {program.spotsLeft > 0 && (
              <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/20 px-1.5 py-0.5 rounded-md animate-pulse">
                🔥 {program.spotsLeft} left
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 max-w-[200px]">
          {user?.role === "host" || user?.role === "admin" ? (
            <div className="text-[9px] font-extrabold text-muted-foreground text-center bg-muted/40 p-2 rounded-xl border">
              Disabled for {user.role}
            </div>
          ) : (
            <Button
              className="w-full rounded-xl py-5 text-xs font-bold shadow-md shadow-primary/10"
              disabled={program.spotsLeft === 0}
              onClick={onBookClick}
            >
              {program.spotsLeft === 0 ? "Closed" : "Book Spot"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}