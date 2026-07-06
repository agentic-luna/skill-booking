"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles, Clock, Ticket, Image as ImageIcon,
  Loader2, Info,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryMeta } from "./program-schema";

interface PreviewSidebarProps {
  watchedTitle: string;
  watchedPrice: number;
  watchedMaxSpots: number;
  watchedDuration: string;
  selectedCategory: string;
  categoryMeta: CategoryMeta | undefined;
  isSubmitting: boolean;
}

export default function PreviewSidebar({
  watchedTitle,
  watchedPrice,
  watchedMaxSpots,
  watchedDuration,
  selectedCategory,
  categoryMeta,
  isSubmitting,
}: PreviewSidebarProps) {
  return (
    <div className="lg:col-span-4 space-y-6">
      {/* Sticky wrapper */}
      <div className="lg:sticky lg:top-24 space-y-6">

        {/* Live Preview Card */}
        <Card className="rounded-2xl border-border/40 bg-card overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 border-b border-border/30 pb-4">
            <CardTitle className="text-sm font-bold flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Live Preview</span>
            </CardTitle>
            <CardDescription className="text-xs">How your program card will appear.</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="rounded-xl border border-border/40 overflow-hidden bg-muted/20">
              {/* Image placeholder */}
              <div className="aspect-video bg-gradient-to-br from-primary/10 via-muted to-violet-500/10 flex items-center justify-center relative">
                <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                {categoryMeta && (
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-md font-semibold capitalize">
                    {selectedCategory}
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-amber-500/80 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-md font-bold uppercase">
                  Pending
                </div>
              </div>
              <div className="p-3.5 space-y-2.5">
                <h4 className="font-bold text-xs text-foreground line-clamp-2 leading-tight min-h-[2rem]">
                  {watchedTitle || "Workshop Title Preview"}
                </h4>
                <div className="grid grid-cols-2 gap-1.5 text-[9px] text-muted-foreground">
                  <span className="flex items-center"><Clock className="h-2.5 w-2.5 mr-1" /> {watchedDuration || "—"}</span>
                  <span className="flex items-center"><Ticket className="h-2.5 w-2.5 mr-1" /> {watchedMaxSpots || 0} spots</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <span className="text-sm font-extrabold text-foreground">${watchedPrice || 0}</span>
                  <span className="text-[9px] text-muted-foreground">Live Preview</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info callout */}
        <div className="flex items-start space-x-3 text-xs bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 text-amber-600 dark:text-amber-500">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <div className="font-bold">Approval Required</div>
            <p className="text-[10px] opacity-90 mt-0.5">
              All newly created workshops require Super Admin validation before they are visible on the explore listings.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            type="submit"
            form="create-program-form"
            className="w-full h-11 rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Publish Workshop
              </>
            )}
          </Button>
          <Link href="/host/programs" className="block">
            <Button variant="outline" type="button" className="w-full h-10 rounded-xl text-xs font-semibold">
              Cancel
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
