"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Rocket, Calendar, IndianRupee, CheckCircle2, Clock, XCircle, ChevronRight } from "lucide-react";
import * as hostApi from "@/features/host/api/host.api";

export default function BoostHistoryPage() {
  const [boosts, setBoosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoosts = async () => {
      try {
        setLoading(true);
        // Assuming host can get their boosts via the events they own, but there's a need to fetch their boosted events.
        // If there isn't a direct endpoint for host boost history, we fetch all host events and filter those with boostedEvent.
        const allEvents = await hostApi.getMyEvents(); // Fetching host events
        const allBoosts = allEvents
          .filter((e: any) => e.boostedEvent)
          .map((e: any) => ({
            ...e.boostedEvent,
            event: e
          }));
        setBoosts(allBoosts);
      } catch (error) {
        console.error("Failed to fetch boost history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBoosts();
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PRO': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'STANDARD': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle2 className="w-4 h-4 text-[#a0f212]" />;
      case 'APPROVED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Boost History</h1>
        <p className="text-muted-foreground mt-2">
          View all your active and past event boosts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Your Boosted Events
          </CardTitle>
          <CardDescription>
            A record of all your boost purchases and their current status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-[#a0f212]" />
            </div>
          ) : boosts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs font-semibold">
              You haven&apos;t purchased any event boosts yet.
            </div>
          ) : (
            <div className="space-y-4">
              {boosts.map((boost) => (
                <Link
                  key={boost.id}
                  href={`/host/boost-history/${boost.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-black/5 bg-[#0b0c01]/[0.02] hover:bg-black/[0.04] transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex flex-col space-y-1">
                    <span className="font-extrabold text-base text-[#0b0c01] group-hover:text-primary transition-colors flex items-center gap-1.5">
                      {boost.event.title}
                    </span>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(boost.startDate)} - {formatDate(boost.endDate)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5" />
                        ₹{boost.price || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4 sm:mt-0">
                    <span className={`px-2.5 py-1 text-[10px] font-black rounded-full border tracking-wider uppercase ${getTierColor(boost.tier)}`}>
                      {boost.tier || 'BASIC'}
                    </span>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border shadow-sm text-xs font-semibold">
                      {getStatusIcon(boost.status)}
                      <span className="capitalize">{boost.status.toLowerCase()}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
