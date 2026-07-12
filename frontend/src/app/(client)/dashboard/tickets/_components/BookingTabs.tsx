import React from "react";
import Link from "next/link";
import { BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookingCard from "./BookingCard";
import type { ClientBooking } from "@/features/client/api/types";

interface BookingTabsProps {
  activeBookings: ClientBooking[];
  pastBookings: ClientBooking[];
  onCancel: (id: string) => void;
  onWriteReview: (booking: ClientBooking) => void;
}

export default function BookingTabs({ activeBookings, pastBookings, onCancel, onWriteReview }: BookingTabsProps) {
  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="grid grid-cols-2 max-w-xs mb-4">
        <TabsTrigger value="active">Active Tickets ({activeBookings.length})</TabsTrigger>
        <TabsTrigger value="past">Past / Cancelled</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-4">
        {activeBookings.length > 0 ? (
          activeBookings.map((bk) => <BookingCard key={bk.id} booking={bk} onCancel={onCancel} onWriteReview={onWriteReview} />)
        ) : (
          <div className="text-center p-12 border rounded-3xl bg-muted/20 border-dashed border-border/60 flex flex-col items-center justify-center space-y-5 min-h-[300px]">
            <div className="bg-muted p-4 rounded-full shadow-sm border border-black/5 dark:border-white/5">
              <BookmarkCheck className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-lg text-foreground">No active tickets</h3>
              <p className="text-sm font-medium text-muted-foreground max-w-sm mx-auto">
                You haven&apos;t reserved spots for any upcoming workshops yet.
              </p>
            </div>
            <Link href="/programs" className="pt-2">
              <Button className="rounded-xl px-8 h-11 font-bold shadow-sm bg-[#0b0c01] text-white hover:bg-[#0b0c01]/90 dark:bg-[#a0f212] dark:text-[#0b0c01] dark:hover:bg-[#abf282]">
                Browse Workshops
              </Button>
            </Link>
          </div>
        )}
      </TabsContent>

      <TabsContent value="past" className="space-y-4">
        {pastBookings.length > 0 ? (
          pastBookings.map((bk) => <BookingCard key={bk.id} booking={bk} onCancel={onCancel} onWriteReview={onWriteReview} />)
        ) : (
          <div className="text-center p-12 border rounded-3xl bg-muted/20 border-dashed border-border/60 flex flex-col items-center justify-center min-h-[250px]">
            <p className="text-sm font-medium text-muted-foreground">
              No booking history found.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
