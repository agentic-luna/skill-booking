"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProgramVideoPlayerProps {
  videoUrls?: string[];
}

export default function ProgramVideoPlayer({ videoUrls }: ProgramVideoPlayerProps) {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  if (!videoUrls || videoUrls.length === 0) {
    return null;
  }

  const videos = videoUrls;

  const getEmbedUrl = (url: string): string => {
    if (!url) return "";
    if (url.includes("youtube.com/embed/")) return url;
    let videoId = "";
    try {
      if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split(/[?#]/)[0] || "";
      } else if (url.includes("youtube.com/watch")) {
        const parts = url.split("v=");
        if (parts[1]) {
          videoId = parts[1].split("&")[0];
        }
      } else if (url.includes("youtube.com/shorts/")) {
        videoId = url.split("youtube.com/shorts/")[1]?.split(/[?#]/)[0] || "";
      }
    } catch (e) {
      console.error("Error parsing video URL:", e);
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const activeEmbedUrl = getEmbedUrl(videos[activeVideoIndex]);

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Introductory Videos</h2>
        {videos.length > 1 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setActiveVideoIndex((prev) => (prev > 0 ? prev - 1 : videos.length - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-muted-foreground">
              {activeVideoIndex + 1} / {videos.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setActiveVideoIndex((prev) => (prev < videos.length - 1 ? prev + 1 : 0))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="max-w-[320px] xs:max-w-md sm:max-w-lg md:max-w-xl mx-auto aspect-video w-full rounded-2xl overflow-hidden bg-muted shadow-sm border border-border/30">
        <iframe 
          key={videos[activeVideoIndex]}
          width="100%" 
          height="100%" 
          src={activeEmbedUrl} 
          title={`YouTube video player ${activeVideoIndex + 1}`}
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}