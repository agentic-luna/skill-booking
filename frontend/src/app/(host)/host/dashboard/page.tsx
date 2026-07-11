"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useHostStore } from "@/features/host/store/hostStore";

import KpiCards from "./_components/KpiCards";
import DashboardCharts from "./_components/DashboardCharts";
import RecentBookingsTable from "./_components/RecentBookingsTable";

const FALLBACK_REVENUE = [
  { month: "Jan", earnings: 0 }, { month: "Feb", earnings: 0 },
  { month: "Mar", earnings: 0 }, { month: "Apr", earnings: 0 },
  { month: "May", earnings: 0 }, { month: "Jun", earnings: 0 },
];
const FALLBACK_WEEKLY = [
  { day: "Mon", bookings: 0 }, { day: "Tue", bookings: 0 },
  { day: "Wed", bookings: 0 }, { day: "Thu", bookings: 0 },
  { day: "Fri", bookings: 0 }, { day: "Sat", bookings: 0 },
  { day: "Sun", bookings: 0 },
];

function SkeletonCard() {
  return (
    <Card className="rounded-2xl border-border/40 bg-card animate-pulse">
      <CardContent className="pt-6 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-2 w-20 bg-muted rounded" />
          <div className="h-6 w-24 bg-muted rounded" />
        </div>
        <div className="h-11 w-11 bg-muted rounded-xl" />
      </CardContent>
    </Card>
  );
}

export default function HostDashboard() {
  const { dashboard, dashboardLoading, error, fetchDashboard } = useHostStore();

  useEffect(() => { fetchDashboard(); }, []);

  const totalRevenue = dashboard?.grossRevenue ?? 0;
  const totalSignups = dashboard?.totalBookings ?? 0;
  const activePrograms = dashboard?.approvedEvents ?? 0;
  const averageRating = dashboard?.averageRating != null
    ? `${dashboard.averageRating.toFixed(1)}★` : "—";
  const revenueData = dashboard?.monthlyRevenue ?? FALLBACK_REVENUE;
  const bookingsTrendData = dashboard?.weeklyBookings ?? FALLBACK_WEEKLY;
  const recentBookings = dashboard?.recentBookings ?? [];

  return (
    <div className="space-y-6">

      {/* Header */}
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

      {error && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
          {error} — dashboard data may not be up to date.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {dashboardLoading
          ? [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
          : <KpiCards totalRevenue={totalRevenue} totalSignups={totalSignups} activePrograms={activePrograms} averageRating={averageRating} />
        }
      </div>

      <DashboardCharts revenueData={revenueData} bookingsTrendData={bookingsTrendData} />
      <RecentBookingsTable loading={dashboardLoading} bookings={recentBookings} />

    </div>
  );
}
