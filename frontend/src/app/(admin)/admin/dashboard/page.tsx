"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { 
  Users, DollarSign, CheckSquare, Landmark, ArrowRight, UserPlus, Scale, RefreshCw, AlertCircle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/features/admin/store/adminStore";

export default function AdminDashboard() {
  const {
    eventQueue,
    hosts,
    pendingKycHosts,
    financeLedger,
    loading,
    error,
    fetchEventQueue,
    fetchHosts,
    fetchPendingKycHosts,
    fetchFinanceLedger
  } = useAdminStore();

  useEffect(() => {
    fetchEventQueue();
    fetchHosts();
    fetchPendingKycHosts();
    fetchFinanceLedger();
  }, [fetchEventQueue, fetchHosts, fetchPendingKycHosts, fetchFinanceLedger]);

  // Calculations
  const grossSales = (financeLedger?.totalRealizedRevenue || 0) + (financeLedger?.totalEscrowLiabilities || 0);
  const totalCommission = financeLedger?.totalRealizedRevenue || 0;
  const pendingApprovalsCount = eventQueue?.length || 0;
  const activeHostsCount = hosts?.length || 0;

  // Chart data showing ledger breakdown
  const platformFinancials = [
    { name: "Escrow Held", amount: financeLedger?.totalEscrowLiabilities || 0 },
    { name: "Realized Net", amount: financeLedger?.totalRealizedRevenue || 0 },
    { name: "Refunded", amount: financeLedger?.totalRefunded || 0 }
  ];

  // Match event titles to category
  const getCategoryFromTitle = (title: string): string => {
    const t = (title || "").toLowerCase();
    if (t.includes("react") || t.includes("next") || t.includes("python") || t.includes("code") || t.includes("web") || t.includes("javascript") || t.includes("tech") || t.includes("develop") || t.includes("program")) return "Technology & Tech";
    if (t.includes("design") || t.includes("ux") || t.includes("ui") || t.includes("figma") || t.includes("art") || t.includes("sketch")) return "Design & Creative";
    if (t.includes("business") || t.includes("market") || t.includes("finance") || t.includes("sales") || t.includes("startup")) return "Business & Marketing";
    if (t.includes("cook") || t.includes("bake") || t.includes("chef") || t.includes("food") || t.includes("culinary")) return "Culinary & Baking";
    if (t.includes("fitness") || t.includes("yoga") || t.includes("workout") || t.includes("gym") || t.includes("wellness")) return "Fitness & Health";
    if (t.includes("photo") || t.includes("camera") || t.includes("video") || t.includes("lens")) return "Photography";
    return "Other Skills";
  };

  const categoryCounts: Record<string, number> = {};
  let totalMatches = 0;

  (hosts || []).forEach((host) => {
    (host.hostProfile?.events || []).forEach((e) => {
      const cat = getCategoryFromTitle(e.title);
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      totalMatches++;
    });
  });

  // Convert to array, calculate and sort
  const sortedCategories = Object.entries(categoryCounts)
    .map(([name, count]) => {
      const percentage = totalMatches > 0 ? Math.round((count / totalMatches) * 100) : 0;
      return { name, count, percentage };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const displaySectors = sortedCategories.map((c, i) => {
    const colors = ["bg-blue-500", "bg-indigo-500", "bg-amber-500", "bg-emerald-500", "bg-pink-500"];
    return {
      name: c.name,
      count: c.count,
      percentage: c.percentage,
      color: colors[i % colors.length]
    };
  });

  const firstPendingKyc = pendingKycHosts?.[0];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Super Admin Board</h1>
          <p className="text-sm text-muted-foreground">Monitor platform transactions, verify host credential files, and approve new listings.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            fetchEventQueue();
            fetchHosts();
            fetchPendingKycHosts();
            fetchFinanceLedger();
          }}
          disabled={loading}
          className="rounded-xl flex items-center gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Registry
        </Button>
      </div>

      {error && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-xl border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Sync issue detected: {error}</span>
        </div>
      )}

      {/* Platform Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-border/40 bg-card rounded-2xl">
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Gross Platform Volume</span>
              <div className="text-2xl font-extrabold text-foreground">${grossSales}</div>
            </div>
            <div className="bg-primary/10 text-primary p-3 rounded-xl"><DollarSign className="h-5 w-5" /></div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card rounded-2xl">
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Realized Net Commission</span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-500">${totalCommission}</div>
            </div>
            <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl"><Landmark className="h-5 w-5" /></div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card rounded-2xl">
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Pending Approvals</span>
              <div className="text-2xl font-extrabold text-foreground">{pendingApprovalsCount} Listings</div>
            </div>
            <div className="bg-amber-500/10 text-amber-500 p-3 rounded-xl"><CheckSquare className="h-5 w-5" /></div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card rounded-2xl">
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Registered Hosts</span>
              <div className="text-2xl font-extrabold text-foreground">{activeHostsCount} Instructors</div>
            </div>
            <div className="bg-blue-500/10 text-blue-500 p-3 rounded-xl"><Users className="h-5 w-5" /></div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Platform ledger distribution bar chart */}
        <Card className="lg:col-span-7 border-border/40 rounded-2xl bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Escrow Ledger Breakdown (USD)</CardTitle>
            <CardDescription className="text-xs">Platform ledger balances distribution from backend database.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformFinancials} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.15} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 11 }} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Topic distribution */}
        <Card className="lg:col-span-5 border-border/40 rounded-2xl bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Top 5 Core Topic Areas</CardTitle>
            <CardDescription className="text-xs">Workshop format distribution across core educational sectors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {displaySectors.length > 0 ? (
              displaySectors.map((sector) => (
                <div key={sector.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{sector.name}</span>
                    <span className="text-muted-foreground">{sector.count} classes ({sector.percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${sector.color} rounded-full`} style={{ width: `${sector.percentage}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground text-xs italic">
                No active classes recorded to compute topic sectors.
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Roster & Quick approvals queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Verification Alert logs */}
        <Card className="lg:col-span-2 border-border/40 rounded-2xl bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-bold">Class Approvals Queue</CardTitle>
              <CardDescription className="text-xs">Newly hosted workshops requiring review.</CardDescription>
            </div>
            <Link href="/admin/approvals">
              <Button size="sm" variant="ghost" className="text-xs">
                Review Board <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-t">
                <thead>
                  <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Host Name</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {eventQueue && eventQueue.slice(0, 3).map((prog) => (
                    <tr key={prog.id} className="border-b hover:bg-muted/30 last:border-none">
                      <td className="py-3 px-4 font-bold max-w-[200px] truncate">{prog.title}</td>
                      <td className="py-3 px-4 uppercase">{prog.mode}</td>
                      <td className="py-3 px-4">
                        {prog.host?.user ? `${prog.host.user.firstName} ${prog.host.user.lastName}` : "Platform Host"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link href="/admin/approvals">
                          <Button size="sm" className="rounded-lg h-7 px-3 text-[10px] font-bold">Verify</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {(!eventQueue || eventQueue.length === 0) && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-muted-foreground text-xs">
                        All listing approval queues cleared.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Verification Queue notification */}
        <Card className="border-border/40 rounded-2xl bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Host Verification Alert</CardTitle>
            <CardDescription className="text-xs">Pending teacher certificates reviews.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {firstPendingKyc ? (
              <div className="flex items-start space-x-3 text-xs bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-amber-600 dark:text-amber-500">
                <UserPlus className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <div className="font-bold">Pending Host: {firstPendingKyc.firstName} {firstPendingKyc.lastName}</div>
                  <p className="text-[10px] opacity-90 leading-relaxed truncate max-w-[180px]">
                    {firstPendingKyc.hostProfile?.bio || "Submitted government credentials for review."}
                  </p>
                  <Link href="/admin/hosts" className="text-[10px] font-bold underline block pt-1">
                    View Credentials Sheet
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed rounded-xl text-center text-muted-foreground text-xs bg-muted/10">
                All host registration KYC submissions verified!
              </div>
            )}
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
