"use client";

import React from "react";
import Link from "next/link";
import { 
  Users, DollarSign, Calendar, ShieldCheck, CheckSquare, 
  ArrowUpRight, Landmark, ArrowRight, UserPlus 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_PROGRAMS, MOCK_BOOKINGS } from "@/constants/mockData";

const platformFinancials = [
  { month: "Jan", platformFee: 67 },
  { month: "Feb", platformFee: 123 },
  { month: "Mar", platformFee: 165 },
  { month: "Apr", platformFee: 135 },
  { month: "May", platformFee: 210 },
  { month: "Jun", platformFee: 277 },
];

export default function AdminDashboard() {
  
  // Calculations
  const grossSales = MOCK_BOOKINGS.reduce((sum, b) => sum + (["confirmed", "completed"].includes(b.status) ? b.amountPaid : 0), 0);
  const totalCommission = Math.round(grossSales * 0.15); // 15% marketplace commission
  const pendingApprovalsCount = MOCK_PROGRAMS.filter(p => p.status === "pending").length;
  const activeHostsCount = 14;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="pb-4 border-b">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Super Admin Board</h1>
        <p className="text-sm text-muted-foreground">Monitor platform transactions, verify host credential files, and approve new listings.</p>
      </div>

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
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Platform Revenue (15%)</span>
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
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Verified Hosts</span>
              <div className="text-2xl font-extrabold text-foreground">{activeHostsCount} Instructors</div>
            </div>
            <div className="bg-blue-500/10 text-blue-500 p-3 rounded-xl"><Users className="h-5 w-5" /></div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Platform commission charts */}
        <Card className="lg:col-span-7 border-border/40 rounded-2xl bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Marketplace Commission (USD)</CardTitle>
            <CardDescription className="text-xs">Timeline of platform commission collected monthly.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformFinancials} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.15} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 11 }} />
                  <Bar dataKey="platformFee" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Category distribution bar lists */}
        <Card className="lg:col-span-5 border-border/40 rounded-2xl bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Popular Domains</CardTitle>
            <CardDescription className="text-xs">Booking density across marketplace sectors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {[
              { name: "Technology & Code", count: 48, percentage: 80, color: "bg-blue-500" },
              { name: "Design & UX", count: 32, percentage: 60, color: "bg-indigo-500" },
              { name: "Culinary Arts", count: 24, percentage: 45, color: "bg-amber-500" },
              { name: "Fitness & Wellness", count: 18, percentage: 35, color: "bg-emerald-500" },
            ].map((sector) => (
              <div key={sector.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{sector.name}</span>
                  <span className="text-muted-foreground">{sector.count} Books</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${sector.color} rounded-full`} style={{ width: `${sector.percentage}%` }} />
                </div>
              </div>
            ))}
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
                    <th className="py-3 px-4">Domain</th>
                    <th className="py-3 px-4">Instructor</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PROGRAMS.filter(p => p.status === "pending").slice(0, 2).map((prog) => (
                    <tr key={prog.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4 font-bold max-w-[200px] truncate">{prog.title}</td>
                      <td className="py-3 px-4 capitalize">{prog.category}</td>
                      <td className="py-3 px-4">{prog.instructorName}</td>
                      <td className="py-3 px-4 text-center">
                        <Link href="/admin/approvals">
                          <Button size="sm" className="rounded-lg h-7 px-3 text-[10px] font-bold">Verify</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {MOCK_PROGRAMS.filter(p => p.status === "pending").length === 0 && (
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
            <div className="flex items-start space-x-3 text-xs bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-amber-600 dark:text-amber-500">
              <UserPlus className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <div className="font-bold">Pending Host: Sarah Jenkins</div>
                <p className="text-[10px] opacity-90 leading-relaxed">Submitted proof credentials for Technology and React 19 Mastery.</p>
                <Link href="/admin/hosts" className="text-[10px] font-bold underline block pt-1">
                  View Credentials Sheet
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
