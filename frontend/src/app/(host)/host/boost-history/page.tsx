"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Rocket, Calendar, IndianRupee, CheckCircle2, Clock, XCircle } from "lucide-react";
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
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : boosts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              You haven't purchased any boosts yet.
            </div>
          ) : (
            <div className="space-y-4">
              {boosts.map((boost) => (
                <div key={boost.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col space-y-1">
                    <span className="font-semibold text-lg">{boost.event.title}</span>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(boost.startDate)} - {formatDate(boost.endDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        {boost.price || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4 sm:mt-0">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getTierColor(boost.tier)}`}>
                      {boost.tier || 'BASIC'}
                    </span>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border shadow-sm">
                      {getStatusIcon(boost.status)}
                      <span className="text-sm font-medium capitalize">{boost.status.toLowerCase()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
