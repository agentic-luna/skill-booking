import Link from "next/link";
import {
  Clock, Ticket, MapPin, Eye, Edit3,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Program } from "@/constants/mockData";

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-emerald-500/80",
  pending: "bg-amber-500/80",
  rejected: "bg-destructive/80",
};

interface ProgramCardProps {
  program: Program;
}

export default function ProgramCard({ program }: ProgramCardProps) {
  return (
    <Card className="overflow-hidden border-border/40 bg-card rounded-2xl flex flex-col group shadow-xs">
      <div className="aspect-video w-full relative bg-muted">
        <img src={program.imageUrl} alt={program.title} className="object-cover w-full h-full" />

        {/* Approval status banner */}
        <div
          className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase backdrop-blur-xs text-white ${
            STATUS_STYLES[program.status] || "bg-muted"
          }`}
        >
          {program.status}
        </div>
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-semibold capitalize">
          {program.category}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {program.title}
          </h3>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] text-muted-foreground">
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" /> {program.duration}
            </span>
            <span className="flex items-center">
              <Ticket className="h-3 w-3 mr-1" /> {program.spotsLeft}/{program.maxSpots} spots
            </span>
            <span className="flex items-center col-span-2">
              <MapPin className="h-3 w-3 mr-1 truncate" /> {program.location.split(",")[0]}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/30 pt-4 mt-auto">
          <div className="text-base font-extrabold text-foreground">${program.price}</div>
          <div className="flex space-x-1.5">
            <Link href={`/programs/${program.id}`}>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" title="View details as client">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/host/programs/${program.id}/edit`}>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" title="Edit workshop">
                <Edit3 className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
