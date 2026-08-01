"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2, Rocket, Calendar, IndianRupee, CheckCircle2, Clock, XCircle,
  BarChart2, RefreshCw, Zap, AlertTriangle, ArrowUpRight
} from "lucide-react";
import * as hostApi from "@/features/host/api/host.api";
import BoostAnalyticsModal from "@/components/host/BoostAnalyticsModal";
import BoostUpgradeModal from "@/components/host/BoostUpgradeModal";
import BoostRenewModal from "@/components/host/BoostRenewModal";

export default function BoostHistoryPage() {
  const [boosts, setBoosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"ALL" | "ACTIVE" | "EXPIRED" | "PENDING">("ALL");

  const [analyticsEventId, setAnalyticsEventId] = useState<string | null>(null);
  const [upgradeTarget, setUpgradeTarget] = useState<{ id: string; tier: string } | null>(null);
  const [renewTarget, setRenewTarget] = useState<{ id: string; tier: string } | null>(null);

  const fetchBoosts = async () => {
    try {
      setLoading(true);
      const allEvents = await hostApi.getMyEvents();
      const allBoosts = allEvents
        .filter((e: any) => e.boostedEvent)
        .map((e: any) => ({
          ...e.boostedEvent,
          event: e,
        }));
      setBoosts(allBoosts);
    } catch (error) {
      console.error("Failed to fetch boost history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoosts();
  }, []);

  const getTierColor = (tier: string) => {
    switch ((tier || "").toUpperCase()) {
      case "PRO":
        return "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-300";
      case "STANDARD":
        return "bg-[#a0f212]/20 text-[#0b0c01] dark:text-[#a0f212] border-[#a0f212]/40";
      default:
        return "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch ((status || "").toUpperCase()) {
      case "ACTIVE":
        return <CheckCircle2 className="w-4 h-4 text-[#a0f212]" />;
      case "APPROVED":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "REJECTED":
      case "CANCELLED":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  };

  const filteredBoosts = boosts.filter((b) => {
    if (filterTab === "ACTIVE") return b.status === "ACTIVE" && b.isActive;
    if (filterTab === "EXPIRED") return b.status === "EXPIRED" || !b.isActive;
    if (filterTab === "PENDING") return b.status === "PENDING";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Boost History & Telemetry</h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm font-medium">
            Manage your live workshop promotions, view ROI analytics, and upgrade campaign reach.
          </p>
        </div>

        <Link
          href="/host/boost-pricing"
          className="inline-flex items-center gap-2 bg-[#a0f212] hover:bg-[#aee665] text-[#0d1e17] px-6 py-3 rounded-2xl text-xs font-black transition-all shadow-md shrink-0"
        >
          <Rocket className="w-4 h-4" /> Boost New Workshop
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted p-1 rounded-2xl max-w-md gap-1">
        {(["ALL", "ACTIVE", "PENDING", "EXPIRED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`flex-1 text-center py-2 rounded-xl text-xs font-black transition-all ${
              filterTab === tab
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Your Promoted Workshops
          </CardTitle>
          <CardDescription>
            A real-time record of all active, pending, and past workshop promotions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#a0f212]" />
            </div>
          ) : filteredBoosts.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-xs text-muted-foreground font-semibold">
                No promotions found under this status filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBoosts.map((boost) => {
                const daysLeft = getDaysRemaining(boost.endDate);
                const isExpiringSoon = boost.isActive && boost.status === "ACTIVE" && daysLeft <= 2 && daysLeft > 0;

                return (
                  <div
                    key={boost.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-6 rounded-3xl border border-black/5 dark:border-white/5 bg-card hover:border-[#a0f212]/30 transition-all duration-300 gap-6 shadow-sm relative overflow-hidden"
                  >
                    <div className="flex flex-col space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/host/boost-history/${boost.id}`}
                          className="font-black text-base text-foreground hover:text-primary transition-colors truncate flex items-center gap-1 group"
                        >
                          {boost.event.title}
                          <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        
                        <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-full border uppercase ${getTierColor(boost.tier)}`}>
                          {boost.tier || "BASIC"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground font-bold">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {formatDate(boost.startDate)} - {formatDate(boost.endDate)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <IndianRupee className="w-3.5 h-3.5 text-primary" />
                          ₹{boost.price || 0}
                        </div>
                        {boost.isActive && boost.status === "ACTIVE" && (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-[#a0f212] font-extrabold">
                            <Clock className="w-3.5 h-3.5" />
                            {daysLeft} Days Remaining
                          </div>
                        )}
                      </div>

                      {/* Expiry Alert Warning Banner */}
                      {isExpiringSoon && (
                        <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold flex items-center gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                          <span>Expiring soon! Extend duration to maintain top search & spotlight priority.</span>
                        </div>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted border text-xs font-bold mr-2">
                        {getStatusIcon(boost.status)}
                        <span className="capitalize">{boost.status.toLowerCase()}</span>
                      </div>

                      {/* Upgrade Trigger */}
                      {boost.isActive && boost.tier !== "PRO" && (
                        <button
                          onClick={() => setUpgradeTarget({ id: boost.id, tier: boost.tier })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-300 text-xs font-bold transition-all border border-purple-500/20"
                        >
                          <Zap className="w-3.5 h-3.5" /> Upgrade
                        </button>
                      )}

                      {/* Extend / Renew Trigger */}
                      <button
                        onClick={() => setRenewTarget({ id: boost.id, tier: boost.tier })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-[#a0f212] text-xs font-bold transition-all border border-emerald-500/20"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> {boost.isActive ? "Extend" : "Renew"}
                      </button>

                      {/* Telemetry Trigger */}
                      <Link
                        href={`/host/boost-history/${boost.id}`}
                        className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-[#0b0c01] hover:bg-black dark:bg-[#a0f212] dark:hover:bg-[#aee665] text-white dark:text-[#0b0c01] text-xs font-bold transition-all shadow-sm"
                      >
                        <BarChart2 className="w-3.5 h-3.5" /> Console
                      </Link>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {analyticsEventId && (
        <BoostAnalyticsModal
          eventId={analyticsEventId}
          isOpen={!!analyticsEventId}
          onClose={() => setAnalyticsEventId(null)}
        />
      )}

      {upgradeTarget && (
        <BoostUpgradeModal
          boostId={upgradeTarget.id}
          currentTier={upgradeTarget.tier}
          isOpen={!!upgradeTarget}
          onClose={() => setUpgradeTarget(null)}
          onSuccess={fetchBoosts}
        />
      )}

      {renewTarget && (
        <BoostRenewModal
          boostId={renewTarget.id}
          tier={renewTarget.tier}
          isOpen={!!renewTarget}
          onClose={() => setRenewTarget(null)}
          onSuccess={fetchBoosts}
        />
      )}
    </div>
  );
}

