import React from "react";
import Link from "next/link";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProgramRowCardProps {
  program: {
    id: string;
    title: string;
    imageUrl: string;
    category: string;
    status: string;
    date: string;
    time: string;
    maxSpots: number;
    price: number;
    enrolledCount?: number;
  };
  href?: string;
}

export default function ProgramRowCard({ program, href }: ProgramRowCardProps) {
  const enrolledCount = program.enrolledCount ?? 0;

  const CardContent = () => (
    <Card className="border-border/40 overflow-hidden bg-card transition-all duration-300 hover:shadow-md hover:border-primary/20 active:scale-[0.995]">
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {/* Thumbnail banner */}
          <img
            src={program.imageUrl}
            alt={program.title}
            className="w-20 h-14 object-cover rounded-xl shrink-0 border border-border/10 transition-opacity group-hover:opacity-90"
          />
          <div className="space-y-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-muted-foreground/10 text-muted-foreground uppercase tracking-wider">
                {program.category}
              </span>
              {program.status === "approved" ? (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Active
                </span>
              ) : (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 uppercase tracking-wider">
                  {program.status}
                </span>
              )}
            </div>
            <h3 className="font-bold text-sm text-foreground truncate max-w-sm md:max-w-md lg:max-w-lg group-hover:text-primary transition-colors">
              {program.title}
            </h3>
            <div className="flex items-center space-x-3 text-[10px] text-muted-foreground">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" /> {program.date}
              </span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" /> {program.time}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-3 md:pt-0">
          <div className="text-right">
            <div className="text-xs text-muted-foreground font-semibold">Confirmed Enrolled</div>
            <div className="text-sm font-extrabold text-foreground">
              {enrolledCount} / {program.maxSpots} Students
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-[10px] font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">
              ${program.price} / Seat
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block group">
        <CardContent />
      </Link>
    );
  }

  return (
    <div className="group">
      <CardContent />
    </div>
  );
}
