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
          <div className="text-center p-12 border bg-card border-dashed border-border/60 rounded-2xl space-y-4">
            <BookmarkCheck className="h-8 w-8 text-muted-foreground mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">No active bookings</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                You haven&apos;t reserved spots for any upcoming workshops yet.
              </p>
            </div>
            <Link href="/programs">
              <Button className="rounded-xl text-xs h-9">Browse Skills</Button>
            </Link>
          </div>
        )}
      </TabsContent>

      <TabsContent value="past" className="space-y-4">
        {pastBookings.length > 0 ? (
          pastBookings.map((bk) => <BookingCard key={bk.id} booking={bk} onCancel={onCancel} onWriteReview={onWriteReview} />)
        ) : (
          <div className="text-center p-12 bg-card border border-dashed rounded-2xl text-muted-foreground text-xs">
            No booking history found.
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
