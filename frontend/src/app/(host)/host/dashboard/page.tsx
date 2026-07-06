"use client";

import React from "react";
import Link from "next/link";
import { 
  Users, DollarSign, Calendar, Star, Plus, 
  ArrowUpRight, AlertCircle, ArrowRight 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line 
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_PROGRAMS, MOCK_BOOKINGS } from "@/constants/mockData";

// Charts Data
const revenueData = [
  { month: "Jan", earnings: 450 },
  { month: "Feb", earnings: 820 },
  { month: "Mar", earnings: 1100 },
  { month: "Apr", earnings: 900 },
  { month: "May", earnings: 1400 },
  { month: "Jun", earnings: 1850 },
];

const bookingsTrendData = [
  { day: "Mon", bookings: 2 },
  { day: "Tue", bookings: 5 },
  { day: "Wed", bookings: 4 },
  { day: "Thu", bookings: 8 },
  { day: "Fri", bookings: 12 },
  { day: "Sat", bookings: 15 },
  { day: "Sun", bookings: 9 },
];

export default function HostDashboard() {
  
  // Host metrics calculation
  const totalRevenue = MOCK_BOOKINGS.reduce((sum, b) => sum + (b.status === "confirmed" || b.status === "completed" ? b.amountPaid : 0), 0);
  const activePrograms = MOCK_PROGRAMS.filter(p => p.status === "approved").length;
  const totalSignups = MOCK_BOOKINGS.reduce((sum, b) => sum + b.spotsBooked, 0);

  return (
    <div className="space-y-6">
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Host Control Center</h1>
          <p className="text-sm text-muted-foreground">Monitor class bookings, track revenue metrics, and publish new programs.</p>
        </div>
        <Link href="/host/programs/create">
          <Button className="rounded-xl h-10 text-xs font-semibold">
            <Plus className="mr-1.5 h-4 w-4" /> Create Workshop
          </Button>
        </Link>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-2xl border-border/40 bg-card">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Gross Earnings</span>
              <div className="text-2xl font-extrabold text-foreground">${totalRevenue}</div>
            </div>
            <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl"><DollarSign className="h-5 w-5" /></div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/40 bg-card">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total Signups</span>
              <div className="text-2xl font-extrabold text-foreground">{totalSignups} Students</div>
            </div>
            <div className="bg-blue-500/10 text-blue-500 p-3 rounded-xl"><Users className="h-5 w-5" /></div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/40 bg-card">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Active Classes</span>
              <div className="text-2xl font-extrabold text-foreground">{activePrograms} Workshops</div>
            </div>
            <div className="bg-violet-500/10 text-violet-500 p-3 rounded-xl"><Calendar className="h-5 w-5" /></div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/40 bg-card">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Average Rating</span>
              <div className="text-2xl font-extrabold text-foreground">4.8★</div>
            </div>
            <div className="bg-amber-500/10 text-amber-500 p-3 rounded-xl"><Star className="h-5 w-5" /></div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Earnings Bar Chart */}
        <Card className="lg:col-span-7 border-border/40 rounded-2xl bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Earnings Performance</CardTitle>
            <CardDescription className="text-xs">Gross monthly revenue compiled across workshop sales (USD).</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.15} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 11 }} />
                  <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Registrations Trend */}
        <Card className="lg:col-span-5 border-border/40 rounded-2xl bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Weekly Signups Flow</CardTitle>
            <CardDescription className="text-xs">Timeline of ticket registrations this week.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bookingsTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.15} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 11 }} />
                  <Line type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 0, fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Roster Quick-look */}
      <div className="w-full">
        
        {/* Recent Bookings List Table */}
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
                  {MOCK_BOOKINGS.slice(0, 3).map((bk) => (
                    <tr key={bk.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4 font-bold">{bk.id.startsWith("bk_1") ? "Liam O'Connor" : "Sophia Martinez"}</td>
                      <td className="py-3 px-4 truncate max-w-[200px]">{bk.programTitle}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">${bk.amountPaid}</td>
                      <td className="py-3 px-4 text-muted-foreground">{bk.bookingDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
