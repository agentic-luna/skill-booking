import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DashboardStats } from "@/features/host/api/types";

interface RecentBookingsTableProps {
  loading: boolean;
  bookings: NonNullable<DashboardStats["recentBookings"]>;
}

export default function RecentBookingsTable({ loading, bookings }: RecentBookingsTableProps) {
  return (
    <Card className="border-border/40 rounded-2xl bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-sm font-bold">Recent Roster Activity</CardTitle>
          <CardDescription className="text-xs">Quick review of incoming learner registrations.</CardDescription>
        </div>
        <Link href="/host/participants">
          <Button size="sm" variant="ghost" className="text-xs">
            Roster Board <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-muted rounded-lg" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">No bookings recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-t">
              <thead>
                <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                  <th className="py-3 px-4">Learner</th>
                  <th className="py-3 px-4">Workshop</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((bk) => (
                  <tr key={bk.id} className="border-b hover:bg-muted/30">
                    <td className="py-3 px-4 font-bold">{bk.clientName}</td>
                    <td className="py-3 px-4 truncate max-w-[200px]">{bk.eventTitle}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">${bk.amountPaid}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(bk.bookingDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
