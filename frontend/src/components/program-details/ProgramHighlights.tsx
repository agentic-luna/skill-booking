import React from "react";
import { Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProgramHighlightsProps {
  rating: number;
  reviewsCount: number;
  location: string;
  mode: string|undefined;
}

export default function ProgramHighlights({
  rating,
  reviewsCount,
  location,
  mode,
}: ProgramHighlightsProps) {
  return (
    <>
      {/* Large Highlighted Key Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
        {/* Rating Spec */}
        <Card className="rounded-2xl border-border/40 bg-card overflow-hidden shadow-2xs">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="bg-amber-500/10 text-amber-500 p-3.5 rounded-xl shrink-0">
              <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground leading-none flex items-baseline space-x-1">
                <span>{rating}</span>
                <span className="text-[10px] font-bold text-muted-foreground">/ 5.0</span>
              </div>
              <div className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-wide">
                {reviewsCount} Host Reviews
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Spec */}
        <Card className="rounded-2xl border-border/40 bg-card overflow-hidden shadow-2xs">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="bg-primary/10 text-primary p-3.5 rounded-xl shrink-0">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                Class Venue
              </div>
              <div
                className="text-xs font-extrabold text-foreground mt-1 leading-snug break-words line-clamp-2"
                title={location}
              >
                {location}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Direction for Offline Events */}
      {mode === "OFFLINE" && location && location !== "In Person" && (
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Venue Map Direction</span>
          </h3>
          <div className="w-full h-[250px] rounded-2xl overflow-hidden border border-border/40 bg-muted/30 shadow-xs relative">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                location
              )}&output=embed`}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="w-full h-10 rounded-xl text-xs font-semibold shadow-2xs"
          >
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                location
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5"
            >
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>Get Directions on Google Maps</span>
            </a>
          </Button>
        </div>
      )}
    </>
  );
}