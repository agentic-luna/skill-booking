"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { 
  Users, IndianRupee, CheckSquare, Landmark, ArrowRight, UserPlus, Scale, RefreshCw, AlertCircle, Sparkles, LayoutDashboard, Settings
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
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Massive Bento Typography Header */}
      <div className="flex flex-col gap-6 pt-4 pb-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <h1 className="text-5xl md:text-6xl lg:text-[72px] font-medium tracking-tight text-foreground leading-[1.1]">
            Managing Your Hosts <br className="hidden md:block" />
            and Approvals
          </h1>
          
          <Button 
            onClick={() => {
              fetchEventQueue();
              fetchHosts();
              fetchPendingKycHosts();
              fetchFinanceLedger();
            }}
            disabled={loading}
            className="rounded-full px-6 py-6 font-bold shadow-xl transition-all duration-300 bg-[#0b0c01] text-white hover:bg-[#1a1c02] border-none flex-shrink-0"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Sync Platform
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-xl border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Sync issue detected: {error}</span>
        </div>
      )}

      {/* Platform Analytics Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Card 1: Gross Platform Vol (Standard Bento) */}
        <Card className="col-span-1 lg:col-span-4 group relative overflow-hidden border-black/5 dark:border-white/5 bg-card rounded-[32px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
           <CardContent className="p-8 flex flex-col justify-between h-full relative z-10 space-y-8">
             <div className="flex justify-between items-start">
                <div className="bg-primary/10 text-primary p-3 rounded-2xl shadow-sm border border-primary/20"><IndianRupee className="h-5 w-5" /></div>
                <div className="bg-muted px-3 py-1.5 rounded-full text-xs font-bold text-muted-foreground shadow-sm">Platform Vol.</div>
             </div>
             <div className="space-y-1">
               <span className="text-sm text-muted-foreground font-semibold">Gross Volume</span>
               <div className="text-5xl lg:text-6xl font-medium tracking-tight text-foreground">₹{grossSales.toFixed(2)}</div>
             </div>
           </CardContent>
        </Card>

        {/* Card 2: Realized Net (Lime Green Bento) */}
        <Card className="col-span-1 lg:col-span-4 group relative overflow-hidden border-none bg-[#a0f212] rounded-[32px] shadow-[0_10px_30px_rgba(160,242,18,0.2)] hover:shadow-[0_15px_40px_rgba(160,242,18,0.4)] hover:-translate-y-1 transition-all duration-300">
           <CardContent className="p-8 flex flex-col justify-between h-full relative z-10 space-y-8">
             <div className="flex justify-between items-start">
                <div className="bg-black/10 text-[#0b0c01] p-3 rounded-2xl shadow-sm border border-black/10"><Landmark className="h-5 w-5" /></div>
                <div className="bg-white/80 text-[#0b0c01] px-3 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">Verified <ArrowRight className="w-3 h-3"/></div>
             </div>
             <div className="space-y-1">
               <span className="text-sm text-[#0b0c01]/70 font-bold">Realized Net Commission</span>
               <div className="text-5xl lg:text-6xl font-medium tracking-tight text-[#0b0c01]">₹{totalCommission.toFixed(2)}</div>
             </div>
           </CardContent>
        </Card>

        {/* Card 3: Dark CTA Image Bento */}
        <Card className="col-span-1 lg:col-span-4 group relative overflow-hidden border-none bg-[#0b0c01] rounded-[32px] shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/40 to-transparent"></div>
          <div className="absolute -right-8 -bottom-8 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
            <Sparkles className="w-56 h-56 text-[#a0f212]" />
          </div>
          <CardContent className="p-8 flex flex-col justify-between h-full relative z-10">
            <h3 className="text-3xl font-medium text-white leading-snug max-w-[200px]">
              Take Your <br/><span className="text-[#a0f212]">Platform</span> to the Next Level
            </h3>
            <Link href="/admin/approvals">
              <Button className="mt-8 bg-white text-[#0b0c01] hover:bg-gray-100 rounded-full font-bold px-8 py-6 w-full lg:w-auto shadow-xl flex items-center justify-center gap-2 transition-transform group-hover:scale-105">
                Review Approvals <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Middle Dashboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        
        {/* Left Column (Big Charts & Tables) */}
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
          
          {/* Platform ledger distribution bar chart */}
          <Card className="group relative overflow-hidden border-black/5 dark:border-white/5 rounded-[32px] bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all duration-500"></div>
            <div className="relative z-10">
              <CardHeader className="px-8 pt-8">
                <CardTitle className="text-lg font-extrabold">Escrow Ledger Breakdown (INR)</CardTitle>
                <CardDescription className="text-sm">Platform ledger balances distribution from backend database.</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8 pt-4">
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={platformFinancials} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.15} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: "bold" }} />
                      <YAxis tickLine={false} axisLine={false} style={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: "bold" }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 16, fontSize: 12, fontWeight: "bold", padding: "12px" }} cursor={{fill: 'hsl(var(--muted))', opacity: 0.4}} />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[8, 8, 8, 8]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Verification Alert logs */}
          <Card className="group relative overflow-hidden border-black/5 dark:border-white/5 rounded-[32px] bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-500"></div>
            <div className="relative z-10">
              <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8">
                <div>
                  <CardTitle className="text-lg font-extrabold">Class Approvals Queue</CardTitle>
                  <CardDescription className="text-sm">Newly hosted workshops requiring review.</CardDescription>
                </div>
                <Link href="/admin/approvals">
                  <Button size="sm" className="rounded-full px-6 font-bold shadow-sm">
                    Review Board <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-t border-black/5 dark:border-white/5">
                    <thead>
                      <tr className="border-b border-black/5 dark:border-white/5 bg-muted/40 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">
                        <th className="py-4 px-8">Title</th>
                        <th className="py-4 px-8">Mode</th>
                        <th className="py-4 px-8">Host Name</th>
                        <th className="py-4 px-8 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventQueue && eventQueue.slice(0, 4).map((prog) => (
                        <tr key={prog.id} className="border-b border-black/5 dark:border-white/5 hover:bg-muted/30 last:border-none transition-colors">
                          <td className="py-4 px-8 font-bold max-w-[250px] truncate">{prog.title}</td>
                          <td className="py-4 px-8">
                            <span className="bg-muted px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">{prog.mode}</span>
                          </td>
                          <td className="py-4 px-8 font-medium">
                            {prog.host?.user ? `${prog.host.user.firstName} ${prog.host.user.lastName}` : "Platform Host"}
                          </td>
                          <td className="py-4 px-8 text-center">
                            <Link href="/admin/approvals">
                              <Button size="sm" variant="outline" className="rounded-xl h-8 px-4 text-xs font-bold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">Verify</Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {(!eventQueue || eventQueue.length === 0) && (
                        <tr>
                          <td colSpan={4} className="text-center py-12 text-muted-foreground text-sm font-medium">
                            <div className="flex flex-col items-center gap-2">
                              <CheckSquare className="h-8 w-8 text-emerald-500 opacity-50" />
                              All listing approval queues cleared.
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </div>
          </Card>

        </div>

        {/* Right Column (Side Bento Stack) */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
          
          {/* Mini Metrics Cards */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="border-black/5 dark:border-white/5 rounded-[32px] bg-card p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="bg-amber-500/10 text-amber-500 p-4 rounded-2xl mb-4 shadow-sm border border-amber-500/20 group-hover:scale-110 transition-transform"><CheckSquare className="h-6 w-6" /></div>
              <div className="text-4xl font-extrabold text-foreground">{pendingApprovalsCount}</div>
              <div className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">Pending</div>
            </Card>
            <Card className="border-black/5 dark:border-white/5 rounded-[32px] bg-card p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="bg-blue-500/10 text-blue-500 p-4 rounded-2xl mb-4 shadow-sm border border-blue-500/20 group-hover:scale-110 transition-transform"><Users className="h-6 w-6" /></div>
              <div className="text-4xl font-extrabold text-foreground">{activeHostsCount}</div>
              <div className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">Hosts</div>
            </Card>
          </div>

          {/* Verification Queue notification */}
          <Card className="group relative overflow-hidden border-black/5 dark:border-white/5 rounded-[32px] bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-all duration-500"></div>
            <div className="relative z-10">
              <CardHeader className="px-8 pt-8">
                <CardTitle className="text-lg font-extrabold">Host Verification</CardTitle>
                <CardDescription className="text-sm">Pending teacher certificates reviews.</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-4">
                {firstPendingKyc ? (
                  <div className="flex items-start space-x-4 text-sm bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20 text-amber-600 dark:text-amber-500 shadow-inner">
                    <div className="bg-amber-500/20 p-2 rounded-xl mt-0.5"><UserPlus className="h-5 w-5 shrink-0" /></div>
                    <div className="space-y-1.5 flex-1">
                      <div className="font-extrabold">Pending: {firstPendingKyc.firstName} {firstPendingKyc.lastName}</div>
                      <p className="text-xs opacity-90 leading-relaxed max-w-[200px] font-medium">
                        {firstPendingKyc.hostProfile?.bio || "Submitted government credentials for review."}
                      </p>
                      <Link href="/admin/hosts" className="text-xs font-bold underline block pt-2 hover:text-amber-700 dark:hover:text-amber-400">
                        View Credentials Sheet
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-black/10 dark:border-white/10 rounded-[24px] text-center text-muted-foreground text-sm font-medium bg-muted/20">
                    All host registration KYC submissions verified!
                  </div>
                )}
              </CardContent>
            </div>
          </Card>

          {/* Dynamic Topic distribution */}
          <Card className="group relative overflow-hidden border-black/5 dark:border-white/5 rounded-[32px] bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-all duration-500"></div>
            <div className="relative z-10">
              <CardHeader className="px-8 pt-8">
                <CardTitle className="text-lg font-extrabold">Core Topic Areas</CardTitle>
                <CardDescription className="text-sm">Distribution across core sectors.</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-5 pt-2">
                {displaySectors.length > 0 ? (
                  displaySectors.map((sector) => (
                    <div key={sector.name} className="space-y-2">
                      <div className="flex justify-between text-sm font-bold">
                        <span>{sector.name}</span>
                        <span className="text-muted-foreground">{sector.count} cls ({sector.percentage}%)</span>
                      </div>
                      <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full ${sector.color} rounded-full transition-all duration-1000`} style={{ width: `${sector.percentage}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground text-sm font-medium italic bg-muted/20 rounded-[24px]">
                    No active classes recorded.
                  </div>
                )}
              </CardContent>
            </div>
          </Card>

        </div>
      </div>

    </div>
  );
}
