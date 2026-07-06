import React from "react";
import Link from "next/link";
import { Clock, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Program } from "@/constants/mockData";

interface ProgramCardProps {
  program: Program;
}

export default function ProgramCard({ program }: ProgramCardProps) {
  return (
    <div
      className="group flex flex-col border border-clay-shadow rounded-[25px] overflow-hidden bg-bone-white hover:border-nightshade-black transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-haze">
        <img
          src={program.imageUrl}
          alt={program.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-nightshade-black/60 backdrop-blur-md text-bone-white text-xs px-2.5 py-1 rounded-[8px] font-semibold capitalize">
          {program.category}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5 space-y-3">
        <div className="flex items-center space-x-2">
          <img
            src={program.instructorAvatar}
            alt={program.instructorName}
            className="h-6 w-6 rounded-full object-cover"
          />
          <span className="text-xs text-stone-grey">{program.instructorName}</span>
        </div>

        <h3 className="font-bold text-base text-graphite-ink line-clamp-2 leading-tight group-hover:text-nightshade-black transition-colors">
          {program.title}
        </h3>

        <div className="flex items-center space-x-3 text-xs text-stone-grey">
          <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {program.duration}</span>
          <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {program.location.split(",")[0]}</span>
        </div>

        <div className="flex items-center space-x-1.5 pt-1">
          <Star className="h-4 w-4 fill-iron-grey text-iron-grey" />
          <span className="text-xs font-bold text-graphite-ink">{program.rating}</span>
          <span className="text-xs text-stone-grey">({program.reviewsCount} reviews)</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-clay-shadow mt-auto">
          <div>
            <span className="text-xs text-stone-grey">Registration Fee</span>
            <div className="text-lg font-extrabold text-graphite-ink">${program.price}</div>
          </div>
          <Link href={`/programs/${program.id}`}>
            <Button size="sm" className="rounded-[12px]">Book Spot</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
