import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface RecentBookingsTableProps {
  loading: boolean;
  bookings: any[];
}

function generateGradient(seed: string) {
  const hash = Array.from(seed).reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 80%, 65%), hsl(${hue2}, 80%, 60%))`;
}

export default function RecentBookingsTable({ loading, bookings }: RecentBookingsTableProps) {
  return (
    <Card className="border border-black/5 rounded-[32px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-6 px-8 pt-8">
        <CardTitle className="text-xl font-extrabold text-[#0b0c01]">Latest Orders</CardTitle>
        <Link href="/host/participants" className="text-sm font-bold text-muted-foreground hover:text-[#0b0c01] flex items-center gap-1 transition-colors">
          View All <ExternalLink className="w-4 h-4 ml-1" />
        </Link>
      </CardHeader>
      
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-black/[0.02] text-muted-foreground font-extrabold tracking-wider border-y border-black/5">
              <tr>
                <th className="px-8 py-5">Learner</th>
                <th className="px-8 py-5">Workshop</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-black/5 animate-pulse">
                    <td className="px-8 py-5 flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-xl bg-black/5" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-black/5 rounded-md" />
                        <div className="h-3 w-32 bg-black/5 rounded-md" />
                      </div>
                    </td>
                    <td className="px-8 py-5"><div className="h-4 w-32 bg-black/5 rounded-md" /></td>
                    <td className="px-8 py-5"><div className="h-4 w-24 bg-black/5 rounded-md" /></td>
                    <td className="px-8 py-5"><div className="h-4 w-16 bg-black/5 rounded-md" /></td>
                    <td className="px-8 py-5"><div className="h-6 w-20 bg-black/5 rounded-full" /></td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-muted-foreground font-medium">
                    No recent bookings found. Your latest orders will appear here.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const clientUser = booking.client?.user;
                  const name = clientUser ? `${clientUser.firstName} ${clientUser.lastName}` : "Unknown User";
                  const initial = name.charAt(0).toUpperCase();
                  const event = booking.event;
                  
                  return (
                    <tr key={booking.id} className="border-b border-black/5 hover:bg-black/[0.01] transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div 
                            className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm transform group-hover:scale-105 transition-transform"
                            style={{ background: generateGradient(name) }}
                          >
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-[#0b0c01]">{name}</div>
                            <div className="text-xs text-muted-foreground font-medium">{clientUser?.email || "No email"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-semibold text-[#0b0c01] max-w-[200px] truncate" title={event?.title}>
                        {event?.title || "Unknown Event"}
                      </td>
                      <td className="px-8 py-5 text-muted-foreground font-medium">
                        {new Date(booking.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                      </td>
                      <td className="px-8 py-5 font-extrabold text-[#0b0c01]">
                        ₹{booking.totalAmount ?? booking.amount}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          booking.status === "CONFIRMED" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                          booking.status === "PENDING" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                          "bg-red-500/10 text-red-600 border border-red-500/20"
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
