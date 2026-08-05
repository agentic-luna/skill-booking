"use client";

import React, { useState } from "react";
import { Search, Rocket, Sparkles, RefreshCw, IndianRupee, ShieldCheck, CheckCircle2, Clock, XCircle, Calendar, Zap, Users, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { PaginationControl } from "@/components/ui/pagination-control";
import { PaginationMeta } from "@/features/admin/api/types";

interface BoostPromotionsTableProps {
  loading: boolean;
  boostRequests: any[];
  onRefresh: () => void;
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export default function BoostPromotionsTable({
  loading,
  boostRequests,
  onRefresh,
  pagination,
  onPageChange,
  onLimitChange,
}: BoostPromotionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const safeBoosts = Array.isArray(boostRequests) ? boostRequests : [];

  // Filtered List
  const filteredBoosts = safeBoosts.filter((boost) => {
    const tierMatch = tierFilter === "ALL" || (boost.tier || "").toUpperCase() === tierFilter;
    const statusMatch =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && boost.isActive) ||
      (statusFilter === "EXPIRED" && !boost.isActive && boost.status !== "PENDING") ||
      (statusFilter === "PENDING" && boost.status === "PENDING");

    const hostUser = boost.event?.host?.user;
    const hostName = `${hostUser?.firstName || ""} ${hostUser?.lastName || ""}`.toLowerCase();
    const hostEmail = (hostUser?.email || "").toLowerCase();
    const eventTitle = (boost.event?.title || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const searchMatch =
      !searchTerm ||
      hostName.includes(search) ||
      hostEmail.includes(search) ||
      eventTitle.includes(search);

    return tierMatch && statusMatch && searchMatch;
  });

  // Calculate Metrics
  const totalBoostRevenue = safeBoosts
    .filter((b) => b.status === "ACTIVE" || b.status === "APPROVED" || b.isActive)
    .reduce((sum, b) => sum + (Number(b.price) || 0), 0);

  const activeBoostsCount = safeBoosts.filter((b) => b.isActive || b.status === "ACTIVE").length;
  
  const uniqueHostsCount = new Set(
    safeBoosts.map((b) => b.event?.host?.id || b.event?.host?.user?.id).filter(Boolean)
  ).size;

  const getTierBadge = (tier: string) => {
    switch ((tier || "").toUpperCase()) {
      case "PRO":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30";
      case "STANDARD":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-600 dark:text-[#a0f212] border-emerald-500/30";
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (isActive || status === "ACTIVE") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-[#a0f212] border border-emerald-500/20 text-[10px] font-black uppercase">
          <CheckCircle2 className="w-3 h-3" /> Active
        </span>
      );
    }
    if (status === "PENDING") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase">
          <Clock className="w-3 h-3" /> Pending Payment
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-black/5 dark:border-white/5 text-[10px] font-black uppercase">
        <XCircle className="w-3 h-3" /> Expired
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-card border border-black/5 dark:border-white/5 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
            <span>Total Boost Revenue</span>
            <div className="p-2 rounded-xl bg-[#a0f212]/10 text-[#0b0c01] dark:text-[#a0f212]">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground">₹{totalBoostRevenue.toLocaleString()}</div>
          <p className="text-[10px] text-muted-foreground font-semibold">Collected platform promotion revenues</p>
        </div>

        <div className="bg-card border border-black/5 dark:border-white/5 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
            <span>Active Campaigns</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Rocket className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground">{activeBoostsCount}</div>
          <p className="text-[10px] text-muted-foreground font-semibold">Promotions currently running live</p>
        </div>

        <div className="bg-card border border-black/5 dark:border-white/5 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
            <span>Boosted Hosts</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground">{uniqueHostsCount}</div>
          <p className="text-[10px] text-muted-foreground font-semibold">Unique organizers purchasing boosts</p>
        </div>

      </div>

      {/* Main Table Card */}
      <Card className="border-border/40 bg-card rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Rocket className="h-4 w-4 text-[#a0f212]" /> Host Boost Promotions & Financial Ledger
            </CardTitle>
            <CardDescription className="text-xs">
              Audit organizer boost payments, active placement tiers, and transaction reference numbers.
            </CardDescription>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search host, email, event..."
                className="pl-9 h-9 rounded-xl text-xs bg-muted/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Tier Filter */}
            <select
              className="h-9 rounded-xl border border-black/5 dark:border-white/5 bg-card px-3 text-xs outline-none focus:ring-1 focus:ring-primary/20 text-muted-foreground font-semibold shrink-0 cursor-pointer"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
            >
              <option value="ALL">All Tiers</option>
              <option value="BASIC">Basic Boost</option>
              <option value="STANDARD">Pro Boost</option>
              <option value="PRO">Ultra Pro Boost</option>
            </select>

            {/* Status Filter */}
            <select
              className="h-9 rounded-xl border border-black/5 dark:border-white/5 bg-card px-3 text-xs outline-none focus:ring-1 focus:ring-primary/20 text-muted-foreground font-semibold shrink-0 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="PENDING">Pending Only</option>
              <option value="EXPIRED">Expired Only</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 bg-muted/20 font-semibold text-muted-foreground">
                  <th className="py-3 px-4">Boosted Host</th>
                  <th className="py-3 px-4">Promoted Event</th>
                  <th className="py-3 px-4">Boost Tier</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Campaign Dates</th>
                  <th className="py-3 px-4">Gateway Txn Ref</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                      Retrieving boosted host financial ledger...
                    </td>
                  </tr>
                ) : filteredBoosts.length > 0 ? (
                  filteredBoosts.map((boost) => {
                    const hostUser = boost.event?.host?.user;
                    const hostName = hostUser ? `${hostUser.firstName || ""} ${hostUser.lastName || ""}`.trim() : "Unknown Host";
                    const hostEmail = hostUser?.email || "No email";
                    const eventTitle = boost.event?.title || "Event Title N/A";
                    const price = boost.price || 0;
                    const startDateStr = boost.startDate ? new Date(boost.startDate).toLocaleDateString() : "N/A";
                    const endDateStr = boost.endDate ? new Date(boost.endDate).toLocaleDateString() : "N/A";
                    const txnRef = boost.razorpayOrderId || boost.razorpayPaymentId || "N/A";

                    return (
                      <tr key={boost.id} className="border-b border-black/5 dark:border-white/5 hover:bg-muted/10 last:border-none">
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{hostName}</span>
                            <span className="text-[10px] text-muted-foreground">{hostEmail}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-[200px]">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground truncate">{eventTitle}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                              Mode: {boost.event?.mode || "ONLINE"}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${getTierBadge(boost.tier)}`}>
                            {boost.tier || "BASIC"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-black text-foreground text-sm">
                          ₹{Number(price).toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-muted-foreground text-[11px] font-semibold">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span>{startDateStr} - {endDateStr}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[10px] text-muted-foreground">
                          {txnRef}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {getStatusBadge(boost.status, boost.isActive)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      <Rocket className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                      <p className="font-bold text-sm">No boost promotion records found.</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Host boost purchases will appear here automatically.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {pagination && onPageChange && (
            <PaginationControl
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              limit={pagination.limit}
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
            />
          )}
        </CardContent>
      </Card>

    </div>
  );
}
